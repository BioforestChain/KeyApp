/**
 * Tron RPC Provider (Effect TS - 深度重构)
 * 
 * 使用 Effect 原生 Source API 实现响应式数据获取
 * - transactionHistory: 定时轮询 + 事件触发
 * - balance: 依赖 transactionHistory 变化
 */

import { Effect, Duration } from "effect"
import { Schema as S } from "effect"
import {
  httpFetchCached,
  createStreamInstanceFromSource,
  createPollingSource,
  createDependentSource,
  acquireSource,
  makeRegistryKey,
  type FetchError,
  type DataSource,
  type EventBusService,
} from "@biochain/chain-effect"
import type { StreamInstance } from "@biochain/chain-effect"
import type {
  ApiProvider,
  Direction,
  BalanceOutput,
  BlockHeightOutput,
  TransactionOutput,
  TransactionsOutput,
  AddressParams,
  TxHistoryParams,
  TransactionParams,
  Transaction,
} from "./types"
import type { ParsedApiEntry } from "@/services/chain-config"
import { chainConfigService } from "@/services/chain-config/service";
import { Amount } from "@/types/amount"
import { TronIdentityMixin } from "../tron/identity-mixin"
import { TronTransactionMixin } from "../tron/transaction-mixin"
import { getWalletEventBus } from "@/services/chain-adapter/wallet-event-bus"
import { normalizeTronAddress, normalizeTronHex, tronAddressToHex } from "../tron/address"
import { getApiKey } from "./api-key-picker"

// ==================== Effect Schema 定义 ====================

const TronAccountSchema = S.Struct({
  balance: S.optional(S.Number),
  address: S.optional(S.String),
})
type TronAccount = S.Schema.Type<typeof TronAccountSchema>

const TronNowBlockSchema = S.Struct({
  block_header: S.optional(S.Struct({
    raw_data: S.optional(S.Struct({
      number: S.optional(S.Number),
    })),
  })),
})
type TronNowBlock = S.Schema.Type<typeof TronNowBlockSchema>

const TronTxValueSchema = S.Struct({
  amount: S.optional(S.Number),
  owner_address: S.optional(S.String),
  to_address: S.optional(S.String),
})

const TronTxContractSchema = S.Struct({
  parameter: S.optional(S.Struct({
    value: S.optional(TronTxValueSchema),
  })),
  type: S.optional(S.String),
})

const TronTxSchema = S.Struct({
  txID: S.String,
  block_timestamp: S.optional(S.Number),
  raw_data: S.optional(S.Struct({
    contract: S.optional(S.Array(TronTxContractSchema)),
    timestamp: S.optional(S.Number),
  })),
  ret: S.optional(S.Array(S.Struct({
    contractRet: S.optional(S.String),
  }))),
})
type TronTx = S.Schema.Type<typeof TronTxSchema>

const TronTxListSchema = S.Struct({
  success: S.Boolean,
  data: S.optional(S.Array(TronTxSchema)),
})
type TronTxList = S.Schema.Type<typeof TronTxListSchema>

// ==================== 工具函数 ====================

function safeNormalizeHex(value: string): string {
  try {
    return normalizeTronHex(value)
  } catch {
    return value.toLowerCase()
  }
}

