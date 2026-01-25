/**
 * BscWallet API Provider - Effect TS Version (深度重构)
 * 
 * 使用 Effect 原生 Source API 实现响应式数据获取
 *
 * Docs:
 * - docs/white-book/02-Driver-Ref/02-EVM/03-Wallet-Provider.md
 * - docs/white-book/99-Appendix/05-API-Providers.md
 */

import { Effect, Duration, Stream, SubscriptionRef, Fiber } from "effect"
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
import type {
  ApiProvider,
  Transaction,
  Direction,
  BalanceOutput,
  TransactionsOutput,
  AddressParams,
  TxHistoryParams,
  TokenBalancesOutput,
  TokenBalance,
} from "./types"
import type { ParsedApiEntry } from "@/services/chain-config"
import { chainConfigService } from "@/services/chain-config/service";
import { Amount } from "@/types/amount"
import { EvmIdentityMixin } from "../evm/identity-mixin"
import { EvmTransactionMixin } from "../evm/transaction-mixin"
import { getWalletEventBus } from "@/services/chain-adapter/wallet-event-bus"

// ==================== Effect Schema 定义 ====================

const BalanceResponseSchema = S.Struct({
  success: S.Boolean,
  result: S.optional(S.NullOr(S.Union(S.String, S.Number))),
})
const BalanceRawSchema = S.Union(BalanceResponseSchema, S.String, S.Number)
type BalanceRaw = S.Schema.Type<typeof BalanceRawSchema>

const NativeTxSchema = S.Struct({
  blockNumber: S.optional(S.String),
  timeStamp: S.String,
  hash: S.String,
  from: S.String,
  to: S.String,
  value: S.String,
  isError: S.optional(S.String),
  txreceipt_status: S.optional(S.String),
})

const TokenTxSchema = S.Struct({
  blockNumber: S.optional(S.String),
  timeStamp: S.String,
  hash: S.String,
  from: S.String,
  to: S.String,
  value: S.String,
  tokenSymbol: S.optional(S.String),
  tokenName: S.optional(S.String),
  tokenDecimal: S.optional(S.String),
  contractAddress: S.optional(S.String),
})

const TxHistoryResultSchema = S.Struct({
  status: S.optional(S.String),
  message: S.optional(S.String),
  result: S.Array(NativeTxSchema),
})

const TokenHistoryResultSchema = S.Struct({
  status: S.optional(S.String),
  message: S.optional(S.String),
  result: S.Array(TokenTxSchema),
})

const TxHistoryResponseSchema = S.Struct({
  success: S.Boolean,
  result: S.optional(TxHistoryResultSchema),
})
type TxHistoryResponse = S.Schema.Type<typeof TxHistoryResponseSchema>

const TokenHistoryResponseSchema = S.Struct({
  success: S.Boolean,
  result: S.optional(TokenHistoryResultSchema),
})
type TokenHistoryResponse = S.Schema.Type<typeof TokenHistoryResponseSchema>

const BalanceV2ItemSchema = S.Struct({
  amount: S.NullOr(S.Union(S.String, S.Number)),
  contractAddress: S.optional(S.NullOr(S.String)),
  decimals: S.optional(S.NullOr(S.Number)),
  icon: S.optional(S.NullOr(S.String)),
  symbol: S.optional(S.NullOr(S.String)),
  name: S.optional(S.NullOr(S.String)),
})

const BalanceV2ResponseSchema = S.Array(BalanceV2ItemSchema)
const BalanceV2WrappedSchema = S.Struct({
  success: S.Boolean,
  result: S.optional(S.NullOr(S.Array(BalanceV2ItemSchema))),
})
const BalanceV2RawSchema = S.Union(BalanceV2ResponseSchema, BalanceV2WrappedSchema)
type BalanceV2Raw = S.Schema.Type<typeof BalanceV2RawSchema>
type BalanceV2Response = S.Schema.Type<typeof BalanceV2ResponseSchema>

const TokenListItemSchema = S.Struct({
  chain: S.optional(S.String),
  address: S.String,
  name: S.String,
  icon: S.optional(S.String),
  symbol: S.String,
  decimals: S.Number,
})

const TokenListResultSchema = S.Struct({
  data: S.Array(TokenListItemSchema),
  page: S.Number,
  pageSize: S.Number,
  total: S.Number,
  pages: S.optional(S.Number),
})

const TokenListResponseSchema = S.Struct({
  success: S.Boolean,
  result: S.optional(TokenListResultSchema),
})
type TokenListResponse = S.Schema.Type<typeof TokenListResponseSchema>

// ==================== 工具函数 ====================

