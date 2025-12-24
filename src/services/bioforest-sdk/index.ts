/**
 * BioForest Chain SDK Integration
 *
 * This module provides the BioForest Chain SDK for transaction creation
 * and signing. The SDK bundle and genesis blocks are loaded dynamically at runtime.
 *
 * Architecture:
 * - SDK bundle: precompiled .cjs file (TODO: Issue #101 - migrate to npm @bfchain/core)
 * - Genesis blocks: fetched from public/configs/genesis/{chainId}.json
 * - Network API: delegated to apis/bnqkl_wallet/bioforest (external dependency)
 *
 * This SDK is the ONLY entry point for chain-adapter and hooks.
 * Other services should NOT directly depend on apis/bnqkl_wallet.
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

import { BnqklWalletBioforestApi } from '@/apis/bnqkl_wallet/bioforest'

/** API client cache by baseUrl+chainPath */
const apiCache = new Map<string, BnqklWalletBioforestApi>()

/**
 * Get or create a BnqklWalletBioforestApi instance
 */
function getApi(baseUrl: string, chainPath: string): BnqklWalletBioforestApi {
  const key = `${baseUrl}|${chainPath}`
  let api = apiCache.get(key)
  if (!api) {
    api = new BnqklWalletBioforestApi({ baseUrl, chainPath })
    apiCache.set(key, api)
  }
  return api
}

/** Genesis block cache by chainId */
const genesisCache = new Map<string, BFChainCore.BlockJSON<BFChainCore.GenesisBlockAssetJSON>>()

/** Core instances cache by chain magic */
const coreCache = new Map<string, BioforestChainBundleCore>()

/** SDK bundle singleton */
let bundleModule: BioforestChainBundle | null = null
let bundlePromise: Promise<BioforestChainBundle> | null = null

/** Base URL for fetching genesis blocks (configurable for different environments) */
let genesisBaseUrl: string | null = null // null means use document.baseURI

/** Import options for JSON modules (needed for Node.js, not for browser/Vite) */
let genesisImportOptions: object | undefined = undefined

/**
 * Set base URL for genesis block fetching
 * - Browser: null (default, uses document.baseURI + '/configs/genesis')
 * - Node.js: 'file:///absolute/path/to/public/configs/genesis'
 * @param baseUrl - Base URL for genesis files
 * @param importOptions - Import options (e.g., { with: { type: 'json' } } for Node.js)
 */
export function setGenesisBaseUrl(baseUrl: string, importOptions?: object): void {
  genesisBaseUrl = baseUrl
  genesisImportOptions = importOptions
  genesisCache.clear() // Clear cache when base URL changes
}

/** Get the effective base URL for genesis files */
function getGenesisBaseUrl(): string {
  if (genesisBaseUrl) {
    return genesisBaseUrl
  }
  // Browser: use document.baseURI to get full HTTP URL
  if (typeof document !== 'undefined') {
    return new URL('/configs/genesis', document.baseURI).href
  }
  // Fallback
  return '/configs/genesis'
}

/**
 * Load genesis block from {baseUrl}/{chainId}.json
 * - Browser (http/https): uses fetch()
 * - Node.js (file://): uses import() with { with: { type: 'json' } }
 */
