/**
 * BioForest Chain SDK Integration
 *
 * This module provides the BioForest Chain SDK for transaction creation
 * and signing. The SDK bundle and genesis blocks are loaded dynamically at runtime.
 *
 * Architecture:
 * - SDK bundle: precompiled .cjs file (TODO: Issue #101 - migrate to npm @bfchain/core)
 * - Genesis blocks: fetched from public/configs/genesis/{chainId}.json
 */

// Re-export types for consumers (type-only exports)
export type {
  BFChainCore,
  BioforestChainBundle,
  BioforestChainBundleCore,
  BioforestChainBundleSetup,
  Secrets,
  TransactionBodyOptions,
  TransferAssetInfo,
} from './types'

import type {
  BioforestChainBundle,
  BioforestChainBundleCore,
  BFChainCore,
  Secrets,
  TransferAssetInfo,
} from './types'

/** Genesis block cache by chainId */
const genesisCache = new Map<string, BFChainCore.BlockJSON<BFChainCore.GenesisBlockAssetJSON>>()

/** Core instances cache by chain magic */
const coreCache = new Map<string, BioforestChainBundleCore>()

/** SDK bundle singleton */
let bundleModule: BioforestChainBundle | null = null
let bundlePromise: Promise<BioforestChainBundle> | null = null

/**
 * Fetch genesis block from public/configs/genesis/{chainId}.json
 */
async function fetchGenesisBlock(
  chainId: string,
): Promise<BFChainCore.BlockJSON<BFChainCore.GenesisBlockAssetJSON>> {
  const cached = genesisCache.get(chainId)
  if (cached) {
    return cached
  }

  const response = await fetch(`./configs/genesis/${chainId}.json`)
  if (!response.ok) {
    throw new Error(`Failed to fetch genesis block for ${chainId}: ${response.status}`)
  }

  const genesis = (await response.json()) as BFChainCore.BlockJSON<BFChainCore.GenesisBlockAssetJSON>
  genesisCache.set(chainId, genesis)
  return genesis
}

/**
 * Create crypto helper compatible with the SDK
 */
async function createCryptoHelper(): Promise<BFChainCore.CryptoHelperInterface> {
  const cryptoModule = await import('crypto')

  const cryptoHelper: BFChainCore.CryptoHelperInterface = {
    async sha256(data?: Uint8Array | string): Promise<Buffer> {
      if (!data) {
        throw new Error('sha256 requires data argument')
      }
      const input = typeof data === 'string' ? data : Buffer.from(data)
      return cryptoModule.createHash('sha256').update(input).digest()
    },
    async md5(data?: Uint8Array | string): Promise<Buffer> {
      if (!data) {
        throw new Error('md5 requires data argument')
      }
      const input = typeof data === 'string' ? data : Buffer.from(data)
      return cryptoModule.createHash('md5').update(input).digest()
    },
    async ripemd160(data?: Uint8Array | string): Promise<Buffer> {
      if (!data) {
        throw new Error('ripemd160 requires data argument')
      }
      const input = typeof data === 'string' ? data : Buffer.from(data)
      return cryptoModule.createHash('ripemd160').update(input).digest()
    },
  }

  return cryptoHelper
}

/**
 * Load the BioForest Chain SDK bundle dynamically
 */
async function loadBundle(): Promise<BioforestChainBundle> {
  if (bundleModule) {
    return bundleModule
  }

  if (bundlePromise) {
    return bundlePromise
  }

  bundlePromise = (async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const module = (await import('./bioforest-chain-bundle.js')) as any
    bundleModule = { setup: module.setup }
    return bundleModule!
  })()

  return bundlePromise
}

/**
 * Get or create a BioForest core instance for a specific chain
 */
export async function getBioforestCore(chainId: string): Promise<BioforestChainBundleCore> {
  const genesis = await fetchGenesisBlock(chainId)
  const chainMagic = genesis.magic

  const cached = coreCache.get(chainMagic)
  if (cached) {
    return cached
  }

  const bundle = await loadBundle()
  const cryptoHelper = await createCryptoHelper()

  const core = await bundle.setup(genesis, cryptoHelper, {
    n: 'KeyApp',
    m: 'true',
    a: 'web',
  })

  coreCache.set(chainMagic, core)
  return core
}

