/**
 * Moralis API Provider (Effect TS - 深度重构)
 * 
 * 使用 Effect 原生 Source API 实现响应式数据获取
 * - transactionHistory: 定时轮询 + 事件触发
 * - balance/tokenBalances: 依赖 transactionHistory 变化
 */

import { Effect, Schedule, Duration } from "effect"
import { Schema as S } from "effect"
import {
  httpFetchCached,
  createStreamInstanceFromSource,
  createPollingSource,
  createDependentSource,
  txConfirmedEvent,
  type FetchError,
  type DataSource,
  type EventBusService,
} from "@biochain/chain-effect"
import type { StreamInstance } from "@biochain/chain-effect"
import type {
  ApiProvider,
  TokenBalance,
  Transaction,
  Direction,
  Action,
  BalanceOutput,
  TokenBalancesOutput,
  TransactionsOutput,
  TransactionStatusOutput,
  AddressParams,
  TxHistoryParams,
  TransactionStatusParams,
} from "./types"
import type { ParsedApiEntry } from "@/services/chain-config"
import { chainConfigService } from "@/services/chain-config"
import { Amount } from "@/types/amount"
import { EvmIdentityMixin } from "../evm/identity-mixin"
import { EvmTransactionMixin } from "../evm/transaction-mixin"
import { getApiKey } from "./api-key-picker"
import { getWalletEventBus } from "@/services/chain-adapter/wallet-event-bus"

// ==================== 链 ID 映射 ====================

const MORALIS_CHAIN_MAP: Record<string, string> = {
  ethereum: "eth",
  binance: "bsc",
  polygon: "polygon",
  avalanche: "avalanche",
  fantom: "fantom",
  arbitrum: "arbitrum",
  optimism: "optimism",
  base: "base",
}

// ==================== Effect Schema 定义 ====================

const NativeBalanceResponseSchema = S.Struct({
  balance: S.String,
})
type NativeBalanceResponse = S.Schema.Type<typeof NativeBalanceResponseSchema>

const TxReceiptResultSchema = S.Struct({
  transactionHash: S.String,
  blockNumber: S.String,
  status: S.optional(S.String),
})

const TxReceiptRpcResponseSchema = S.Struct({
  jsonrpc: S.String,
  id: S.Number,
  result: S.NullOr(TxReceiptResultSchema),
})
type TxReceiptRpcResponse = S.Schema.Type<typeof TxReceiptRpcResponseSchema>

const TokenBalanceItemSchema = S.Struct({
  token_address: S.String,
  symbol: S.String,
  name: S.String,
  decimals: S.Number,
  balance: S.String,
  logo: S.optional(S.NullOr(S.String)),
  thumbnail: S.optional(S.NullOr(S.String)),
  possible_spam: S.optional(S.Boolean),
  verified_contract: S.optional(S.Boolean),
  total_supply: S.optional(S.NullOr(S.String)),
  security_score: S.optional(S.NullOr(S.Number)),
})
type TokenBalanceItem = S.Schema.Type<typeof TokenBalanceItemSchema>

const TokenBalancesResponseSchema = S.Array(TokenBalanceItemSchema)

const NativeTransferSchema = S.Struct({
  from_address: S.String,
  to_address: S.String,
  value: S.String,
  value_formatted: S.optional(S.NullOr(S.String)),
  direction: S.optional(S.Literal("send", "receive")),
  token_symbol: S.optional(S.NullOr(S.String)),
  token_logo: S.optional(S.NullOr(S.String)),
})

const Erc20TransferSchema = S.Struct({
  from_address: S.String,
  to_address: S.String,
  value: S.String,
  value_formatted: S.optional(S.NullOr(S.String)),
  token_name: S.optional(S.NullOr(S.String)),
  token_symbol: S.optional(S.NullOr(S.String)),
  token_decimals: S.optional(S.NullOr(S.String)),
  token_logo: S.optional(S.NullOr(S.String)),
  address: S.String,
})

const WalletHistoryItemSchema = S.Struct({
  hash: S.String,
  from_address: S.String,
  to_address: S.NullOr(S.String),
  value: S.String,
  block_timestamp: S.String,
  block_number: S.String,
  receipt_status: S.optional(S.String),
  transaction_fee: S.optional(S.String),
  category: S.optional(S.String),
  summary: S.optional(S.String),
  possible_spam: S.optional(S.Boolean),
  from_address_entity: S.optional(S.NullOr(S.String)),
  to_address_entity: S.optional(S.NullOr(S.String)),
  native_transfers: S.optional(S.Array(NativeTransferSchema)),
  erc20_transfers: S.optional(S.Array(Erc20TransferSchema)),
})