async function fetchGenesisBlock(
  chainId: string,
): Promise<BFChainCore.BlockJSON<BFChainCore.GenesisBlockAssetJSON>> {
  const cached = genesisCache.get(chainId)
  if (cached) {
    return cached
  }

  const url = `${getGenesisBaseUrl()}/${chainId}.json`
  
  let genesis: BFChainCore.BlockJSON<BFChainCore.GenesisBlockAssetJSON>
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Browser: use fetch() for JSON files
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch genesis block: ${response.status}`)
    }
    genesis = await response.json()
  } else {
    // Node.js: use import() with import attributes
    const module = genesisImportOptions
      ? await import(/* @vite-ignore */ url, genesisImportOptions as ImportCallOptions)
      : await import(/* @vite-ignore */ url)
    genesis = module.default
  }

  genesisCache.set(chainId, genesis)
  return genesis
}

/**
 * Create crypto helper compatible with the SDK
 * Uses @noble/hashes for cross-platform compatibility (Node.js + browser)
 */
async function createCryptoHelper(): Promise<BFChainCore.CryptoHelperInterface> {
  // Dynamic import for tree-shaking, use .js extension for ESM compatibility
  const { sha256 } = await import('@noble/hashes/sha2.js')
  const { md5, ripemd160 } = await import('@noble/hashes/legacy.js')
  
  // Helper to create chainable hash object
  const createChainable = (hashFn: (data: Uint8Array) => Uint8Array) => {
    const chunks: Uint8Array[] = []
    return {
      update(data: Uint8Array | string): BFChainCore.CryptoAsyncHash {
        const input = typeof data === 'string' ? new TextEncoder().encode(data) : data
        chunks.push(input)
        return this
      },
      async digest(): Promise<Buffer> {
        const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
        const combined = new Uint8Array(totalLength)
        let offset = 0
        for (const chunk of chunks) {
          combined.set(chunk, offset)
          offset += chunk.length
        }
        return Buffer.from(hashFn(combined))
      }
    }
  }

  const cryptoHelper: BFChainCore.CryptoHelperInterface = {
    sha256(data?: Uint8Array | string): Promise<Buffer> | BFChainCore.CryptoAsyncHash {
      if (!data) {
        return createChainable((d) => sha256(d))
      }
      const input = typeof data === 'string' ? new TextEncoder().encode(data) : data
      return Promise.resolve(Buffer.from(sha256(input)))
    },
    md5(data?: Uint8Array | string): Promise<Buffer> | BFChainCore.CryptoAsyncHash {
      if (!data) {
        return createChainable((d) => md5(d))
      }
      const input = typeof data === 'string' ? new TextEncoder().encode(data) : data
      return Promise.resolve(Buffer.from(md5(input)))
    },
    ripemd160(data?: Uint8Array | string): Promise<Buffer> | BFChainCore.CryptoAsyncHash {
      if (!data) {
        return createChainable((d) => ripemd160(d))
      }
      const input = typeof data === 'string' ? new TextEncoder().encode(data) : data
      return Promise.resolve(Buffer.from(ripemd160(input)))
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
    const module = await import('./bioforest-chain-bundle.js')
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
 * @param rpcUrl - API base URL (e.g., "https://walletapi.bfmeta.info")
 * @param apiPath - API provider's chain path (e.g., "bfm" not "bfmeta")
 */
export async function getLastBlock(
  rpcUrl: string,
  apiPath: string,
): Promise<{ height: number; timestamp: number }> {
  const api = getApi(rpcUrl, apiPath)
  const block = await api.getLastBlock()
  return { height: block.height, timestamp: block.timestamp }
}

export interface AddressInfo {
  address: string
  secondPublicKey?: string
  accountStatus?: number
}

/**
 * Get address info including second public key
 * @param rpcUrl - API base URL
 * @param apiPath - API provider's chain path (e.g., "bfm")
 * @param address - Address to query
 */
export async function getAddressInfo(
  rpcUrl: string,
  apiPath: string,
  address: string,
): Promise<AddressInfo> {
  const api = getApi(rpcUrl, apiPath)
  try {
    const result = await api.getAddressInfo(address)
    return result ?? { address }
  } catch {
    return { address }
  }
}

/**
 * Get account balance for the main asset type
 * @param rpcUrl - API base URL
 * @param chainId - Chain ID for loading genesis/core
 * @param address - Address to query
 * @param apiPath - Optional API path override
 */
export async function getAccountBalance(
  rpcUrl: string,
  chainId: string,
  address: string,
  apiPath?: string,
): Promise<string> {
  const core = await getBioforestCore(chainId)
  const assetType = await core.getAssetType()
  const chainPath = apiPath ?? assetType.toLowerCase()
  
  const api = getApi(rpcUrl, chainPath)
  try {
    const result = await api.getAddressAssets(address)
    if (!result?.assets) {
      return '0'
    }
    // Find main asset in nested structure
    for (const magicAssets of Object.values(result.assets)) {
      const asset = magicAssets[assetType]
      if (asset) {
        return asset.assetNumber
      }
    }
    return '0'
  } catch {
    return '0'
  }
}

export interface CreateTransferParams {
  rpcUrl: string
  chainId: string
  /** API path for the provider (e.g., "bfm" for bfmeta) */
  apiPath?: string
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
  const apiPath = params.apiPath ?? params.chainId

  // Get latest block for transaction timing
  const lastBlock = await getLastBlock(params.rpcUrl, apiPath)
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
    const addressInfo = await getAddressInfo(params.rpcUrl, apiPath, params.from)
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
 * @param rpcUrl - API base URL
 * @param apiPath - API provider's chain path
 * @param transaction - Signed transaction to broadcast
 */
export async function broadcastTransaction(
  rpcUrl: string,
  apiPath: string,
  transaction: BFChainCore.TransactionJSON,
): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { nonce, ...txWithoutNonce } = transaction as BFChainCore.TransactionJSON & {
    nonce?: number
  }

  const api = getApi(rpcUrl, apiPath)
  const result = await api.broadcastTransaction(txWithoutNonce)

  if (!result.success) {
    const msg = result.message ?? 'Transaction rejected'
    const minFee = result.minFee
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
  apiPath: string,
  chainId: string,
): Promise<string> {
  const core = await getBioforestCore(chainId)

  const lastBlock = await getLastBlock(rpcUrl, apiPath)
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
  /** API path (e.g., "bfm" for bfmeta) - defaults to asset type lowercase */
  apiPath?: string
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
  const apiPath = params.apiPath ?? (await core.getAssetType()).toLowerCase()

  const lastBlock = await getLastBlock(params.rpcUrl, apiPath)
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
  /** API path for the provider (e.g., "bfm" for bfmeta) */
  apiPath?: string
  mainSecret: string
  newPaySecret: string
}

/**
 * Set pay password (二次签名) for an account
 */
export async function setPayPassword(
  params: SetPayPasswordParams,
): Promise<{ txHash: string; success: boolean }> {
  const core = await getBioforestCore(params.chainId)
  const apiPath = params.apiPath ?? (await core.getAssetType()).toLowerCase()

  const transaction = await createSignatureTransaction({
    rpcUrl: params.rpcUrl,
    chainId: params.chainId,
    apiPath,
    mainSecret: params.mainSecret,
    newPaySecret: params.newPaySecret,
  })

  // 广播可能返回 "rejected" 但交易实际成功，忽略异常
  await broadcastTransaction(
    params.rpcUrl,
    apiPath,
    transaction as unknown as BFChainCore.TransactionJSON,
  ).catch(() => {})

  return { txHash: transaction.signature, success: true }
}