/**
 * Get the latest block info for transaction timing
 */
export async function getLastBlock(
  rpcUrl: string,
  chainId: string,
): Promise<{ height: number; timestamp: number }> {
  const response = await fetch(`${rpcUrl}/wallet/${chainId}/lastblock`)
  if (!response.ok) {
    throw new Error(`Failed to get lastblock: ${response.status}`)
  }
  const json = (await response.json()) as { success: boolean; result: { height: number; timestamp: number } }
  if (!json.success) {
    throw new Error('Failed to get lastblock')
  }
  return json.result
}

export interface AddressInfo {
  address: string
  secondPublicKey?: string
  accountStatus?: number
}

/**
 * Get address info including second public key
 */
export async function getAddressInfo(
  rpcUrl: string,
  chainId: string,
  address: string,
): Promise<AddressInfo> {
  const response = await fetch(`${rpcUrl}/wallet/${chainId}/address/info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address }),
  })

  if (!response.ok) {
    return { address }
  }

  const result = (await response.json()) as AddressInfo | null
  return result ?? { address }
}

export interface CreateTransferParams {
  rpcUrl: string
  chainId: string
  mainSecret: string
  paySecret?: string | undefined
  from: string
  to: string
  amount: string
  assetType: string
  fee?: string | undefined
  remark?: Record<string, string> | undefined
}

/**
 * Create a transfer transaction using the SDK
 */
export async function createTransferTransaction(
  params: CreateTransferParams,
): Promise<BFChainCore.TransferAssetTransactionJSON> {
  const core = await getBioforestCore(params.chainId)

  // Get latest block for transaction timing
  const lastBlock = await getLastBlock(params.rpcUrl, params.chainId)
  const applyBlockHeight = lastBlock.height
  const timestamp = lastBlock.timestamp

  // Calculate fee if not provided
  let fee = params.fee
  if (!fee) {
    fee = await core.transactionController.getTransferTransactionMinFee({
      transaction: {
        applyBlockHeight,
        timestamp,
        remark: params.remark ?? {},
      },
      assetInfo: {
        sourceChainName: await core.getChainName(),
        sourceChainMagic: await core.getMagic(),
        assetType: params.assetType,
        amount: params.amount,
      },
    })
  }

  // Determine pay password version if set
  let usePaySecretV1 = false
  if (params.paySecret) {
    const addressInfo = await getAddressInfo(params.rpcUrl, params.chainId, params.from)
    if (addressInfo.secondPublicKey) {
      const version = await verifyPayPassword(
        params.chainId,
        params.mainSecret,
        params.paySecret,
        addressInfo.secondPublicKey,
      )
      usePaySecretV1 = version === 'v1'
    }
  }

  const secrets: Secrets = {
    mainSecret: params.mainSecret,
    ...(params.paySecret ? { paySecret: params.paySecret, usePaySecretV1 } : {}),
  }

  const assetInfo: TransferAssetInfo = {
    sourceChainName: await core.getChainName(),
    sourceChainMagic: await core.getMagic(),
    assetType: params.assetType,
    amount: params.amount,
  }

  return core.transactionController.createTransferTransactionJSON({
    secrets,
    transaction: {
      fee,
      recipientId: params.to,
      applyBlockHeight,
      timestamp,
      remark: params.remark ?? {},
      effectiveBlockHeight: applyBlockHeight + 100,
    },
    assetInfo,
  })
}

/**
 * Broadcast a signed transaction
 */
export async function broadcastTransaction(
  rpcUrl: string,
  chainId: string,
  transaction: BFChainCore.TransactionJSON,
): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { nonce, ...txWithoutNonce } = transaction as BFChainCore.TransactionJSON & {
    nonce?: number
  }

  const response = await fetch(`${rpcUrl}/wallet/${chainId}/transactions/broadcast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(txWithoutNonce),
  })

  const json = (await response.json()) as {
    success: boolean
    result?: { success: boolean; minFee?: string; message?: string }
    message?: string
  }

  if (!response.ok || !json.success) {
    const errorMsg = json.message ?? json.result?.message ?? `Broadcast failed: ${response.status}`
    throw new Error(errorMsg)
  }

  if (json.result && !json.result.success) {
    const msg = json.result.message ?? 'Transaction rejected'
    const minFee = json.result.minFee
    throw new Error(minFee ? `${msg} (minFee: ${minFee})` : msg)
  }

  return transaction.signature
}

