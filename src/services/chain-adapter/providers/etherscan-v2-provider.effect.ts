/**
 * Etherscan V2 API Provider - Effect TS Version (深度重构)
 *
 * 使用 Effect 原生 Source API 实现响应式数据获取
 * - transactionHistory: 定时轮询 + 事件触发
 * - nativeBalance: 依赖 transactionHistory 变化
 */

import { Effect, Duration } from "effect"
import { Schema as S } from "effect"
import {
  httpFetchCached,
  createStreamInstanceFromSource,
  createPollingSource,
  createDependentSource,
  HttpError,
  type FetchError,
  type DataSource,
  type EventBusService,
} from "@biochain/chain-effect"
import type { StreamInstance } from "@biochain/chain-effect"
import type { ApiProvider, Direction, BalanceOutput, TransactionsOutput, AddressParams, TxHistoryParams, Transaction } from "./types"
import type { ParsedApiEntry } from "@/services/chain-config"
import { chainConfigService } from "@/services/chain-config"
import { Amount } from "@/types/amount"
import { EvmIdentityMixin } from "../evm/identity-mixin"
import { EvmTransactionMixin } from "../evm/transaction-mixin"
import { getApiKey } from "./api-key-picker"
import { getWalletEventBus } from "@/services/chain-adapter/wallet-event-bus"

// ==================== Effect Schema 定义 ====================

const ApiResponseSchema = S.Struct({
  status: S.String,
  message: S.String,
  result: S.Unknown,
})

const NativeTxSchema = S.Struct({
  hash: S.String,
  from: S.String,
  to: S.String,
  value: S.String,
  timeStamp: S.String,
  isError: S.String,
  blockNumber: S.String,
  input: S.optional(S.String),
  methodId: S.optional(S.String),
  functionName: S.optional(S.String),
})

type ApiResponse = S.Schema.Type<typeof ApiResponseSchema>
type NativeTx = S.Schema.Type<typeof NativeTxSchema>

// ==================== 工具函数 ====================

function getDirection(from: string, to: string, address: string): Direction {
  const fromLower = from.toLowerCase()
  const toLower = to.toLowerCase()
  if (fromLower === address && toLower === address) return "self"
  if (fromLower === address) return "out"
  return "in"
}

function parseNativeTx(item: unknown): NativeTx | null {
  try {
    const { Schema: S } = require("effect")
    return S.decodeUnknownSync(NativeTxSchema)(item)
  } catch {
    return null
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

// ==================== Base Class ====================

class EtherscanV2Base {
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

export class EtherscanV2ProviderEffect extends EvmIdentityMixin(EvmTransactionMixin(EtherscanV2Base)) implements ApiProvider {
  private readonly symbol: string
  private readonly decimals: number
  private readonly baseUrl: string
  private readonly apiKey: string | undefined
  private readonly evmChainId: number
  private readonly pollingInterval: number = 30000

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

  readonly nativeBalance: StreamInstance<AddressParams, BalanceOutput>
  readonly transactionHistory: StreamInstance<TxHistoryParams, TransactionsOutput>

  constructor(entry: ParsedApiEntry, chainId: string) {
    super(entry, chainId)
    this.symbol = chainConfigService.getSymbol(chainId)
    this.decimals = chainConfigService.getDecimals(chainId)
    this.baseUrl = this.endpoint
    this.apiKey = getApiKey(this.config?.apiKeyEnv as string, `etherscan-${chainId}`)

    const evmChainId = this.config?.evmChainId as number | undefined
    if (!evmChainId) {
      throw new Error(`[EtherscanV2Provider] evmChainId is required for chain ${chainId}`)
    }
    this.evmChainId = evmChainId

    const provider = this

    // transactionHistory: 定时轮询 + 事件触发
    this.transactionHistory = createStreamInstanceFromSource<TxHistoryParams, TransactionsOutput>(
      `etherscan-v2.${chainId}.transactionHistory`,
      (params) => provider.createTransactionHistorySource(params)
    )

    // nativeBalance: 依赖 transactionHistory 变化
    this.nativeBalance = createStreamInstanceFromSource<AddressParams, BalanceOutput>(
      `etherscan-v2.${chainId}.nativeBalance`,
      (params) => provider.createBalanceSource(params)
    )
  }

  // ==================== URL 构建 ====================

  private buildUrl(params: Record<string, string>): string {
    const url = new URL(this.baseUrl)
    url.searchParams.set("chainid", this.evmChainId.toString())
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }
    if (this.apiKey) {
      url.searchParams.set("apikey", this.apiKey)
    }
    return url.toString()
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

          const fetchEffect = provider.fetchTransactionHistory({ address, limit: 50 }, true).pipe(
            Effect.map((raw): TransactionsOutput => {
              if (raw.status === "0" || !Array.isArray(raw.result)) {
                throw new HttpError("API rate limited", 429)
              }
              return (raw.result as unknown[])
                .map(parseNativeTx)
                .filter((tx): tx is NativeTx => tx !== null)
                .map((tx): Transaction => ({
                  hash: tx.hash,
                  from: tx.from,
                  to: tx.to,
                  timestamp: parseInt(tx.timeStamp, 10) * 1000,
                  status: tx.isError === "0" ? ("confirmed" as const) : ("failed" as const),
                  blockNumber: BigInt(tx.blockNumber),
                  action: "transfer" as const,
                  direction: getDirection(tx.from, tx.to, normalizedAddress),
                  assets: [{
                    assetType: "native" as const,
                    value: tx.value,
                    symbol,
                    decimals,
                  }],
                }))
            })
          )

          const source = yield* createPollingSource({
            name: `etherscan-v2.${provider.chainId}.txHistory.${cacheKey}`,
            fetch: fetchEffect,
            interval: Duration.millis(provider.pollingInterval),
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
            name: `etherscan-v2.${provider.chainId}.balance`,
            dependsOn: txHistorySource.ref,
            hasChanged: hasTransactionListChanged,
            fetch: (_dep, forceRefresh) =>
              provider.fetchBalance(address, forceRefresh).pipe(
                Effect.map((raw): BalanceOutput => {
                  if (raw.status === "0" || typeof raw.result !== "string") {
                    throw new HttpError("API rate limited", 429)
                  }
                  const balanceValue = (raw.result as string).startsWith("0x")
                    ? BigInt(raw.result as string).toString()
                    : raw.result as string
                  return {
                    amount: Amount.fromRaw(balanceValue, decimals, symbol),
                    symbol,
                  }
                })
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

  // ==================== HTTP Fetch Effects ====================

  private fetchBalance(address: string, forceRefresh = false): Effect.Effect<ApiResponse, FetchError> {
    return httpFetchCached({
      url: this.buildUrl({
        module: "account",
        action: "balance",
        address,
        tag: "latest",
      }),
      schema: ApiResponseSchema,
      cacheStrategy: forceRefresh ? "network-first" : "cache-first",
    })
  }

  private fetchTransactionHistory(params: TxHistoryParams, forceRefresh = false): Effect.Effect<ApiResponse, FetchError> {
    return httpFetchCached({
      url: this.buildUrl({
        module: "account",
        action: "txlist",
        address: params.address,
        page: "1",
        offset: String(params.limit ?? 20),
        sort: "desc",
      }),
      schema: ApiResponseSchema,
      cacheStrategy: forceRefresh ? "network-first" : "cache-first",
    })
  }
}

export function createEtherscanV2ProviderEffect(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type === "etherscan-v2") return new EtherscanV2ProviderEffect(entry, chainId)
  return null
}