const WalletHistoryResponseSchema = S.Struct({
  result: S.Array(WalletHistoryItemSchema),
  cursor: S.optional(S.NullOr(S.String)),
  page: S.optional(S.Number),
  page_size: S.optional(S.Number),
})
type WalletHistoryResponse = S.Schema.Type<typeof WalletHistoryResponseSchema>

// ==================== 工具函数 ====================

function getDirection(from: string, to: string, address: string): Direction {
  const fromLower = from.toLowerCase()
  const toLower = to.toLowerCase()
  const addrLower = address.toLowerCase()
  if (fromLower === addrLower && toLower === addrLower) return "self"
  if (fromLower === addrLower) return "out"
  return "in"
}

function mapCategory(category: string | undefined): Action {
  switch (category) {
    case "send":
    case "receive":
      return "transfer"
    case "token send":
    case "token receive":
      return "transfer"
    case "nft send":
    case "nft receive":
      return "transfer"
    case "approve":
      return "approve"
    case "contract interaction":
      return "contract"
    default:
      return "transfer"
  }
}

// ==================== 判断交易列表是否变化 ====================

function hasTransactionListChanged(
  prev: TransactionsOutput | null,
  next: TransactionsOutput
): boolean {
  if (!prev) return true
  if (prev.length !== next.length) return true
  if (prev.length === 0 && next.length === 0) return false
  return prev[0]?.hash !== next[0]?.hash
}

// ==================== Retry Schedule for 429 ====================

const rateLimitRetrySchedule = Schedule.exponential(Duration.seconds(5), 2).pipe(
  Schedule.compose(Schedule.recurs(3)),
  Schedule.whileInput((error: FetchError) =>
    error._tag === "RateLimitError" ||
    (error._tag === "HttpError" && (error.status === 429 || error.status === 401))
  )
)

// ==================== Base Class for Mixins ====================

class MoralisBase {
  readonly chainId: string
  readonly type: string
  readonly endpoint: string
  readonly config?: Record<string, unknown>

  constructor(entry: ParsedApiEntry, chainId: string) {
    this.type = entry.type
    this.endpoint = entry.endpoint
    this.config = entry.config
    this.chainId = chainId
  }
}

// ==================== Provider 实现 ====================

export class MoralisProviderEffect extends EvmIdentityMixin(EvmTransactionMixin(MoralisBase)) implements ApiProvider {
  private readonly symbol: string
  private readonly decimals: number
  private readonly moralisChain: string
  private readonly apiKey: string
  private readonly baseUrl: string

  private readonly txStatusInterval: number
  private readonly erc20Interval: number

  private readonly rpcUrl: string

  // Provider 级别共享的 EventBus（延迟初始化）
  private _eventBus: EventBusService | null = null
  private _txHistorySources = new Map<
    string,
    {
      source: DataSource<TransactionsOutput>
      refCount: number
      stopAll: Effect.Effect<void>
    }
  >()
  private _txHistoryCreations = new Map<string, Promise<DataSource<TransactionsOutput>>>()
  private _balanceSources = new Map<
    string,
    {
      source: DataSource<BalanceOutput>
      refCount: number
      stopAll: Effect.Effect<void>
    }
  >()
  private _balanceCreations = new Map<string, Promise<DataSource<BalanceOutput>>>()
  private _tokenBalanceSources = new Map<
    string,
    {
      source: DataSource<TokenBalancesOutput>
      refCount: number
      stopAll: Effect.Effect<void>
    }
  >()
  private _tokenBalanceCreations = new Map<string, Promise<DataSource<TokenBalancesOutput>>>()

  readonly nativeBalance: StreamInstance<AddressParams, BalanceOutput>
  readonly tokenBalances: StreamInstance<AddressParams, TokenBalancesOutput>
  readonly transactionHistory: StreamInstance<TxHistoryParams, TransactionsOutput>
  readonly transactionStatus: StreamInstance<TransactionStatusParams, TransactionStatusOutput>

