/**
 * BtcWallet API Provider (Blockbook) - Effect TS Version (深度重构)
 *
 * 使用 Effect 原生 Source API 实现响应式数据获取
 * - transactionHistory: 定时轮询 + 事件触发
 * - nativeBalance: 依赖 transactionHistory 变化
 *
 * Docs:
 * - docs/white-book/02-Driver-Ref/03-UTXO/01-BTC-Provider.md
 * - docs/white-book/99-Appendix/05-API-Providers.md
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
import type {
  ApiProvider,
  Direction,
  BalanceOutput,
  TransactionsOutput,
  AddressParams,
  TxHistoryParams,
  TransactionParams,
  TransactionOutput,
} from "./types"
import type {
  TransactionIntent,
  UnsignedTransaction,
  SignedTransaction,
  TransactionHash,
  FeeEstimate,
  Fee,
  TransferIntent,
} from "../types"
import type { ParsedApiEntry } from "@/services/chain-config"
import { chainConfigService } from "@/services/chain-config"
import { Amount } from "@/types/amount"
import { BitcoinIdentityMixin } from "../bitcoin/identity-mixin"
import { BitcoinTransactionMixin } from "../bitcoin/transaction-mixin"
import { getWalletEventBus } from "@/services/chain-adapter/wallet-event-bus"

// ==================== Effect Schema 定义 ====================

const TxItemSchema = S.Struct({
  txid: S.String,
  vin: S.optional(S.Array(S.Struct({
    addresses: S.optional(S.Array(S.String)),
  }))),
  vout: S.optional(S.Array(S.Struct({
    addresses: S.optional(S.Array(S.String)),
    value: S.optional(S.String),
  }))),
  blockTime: S.optional(S.Number),
  confirmations: S.optional(S.Number),
})

const AddressInfoSchema = S.Struct({
  balance: S.String,
  txs: S.optional(S.Number),
  transactions: S.optional(S.Array(TxItemSchema)),
})

const AddressInfoResponseSchema = S.Struct({
  success: S.Boolean,
  result: S.optional(AddressInfoSchema),
})

type AddressInfo = S.Schema.Type<typeof AddressInfoSchema>
type AddressInfoResponse = S.Schema.Type<typeof AddressInfoResponseSchema>
type TxItem = S.Schema.Type<typeof TxItemSchema>

const TxDetailSchema = S.Struct({
  txid: S.String,
  vin: S.optional(S.Array(S.Struct({
    addresses: S.optional(S.Array(S.String)),
  }))),
  vout: S.optional(S.Array(S.Struct({
    addresses: S.optional(S.Array(S.String)),
    value: S.optional(S.String),
  }))),
  blockTime: S.optional(S.Number),
  confirmations: S.optional(S.Number),
  blockHeight: S.optional(S.Number),
})

const TxDetailResponseSchema = S.Struct({
  success: S.Boolean,
  result: S.optional(TxDetailSchema),
})

const UtxoSchema = S.Struct({
  txid: S.String,
  vout: S.Number,
  value: S.Union(S.String, S.Number),
  scriptPubKey: S.optional(S.String),
})

const UtxoResponseSchema = S.Struct({
  success: S.Boolean,
  result: S.optional(S.Array(UtxoSchema)),
})

const FeeRateResponseSchema = S.Struct({
  success: S.Boolean,
  result: S.optional(S.Union(S.String, S.Number)),
})

const BroadcastResponseSchema = S.Struct({
  success: S.Boolean,
  result: S.optional(S.String),
})

// ==================== 工具函数 ====================

function getDirection(vin: TxItem["vin"], vout: TxItem["vout"], address: string): Direction {
  const isFrom = vin?.some((v) => v.addresses?.includes(address))
  const isTo = vout?.some((v) => v.addresses?.includes(address))
  if (isFrom && isTo) return "self"
  return isFrom ? "out" : "in"
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

function normalizeAddressInfo(response: AddressInfoResponse): AddressInfo {
  return response.result ?? { balance: "0", transactions: [] }
}

function canCacheSuccess(result: AddressInfoResponse): Promise<boolean> {
  return Promise.resolve(result.success)
}

function unwrapBlockbookResult<T>(
  name: string,
  raw: { success: boolean; result?: T }
): Effect.Effect<T, FetchError> {
  if (raw.success && raw.result !== undefined) {
    return Effect.succeed(raw.result)
  }
  if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
    console.warn(`[btcwallet] ${name} failed`, raw)
  }
  return Effect.fail(new HttpError(`[btcwallet] ${name} failed`))
}

function unwrapBlockbookResultOrNull<T>(
  name: string,
  raw: { success: boolean; result?: T }
): Effect.Effect<T | null, FetchError> {
  if (raw.success) {
    return Effect.succeed(raw.result ?? null)
  }
  if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
    console.warn(`[btcwallet] ${name} failed`, raw)
  }
  return Effect.fail(new HttpError(`[btcwallet] ${name} failed`))
}

function logApiFailure(name: string, payload: { success: boolean; error?: unknown }): void {
  if (payload.success) return
  if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
    console.warn(`[btcwallet] ${name} success=false`, payload.error ?? payload)
  }
}

// ==================== Base Class ====================

class BtcWalletBase {
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

export class BtcWalletProviderEffect extends BitcoinIdentityMixin(BitcoinTransactionMixin(BtcWalletBase)) implements ApiProvider {
  private readonly symbol: string
  private readonly decimals: number
  private readonly baseUrl: string
  private readonly pollingInterval: number = 60000

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
  private _transactionSources = new Map<
    string,
    {
      source: DataSource<TransactionOutput>
      refCount: number
      stopAll: Effect.Effect<void>
    }
  >()
  private _transactionCreations = new Map<string, Promise<DataSource<TransactionOutput>>>()

  readonly nativeBalance: StreamInstance<AddressParams, BalanceOutput>
  readonly transactionHistory: StreamInstance<TxHistoryParams, TransactionsOutput>
  readonly transaction: StreamInstance<TransactionParams, TransactionOutput>

  constructor(entry: ParsedApiEntry, chainId: string) {
    super(entry, chainId)
    this.symbol = chainConfigService.getSymbol(chainId)
    this.decimals = chainConfigService.getDecimals(chainId)
    this.baseUrl = this.endpoint

    const provider = this

    // transactionHistory: 定时轮询 + 事件触发
    this.transactionHistory = createStreamInstanceFromSource<TxHistoryParams, TransactionsOutput>(
      `btcwallet.${chainId}.transactionHistory`,
      (params) => provider.createTransactionHistorySource(params)
    )

    // nativeBalance: 依赖 transactionHistory 变化
    this.nativeBalance = createStreamInstanceFromSource<AddressParams, BalanceOutput>(
      `btcwallet.${chainId}.nativeBalance`,
      (params) => provider.createBalanceSource(params)
    )

    // transaction: 单笔交易查询
    this.transaction = createStreamInstanceFromSource<TransactionParams, TransactionOutput>(
      `btcwallet.${chainId}.transaction`,
      (params) => provider.createTransactionSource(params)
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

  private createTransactionSource(
    params: TransactionParams
  ): Effect.Effect<DataSource<TransactionOutput>> {
    return this.getSharedTransactionSource(params.txHash, params.senderId)
  }

  private getSharedTxHistorySource(address: string): Effect.Effect<DataSource<TransactionsOutput>> {
    const provider = this
    const cacheKey = address
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

          const fetchEffect = provider.fetchAddressInfo(address, true).pipe(
            Effect.map((info): TransactionsOutput =>
              (info.transactions ?? []).map((tx) => ({
                hash: tx.txid,
                from: tx.vin?.[0]?.addresses?.[0] ?? "",
                to: tx.vout?.[0]?.addresses?.[0] ?? "",
                timestamp: (tx.blockTime ?? 0) * 1000,
                status: (tx.confirmations ?? 0) > 0 ? ("confirmed" as const) : ("pending" as const),
                action: "transfer" as const,
                direction: getDirection(tx.vin, tx.vout, address),
                assets: [{
                  assetType: "native" as const,
                  value: tx.vout?.[0]?.value ?? "0",
                  symbol,
                  decimals,
                }],
              }))
            )
          )

          const source = yield* createPollingSource({
            name: `btcwallet.${provider.chainId}.txHistory.${cacheKey}`,
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
    const cacheKey = address
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
            name: `btcwallet.${provider.chainId}.balance`,
            dependsOn: txHistorySource.ref,
            hasChanged: hasTransactionListChanged,
            fetch: (_dep, forceRefresh) =>
              provider.fetchAddressInfo(address, forceRefresh).pipe(
                Effect.map((info): BalanceOutput => ({
                  amount: Amount.fromRaw(info.balance, decimals, symbol),
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

  private getSharedTransactionSource(txHash: string, address?: string): Effect.Effect<DataSource<TransactionOutput>> {
    const provider = this
    const cacheKey = address ? `${txHash}:${address}` : txHash
    const symbol = this.symbol
    const decimals = this.decimals

    const wrapSharedSource = (source: DataSource<TransactionOutput>): DataSource<TransactionOutput> => ({
      ...source,
      stop: provider.releaseSharedTransactionSource(cacheKey),
    })

    const cached = provider._transactionSources.get(cacheKey)
    if (cached) {
      cached.refCount += 1
      return Effect.succeed(wrapSharedSource(cached.source))
    }

    const pending = provider._transactionCreations.get(cacheKey)
    if (pending) {
      return Effect.promise(async () => {
        const source = await pending
        const entry = provider._transactionSources.get(cacheKey)
        if (entry) {
          entry.refCount += 1
        }
        return wrapSharedSource(source)
      })
    }

    return Effect.promise(async () => {
      const createPromise = Effect.runPromise(
        Effect.gen(function* () {
          const fetchEffect = provider.fetchTransactionDetail(txHash, true).pipe(
            Effect.map((detail): TransactionOutput => {
              if (!detail) return null
              const direction: Direction = address ? getDirection(detail.vin, detail.vout, address) : "self"
              return {
                hash: detail.txid,
                from: detail.vin?.[0]?.addresses?.[0] ?? "",
                to: detail.vout?.[0]?.addresses?.[0] ?? "",
                timestamp: (detail.blockTime ?? 0) * 1000,
                status: (detail.confirmations ?? 0) > 0 ? ("confirmed" as const) : ("pending" as const),
                action: "transfer" as const,
                direction,
                assets: [{
                  assetType: "native" as const,
                  value: detail.vout?.[0]?.value ?? "0",
                  symbol,
                  decimals,
                }],
              }
            })
          )

          const source = yield* createPollingSource({
            name: `btcwallet.${provider.chainId}.transaction.${cacheKey}`,
            fetch: fetchEffect,
            interval: Duration.millis(provider.pollingInterval),
          })

          const stopAll = source.stop

          provider._transactionSources.set(cacheKey, {
            source,
            refCount: 1,
            stopAll,
          })

          return source
        })
      )

      provider._transactionCreations.set(cacheKey, createPromise)

      try {
        const source = await createPromise
        return wrapSharedSource(source)
      } finally {
        provider._transactionCreations.delete(cacheKey)
      }
    })
  }

  private releaseSharedTransactionSource(key: string): Effect.Effect<void> {
    const provider = this
    return Effect.gen(function* () {
      const entry = provider._transactionSources.get(key)
      if (!entry) return
      entry.refCount -= 1
      if (entry.refCount <= 0) {
        yield* entry.stopAll
        provider._transactionSources.delete(key)
      }
    })
  }

  // ==================== HTTP Fetch Effects ====================

  private fetchAddressInfo(address: string, forceRefresh = false): Effect.Effect<AddressInfo, FetchError> {
    const url = `/api/v2/address/${address}?page=1&pageSize=50&details=txs`
    return httpFetchCached({
      url: this.baseUrl,
      method: "POST",
      body: {
        url,
        method: "GET",
      },
      schema: AddressInfoResponseSchema,
      cacheStrategy: forceRefresh ? "ttl" : "cache-first",
      cacheTtl: 5000,
      canCache: canCacheSuccess,
    }).pipe(
      Effect.tap((raw) => logApiFailure("blockbook/address", raw)),
      Effect.map(normalizeAddressInfo)
    )
  }

  private fetchTransactionDetail(txHash: string, forceRefresh = false): Effect.Effect<S.Schema.Type<typeof TxDetailSchema> | null, FetchError> {
    const url = `/api/v2/tx/${txHash}`
    return httpFetchCached({
      url: this.baseUrl,
      method: "POST",
      body: {
        url,
        method: "GET",
      },
      schema: TxDetailResponseSchema,
      cacheStrategy: forceRefresh ? "ttl" : "cache-first",
      cacheTtl: 5000,
      canCache: canCacheSuccess,
    }).pipe(
      Effect.tap((raw) => logApiFailure("blockbook/tx", raw)),
      Effect.flatMap((raw) => unwrapBlockbookResultOrNull("blockbook/tx", raw))
    )
  }

  private fetchUtxos(address: string, forceRefresh = false): Effect.Effect<S.Schema.Type<typeof UtxoSchema>[], FetchError> {
    const url = `/api/v2/utxo/${address}`
    return httpFetchCached({
      url: this.baseUrl,
      method: "POST",
      body: {
        url,
        method: "GET",
      },
      schema: UtxoResponseSchema,
      cacheStrategy: forceRefresh ? "ttl" : "cache-first",
      cacheTtl: 15000,
      canCache: canCacheSuccess,
    }).pipe(
      Effect.tap((raw) => logApiFailure("blockbook/utxo", raw)),
      Effect.flatMap((raw) => unwrapBlockbookResult("blockbook/utxo", raw))
    )
  }

  private fetchFeeRate(blocks = 6, forceRefresh = false): Effect.Effect<string, FetchError> {
    const url = `/api/v2/estimatefee/${blocks}`
    return httpFetchCached({
      url: this.baseUrl,
      method: "POST",
      body: {
        url,
        method: "GET",
      },
      schema: FeeRateResponseSchema,
      cacheStrategy: forceRefresh ? "ttl" : "cache-first",
      cacheTtl: 30000,
      canCache: canCacheSuccess,
    }).pipe(
      Effect.tap((raw) => logApiFailure("blockbook/estimatefee", raw)),
      Effect.flatMap((raw) => unwrapBlockbookResult("blockbook/estimatefee", raw)),
      Effect.map((value) => String(value))
    )
  }

  private broadcastRawTransaction(txHex: string): Effect.Effect<string, FetchError> {
    const url = `/api/v2/sendtx/${txHex}`
    return httpFetchCached({
      url: this.baseUrl,
      method: "POST",
      body: {
        url,
        method: "GET",
      },
      schema: BroadcastResponseSchema,
      cacheStrategy: "network-first",
      cacheTtl: 0,
      canCache: async () => false,
    }).pipe(
      Effect.tap((raw) => logApiFailure("blockbook/sendtx", raw)),
      Effect.flatMap((raw) => unwrapBlockbookResult("blockbook/sendtx", raw))
    )
  }

  async buildTransaction(intent: TransactionIntent): Promise<UnsignedTransaction> {
    if (intent.type !== "transfer") {
      throw new Error(`Transaction type not supported: ${intent.type}`)
    }

    const transferIntent = intent as TransferIntent
    const utxos = await Effect.runPromise(this.fetchUtxos(transferIntent.from, true))

    if (utxos.length === 0) {
      throw new Error("No UTXOs available")
    }

    const feeRateBtcPerKb = await Effect.runPromise(this.fetchFeeRate(6, true))
    const feeRateBtc = Number(feeRateBtcPerKb)
    const satPerKb = Number.isFinite(feeRateBtc) ? feeRateBtc * 1e8 : 0
    const feeRate = satPerKb > 0 ? Math.ceil(satPerKb / 1000) : 1

    const totalInput = utxos.reduce((sum, u) => sum + Number(u.value), 0)
    const sendAmount = Number(transferIntent.amount.raw)
    const estimatedVsize = 10 + utxos.length * 68 + 2 * 31
    const fee = feeRate * estimatedVsize

    if (totalInput < sendAmount + fee) {
      throw new Error(`Insufficient balance: need ${sendAmount + fee}, have ${totalInput}`)
    }

    const change = totalInput - sendAmount - fee
    const txData = {
      inputs: utxos.map((u) => ({
        txid: u.txid,
        vout: u.vout,
        value: Number(u.value),
        scriptPubKey: u.scriptPubKey ?? "",
      })),
      outputs: [{ address: transferIntent.to, value: sendAmount }],
      fee,
      changeAddress: transferIntent.from,
    }

    if (change > 546) {
      txData.outputs.push({ address: transferIntent.from, value: change })
    }

    return {
      chainId: this.chainId,
      intentType: "transfer",
      data: txData,
    }
  }

  async estimateFee(_unsignedTx: UnsignedTransaction): Promise<FeeEstimate> {
    const feeRateBtcPerKb = await Effect.runPromise(this.fetchFeeRate(6, true))
    const feeRateBtc = Number(feeRateBtcPerKb)
    const satPerKb = Number.isFinite(feeRateBtc) ? feeRateBtc * 1e8 : 0
    const satPerByte = satPerKb > 0 ? Math.ceil(satPerKb / 1000) : 1

    const config = chainConfigService.getConfig(this.chainId)!
    const typicalVsize = 140
    const baseFee = BigInt(satPerByte * typicalVsize)

    const slow: Fee = {
      amount: Amount.fromRaw(((baseFee * 80n) / 100n).toString(), config.decimals, config.symbol),
      estimatedTime: 3600,
    }
    const standard: Fee = {
      amount: Amount.fromRaw(baseFee.toString(), config.decimals, config.symbol),
      estimatedTime: 1800,
    }
    const fast: Fee = {
      amount: Amount.fromRaw(((baseFee * 120n) / 100n).toString(), config.decimals, config.symbol),
      estimatedTime: 600,
    }
    return { slow, standard, fast }
  }

  async broadcastTransaction(signedTx: SignedTransaction): Promise<TransactionHash> {
    const txHex = signedTx.data as string
    return Effect.runPromise(this.broadcastRawTransaction(txHex))
  }
}

export function createBtcwalletProviderEffect(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type === "btcwallet-v1") return new BtcWalletProviderEffect(entry, chainId)
  return null
}
