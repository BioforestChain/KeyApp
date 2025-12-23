/**
 * BioForest Chain API Client
 *
 * Type-safe, production-ready API client for BioForest Chain wallet APIs.
 * All methods handle the { success, result } response format automatically.
 */

import type {
  ApiResponse,
  ApiError,
  BlockInfo,
  BalanceInfo,
  AddressInfo,
  TransactionQueryResult,
  PendingTransaction,
  AccountAssetsResult,
  BroadcastResult,
  FeeResult,
  TransactionQueryParams,
  PendingQueryParams,
  AccountAssetsParams,
  Transaction,
} from './types'

export class BioForestApiError extends Error {
  constructor(
    message: string,
    public readonly code?: number,
    public readonly response?: ApiError,
  ) {
    super(message)
    this.name = 'BioForestApiError'
  }
}

export interface BioForestApiClientConfig {
  /** Base RPC URL (e.g., https://walletapi.bfmeta.info) */
  rpcUrl: string
  /** Chain ID (e.g., 'bfm') */
  chainId: string
  /** Request timeout in ms (default: 30000) */
  timeout?: number
  /** Custom fetch function (for testing) */
  fetch?: typeof fetch
}

/**
 * Type-safe BioForest Chain API Client
 *
 * @example
 * ```ts
 * const client = new BioForestApiClient({
 *   rpcUrl: 'https://walletapi.bfmeta.info',
 *   chainId: 'bfm',
 * })
 *
 * const block = await client.getLastBlock()
 * console.log(`Height: ${block.height}`)
 *
 * const balance = await client.getBalance('bXXX...', 'BFM')
 * console.log(`Balance: ${balance.amount}`)
 * ```
 */
export class BioForestApiClient {
  private readonly rpcUrl: string
  private readonly chainId: string
  private readonly timeout: number
  private readonly fetchFn: typeof fetch

  constructor(config: BioForestApiClientConfig) {
    this.rpcUrl = config.rpcUrl.replace(/\/$/, '') // Remove trailing slash
    this.chainId = config.chainId
    this.timeout = config.timeout ?? 30000
    this.fetchFn = config.fetch ?? fetch
  }

  /** Build full API URL */
  private url(path: string): string {
    return `${this.rpcUrl}/wallet/${this.chainId}${path}`
  }