  constructor(entry: ParsedApiEntry, chainId: string) {
    super(entry, chainId)
    this.symbol = chainConfigService.getSymbol(chainId)
    this.decimals = chainConfigService.getDecimals(chainId)

    this.moralisChain = MORALIS_CHAIN_MAP[chainId]
    if (!this.moralisChain) {
      throw new Error(`[MoralisProviderEffect] Unsupported chain: ${chainId}`)
    }

    this.baseUrl = this.endpoint

    const apiKey = getApiKey("MORALIS_API_KEY", `moralis-${chainId}`)
    if (!apiKey) {
      throw new Error(`[MoralisProviderEffect] MORALIS_API_KEY is required`)
    }
    this.apiKey = apiKey

    this.txStatusInterval = (this.config?.txStatusInterval as number) ?? 3000
    this.erc20Interval = (this.config?.erc20Interval as number) ?? 120000

    this.rpcUrl = chainConfigService.getRpcUrl(chainId)

    const provider = this

    // ==================== transactionHistory: 定时轮询 + 事件触发 ====================
    this.transactionHistory = createStreamInstanceFromSource<TxHistoryParams, TransactionsOutput>(
      `moralis.${chainId}.transactionHistory`,
      (params) => provider.createTransactionHistorySource(params)
    )

    // ==================== nativeBalance: 依赖 transactionHistory 变化 ====================
    this.nativeBalance = createStreamInstanceFromSource<AddressParams, BalanceOutput>(
      `moralis.${chainId}.nativeBalance`,
      (params) => provider.createBalanceSource(params)
    )

    // ==================== tokenBalances: 依赖 transactionHistory 变化 ====================
    this.tokenBalances = createStreamInstanceFromSource<AddressParams, TokenBalancesOutput>(
      `moralis.${chainId}.tokenBalances`,
      (params) => provider.createTokenBalancesSource(params)
    )

    // ==================== transactionStatus: 简单轮询 ====================
    this.transactionStatus = createStreamInstanceFromSource<TransactionStatusParams, TransactionStatusOutput>(
      `moralis.${chainId}.transactionStatus`,
      (params) => provider.createTransactionStatusSource(params)
    )
  }

  // ==================== Source 创建方法 ====================

  private createTransactionHistorySource(
    params: TxHistoryParams
  ): Effect.Effect<DataSource<TransactionsOutput>> {
    return this.getSharedTxHistorySource(params.address)
  }

  private createBalanceSource(
    params: AddressParams
  ): Effect.Effect<DataSource<BalanceOutput>> {
    return this.getSharedBalanceSource(params.address)
  }

  private createTokenBalancesSource(
    params: AddressParams
  ): Effect.Effect<DataSource<TokenBalancesOutput>> {
    return this.getSharedTokenBalanceSource(params.address)
  }