function getDirection(from: string, to: string, address: string): Direction {
  const fromHex = safeNormalizeHex(from)
  const toHex = safeNormalizeHex(to)
  const addrHex = safeNormalizeHex(address)
  if (fromHex === addrHex && toHex === addrHex) return "self"
  if (fromHex === addrHex) return "out"
  return "in"
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

class TronRpcBase {
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

export class TronRpcProviderEffect extends TronIdentityMixin(TronTransactionMixin(TronRpcBase)) implements ApiProvider {
  private readonly symbol: string
  private readonly decimals: number
  private readonly baseUrl: string
  private readonly headers: Record<string, string>

  private readonly pollingInterval: number = 30000

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

  readonly nativeBalance: StreamInstance<AddressParams, BalanceOutput>
  readonly transactionHistory: StreamInstance<TxHistoryParams, TransactionsOutput>
  readonly transaction: StreamInstance<TransactionParams, TransactionOutput>
  readonly blockHeight: StreamInstance<void, BlockHeightOutput>

  constructor(entry: ParsedApiEntry, chainId: string) {
    super(entry, chainId)
    this.symbol = chainConfigService.getSymbol(chainId)
    this.decimals = chainConfigService.getDecimals(chainId)
    this.baseUrl = this.endpoint

    // API Key
    const tronApiKey = getApiKey(this.config?.apiKeyEnv as string, `trongrid-${chainId}`)
    this.headers = tronApiKey ? { "TRON-PRO-API-KEY": tronApiKey } : {}

    const provider = this

    // ==================== blockHeight: 定时轮询 ====================
    this.blockHeight = createStreamInstanceFromSource<void, BlockHeightOutput>(
      `tron-rpc.${chainId}.blockHeight`,
      () => provider.createBlockHeightSource()
    )

    // ==================== transactionHistory: 定时轮询 + 事件触发 ====================
    this.transactionHistory = createStreamInstanceFromSource<TxHistoryParams, TransactionsOutput>(
      `tron-rpc.${chainId}.transactionHistory`,
      (params) => provider.createTransactionHistorySource(params)
    )

    // ==================== nativeBalance: 依赖 transactionHistory 变化 ====================
    this.nativeBalance = createStreamInstanceFromSource<AddressParams, BalanceOutput>(
      `tron-rpc.${chainId}.nativeBalance`,
      (params) => provider.createBalanceSource(params)
    )

    // ==================== transaction: 定时轮询（等待确认）====================
    this.transaction = createStreamInstanceFromSource<TransactionParams, TransactionOutput>(
      `tron-rpc.${chainId}.transaction`,
      (params) => provider.createTransactionSource(params)
    )
  }

  // ==================== Source 创建方法 ====================

  private createBlockHeightSource(): Effect.Effect<DataSource<BlockHeightOutput>> {
    return this.getSharedBlockHeightSource()
  }

  private getSharedBlockHeightSource(): Effect.Effect<DataSource<BlockHeightOutput>> {
    const provider = this
    const registryKey = makeRegistryKey(this.chainId, "global", "blockHeight")
    const fetchEffect = provider.fetchNowBlock(true).pipe(
      Effect.map((raw): BlockHeightOutput =>
        BigInt(raw.block_header?.raw_data?.number ?? 0)
      )
    )

    return acquireSource(registryKey, {
      fetch: fetchEffect,
      interval: Duration.millis(provider.pollingInterval),
    })
  }

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
    const eventAddress = normalizeTronAddress(address)
    const cacheKey = normalizeTronHex(address)
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

          const fetchEffect = provider.fetchTransactionList(eventAddress, true).pipe(
            Effect.map((raw): TransactionsOutput => {
              if (!raw.success || !raw.data) return []

              return raw.data.map((tx): Transaction => {
                const contract = tx.raw_data?.contract?.[0]
                const value = contract?.parameter?.value
                const fromRaw = value?.owner_address ?? ""
                const toRaw = value?.to_address ?? ""
                const from = normalizeTronAddress(fromRaw)
                const to = normalizeTronAddress(toRaw)
                const status = tx.ret?.[0]?.contractRet === "SUCCESS" ? "confirmed" : "failed"

                return {
                  hash: tx.txID,
                  from,
                  to,
                  timestamp: tx.block_timestamp ?? tx.raw_data?.timestamp ?? 0,
                  status: status as "confirmed" | "failed",
                  action: "transfer" as const,
                  direction: getDirection(fromRaw, toRaw, eventAddress),
                  assets: [{
                    assetType: "native" as const,
                    value: (value?.amount ?? 0).toString(),
                    symbol,
                    decimals,
                  }],
                }
              })
            })
          )

          const source = yield* createPollingSource({
            name: `tron-rpc.${provider.chainId}.txHistory.${cacheKey}`,
            fetch: fetchEffect,
            interval: Duration.millis(provider.pollingInterval),
            walletEvents: {
              eventBus,
              chainId: provider.chainId,
              address: eventAddress,
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
    const cacheKey = normalizeTronHex(address)
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
            name: `tron-rpc.${provider.chainId}.balance`,
            dependsOn: txHistorySource.ref,
            hasChanged: hasTransactionListChanged,
            fetch: (_dep, forceRefresh) =>
              provider.fetchAccount(address, forceRefresh).pipe(
                Effect.map((raw): BalanceOutput => ({
                  amount: Amount.fromRaw((raw.balance ?? 0).toString(), decimals, symbol),
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

  private createTransactionSource(
    params: TransactionParams
  ): Effect.Effect<DataSource<TransactionOutput>> {
    const provider = this
    const symbol = this.symbol
    const decimals = this.decimals

    return Effect.gen(function* () {
      const fetchEffect = provider.fetchTransactionById(params.txHash).pipe(
        Effect.map((tx): TransactionOutput => {
          if (!tx.txID) return null

          const contract = tx.raw_data?.contract?.[0]
          const value = contract?.parameter?.value
          const fromRaw = value?.owner_address ?? ""
          const toRaw = value?.to_address ?? ""
          const from = normalizeTronAddress(fromRaw)
          const to = normalizeTronAddress(toRaw)

          let status: "pending" | "confirmed" | "failed"
          if (!tx.ret || tx.ret.length === 0) {
            status = "pending"
          } else {
            status = tx.ret[0]?.contractRet === "SUCCESS" ? "confirmed" : "failed"
          }

          const directionAddress = params.senderId ?? from

          return {
            hash: tx.txID,
            from,
            to,
            timestamp: tx.block_timestamp ?? tx.raw_data?.timestamp ?? 0,
            status,
            action: "transfer" as const,
            direction: getDirection(fromRaw, toRaw, directionAddress),
            assets: [{
              assetType: "native" as const,
              value: (value?.amount ?? 0).toString(),
              symbol,
              decimals,
            }],
          }
        })
      )

      // 交易查询使用轮询（等待确认）
      const source = yield* createPollingSource({
        name: `tron-rpc.${provider.chainId}.transaction`,
        fetch: fetchEffect,
        interval: Duration.millis(3000), // 3秒检查一次
      })

      return source
    })
  }

  // ==================== HTTP Fetch Effects ====================

  private fetchNowBlock(forceRefresh = false): Effect.Effect<TronNowBlock, FetchError> {
    return httpFetchCached({
      url: `${this.baseUrl}/wallet/getnowblock`,
      method: "POST",
      headers: this.headers,
      schema: TronNowBlockSchema,
      cacheStrategy: forceRefresh ? "network-first" : "cache-first",
      cache: "no-store",
    })
  }

  private fetchAccount(address: string, forceRefresh = false): Effect.Effect<TronAccount, FetchError> {
    return httpFetchCached({
      url: `${this.baseUrl}/wallet/getaccount`,
      method: "POST",
      headers: this.headers,
      body: { address: tronAddressToHex(address) },
      schema: TronAccountSchema,
      cacheStrategy: forceRefresh ? "network-first" : "cache-first",
    })
  }

  private fetchTransactionList(address: string, forceRefresh = false): Effect.Effect<TronTxList, FetchError> {
    const targetAddress = normalizeTronAddress(address)
    return httpFetchCached({
      url: `${this.baseUrl}/v1/accounts/${targetAddress}/transactions`,
      headers: this.headers,
      schema: TronTxListSchema,
      cacheStrategy: forceRefresh ? "network-first" : "cache-first",
    })
  }

  private fetchTransactionById(txHash: string): Effect.Effect<TronTx, FetchError> {
    return httpFetchCached({
      url: `${this.baseUrl}/wallet/gettransactionbyid`,
      method: "POST",
      headers: this.headers,
      body: { value: txHash },
      schema: TronTxSchema,
      cacheStrategy: "ttl",
      cacheTtl: Math.max(1000, Math.floor(this.pollingInterval / 4)),
    })
  }
}

export function createTronRpcProviderEffect(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type === "tron-rpc" || entry.type === "tron-rpc-pro") {
    return new TronRpcProviderEffect(entry, chainId)
  }
  return null
}