function getDirection(from: string, to: string, address: string): Direction {
  const f = from.toLowerCase()
  const t = to.toLowerCase()
  if (f === address && t === address) return "self"
  return f === address ? "out" : "in"
}

function toRawString(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return "0"
  return String(value)
}

function normalizeBalance(raw: BalanceRaw): { success: boolean; amount: string } {
  if (typeof raw === "string" || typeof raw === "number") {
    return { success: true, amount: toRawString(raw) }
  }
  return { success: raw.success, amount: toRawString(raw.result) }
}

function canCacheSuccess(result: { success: boolean }): Promise<boolean> {
  return Promise.resolve(result.success)
}

function isWalletApiOk(result?: { status?: string; message?: string }): boolean {
  if (!result) return false
  const status = result.status?.toUpperCase()
  const message = result.message?.toUpperCase()
  if (message === "NO TRANSACTIONS FOUND") return true
  if (status === "0") return false
  if (message === "NOTOK") return false
  return true
}

function canCacheHistory(result: { success: boolean; result?: { status?: string; message?: string } }): Promise<boolean> {
  if (!result.success) return Promise.resolve(false)
  return Promise.resolve(isWalletApiOk(result.result))
}

function canCacheBalance(result: BalanceRaw): Promise<boolean> {
  if (typeof result === "string" || typeof result === "number") return Promise.resolve(true)
  return Promise.resolve(result.success)
}

function canCacheBalanceV2(result: BalanceV2Raw): Promise<boolean> {
  if (Array.isArray(result)) return Promise.resolve(true)
  return Promise.resolve(result.success)
}

function normalizeBalanceV2(raw: BalanceV2Raw): BalanceV2Response {
  if (Array.isArray(raw)) return raw
  return raw.result ?? []
}

function isHistoryHealthy(raw: TxHistoryResponse | null): boolean {
  if (!raw || !raw.success) return false
  return isWalletApiOk(raw.result)
}

function logApiFailure(name: string, payload: { success: boolean; error?: unknown }): void {
  if (payload.success) return
  if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
    console.warn(`[bscwallet] ${name} success=false`, payload.error ?? payload)
  }
}

function parseTokenDecimals(value: string | number | undefined): number {
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10)
    return Number.isNaN(parsed) ? 0 : parsed
  }
  return 0
}

function hasTransactionListChanged(
  prev: TransactionsOutput | null,
  next: TransactionsOutput
): boolean {
  if (!prev) return true
  if (prev.length !== next.length) return true
  if (prev.length === 0 && next.length === 0) return false
  return prev[0]?.hash !== next[0]?.hash
}

function mergeTransactions(nativeTxs: Transaction[], tokenTxs: Transaction[]): Transaction[] {
  const map = new Map<string, Transaction>()
  for (const tx of nativeTxs) {
    map.set(tx.hash, tx)
  }
  for (const tx of tokenTxs) {
    const existing = map.get(tx.hash)
    if (existing) {
      existing.assets = [...existing.assets, ...tx.assets]
      map.set(tx.hash, existing)
      continue
    }
    map.set(tx.hash, tx)
  }
  return Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp)
}

function getContractAddressesFromHistory(txs: TransactionsOutput): string[] {
  const contracts = new Set<string>()
  for (const tx of txs) {
    for (const asset of tx.assets) {
      if (asset.assetType !== "token") continue
      if (!asset.contractAddress) continue
      contracts.add(asset.contractAddress)
    }
  }
  return [...contracts].sort()
}

function normalizeTokenContracts(result: TokenListResponse): string[] {
  if (!result.success || !result.result) return []
  return result.result.data
    .map((item) => item.address)
    .filter((address) => address.length > 0)
    .map((address) => address.toLowerCase())
    .sort()
}

function ensureTokenListSuccess(raw: TokenListResponse): TokenListResponse {
  if (raw.success && raw.result) return raw
  return {
    success: true,
    result: {
      data: [],
      page: 1,
      pageSize: 0,
      total: 0,
    },
  }
}

function assertHistoryHealthy(
  name: string,
  raw: TxHistoryResponse
): Effect.Effect<TxHistoryResponse, FetchError> {
  if (raw.success && isWalletApiOk(raw.result)) {
    return Effect.succeed(raw)
  }
  if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
    console.warn(`[bscwallet] ${name} NOTOK`, raw)
  }
  return Effect.fail(new HttpError(`[bscwallet] ${name} NOTOK`))
}

function assertTokenHistoryHealthy(
  name: string,
  raw: TokenHistoryResponse
): Effect.Effect<TokenHistoryResponse, FetchError> {
  if (raw.success && isWalletApiOk(raw.result)) {
    return Effect.succeed(raw)
  }
  if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
    console.warn(`[bscwallet] ${name} NOTOK`, raw)
  }
  return Effect.fail(new HttpError(`[bscwallet] ${name} NOTOK`))
}