  private getSharedTxHistorySource(address: string): Effect.Effect<DataSource<TransactionsOutput>> {
    const provider = this
    const normalizedAddress = address.toLowerCase()
    const cacheKey = normalizedAddress
    const symbol = this.symbol
    const decimals = this.decimals

    const wrapSharedSource = (source: DataSource<TransactionsOutput>): DataSource<TransactionsOutput> => ({
      ...source,
      stop: provider.releaseSharedTxHistorySource(cacheKey),
    })

    const cached = provider._txHistorySources.get(cacheKey)
    if (cached) {
      cached.refCount += 1
      return Effect.succeed(wrapSharedSource(cached.source))
    }

    const pending = provider._txHistoryCreations.get(cacheKey)
    if (pending) {
      return Effect.promise(async () => {
        const source = await pending
        const entry = provider._txHistorySources.get(cacheKey)
        if (entry) {
          entry.refCount += 1
        }
        return wrapSharedSource(source)
      })
    }

    return Effect.promise(async () => {
      const createPromise = Effect.runPromise(
        Effect.gen(function* () {
          if (!provider._eventBus) {
            provider._eventBus = yield* getWalletEventBus()
          }
          const eventBus = provider._eventBus

          const fetchEffect = provider.fetchWalletHistory({ address, limit: 50 }, true).pipe(
            Effect.retry(rateLimitRetrySchedule),
            Effect.map((raw): TransactionsOutput => {
              return raw.result
                .filter((item) => !item.possible_spam)
                .map((item): Transaction => {
                  const direction = getDirection(item.from_address, item.to_address ?? "", normalizedAddress)
                  const action = mapCategory(item.category)

                  const hasErc20 = item.erc20_transfers && item.erc20_transfers.length > 0
                  const hasNative = item.native_transfers && item.native_transfers.length > 0

                  const assets: Transaction["assets"] = []

                  if (hasErc20) {
                    for (const transfer of item.erc20_transfers!) {
                      assets.push({
                        assetType: "token",
                        value: transfer.value,
                        symbol: transfer.token_symbol ?? "Unknown",
                        decimals: parseInt(transfer.token_decimals ?? "18", 10),
                        contractAddress: transfer.address,
                        name: transfer.token_name,
                        logoUrl: transfer.token_logo ?? undefined,
                      })
                    }
                  }

                  if (hasNative || assets.length === 0) {
                    const nativeValue = hasNative ? item.native_transfers![0].value : item.value
                    assets.unshift({
                      assetType: "native" as const,
                      value: nativeValue,
                      symbol,
                      decimals,
                    })
                  }

                  return {
                    hash: item.hash,
                    from: item.from_address,
                    to: item.to_address ?? "",
                    timestamp: new Date(item.block_timestamp).getTime(),
                    status: item.receipt_status === "1" ? "confirmed" : "failed",
                    blockNumber: BigInt(item.block_number),
                    action,
                    direction,
                    assets,
                    fee: item.transaction_fee
                      ? { value: item.transaction_fee, symbol, decimals }
                      : undefined,
                    fromEntity: item.from_address_entity ?? undefined,
                    toEntity: item.to_address_entity ?? undefined,
                    summary: item.summary,
                  }
                })
            })
          )

          const source = yield* createPollingSource({
            name: `moralis.${provider.chainId}.txHistory.${cacheKey}`,
            fetch: fetchEffect,
            interval: Duration.millis(provider.erc20Interval),
            walletEvents: {
              eventBus,
              chainId: provider.chainId,
              address,
              types: ["tx:confirmed", "tx:sent"],
            },
          })

          const stopAll = source.stop
          provider._txHistorySources.set(cacheKey, {
            source,
            refCount: 1,
            stopAll,
          })

          return source
        })
      )

      provider._txHistoryCreations.set(cacheKey, createPromise)

      try {
        const source = await createPromise
        return wrapSharedSource(source)
      } finally {
        provider._txHistoryCreations.delete(cacheKey)
      }
    })
  }

  private releaseSharedTxHistorySource(key: string): Effect.Effect<void> {
    const provider = this
    return Effect.gen(function* () {
      const entry = provider._txHistorySources.get(key)
      if (!entry) return
      entry.refCount -= 1
      if (entry.refCount <= 0) {
        yield* entry.stopAll
        provider._txHistorySources.delete(key)
      }
    })
  }

  private getSharedBalanceSource(address: string): Effect.Effect<DataSource<BalanceOutput>> {
    const provider = this
    const cacheKey = address.toLowerCase()
    const symbol = this.symbol
    const decimals = this.decimals

    const wrapSharedSource = (source: DataSource<BalanceOutput>): DataSource<BalanceOutput> => ({
      ...source,
      stop: provider.releaseSharedBalanceSource(cacheKey),
    })

    const cached = provider._balanceSources.get(cacheKey)
    if (cached) {
      cached.refCount += 1
      return Effect.succeed(wrapSharedSource(cached.source))
    }

    const pending = provider._balanceCreations.get(cacheKey)
    if (pending) {
      return Effect.promise(async () => {
        const source = await pending
        const entry = provider._balanceSources.get(cacheKey)
        if (entry) {
          entry.refCount += 1
        }
        return wrapSharedSource(source)
      })
    }

    return Effect.promise(async () => {
      const createPromise = Effect.runPromise(
        Effect.gen(function* () {
          const txHistorySource = yield* provider.getSharedTxHistorySource(address)

          const source = yield* createDependentSource({
            name: `moralis.${provider.chainId}.balance`,
            dependsOn: txHistorySource.ref,
            hasChanged: hasTransactionListChanged,
            fetch: (_dep, forceRefresh) =>
              provider.fetchNativeBalance(address, forceRefresh).pipe(
                Effect.retry(rateLimitRetrySchedule),
                Effect.map((raw): BalanceOutput => ({
                  amount: Amount.fromRaw(raw.balance, decimals, symbol),
                  symbol,
                }))
              ),
          })

          const stopAll = Effect.all([source.stop, txHistorySource.stop]).pipe(Effect.asVoid)

          provider._balanceSources.set(cacheKey, {
            source,
            refCount: 1,
            stopAll,
          })

          return source
        })
      )

      provider._balanceCreations.set(cacheKey, createPromise)

      try {
        const source = await createPromise
        return wrapSharedSource(source)
      } finally {
        provider._balanceCreations.delete(cacheKey)
      }
    })
  }

