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

/** API client cache by baseUrl */
const apiCache = new Map<string, BnqklWalletBioforestApi>()

/**
 * Parse a full wallet API URL into baseUrl and chainPath components
 * e.g., "https://walletapi.bf-meta.org/wallet/bfmetav2" => { baseUrl: "https://walletapi.bf-meta.org", chainPath: "bfmetav2" }
 */
function parseWalletUrl(fullUrl: string): { baseUrl: string; chainPath: string } {
  const match = fullUrl.match(/^(https?:\/\/[^/]+)\/wallet\/([^/]+)\/?$/)
  if (match) {
    return { baseUrl: match[1], chainPath: match[2] }
  }
  // Fallback: assume the URL is just a base URL without path
  // This shouldn't happen with proper config, but provides safety
  throw new Error(`Invalid wallet API URL format: ${fullUrl}. Expected format: https://host/wallet/chainPath`)
}

/**
 * Get or create a BnqklWalletBioforestApi instance from a full URL
 * @param fullUrl - Full wallet API URL (e.g., "https://walletapi.bf-meta.org/wallet/bfmetav2")
 */
function getApi(fullUrl: string): BnqklWalletBioforestApi {
  let api = apiCache.get(fullUrl)
  if (!api) {
    const { baseUrl, chainPath } = parseWalletUrl(fullUrl)
    api = new BnqklWalletBioforestApi({ baseUrl, chainPath })
    apiCache.set(fullUrl, api)
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

/** Import options for JSON modules (needed for Node.js, not for browser/Vite) */
let genesisImportOptions: object | undefined = undefined

/**
 * Set import options for genesis block fetching (Node.js environments)
 * @param importOptions - Import options (e.g., { with: { type: 'json' } } for Node.js)
 */
export function setGenesisImportOptions(importOptions?: object): void {
  genesisImportOptions = importOptions
  genesisCache.clear() // Clear cache when options change
}

/**
 * Load genesis block from configured path
 * - Path is relative to ./configs/ directory
 * - Browser (http/https): uses fetch()
 * - Node.js (file://): uses import() with { with: { type: 'json' } }
 * 
 * @param chainId - Chain ID for caching
 * @param genesisBlockPath - Path relative to configs directory (e.g., "./genesis/bfmeta.json")
 */
export async function fetchGenesisBlock(
  chainId: string,
  genesisBlockPath: string,
): Promise<BFChainCore.BlockJSON<BFChainCore.GenesisBlockAssetJSON>> {
  const cacheKey = genesisBlockPath
  const cached = genesisCache.get(cacheKey)
  if (cached) {
    return cached
  }

  // Resolve genesisBlockPath relative to ./configs/ directory
  let url: string
  if (typeof document !== 'undefined') {
    url = new URL(`./configs/${genesisBlockPath.replace(/^\.\//, '')}`, document.baseURI).href
  } else {
    url = `./configs/${genesisBlockPath.replace(/^\.\//, '')}`
  }

  let genesis: BFChainCore.BlockJSON<BFChainCore.GenesisBlockAssetJSON>
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Browser: use fetch() for JSON files
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch genesis block for ${chainId}: ${response.status}`)
    }
    genesis = await response.json()
  } else {
    // Node.js: use import() with import attributes
    const module = genesisImportOptions
      ? await import(/* @vite-ignore */ url, genesisImportOptions as ImportCallOptions)
      : await import(/* @vite-ignore */ url)
    genesis = module.default
  }

  genesisCache.set(cacheKey, genesis)
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
 * @param chainId - Chain ID
 */
export async function getBioforestCore(chainId: string): Promise<BioforestChainBundleCore> {
  // 使用 chain-config 作为唯一可信源获取 genesisBlock 路径
  const { chainConfigService } = await import('@/services/chain-config')
  const genesisBlockPath = chainConfigService.getBiowalletGenesisBlock(chainId)

  if (!genesisBlockPath) {
    throw new Error(`Genesis block path not configured for chain: ${chainId}`)
  }

  const genesis = await fetchGenesisBlock(chainId, genesisBlockPath)
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
 * @param baseUrl - Full wallet API URL (e.g., "https://walletapi.bf-meta.org/wallet/bfm")
 */
export async function getLastBlock(
  baseUrl: string,
): Promise<{ height: number; timestamp: number }> {
  const api = getApi(baseUrl)
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
 * @param baseUrl - Full wallet API URL
 * @param address - Address to query
 */
export async function getAddressInfo(
  baseUrl: string,
  address: string,
): Promise<AddressInfo> {
  const api = getApi(baseUrl)
  try {
    const result = await api.getAddressInfo(address)
    return result ?? { address }
  } catch {
    return { address }
  }
}

/**
 * @deprecated
 * Get account balance for the main asset type
 * @param baseUrl - Full wallet API URL
 * @param chainId - Chain ID for loading genesis/core
 * @param address - Address to query
 */
export async function getAccountBalance(
  baseUrl: string,
  chainId: string,
  address: string,
): Promise<string> {
  const core = await getBioforestCore(chainId)
  const assetType = await core.getAssetType()

  const api = getApi(baseUrl)
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
  /** Full wallet API URL (e.g., "https://walletapi.bf-meta.org/wallet/bfm") */
  baseUrl: string
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
 * @deprecated
 * Create a transfer transaction using the SDK
 */
export async function createTransferTransaction(
  params: CreateTransferParams,
): Promise<BFChainCore.TransferAssetTransactionJSON> {
  const core = await getBioforestCore(params.chainId)

  // Get latest block for transaction timing
  const lastBlock = await getLastBlock(params.baseUrl)
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
    const addressInfo = await getAddressInfo(params.baseUrl, params.from)
    if (addressInfo.secondPublicKey) {
      const version = await verifyTwoStepSecret(
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

import { BroadcastError, type BroadcastResult } from './errors'
import { BroadcastResultSchema } from '@/apis/bnqkl_wallet/bioforest/types'
import { ApiError } from '@/apis/bnqkl_wallet/client'

/**
 * Broadcast a signed transaction
 * @param baseUrl - Full wallet API URL
 * @param transaction - Signed transaction to broadcast
 * @returns BroadcastResult with txHash and alreadyExists flag
 * @throws {BroadcastError} if broadcast fails
 */
export async function broadcastTransaction(
  baseUrl: string,
  transaction: BFChainCore.TransactionJSON,
): Promise<BroadcastResult> {
  const { nonce: _nonce, ...txWithoutNonce } = transaction as BFChainCore.TransactionJSON & {
    nonce?: number
  }

  const api = getApi(baseUrl)

  try {
    const rawResult = await api.broadcastTransaction(txWithoutNonce)

    // Case 1: API 返回交易对象本身 = 成功
    // ApiClient 在 success=true 时返回 json.result，即交易对象
    if (rawResult && typeof rawResult === 'object' && 'signature' in rawResult) {

      return { txHash: transaction.signature, alreadyExists: false }
    }

    // Case 2: API 返回错误对象或状态对象
    const parseResult = BroadcastResultSchema.safeParse(rawResult)
    if (parseResult.success) {
      const result = parseResult.data
      if (!result.success) {
        const errorCode = result.error?.code
        const errorMsg = result.error?.message ?? result.message ?? 'Transaction rejected'

        // 001-00034: 交易已存在（重复广播），视为成功但标记 alreadyExists
        if (errorCode === '001-00034') {

          return { txHash: transaction.signature, alreadyExists: true }
        }

        throw new BroadcastError(errorCode, errorMsg, result.minFee)
      }
      // success=true 的情况
      return { txHash: transaction.signature, alreadyExists: false }
    }

    // Case 3: 未知格式，假设成功（保守处理）

    return { txHash: transaction.signature, alreadyExists: false }
  } catch (error) {
    // Re-throw BroadcastError as-is
    if (error instanceof BroadcastError) {
      throw error
    }

    // Extract broadcast error info from ApiError
    if (error instanceof ApiError && error.response) {
      const parseResult = BroadcastResultSchema.safeParse(error.response)
      if (parseResult.success) {
        const result = parseResult.data
        const errorCode = result.error?.code
        const errorMsg = result.error?.message ?? result.message ?? 'Transaction rejected'

        // 001-00034: 交易已存在（重复广播），视为成功但标记 alreadyExists
        if (errorCode === '001-00034') {

          return { txHash: transaction.signature, alreadyExists: true }
        }

        throw new BroadcastError(errorCode, errorMsg, result.minFee)
      }
    }

    // Fallback: wrap unknown errors
    throw new BroadcastError(
      undefined,
      error instanceof Error ? error.message : 'Transaction rejected',
    )
  }
}

/**
 * Verify pay password against stored second public key
 */
export async function verifyTwoStepSecret(
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

// ===== Fee Estimation APIs =====

export type FeeIntent =
  | { type: 'transfer'; amount: string; remark?: Record<string, string> }
  | { type: 'setPayPassword' }

export interface GetMinFeeParams {
  /** Full wallet API URL */
  baseUrl: string
  /** Chain ID */
  chainId: string
  /** Fee calculation intent */
  intent: FeeIntent
  /** Sender address (for checking if has pay password) */
  fromAddress?: string
}

/**
 * Get minimum fee based on transaction intent
 * 
 * Fee calculation considers:
 * - Transaction type (transfer, setPayPassword, etc.)
 * - Whether sender has pay password set (affects transaction size)
 * - Remark content size
 * - Transfer amount
 * 
 * @param params - Fee calculation parameters
 * @returns Minimum fee in raw string format
 */
export async function getMinFee(params: GetMinFeeParams): Promise<string> {
  const { baseUrl, chainId, intent, fromAddress } = params
  const core = await getBioforestCore(chainId)
  const lastBlock = await getLastBlock(baseUrl)
  const applyBlockHeight = lastBlock.height
  const timestamp = lastBlock.timestamp

  switch (intent.type) {
    case 'transfer': {
      // Check if sender has pay password (secondPublicKey)
      // This affects transaction size because it requires signSignature
      let hasPayPassword = false
      if (fromAddress) {
        try {
          const addressInfo = await getAddressInfo(baseUrl, fromAddress)
          hasPayPassword = !!addressInfo.secondPublicKey
        } catch {
          // Ignore errors, assume no pay password
        }
      }

      // Use a large amount to get maximum fee estimation
      // The SDK calculates fee based on transaction bytes
      const estimationAmount = intent.amount || '99999999999999999'

      let minFee = await core.transactionController.getTransferTransactionMinFee({
        transaction: {
          applyBlockHeight,
          timestamp,
          remark: intent.remark ?? {},
        },
        assetInfo: {
          sourceChainName: await core.getChainName(),
          sourceChainMagic: await core.getMagic(),
          assetType: await core.getAssetType(),
          amount: estimationAmount,
        },
      })

      // If has pay password, the transaction will have signSignature
      // which adds ~64 bytes to the transaction, increasing fee
      if (hasPayPassword) {
        // Add ~5% buffer for signSignature overhead
        minFee = String(BigInt(minFee) * BigInt(105) / BigInt(100))
      }

      return minFee
    }

    case 'setPayPassword': {
      return core.transactionController.getSignatureTransactionMinFee({
        newPaySecret: `${Date.now()}getSignatureTransactionMinFee`,
        applyBlockHeight,
        timestamp,
      })
    }

    default:
      throw new Error(`Unknown fee intent type: ${(intent as FeeIntent).type}`)
  }
}

/**
 * Get minimum fee for transfer transaction
 * @param baseUrl - Full wallet API URL
 * @param chainId - Chain ID
 * @param fromAddress - Sender address (to check pay password)
 * @param amount - Transfer amount
 * @param remark - Transaction remark
 */
export async function getTransferMinFee(
  baseUrl: string,
  chainId: string,
  fromAddress?: string,
  amount?: string,
  remark?: Record<string, string>,
): Promise<string> {
  return getMinFee({
    baseUrl,
    chainId,
    intent: { type: 'transfer', amount: amount ?? '0', remark },
    fromAddress,
  })
}

/**
 * Get minimum fee for setting pay password
 * @param baseUrl - Full wallet API URL
 * @param chainId - Chain ID
 */
export async function getSignatureTransactionMinFee(
  baseUrl: string,
  chainId: string,
): Promise<string> {
  const core = await getBioforestCore(chainId)

  const lastBlock = await getLastBlock(baseUrl)
  const applyBlockHeight = lastBlock.height
  const timestamp = lastBlock.timestamp

  return core.transactionController.getSignatureTransactionMinFee({
    newPaySecret: `${Date.now()}getSignatureTransactionMinFee`,
    applyBlockHeight,
    timestamp,
  })
}

export interface CreateSignatureParams {
  /** Full wallet API URL */
  baseUrl: string
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

  const lastBlock = await getLastBlock(params.baseUrl)
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

export interface SetTwoStepSecretParams {
  /** Full wallet API URL */
  baseUrl: string
  chainId: string
  mainSecret: string
  newPaySecret: string
}

/**
 * Set pay password (二次签名) for an account
 */
export async function setTwoStepSecret(
  params: SetTwoStepSecretParams,
): Promise<{ txHash: string; success: boolean }> {
  const transaction = await createSignatureTransaction({
    baseUrl: params.baseUrl,
    chainId: params.chainId,
    mainSecret: params.mainSecret,
    newPaySecret: params.newPaySecret,
  })

  // 广播可能返回 "rejected" 但交易实际成功，忽略异常
  await broadcastTransaction(
    params.baseUrl,
    transaction as unknown as BFChainCore.TransactionJSON,
  ).catch(() => { })

  return { txHash: transaction.signature, success: true }
}

// ============================================================================
// Destroy Asset (销毁资产)
// ============================================================================

export interface DestroyAssetInfo {
  sourceChainName: string
  sourceChainMagic: string
  assetType: string
  amount: string
}

export interface CreateDestroyParams {
  /** Full wallet API URL */
  baseUrl: string
  chainId: string
  mainSecret: string
  paySecret?: string | undefined
  from: string
  /** Recipient address - usually the asset's applyAddress (issuer) */
  recipientId: string
  assetType: string
  amount: string
  fee?: string | undefined
  remark?: Record<string, string> | undefined
}

/**
 * Get minimum fee for destroying an asset
 */
export async function getDestroyTransactionMinFee(
  baseUrl: string,
  chainId: string,
  assetType: string,
  amount: string,
): Promise<string> {
  const core = await getBioforestCore(chainId)

  const lastBlock = await getLastBlock(baseUrl)
  const applyBlockHeight = lastBlock.height
  const timestamp = lastBlock.timestamp

  // SDK method uses "Destory" spelling (typo in SDK)
  const controller = core.transactionController as unknown as {
    getDestoryAssetTransactionMinFee: (params: unknown) => Promise<string>
  }
  return controller.getDestoryAssetTransactionMinFee({
    transaction: {
      applyBlockHeight,
      timestamp,
      remark: {},
    },
    assetInfo: {
      sourceChainName: await core.getChainName(),
      sourceChainMagic: await core.getMagic(),
      assetType,
      amount,
    },
  })
}

/**
 * Create a destroy asset transaction using the SDK
 * 
 * NOTE: The SDK uses "Destory" (typo from legacy code, not "Destroy")
 */
export async function createDestroyTransaction(
  params: CreateDestroyParams,
): Promise<BFChainCore.TransactionJSON> {
  const core = await getBioforestCore(params.chainId)

  const lastBlock = await getLastBlock(params.baseUrl)
  const applyBlockHeight = lastBlock.height
  const timestamp = lastBlock.timestamp

  // Calculate fee if not provided
  let fee = params.fee
  if (!fee) {
    fee = await getDestroyTransactionMinFee(
      params.baseUrl,
      params.chainId,
      params.assetType,
      params.amount,
    )
  }

  // Determine pay password version if set
  let usePaySecretV1 = false
  if (params.paySecret) {
    const addressInfo = await getAddressInfo(params.baseUrl, params.from)
    if (addressInfo.secondPublicKey) {
      const version = await verifyTwoStepSecret(
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

  const assetInfo: DestroyAssetInfo = {
    sourceChainName: await core.getChainName(),
    sourceChainMagic: await core.getMagic(),
    assetType: params.assetType,
    amount: params.amount,
  }

  // SDK method uses "Destory" spelling (typo in SDK)
  const controller = core.transactionController as unknown as {
    createDestoryAssetTransactionJSON: (params: unknown) => Promise<BFChainCore.TransactionJSON>
  }
  return controller.createDestoryAssetTransactionJSON({
    secrets,
    transaction: {
      fee,
      recipientId: params.recipientId,
      applyBlockHeight,
      timestamp,
      remark: params.remark ?? {},
      effectiveBlockHeight: applyBlockHeight + 100,
    },
    assetInfo,
  })
}

/**
 * Get asset detail including applyAddress (issuer address)
 * @param baseUrl - Full wallet API URL
 * @param assetType - Asset type to query
 * @param address - Address to query (required by API)
 */
export async function getAssetDetail(
  baseUrl: string,
  assetType: string,
  address: string,
): Promise<{ applyAddress: string; assetType: string } | null> {
  const api = getApi(baseUrl)
  try {
    const result = await api.queryTokenDetail({ assetType, address })
    if (result?.applyAddress) {
      return {
        applyAddress: result.applyAddress,
        assetType: result.assetType,
      }
    }
    return null
  } catch {
    return null
  }
}