// ==================== Base Class ====================

class BscWalletBase {
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

export class BscWalletProviderEffect extends EvmIdentityMixin(EvmTransactionMixin(BscWalletBase)) implements ApiProvider {
  private readonly symbol: string
  private readonly decimals: number
  private readonly baseUrl: string
  private readonly pollingInterval: number = 30000
  private readonly balanceCacheTtlMs: number = 5000
  private readonly tokenListCacheTtl: number = 10 * 60 * 1000
  private _normalHistoryDisabled = false

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
  private _tokenListSource: {
    source: DataSource<TokenListResponse>
    refCount: number
    stopAll: Effect.Effect<void>
  } | null = null
  private _tokenListCreation: Promise<DataSource<TokenListResponse>> | null = null

  readonly nativeBalance: StreamInstance<AddressParams, BalanceOutput>
  readonly tokenBalances: StreamInstance<AddressParams, TokenBalancesOutput>
  readonly transactionHistory: StreamInstance<TxHistoryParams, TransactionsOutput>

  constructor(entry: ParsedApiEntry, chainId: string) {
    super(entry, chainId)
    this.symbol = chainConfigService.getSymbol(chainId)
    this.decimals = chainConfigService.getDecimals(chainId)
    this.baseUrl = this.endpoint

    const provider = this

    this.transactionHistory = createStreamInstanceFromSource<TxHistoryParams, TransactionsOutput>(
      `bscwallet.${chainId}.transactionHistory`,
      (params) => provider.createTransactionHistorySource(params)
    )

    this.nativeBalance = createStreamInstanceFromSource<AddressParams, BalanceOutput>(
      `bscwallet.${chainId}.nativeBalance`,
      (params) => provider.createBalanceSource(params)
    )

    this.tokenBalances = createStreamInstanceFromSource<AddressParams, TokenBalancesOutput>(
      `bscwallet.${chainId}.tokenBalances`,
      (params) => provider.createTokenBalancesSource(params)
    )
  }

  private createTransactionHistorySource(
    params: TxHistoryParams
  ): Effect.Effect<DataSource<TransactionsOutput>> {
    return this.getSharedTxHistorySource(params.address)
  }

  private createBalanceSource(
    params: AddressParams
  ): Effect.Effect<DataSource<BalanceOutput>> {
    return this.getSharedBalanceSource(params.address).pipe(
      Effect.catchAllCause((error) => {
        if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
          console.warn("[bscwallet] balance fallback", error)
        }
        return this.createBalanceFallbackSource(params.address)
      })
    )
  }