  private releaseSharedBalanceSource(key: string): Effect.Effect<void> {
    const provider = this
    return Effect.gen(function* () {
      const entry = provider._balanceSources.get(key)
      if (!entry) return
      entry.refCount -= 1
      if (entry.refCount <= 0) {
        yield* entry.stopAll
        provider._balanceSources.delete(key)
      }
    })
  }

  private getSharedTokenBalanceSource(address: string): Effect.Effect<DataSource<TokenBalancesOutput>> {
    const provider = this
    const cacheKey = address.toLowerCase()
    const symbol = this.symbol
    const decimals = this.decimals
    const chainId = this.chainId

    const wrapSharedSource = (source: DataSource<TokenBalancesOutput>): DataSource<TokenBalancesOutput> => ({
      ...source,
      stop: provider.releaseSharedTokenBalanceSource(cacheKey),
    })

    const cached = provider._tokenBalanceSources.get(cacheKey)
    if (cached) {
      cached.refCount += 1
      return Effect.succeed(wrapSharedSource(cached.source))
    }

    const pending = provider._tokenBalanceCreations.get(cacheKey)
    if (pending) {
      return Effect.promise(async () => {
        const source = await pending
        const entry = provider._tokenBalanceSources.get(cacheKey)
        if (entry) {
          entry.refCount += 1
        }
        return wrapSharedSource(source)
      })
    }

    return Effect.promise(async () => {
      const createPromise = Effect.runPromise(
        Effect.gen(function* () {
          const txHistorySource = yield* provider.getSharedTxHistorySource(address)

          const fetchEffect = Effect.all({
            native: provider.fetchNativeBalance(address),
            tokens: provider.fetchTokenBalances(address),
          }).pipe(
            Effect.retry(rateLimitRetrySchedule),
            Effect.map(({ native, tokens }): TokenBalancesOutput => {
              const result: TokenBalance[] = []

              result.push({
                symbol,
                name: symbol,
                amount: Amount.fromRaw(native.balance, decimals, symbol),
                isNative: true,
                decimals,
              })

              const filteredTokens = tokens.filter((token) => !token.possible_spam)

              for (const token of filteredTokens) {
                const icon =
                  token.logo ??
                  token.thumbnail ??
                  chainConfigService.getTokenIconByContract(chainId, token.token_address) ??
                  undefined

                result.push({
                  symbol: token.symbol,
                  name: token.name,
                  amount: Amount.fromRaw(token.balance, token.decimals, token.symbol),
                  isNative: false,
                  decimals: token.decimals,
                  icon,
                  contractAddress: token.token_address,
                  metadata: {
                    possibleSpam: token.possible_spam,
                    securityScore: token.security_score ?? undefined,
                    verified: token.verified_contract,
                    totalSupply: token.total_supply ?? undefined,
                  },
                })
              }

              return result
            })
          )

          const source = yield* createDependentSource({
            name: `moralis.${provider.chainId}.tokenBalances`,
            dependsOn: txHistorySource.ref,
            hasChanged: hasTransactionListChanged,
            fetch: () => fetchEffect,
          })

          const stopAll = Effect.all([source.stop, txHistorySource.stop]).pipe(Effect.asVoid)

          provider._tokenBalanceSources.set(cacheKey, {
            source,
            refCount: 1,
            stopAll,
          })

          return source
        })
      )

      provider._tokenBalanceCreations.set(cacheKey, createPromise)

      try {
        const source = await createPromise
        return wrapSharedSource(source)
      } finally {
        provider._tokenBalanceCreations.delete(cacheKey)
      }
    })
  }