  /** Make a GET request */
  private async get<T>(path: string): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await this.fetchFn(this.url(path), {
        method: 'GET',
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new BioForestApiError(`HTTP ${response.status}: ${response.statusText}`)
      }

      const json = (await response.json()) as ApiResponse<T> | ApiError

      if (!json.success) {
        const error = json as ApiError
        throw new BioForestApiError(
          error.message ?? error.error ?? 'API request failed',
          error.code,
          error,
        )
      }

      return (json as ApiResponse<T>).result
    } finally {
      clearTimeout(timeoutId)
    }
  }

  /** Make a POST request */
  private async post<T>(path: string, body: unknown): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await this.fetchFn(this.url(path), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new BioForestApiError(`HTTP ${response.status}: ${response.statusText}`)
      }

      const json = (await response.json()) as ApiResponse<T> | ApiError

      if (!json.success) {
        const error = json as ApiError
        throw new BioForestApiError(
          error.message ?? error.error ?? 'API request failed',
          error.code,
          error,
        )
      }

      return (json as ApiResponse<T>).result
    } finally {
      clearTimeout(timeoutId)
    }
  }

  // ============================================================
  // Block APIs
  // ============================================================

  /**
   * Get the latest block information
   */
  async getLastBlock(): Promise<BlockInfo> {
    return this.get<BlockInfo>('/lastblock')
  }

  /**
   * Get block height and timestamp (optimized for transaction creation)
   */
  async getBlockHeightAndTimestamp(): Promise<{ height: number; timestamp: number }> {
    const block = await this.getLastBlock()
    return { height: block.height, timestamp: block.timestamp }
  }

  // ============================================================
  // Address/Account APIs
  // ============================================================

  /**
   * Get account balance for a specific asset
   * @param address - Account address
   * @param assetType - Asset type (e.g., 'BFM')
   * @param magic - Chain magic (default: 'nxOGQ' for mainnet)
   */
  async getBalance(address: string, assetType: string, magic = 'nxOGQ'): Promise<BalanceInfo> {
    return this.post<BalanceInfo>('/address/balance', {
      address,
      magic,
      assetType,
    })
  }

  /**
   * Get account information including second public key (pay password)
   * @param address - Account address
   */
  async getAddressInfo(address: string): Promise<AddressInfo> {
    return this.post<AddressInfo>('/address/info', { address })
  }

  /**
   * Check if an account has pay password (second signature) set
   * @param address - Account address
   */
  async hasPayPassword(address: string): Promise<boolean> {
    const info = await this.getAddressInfo(address)
    return info.secondPublicKey !== null && info.secondPublicKey !== ''
  }

  /**
   * Get all assets for an account
   * @param params - Query parameters
   */
  async getAccountAssets(params: AccountAssetsParams): Promise<AccountAssetsResult> {
    return this.post<AccountAssetsResult>('/address/assets', params)
  }

  // ============================================================
  // Transaction APIs
  // ============================================================

  /**
   * Query transaction history
   * @param params - Query parameters
   */
  async queryTransactions(params: TransactionQueryParams): Promise<TransactionQueryResult> {
    return this.post<TransactionQueryResult>('/transactions/query', params)
  }

  /**
   * Get transaction history for an address
   * @param address - Account address
   * @param options - Additional options
   */
  async getTransactionHistory(
    address: string,
    options: { page?: number; pageSize?: number; maxHeight?: number } = {},
  ): Promise<TransactionQueryResult> {
    const maxHeight = options.maxHeight ?? (await this.getLastBlock()).height

    return this.queryTransactions({
      maxHeight,
      address,
      page: options.page ?? 1,
      pageSize: options.pageSize ?? 20,
      sort: -1,
    })
  }

  /**
   * Get pending (unconfirmed) transactions
   * @param params - Query parameters
   */
  async getPendingTransactions(params?: PendingQueryParams): Promise<PendingTransaction[]> {
    return this.post<PendingTransaction[]>('/pendingTr', params ?? { sort: -1 })
  }

  /**
   * Get pending transactions for a sender
   * @param senderId - Sender address
   */
  async getPendingTransactionsForSender(senderId: string): Promise<PendingTransaction[]> {
    return this.getPendingTransactions({ senderId, sort: -1 })
  }

  // ============================================================
  // Transaction Broadcast APIs
  // ============================================================

  /**
   * Broadcast a signed transaction
   * @param transaction - Signed transaction JSON
   * @returns Transaction signature (hash)
   */
  async broadcastTransaction(transaction: Transaction): Promise<string> {
    const result = await this.post<BroadcastResult>('/transactions/broadcast', transaction)

    if (!result.success) {
      throw new BioForestApiError(result.message ?? 'Broadcast failed')
    }

    return transaction.signature
  }

  // ============================================================
  // Fee Calculation APIs
  // ============================================================

  /**
   * Calculate minimum fee for a transaction
   * @param transaction - Transaction body for fee calculation
   */
  async calculateMinFee(transaction: {
    type: string
    senderId: string
    timestamp: number
    applyBlockHeight: number
    effectiveBlockHeight: number
    remark?: Record<string, string>
    asset?: Record<string, unknown>
    recipientId?: string
    amount?: string
    assetType?: string
    sourceChainMagic?: string
    sourceChainName?: string
  }): Promise<string> {
    const result = await this.post<FeeResult>('/transactions/fee', {
      transaction: {
        ...transaction,
        fee: '0', // Fee field is required but ignored for calculation
      },
    })
    return result.minFee
  }

  // ============================================================
  // Utility Methods
  // ============================================================

  /**
   * Format amount from chain units to display units
   * @param amount - Amount in chain units (1e8)
   * @param decimals - Number of decimal places (default: 8)
   */
  static formatAmount(amount: string | bigint, decimals = 8): string {
    const value = typeof amount === 'string' ? BigInt(amount) : amount
    const divisor = BigInt(10 ** decimals)
    const whole = value / divisor
    const fraction = value % divisor
    const fractionStr = fraction.toString().padStart(decimals, '0').replace(/0+$/, '')
    return fractionStr ? `${whole}.${fractionStr}` : whole.toString()
  }

  /**
   * Parse amount from display units to chain units
   * @param amount - Amount in display units (e.g., '1.5')
   * @param decimals - Number of decimal places (default: 8)
   */
  static parseAmount(amount: string, decimals = 8): string {
    const [whole, fraction = ''] = amount.split('.')
    const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals)
    return BigInt(whole + paddedFraction).toString()
  }

  /**
   * Get chain configuration
   */
  getConfig(): { rpcUrl: string; chainId: string } {
    return { rpcUrl: this.rpcUrl, chainId: this.chainId }
  }
}

/** Default mainnet client factory */
export function createMainnetClient(): BioForestApiClient {
  return new BioForestApiClient({
    rpcUrl: 'https://walletapi.bfmeta.info',
    chainId: 'bfm',
  })
}
