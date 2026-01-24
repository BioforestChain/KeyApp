/**
 * TronWallet API Provider - Effect TS Version (深度重构)
 * 
 * 使用 Effect 原生 Source API 实现响应式数据获取
 */

import { Effect, Duration } from "effect"
import { Schema as S } from "effect"
import {
  httpFetchCached,
  createStreamInstanceFromSource,
  createPollingSource,
  createDependentSource,
  type FetchError,
  type DataSource,
  type EventBusService,
} from "@biochain/chain-effect"
import type { StreamInstance } from "@biochain/chain-effect"
import { getWalletEventBus } from "@/services/chain-adapter/wallet-event-bus"
import type {
  ApiProvider,
  Transaction,
  Direction,
  BalanceOutput,
  TransactionsOutput,
  AddressParams,
  TxHistoryParams,
} from "./types"
import type { ParsedApiEntry } from "@/services/chain-config"
import { chainConfigService } from "@/services/chain-config"
import { Amount } from "@/types/amount"
import { TronIdentityMixin } from "../tron/identity-mixin"
import { TronTransactionMixin } from "../tron/transaction-mixin"

// ==================== Effect Schema 定义 ====================

const BalanceResponseSchema = S.Union(
  S.Struct({
    success: S.Boolean,
    result: S.Union(S.String, S.Number),
  }),
  S.Struct({
    success: S.Boolean,
    data: S.Union(S.String, S.Number),
  }),
  S.Struct({
    balance: S.Union(S.String, S.Number),
  }),
  S.String,
  S.Number,
)
type BalanceResponse = S.Schema.Type<typeof BalanceResponseSchema>

const TronNativeTxSchema = S.Struct({
  txID: S.String,
  from: S.String,
  to: S.String,
  amount: S.Union(S.Number, S.String),
  timestamp: S.Number,
  contractRet: S.optional(S.String),
  blockNumber: S.optional(S.Number),
  fee: S.optional(S.Number),
  net_usage: S.optional(S.Number),
  net_fee: S.optional(S.Number),
  energy_usage: S.optional(S.Number),
  energy_fee: S.optional(S.Number),
  expiration: S.optional(S.Number),
})

const TxHistoryResponseSchema = S.Struct({
  success: S.Boolean,
  data: S.Array(TronNativeTxSchema),
  pageSize: S.optional(S.Number),
  fingerprint: S.optional(S.String),
})
type TxHistoryResponse = S.Schema.Type<typeof TxHistoryResponseSchema>

// ==================== 工具函数 ====================

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"

function base58Decode(input: string): Uint8Array {
  const bytes = [0]
  for (const char of input) {
    const idx = BASE58_ALPHABET.indexOf(char)
    if (idx === -1) throw new Error(`Invalid Base58 character: ${char}`)
    let carry = idx
    for (let i = 0; i < bytes.length; i++) {
      carry += bytes[i] * 58
      bytes[i] = carry & 0xff
      carry >>= 8
    }
    while (carry > 0) {
      bytes.push(carry & 0xff)
      carry >>= 8
    }
  }
  for (const char of input) {
    if (char !== "1") break
    bytes.push(0)
  }
  return new Uint8Array(bytes.reverse())
}

function base58Encode(bytes: Uint8Array): string {
  let num = 0n
  for (const byte of bytes) {
    num = num * 256n + BigInt(byte)
  }
  let result = ""
  while (num > 0n) {
    const rem = Number(num % 58n)
    num = num / 58n
    result = BASE58_ALPHABET[rem] + result
  }
  for (const byte of bytes) {
    if (byte === 0) {
      result = BASE58_ALPHABET[0] + result
    } else {
      break
    }
  }
  return result
}

function tronAddressToHex(address: string): string {
  if (address.startsWith("41") && address.length === 42) return address
  if (!address.startsWith("T")) throw new Error(`Invalid Tron address: ${address}`)
  const decoded = base58Decode(address)
  const addressBytes = decoded.slice(0, 21)
  return Array.from(addressBytes).map((b) => b.toString(16).padStart(2, "0")).join("")
}

function tronAddressFromHex(address: string): string {
  if (address.startsWith("T")) return address
  const normalized = address.startsWith("0x") ? address.slice(2) : address
  const hex = normalized.startsWith("41") ? normalized : `41${normalized}`
  if (hex.length !== 42) throw new Error(`Invalid Tron hex address: ${address}`)
  const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map((b) => Number.parseInt(b, 16)))
  return base58Encode(bytes)
}