/**
 * Verify pay password against stored second public key
 */
export async function verifyPayPassword(
  chainId: string,
  mainSecret: string,
  paySecret: string,
  secondPublicKey: string,
): Promise<'v2' | 'v1' | false> {
  const core = await getBioforestCore(chainId)
  const accountHelper = core.accountBaseHelper()

  // Try V2 first (newer algorithm)
  try {
    const keypairV2 = await accountHelper.createSecondSecretKeypairV2(mainSecret, paySecret)
    if (keypairV2.publicKey.toString('hex') === secondPublicKey) {
      return 'v2'
    }
  } catch {
    // V2 failed
  }

  // Try V1 (legacy algorithm)
  try {
    const keypairV1 = await accountHelper.createSecondSecretKeypair(mainSecret, paySecret)
    if (keypairV1.publicKey.toString('hex') === secondPublicKey) {
      return 'v1'
    }
  } catch {
    // V1 also failed
  }

  return false
}

/**
 * Get minimum fee for setting pay password
 */
export async function getSignatureTransactionMinFee(
  rpcUrl: string,
  chainId: string,
): Promise<string> {
  const core = await getBioforestCore(chainId)

  const lastBlock = await getLastBlock(rpcUrl, chainId)
  const applyBlockHeight = lastBlock.height
  const timestamp = lastBlock.timestamp

  return core.transactionController.getSignatureTransactionMinFee({
    newPaySecret: `${Date.now()}getSignatureTransactionMinFee`,
    applyBlockHeight,
    timestamp,
  })
}

export interface CreateSignatureParams {
  rpcUrl: string
  chainId: string
  mainSecret: string
  newPaySecret: string
  fee?: string | undefined
}

/**
 * Create a signature (pay password) transaction using the SDK
 */
export async function createSignatureTransaction(
  params: CreateSignatureParams,
): Promise<BFChainCore.TransactionJSON<BFChainCore.SignatureAssetJSON>> {
  const core = await getBioforestCore(params.chainId)

  const lastBlock = await getLastBlock(params.rpcUrl, params.chainId)
  const applyBlockHeight = lastBlock.height
  const timestamp = lastBlock.timestamp

  let fee = params.fee
  if (!fee) {
    fee = await core.transactionController.getSignatureTransactionMinFee({
      newPaySecret: params.newPaySecret,
      applyBlockHeight,
      timestamp,
    })
  }

  return core.transactionController.createSignatureTransactionJSON(
    { mainSecret: params.mainSecret },
    {
      newPaySecret: params.newPaySecret,
      fee,
      applyBlockHeight,
      timestamp,
      effectiveBlockHeight: applyBlockHeight + 100,
    },
  )
}

export interface SetPayPasswordParams {
  rpcUrl: string
  chainId: string
  mainSecret: string
  newPaySecret: string
}

/**
 * Set pay password (二次签名) for an account
 */
export async function setPayPassword(
  params: SetPayPasswordParams,
): Promise<{ txHash: string; success: boolean }> {
  const transaction = await createSignatureTransaction({
    rpcUrl: params.rpcUrl,
    chainId: params.chainId,
    mainSecret: params.mainSecret,
    newPaySecret: params.newPaySecret,
  })

  const txHash = await broadcastTransaction(
    params.rpcUrl,
    params.chainId,
    transaction as unknown as BFChainCore.TransactionJSON,
  )

  return { txHash, success: true }
}