  private createTokenBalancesSource(
    params: AddressParams
  ): Effect.Effect<DataSource<TokenBalancesOutput>> {
    return this.getSharedTokenBalanceSource(params.address).pipe(
      Effect.catchAllCause((error) => {
        if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
          console.warn("[bscwallet] tokenBalances fallback", error)
        }
        return this.createTokenBalancesFallbackSource(params.address)
      })
    )
  }

  private createBalanceFallbackSource(address: string): Effect.Effect<DataSource<BalanceOutput>> {
    const symbol = this.symbol
    const decimals = this.decimals
    return createPollingSource({
      name: `bscwallet.${this.chainId}.balance.fallback`,
      interval: Duration.millis(this.pollingInterval),
      immediate: true,
      fetch: this.fetchBalance(address, true).pipe(
        Effect.map((raw): BalanceOutput => {
          const balance = normalizeBalance(raw)
          return {
            amount: Amount.fromRaw(balance.amount, decimals, symbol),
            symbol,
          }
        })
      ),
    })
  }

  private createTokenBalancesFallbackSource(address: string): Effect.Effect<DataSource<TokenBalancesOutput>> {
    const symbol = this.symbol
    const decimals = this.decimals
    return createPollingSource({
      name: `bscwallet.${this.chainId}.tokenBalances.fallback`,
      interval: Duration.millis(this.pollingInterval),
      immediate: true,
      fetch: this.fetchTokenBalances(address, [], true).pipe(
        Effect.map((balances): TokenBalancesOutput => {
          const list: TokenBalance[] = []
          const balance = normalizeBalance(balances.native)
          list.push({
            symbol,
            name: symbol,
            amount: Amount.fromRaw(balance.amount, decimals, symbol),
            isNative: true,
            decimals,
          })

          for (const item of balances.tokens) {
            const tokenSymbol = item.symbol ?? "BEP20"
            const tokenDecimals = item.decimals ?? 0
            list.push({
              symbol: tokenSymbol,
              name: item.name ?? tokenSymbol,
              amount: Amount.fromRaw(toRawString(item.amount), tokenDecimals, tokenSymbol),
              isNative: false,
              decimals: tokenDecimals,
              icon: item.icon,
              contractAddress: item.contractAddress,
            })
          }

          return list
        })
      ),
    })
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

          const nativeSource = yield* createPollingSource({
            name: `bscwallet.${provider.chainId}.txHistory.native.${cacheKey}`,
            fetch: provider.fetchNativeHistory({ address, limit: 50 }, true),
            interval: Duration.millis(provider.pollingInterval),
            walletEvents: {
              eventBus,
              chainId: provider.chainId,
              address,
              types: ["tx:confirmed", "tx:sent"],
            },
          })

          const initialNative = yield* nativeSource.get
          if (!isHistoryHealthy(initialNative)) {
            yield* nativeSource.stop
            return yield* Effect.fail(new HttpError("[bscwallet] trans/normal/history NOTOK"))
          }

          const tokenListSource = yield* provider.getSharedTokenListSource()

          const mergeSignal = yield* SubscriptionRef.make(0)
          const bump = SubscriptionRef.update(mergeSignal, (value) => value + 1).pipe(Effect.asVoid)
          const tokenHistoryCache = yield* SubscriptionRef.make<Map<string, TokenHistoryResponse | null>>(
            new Map()
          )

          const changeFibers: Fiber.RuntimeFiber<void, never>[] = []
          const registerChanges = (stream: Stream.Stream<unknown>) =>
            Effect.forkDaemon(
              stream.pipe(
                Stream.tap(() => bump),
                Stream.runDrain
              )
            )

          changeFibers.push(yield* registerChanges(nativeSource.changes))

          const tokenSources = new Map<string, DataSource<TokenHistoryResponse>>()
          const tokenFibers = new Map<string, Fiber.RuntimeFiber<void, never>>()

          const attachContract = (contract: string) =>
            Effect.gen(function* () {
              if (tokenSources.has(contract)) return
              const source = yield* createPollingSource({
                name: `bscwallet.${provider.chainId}.txHistory.bep20.${cacheKey}.${contract}`,
                fetch: provider.fetchTokenHistory({ address, limit: 50, contractAddress: contract }, true),
                interval: Duration.millis(provider.pollingInterval),
                immediate: false,
                walletEvents: {
                  eventBus,
                  chainId: provider.chainId,
                  address,
                  types: ["tx:confirmed", "tx:sent"],
                },
              })
              tokenSources.set(contract, source)
              const fiber = yield* Effect.forkDaemon(
                source.changes.pipe(
                  Stream.runForEach((value) =>
                    SubscriptionRef.update(tokenHistoryCache, (map) => {
                      const next = new Map(map)
                      next.set(contract, value)
                      return next
                    }).pipe(
                      Effect.zipRight(bump)
                    )
                  )
                )
              )
              tokenFibers.set(contract, fiber)
              yield* Effect.forkDaemon(source.refresh.pipe(Effect.asVoid))
            })

          const detachContract = (contract: string) =>
            Effect.gen(function* () {
              const source = tokenSources.get(contract)
              if (source) {
                yield* source.stop
                tokenSources.delete(contract)
              }
              const fiber = tokenFibers.get(contract)
              if (fiber) {
                yield* Fiber.interrupt(fiber)
                tokenFibers.delete(contract)
              }
              yield* SubscriptionRef.update(tokenHistoryCache, (map) => {
                const next = new Map(map)
                next.delete(contract)
                return next
              }).pipe(Effect.zipRight(bump))
            })

          const syncContracts = (tokenList: TokenListResponse | null) =>
            Effect.gen(function* () {
              const nextContracts = tokenList ? normalizeTokenContracts(tokenList) : []
              const nextSet = new Set(nextContracts)
              for (const contract of tokenSources.keys()) {
                if (!nextSet.has(contract)) {
                  yield* detachContract(contract)
                }
              }
              for (const contract of nextSet) {
                if (!tokenSources.has(contract)) {
                  yield* attachContract(contract)
                }
              }
            })

          yield* syncContracts(yield* tokenListSource.get)

          changeFibers.push(yield* Effect.forkDaemon(
            tokenListSource.changes.pipe(
              Stream.runForEach((next) =>
                syncContracts(next).pipe(
                  Effect.zipRight(bump)
                )
              )
            )
          ))

          const mergeSource = yield* createDependentSource({
            name: `bscwallet.${provider.chainId}.txHistory.${cacheKey}`,
            dependsOn: mergeSignal,
            hasChanged: (prev, next) => prev !== next,
            fetch: () =>
              Effect.gen(function* () {
                const native = yield* nativeSource.get
                const nativeTxs = (native?.result?.result ?? []).map((tx): Transaction => {
                  const status =
                    tx.isError === "1" || tx.txreceipt_status === "0" ? "failed" : "confirmed"
                  return {
                    hash: tx.hash,
                    from: tx.from,
                    to: tx.to,
                    timestamp: parseInt(tx.timeStamp, 10) * 1000,
                    status,
                    blockNumber: tx.blockNumber ? BigInt(tx.blockNumber) : undefined,
                    action: "transfer" as const,
                    direction: getDirection(tx.from, tx.to, normalizedAddress),
                    assets: [{
                      assetType: "native" as const,
                      value: tx.value,
                      symbol,
                      decimals,
                    }],
                  }
                })

                const tokenValues = [...(yield* SubscriptionRef.get(tokenHistoryCache)).values()]
                const tokenTxs = tokenValues.flatMap((raw) =>
                  (raw?.result?.result ?? []).map((tx): Transaction => {
                    const tokenSymbol = tx.tokenSymbol ?? "BEP20"
                    const tokenDecimals = parseTokenDecimals(tx.tokenDecimal)
                    const contractAddress = tx.contractAddress?.toLowerCase()
                    return {
                      hash: tx.hash,
                      from: tx.from,
                      to: tx.to,
                      timestamp: parseInt(tx.timeStamp, 10) * 1000,
                      status: "confirmed",
                      blockNumber: tx.blockNumber ? BigInt(tx.blockNumber) : undefined,
                      action: "transfer" as const,
                      direction: getDirection(tx.from, tx.to, normalizedAddress),
                      assets: [{
                        assetType: "token" as const,
                        value: tx.value,
                        symbol: tokenSymbol,
                        decimals: tokenDecimals,
                        contractAddress,
                        name: tx.tokenName,
                      }],
                    }
                  })
                )

                return mergeTransactions(nativeTxs, tokenTxs)
              }),
          })

          const stopAll = Effect.gen(function* () {
            for (const fiber of changeFibers) {
              yield* Fiber.interrupt(fiber)
            }
            for (const source of tokenSources.values()) {
              yield* source.stop
            }
            for (const fiber of tokenFibers.values()) {
              yield* Fiber.interrupt(fiber)
            }
            yield* mergeSource.stop
            yield* nativeSource.stop
            yield* provider.releaseSharedTokenListSource()
          })

          provider._txHistorySources.set(cacheKey, {
            source: mergeSource,
            refCount: 1,
            stopAll,
          })

          return mergeSource
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
          const txHistorySource = yield* Effect.catchAll(
            provider.getSharedTxHistorySource(address),
            (error) =>
              Effect.gen(function* () {
                if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
                  console.warn("[bscwallet] txHistory unavailable for balance", error)
                }
                return null
              })
          )

          if (txHistorySource === null) {
            const source = yield* createPollingSource({
              name: `bscwallet.${provider.chainId}.balance.poll`,
              interval: Duration.millis(provider.pollingInterval),
              immediate: true,
              fetch: provider.fetchBalance(address, true).pipe(
                Effect.map((raw): BalanceOutput => {
                  const balance = normalizeBalance(raw)
                  return {
                    amount: Amount.fromRaw(balance.amount, decimals, symbol),
                    symbol,
                  }
                })
              ),
            })

            provider._balanceSources.set(cacheKey, {
              source,
              refCount: 1,
              stopAll: source.stop,
            })

            return source
          }
          const balanceCache = yield* SubscriptionRef.make<BalanceOutput | null>(null)
          const mergeSignal = yield* SubscriptionRef.make(0)
          const bump = SubscriptionRef.update(mergeSignal, (value) => value + 1).pipe(Effect.asVoid)

          const buildBalance = (raw: BalanceRaw): BalanceOutput => {
            const balance = normalizeBalance(raw)
            return {
              amount: Amount.fromRaw(balance.amount, decimals, symbol),
              symbol,
            }
          }

          const dependentSource = yield* createDependentSource({
            name: `bscwallet.${provider.chainId}.balance.dep`,
            dependsOn: txHistorySource.ref,
            hasChanged: hasTransactionListChanged,
            fetch: (_dep, forceRefresh) =>
              provider.fetchBalance(address, forceRefresh).pipe(
                Effect.map(buildBalance),
                Effect.tap((next) => SubscriptionRef.set(balanceCache, next))
              ),
          })

          const shouldImmediatePoll = (yield* txHistorySource.get) === null
          const pollingSource = yield* createPollingSource({
            name: `bscwallet.${provider.chainId}.balance.poll`,
            interval: Duration.millis(provider.pollingInterval),
            immediate: shouldImmediatePoll,
            fetch: Effect.gen(function* () {
              const history = yield* txHistorySource.get
              const cached = yield* SubscriptionRef.get(balanceCache)
              if (history !== null && cached !== null) return cached
              const raw = yield* provider.fetchBalance(address, true)
              const next = buildBalance(raw)
              yield* SubscriptionRef.set(balanceCache, next)
              return next
            }),
          })

          const changeFibers: Fiber.RuntimeFiber<void, never>[] = []
          const registerChanges = (stream: Stream.Stream<unknown>) =>
            Effect.forkDaemon(
              stream.pipe(
                Stream.tap(() => bump),
                Stream.runDrain
              )
            )

          changeFibers.push(yield* registerChanges(dependentSource.changes))
          changeFibers.push(yield* registerChanges(pollingSource.changes))

          const mergeSource = yield* createDependentSource({
            name: `bscwallet.${provider.chainId}.balance`,
            dependsOn: mergeSignal,
            hasChanged: (prev, next) => prev !== next,
            fetch: () =>
              Effect.gen(function* () {
                const cached = yield* SubscriptionRef.get(balanceCache)
                if (!cached) {
                  return yield* Effect.fail(new HttpError("[bscwallet] balance cache empty"))
                }
                return cached
              }),
          })

          const stopAll = Effect.gen(function* () {
            for (const fiber of changeFibers) {
              yield* Fiber.interrupt(fiber)
            }
            yield* dependentSource.stop
            yield* pollingSource.stop
            yield* mergeSource.stop
            yield* txHistorySource.stop
          })

          provider._balanceSources.set(cacheKey, {
            source: mergeSource,
            refCount: 1,
            stopAll,
          })

          return mergeSource
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
          const txHistorySource = yield* Effect.catchAll(
            provider.getSharedTxHistorySource(address),
            (error) =>
              Effect.gen(function* () {
                if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
                  console.warn("[bscwallet] txHistory unavailable for tokenBalances", error)
                }
                return null
              })
          )

          if (txHistorySource === null) {
            const source = yield* createPollingSource({
              name: `bscwallet.${provider.chainId}.tokenBalances.poll`,
              interval: Duration.millis(provider.pollingInterval),
              immediate: true,
              fetch: provider.fetchTokenBalances(address, [], true).pipe(
                Effect.map((balances): TokenBalancesOutput => {
                  const list: TokenBalance[] = []
                  const balance = normalizeBalance(balances.native)
                  list.push({
                    symbol,
                    name: symbol,
                    amount: Amount.fromRaw(balance.amount, decimals, symbol),
                    isNative: true,
                    decimals,
                  })

                  for (const item of balances.tokens) {
                    const tokenSymbol = item.symbol ?? "BEP20"
                    const tokenDecimals = item.decimals ?? 0
                    list.push({
                      symbol: tokenSymbol,
                      name: item.name ?? tokenSymbol,
                      amount: Amount.fromRaw(toRawString(item.amount), tokenDecimals, tokenSymbol),
                      isNative: false,
                      decimals: tokenDecimals,
                      icon: item.icon,
                      contractAddress: item.contractAddress,
                    })
                  }

                  return list
                })
              ),
            })

            provider._tokenBalanceSources.set(cacheKey, {
              source,
              refCount: 1,
              stopAll: source.stop,
            })

            return source
          }

          const balanceCache = yield* SubscriptionRef.make<TokenBalancesOutput | null>(null)
          const mergeSignal = yield* SubscriptionRef.make(0)
          const bump = SubscriptionRef.update(mergeSignal, (value) => value + 1).pipe(Effect.asVoid)

          const buildTokenBalances = (balances: { native: BalanceRaw; tokens: BalanceV2Response }): TokenBalancesOutput => {
            const list: TokenBalance[] = []
            const balance = normalizeBalance(balances.native)
            list.push({
              symbol,
              name: symbol,
              amount: Amount.fromRaw(balance.amount, decimals, symbol),
              isNative: true,
              decimals,
            })

            for (const item of balances.tokens) {
              const tokenSymbol = item.symbol ?? "BEP20"
              const tokenDecimals = item.decimals ?? 0
              list.push({
                symbol: tokenSymbol,
                name: item.name ?? tokenSymbol,
                amount: Amount.fromRaw(toRawString(item.amount), tokenDecimals, tokenSymbol),
                isNative: false,
                decimals: tokenDecimals,
                icon: item.icon,
                contractAddress: item.contractAddress,
              })
            }

            return list
          }

          const dependentSource = yield* createDependentSource({
            name: `bscwallet.${provider.chainId}.tokenBalances.dep`,
            dependsOn: txHistorySource.ref,
            hasChanged: hasTransactionListChanged,
            fetch: (dep, forceRefresh) =>
              provider.fetchTokenBalances(address, getContractAddressesFromHistory(dep), forceRefresh).pipe(
                Effect.map(buildTokenBalances),
                Effect.tap((next) => SubscriptionRef.set(balanceCache, next))
              ),
          })

          const shouldImmediatePoll = (yield* txHistorySource.get) === null
          const pollingSource = yield* createPollingSource({
            name: `bscwallet.${provider.chainId}.tokenBalances.poll`,
            interval: Duration.millis(provider.pollingInterval),
            immediate: shouldImmediatePoll,
            fetch: Effect.gen(function* () {
              const history = yield* txHistorySource.get
              const cached = yield* SubscriptionRef.get(balanceCache)
              if (history !== null && cached !== null) return cached
              const raw = yield* provider.fetchTokenBalances(address, [], true)
              const next = buildTokenBalances(raw)
              yield* SubscriptionRef.set(balanceCache, next)
              return next
            }),
          })

          const changeFibers: Fiber.RuntimeFiber<void, never>[] = []
          const registerChanges = (stream: Stream.Stream<unknown>) =>
            Effect.forkDaemon(
              stream.pipe(
                Stream.tap(() => bump),
                Stream.runDrain
              )
            )

          changeFibers.push(yield* registerChanges(dependentSource.changes))
          changeFibers.push(yield* registerChanges(pollingSource.changes))

          const mergeSource = yield* createDependentSource({
            name: `bscwallet.${provider.chainId}.tokenBalances`,
            dependsOn: mergeSignal,
            hasChanged: (prev, next) => prev !== next,
            fetch: () =>
              Effect.gen(function* () {
                const cached = yield* SubscriptionRef.get(balanceCache)
                if (!cached) {
                  return yield* Effect.fail(new HttpError("[bscwallet] tokenBalances cache empty"))
                }
                return cached
              }),
          })

          const stopAll = Effect.gen(function* () {
            for (const fiber of changeFibers) {
              yield* Fiber.interrupt(fiber)
            }
            yield* dependentSource.stop
            yield* pollingSource.stop
            yield* mergeSource.stop
            yield* txHistorySource.stop
          })

          provider._tokenBalanceSources.set(cacheKey, {
            source: mergeSource,
            refCount: 1,
            stopAll,
          })

          return mergeSource
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

  private getSharedTokenListSource(): Effect.Effect<DataSource<TokenListResponse>> {
    const provider = this
    if (provider._tokenListSource) {
      provider._tokenListSource.refCount += 1
      return Effect.succeed(provider._tokenListSource.source)
    }
    if (provider._tokenListCreation) {
      return Effect.promise(async () => {
        const source = await provider._tokenListCreation
        if (provider._tokenListSource) {
          provider._tokenListSource.refCount += 1
        }
        return source
      })
    }

    return Effect.promise(async () => {
      const createPromise = Effect.runPromise(
        Effect.gen(function* () {
          const source = yield* createPollingSource({
            name: `bscwallet.${provider.chainId}.tokenList`,
            fetch: provider.fetchTokenList(false),
            interval: Duration.millis(provider.tokenListCacheTtl),
            immediate: true,
          })

          provider._tokenListSource = {
            source,
            refCount: 1,
            stopAll: source.stop,
          }

          return source
        })
      )

      provider._tokenListCreation = createPromise
      try {
        return await createPromise
      } finally {
        provider._tokenListCreation = null
      }
    })
  }

  private releaseSharedTokenListSource(): Effect.Effect<void> {
    const provider = this
    return Effect.gen(function* () {
      const entry = provider._tokenListSource
      if (!entry) return
      entry.refCount -= 1
      if (entry.refCount <= 0) {
        yield* entry.stopAll
        provider._tokenListSource = null
      }
    })
  }

  private fetchBalance(address: string, forceRefresh = false): Effect.Effect<BalanceRaw, FetchError> {
    return httpFetchCached({
      url: `${this.baseUrl}/balance?address=${address}`,
      schema: BalanceRawSchema,
      cacheStrategy: forceRefresh ? "ttl" : "cache-first",
      cacheTtl: this.balanceCacheTtlMs,
      canCache: canCacheBalance,
    }).pipe(
      Effect.tap((raw) => {
        if (typeof raw === "object" && raw !== null && "success" in raw) {
          logApiFailure("balance", raw as { success: boolean; error?: unknown })
        }
      })
    )
  }

  private fetchNativeHistory(
    params: TxHistoryParams,
    forceRefresh = false
  ): Effect.Effect<TxHistoryResponse, FetchError> {
    if (this._normalHistoryDisabled) {
      if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
        console.warn("[bscwallet] trans/normal/history disabled for session")
      }
      return Effect.fail(new HttpError("[bscwallet] trans/normal/history disabled"))
    }
    return httpFetchCached({
      url: `${this.baseUrl}/trans/normal/history`,
      method: "POST",
      body: {
        address: params.address,
        page: 1,
        offset: params.limit ?? 50,
      },
      schema: TxHistoryResponseSchema,
      cacheStrategy: forceRefresh ? "ttl" : "cache-first",
      cacheTtl: this.balanceCacheTtlMs,
      canCache: canCacheHistory,
    }).pipe(
      Effect.tap((raw) => logApiFailure("trans/normal/history", raw)),
      Effect.flatMap((raw) => {
        if (raw.success && raw.result && !isWalletApiOk(raw.result)) {
          this._normalHistoryDisabled = true
        }
        return assertHistoryHealthy("trans/normal/history", raw)
      })
    )
  }

  private fetchTokenHistory(
    params: TxHistoryParams,
    forceRefresh = false
  ): Effect.Effect<TokenHistoryResponse, FetchError> {
    if (!params.contractAddress) {
      return Effect.succeed({ success: true, result: { result: [] } })
    }

    return httpFetchCached({
      url: `${this.baseUrl}/trans/bep20/history`,
      method: "POST",
      body: {
        address: params.address,
        contractaddress: params.contractAddress,
        page: 1,
        offset: params.limit ?? 50,
      },
      schema: TokenHistoryResponseSchema,
      cacheStrategy: forceRefresh ? "ttl" : "cache-first",
      cacheTtl: this.balanceCacheTtlMs,
      canCache: canCacheHistory,
    }).pipe(
      Effect.tap((raw) => logApiFailure("trans/bep20/history", raw)),
      Effect.flatMap((raw) => assertTokenHistoryHealthy("trans/bep20/history", raw))
    )
  }

  private fetchTokenBalances(
    address: string,
    contracts: string[],
    forceRefresh = false
  ): Effect.Effect<{ native: BalanceRaw; tokens: BalanceV2Response }, FetchError> {
    const sortedContracts = [...contracts].sort()
    if (sortedContracts.length === 0) {
      const provider = this
      return Effect.gen(function* () {
        const tokenList = yield* provider.fetchTokenList(false)
        const nextContracts = normalizeTokenContracts(tokenList)
        const native = yield* provider.fetchBalance(address, forceRefresh)
        if (nextContracts.length === 0) {
          return { native, tokens: [] }
        }
        const tokens = yield* httpFetchCached({
          url: `${provider.baseUrl}/account/balance/v2`,
          method: "POST",
          body: { address, contracts: nextContracts },
          schema: BalanceV2RawSchema,
          cacheStrategy: forceRefresh ? "ttl" : "cache-first",
          cacheTtl: provider.balanceCacheTtlMs,
          canCache: canCacheBalanceV2,
        }).pipe(
          Effect.tap((raw) => {
            if (!Array.isArray(raw)) logApiFailure("account/balance/v2", raw)
          }),
          Effect.map(normalizeBalanceV2),
          Effect.catchAll(() => Effect.succeed([] as BalanceV2Response))
        )
        return { native, tokens }
      })
    }

    return Effect.all({
      native: this.fetchBalance(address, forceRefresh),
      tokens: httpFetchCached({
        url: `${this.baseUrl}/account/balance/v2`,
        method: "POST",
        body: { address, contracts: sortedContracts },
        schema: BalanceV2RawSchema,
        cacheStrategy: forceRefresh ? "ttl" : "cache-first",
        cacheTtl: this.balanceCacheTtlMs,
        canCache: canCacheBalanceV2,
      }).pipe(
        Effect.tap((raw) => {
          if (!Array.isArray(raw)) logApiFailure("account/balance/v2", raw)
        }),
        Effect.map(normalizeBalanceV2),
        Effect.catchAll(() => Effect.succeed([] as BalanceV2Response))
      ),
    })
  }

  private fetchTokenList(forceRefresh = false): Effect.Effect<TokenListResponse, FetchError> {
    return httpFetchCached({
      url: `${this.baseUrl}/contract/tokens`,
      method: "POST",
      body: {
        page: 1,
        pageSize: 50,
        chain: "BSC",
      },
      schema: TokenListResponseSchema,
      cacheStrategy: forceRefresh ? "network-first" : "ttl",
      cacheTtl: this.tokenListCacheTtl,
      canCache: canCacheSuccess,
    }).pipe(
      Effect.tap((raw) => logApiFailure("contract/tokens", raw)),
      Effect.map(ensureTokenListSuccess)
    )
  }
}

export function createBscWalletProviderEffect(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type === "bscwallet-v1") {
    return new BscWalletProviderEffect(entry, chainId)
  }
  return null
}