function getDirection(from: string, to: string, address: string): Direction {
  if (from === address && to === address) return "self"
  if (from === address) return "out"
  return "in"
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

function normalizeBalanceResponse(raw: BalanceResponse): string {
  if (typeof raw === "string" || typeof raw === "number") return String(raw)
  if ("balance" in raw) return String(raw.balance)
  if ("result" in raw) return String(raw.result)
  if ("data" in raw) return String(raw.data)
  return "0"
}

// ==================== Base Class ====================

class TronWalletBase {
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

export class TronWalletProviderEffect extends TronIdentityMixin(TronTransactionMixin(TronWalletBase)) implements ApiProvider {
  private readonly symbol: string
  private readonly decimals: number
  private readonly baseUrl: string
  private readonly pollingInterval: number = 30000

  private _eventBus: EventBusService | null = null
  private _txHistorySources = new Map<string, { source: DataSource<TransactionsOutput>; refCount: number }>()
  private _txHistoryCreations = new Map<string, Promise<DataSource<TransactionsOutput>>>()

  readonly nativeBalance: StreamInstance<AddressParams, BalanceOutput>
  readonly transactionHistory: StreamInstance<TxHistoryParams, TransactionsOutput>

  constructor(entry: ParsedApiEntry, chainId: string) {
    super(entry, chainId)
    this.symbol = chainConfigService.getSymbol(chainId)
    this.decimals = chainConfigService.getDecimals(chainId)
    this.baseUrl = this.endpoint

    const provider = this

    this.transactionHistory = createStreamInstanceFromSource<TxHistoryParams, TransactionsOutput>(
      `tronwallet.${chainId}.transactionHistory`,
      (params) => provider.createTransactionHistorySource(params)
    )

    this.nativeBalance = createStreamInstanceFromSource<AddressParams, BalanceOutput>(
      `tronwallet.${chainId}.nativeBalance`,
      (params) => provider.createBalanceSource(params)
    )
  }

  private releaseSharedTxHistorySource(cacheKey: string) {
    const provider = this
    return Effect.gen(function* () {
      const entry = provider._txHistorySources.get(cacheKey)
      if (!entry) return
      entry.refCount -= 1
      if (entry.refCount <= 0) {
        provider._txHistorySources.delete(cacheKey)
        yield* entry.source.stop
      }
    })
  }

  private getSharedTxHistorySource(
    params: TxHistoryParams
  ): Effect.Effect<DataSource<TransactionsOutput>> {
    const provider = this
    const address = params.address
    const symbol = this.symbol
    const decimals = this.decimals
    const chainId = this.chainId
    const cacheKey = address

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

          const fetchEffect = provider.fetchTransactions({ address, limit: 50 }, true).pipe(
            Effect.map((raw): TransactionsOutput => {
              if (typeof raw === "object" && "success" in raw && raw.success === false) return []
              return raw.data.map((tx): Transaction => {
                const from = tronAddressFromHex(tx.from)
                const to = tronAddressFromHex(tx.to)
                return {
                  hash: tx.txID,
                  from,
                  to,
                  timestamp: tx.timestamp,
                  status: tx.contractRet ? (tx.contractRet === "SUCCESS" ? "confirmed" : "failed") : "confirmed",
                  action: "transfer" as const,
                  direction: getDirection(from, to, address),
                  assets: [{
                    assetType: "native" as const,
                    value: String(tx.amount),
                    symbol,
                    decimals,
                  }],
                }
              })
            })
          )

          const source = yield* createPollingSource({
            name: `tronwallet.${provider.chainId}.txHistory.${address}`,
            fetch: fetchEffect,
            interval: Duration.millis(provider.pollingInterval),
            walletEvents: {
              eventBus,
              chainId,
              address,
              types: ["tx:confirmed", "tx:sent"],
            },
          })

          return source
        })
      )

      provider._txHistoryCreations.set(cacheKey, createPromise)
      try {
        const source = await createPromise
        provider._txHistorySources.set(cacheKey, { source, refCount: 1 })
        return wrapSharedSource(source)
      } finally {
        provider._txHistoryCreations.delete(cacheKey)
      }
    })
  }

  private createTransactionHistorySource(
    params: TxHistoryParams
  ): Effect.Effect<DataSource<TransactionsOutput>> {
    return this.getSharedTxHistorySource(params)
  }

  private createBalanceSource(
    params: AddressParams
  ): Effect.Effect<DataSource<BalanceOutput>> {
    const provider = this
    const symbol = this.symbol
    const decimals = this.decimals

    return Effect.gen(function* () {
      const txHistorySource = yield* provider.getSharedTxHistorySource({
        address: params.address,
        limit: 50,
      })

      const fetchBalance = (forceRefresh?: boolean) =>
        provider.fetchBalance(params.address, forceRefresh).pipe(
          Effect.map((raw): BalanceOutput => ({
            amount: Amount.fromRaw(normalizeBalanceResponse(raw), decimals, symbol),
            symbol,
          }))
        )

      const source = yield* createDependentSource({
        name: `tronwallet.${provider.chainId}.balance`,
        dependsOn: txHistorySource.ref,
        hasChanged: hasTransactionListChanged,
        fetch: (_dep, forceRefresh) => fetchBalance(forceRefresh),
      })

      const stopAll = Effect.all([source.stop, txHistorySource.stop]).pipe(Effect.asVoid)
      return {
        ...source,
        stop: stopAll,
      }
    })
  }

  private fetchBalance(address: string, forceRefresh = false): Effect.Effect<BalanceResponse, FetchError> {
    return httpFetchCached({
      url: `${this.baseUrl}/balance?address=${tronAddressToHex(address)}`,
      schema: BalanceResponseSchema,
      cacheStrategy: forceRefresh ? "network-first" : "cache-first",
    })
  }

  private fetchTransactions(
    params: TxHistoryParams,
    forceRefresh = false
  ): Effect.Effect<TxHistoryResponse, FetchError> {
    return httpFetchCached({
      url: `${this.baseUrl}/trans/common/history`,
      method: "POST",
      body: {
        address: tronAddressToHex(params.address),
        limit: params.limit ?? 50,
      },
      schema: TxHistoryResponseSchema,
      cacheStrategy: forceRefresh ? "network-first" : "cache-first",
    })
  }
}

export function createTronwalletProviderEffect(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type === "tronwallet-v1") {
    return new TronWalletProviderEffect(entry, chainId)
  }
  return null
}