  private releaseSharedTokenBalanceSource(key: string): Effect.Effect<void> {
    const provider = this
    return Effect.gen(function* () {
      const entry = provider._tokenBalanceSources.get(key)
      if (!entry) return
      entry.refCount -= 1
      if (entry.refCount <= 0) {
        yield* entry.stopAll
        provider._tokenBalanceSources.delete(key)
      }
    })
  }

  private createTransactionStatusSource(
    params: TransactionStatusParams
  ): Effect.Effect<DataSource<TransactionStatusOutput>> {
    const provider = this
    const chainId = this.chainId

    return Effect.gen(function* () {
      // 获取或创建 Provider 级别共享的 EventBus
      if (!provider._eventBus) {
        provider._eventBus = yield* getWalletEventBus()
      }
      const eventBus = provider._eventBus

      const fetchEffect: Effect.Effect<TransactionStatusOutput, FetchError> = provider.fetchTransactionReceipt(
        params.txHash
      ).pipe(
        Effect.retry(rateLimitRetrySchedule),
        Effect.flatMap((raw) =>
          Effect.gen(function* () {
            const receipt = raw.result
            const isConfirmed = !!receipt?.blockNumber
            if (!isConfirmed) {
              const status: TransactionStatusOutput["status"] = "pending"
              return { status, confirmations: 0, requiredConfirmations: 1 }
            }

            // 交易已确认，发送事件通知（带钱包标识）
            if (params.address) {
              yield* eventBus.emit(txConfirmedEvent(chainId, params.address, params.txHash))
            }

            const isSuccess = receipt.status === "0x1" || receipt.status === undefined
            const status: TransactionStatusOutput["status"] = isSuccess ? "confirmed" : "failed"
            return {
              status,
              confirmations: 1,
              requiredConfirmations: 1,
            }
          })
        )
      )

      const source = yield* createPollingSource({
        name: `moralis.${provider.chainId}.txStatus`,
        fetch: fetchEffect,
        interval: Duration.millis(provider.txStatusInterval),
      })

      return source
    })
  }

  // ==================== HTTP Fetch Effects ====================

  private fetchNativeBalance(address: string, forceRefresh = false): Effect.Effect<NativeBalanceResponse, FetchError> {
    return httpFetchCached({
      url: `${this.baseUrl}/${address}/balance`,
      searchParams: { chain: this.moralisChain },
      headers: {
        "X-API-Key": this.apiKey,
        accept: "application/json",
      },
      schema: NativeBalanceResponseSchema,
      cacheStrategy: forceRefresh ? "network-first" : "cache-first",
    })
  }

  private fetchTokenBalances(address: string, forceRefresh = false): Effect.Effect<TokenBalanceItem[], FetchError> {
    return httpFetchCached({
      url: `${this.baseUrl}/${address}/erc20`,
      searchParams: { chain: this.moralisChain },
      headers: {
        "X-API-Key": this.apiKey,
        accept: "application/json",
      },
      schema: TokenBalancesResponseSchema,
      cacheStrategy: forceRefresh ? "network-first" : "cache-first",
    }).pipe(
      Effect.map((tokens) => tokens.slice())
    )
  }

  private fetchWalletHistory(params: TxHistoryParams, forceRefresh = false): Effect.Effect<WalletHistoryResponse, FetchError> {
    return httpFetchCached({
      url: `${this.baseUrl}/wallets/${params.address}/history`,
      searchParams: {
        chain: this.moralisChain,
        limit: String(params.limit ?? 20),
      },
      headers: {
        "X-API-Key": this.apiKey,
        accept: "application/json",
      },
      schema: WalletHistoryResponseSchema,
      cacheStrategy: forceRefresh ? "network-first" : "cache-first",
    })
  }

  private fetchTransactionReceipt(txHash: string, forceRefresh = false): Effect.Effect<TxReceiptRpcResponse, FetchError> {
    return httpFetchCached({
      url: this.rpcUrl,
      method: "POST",
      body: {
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getTransactionReceipt",
        params: [txHash],
      },
      schema: TxReceiptRpcResponseSchema,
      cacheStrategy: forceRefresh ? "network-first" : "cache-first",
    })
  }
}

export function createMoralisProviderEffect(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type === "moralis") {
    try {
      return new MoralisProviderEffect(entry, chainId)
    } catch (err) {
      console.warn(`[MoralisProviderEffect] Failed to create provider for ${chainId}:`, err)
      return null
    }
  }
  return null
}
