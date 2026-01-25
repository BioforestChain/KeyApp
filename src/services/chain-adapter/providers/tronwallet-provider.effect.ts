/**
 * TronWallet API Provider (Effect TS - 深度重构)
 *
 * 使用 Effect 原生 Source API 实现响应式数据获取
 * - transactionHistory: 定时轮询 + 事件触发（共享 source）
 * - nativeBalance/tokenBalances: 依赖 transactionHistory 变化
 *
 * Legacy Reference:
 * - /Users/kzf/Dev/bioforestChain/legacy-apps/libs/wallet-base/services/wallet/tron/tron.service.ts
 * Whitebook:
 * - docs/white-book/02-Driver-Ref/04-TVM/01-Tron-Provider.md
 * - docs/white-book/99-Appendix/05-API-Providers.md
 */

import { Effect, Duration, Stream, SubscriptionRef, Fiber } from "effect"
import { Schema as S } from "effect"
import {
  httpFetch,
  httpFetchCached,
  createStreamInstanceFromSource,
  createPollingSource,
  createDependentSource,
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
  TokenBalancesOutput,
  TransactionsOutput,
  TransactionOutput,
  AddressParams,
  TxHistoryParams,
  TransactionParams,
  TokenBalance,
} from "./types"
import type { ParsedApiEntry } from "@/services/chain-config"
import { chainConfigService } from "@/services/chain-config/service";
import { Amount } from "@/types/amount"
import { ChainServiceError, ChainErrorCodes } from "../types"
import { TronIdentityMixin } from "../tron/identity-mixin"
import { TronTransactionMixin } from "../tron/transaction-mixin"
import { getWalletEventBus } from "@/services/chain-adapter/wallet-event-bus"
import { normalizeTronAddress, normalizeTronHex, tronAddressToHex } from "../tron/address"
import type { SignedTransaction, SignOptions, TransactionHash, TransactionIntent, TransferIntent, UnsignedTransaction } from "../types"
import type { TronRawTransaction, TronSignedTransaction } from "../tron/types"
import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js"
import { secp256k1 } from "@noble/curves/secp256k1.js"

// ==================== Effect Schema 定义 ====================

const BalanceResponseSchema = S.Struct({
  success: S.Boolean,
  result: S.optional(S.Union(S.String, S.Number)),
})
const BalanceRawSchema = S.Union(BalanceResponseSchema, S.String, S.Number)
type BalanceRaw = S.Schema.Type<typeof BalanceRawSchema>

const TronNativeTxSchema = S.Struct({
  txID: S.String,
  from: S.String,
  to: S.String,
  amount: S.Union(S.String, S.Number),
  timestamp: S.Number,
  contractRet: S.optional(S.String),
  blockNumber: S.optional(S.Union(S.String, S.Number)),
  fee: S.optional(S.Union(S.String, S.Number)),
})

const TronTrc20TxSchema = S.Struct({
  txID: S.String,
  from: S.String,
  to: S.String,
  value: S.Union(S.String, S.Number),
  timestamp: S.Number,
  tokenSymbol: S.optional(S.String),
  token_symbol: S.optional(S.String),
  tokenName: S.optional(S.String),
  token_name: S.optional(S.String),
  tokenDecimal: S.optional(S.Number),
  token_decimals: S.optional(S.Number),
  contractAddress: S.optional(S.String),
  token_address: S.optional(S.String),
  contractRet: S.optional(S.String),
})

const TxHistoryResponseSchema = S.Struct({
  success: S.Boolean,
  data: S.optional(S.Array(TronNativeTxSchema)),
  fingerprint: S.optional(S.String),
  pageSize: S.optional(S.Number),
})
type TxHistoryResponse = S.Schema.Type<typeof TxHistoryResponseSchema>

const Trc20HistoryResponseSchema = S.Struct({
  success: S.Boolean,
  data: S.optional(S.Array(TronTrc20TxSchema)),
  fingerprint: S.optional(S.String),
  pageSize: S.optional(S.Number),
})
type Trc20HistoryResponse = S.Schema.Type<typeof Trc20HistoryResponseSchema>

const BalanceV2ItemSchema = S.Struct({
  amount: S.Union(S.String, S.Number),
  contractAddress: S.optional(S.String),
  decimals: S.optional(S.Number),
  icon: S.optional(S.String),
  symbol: S.optional(S.String),
  name: S.optional(S.String),
})

const BalanceV2ResponseSchema = S.Array(BalanceV2ItemSchema)
const BalanceV2WrappedSchema = S.Struct({
  success: S.Boolean,
  result: S.optional(S.Array(BalanceV2ItemSchema)),
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
  result: TokenListResultSchema,
})
type TokenListResponse = S.Schema.Type<typeof TokenListResponseSchema>

const PendingTxItemSchema = S.Struct({
  from: S.String,
  to: S.String,
  state: S.optional(S.Union(S.String, S.Number)),
  createdTime: S.Union(S.String, S.Number),
  txHash: S.String,
  value: S.Union(S.String, S.Number),
  assetSymbol: S.optional(S.String),
  fee: S.optional(S.Union(S.String, S.Number)),
  extra: S.optional(S.Unknown),
})
type PendingTxItem = S.Schema.Type<typeof PendingTxItemSchema>

const PendingTxResponseSchema = S.Array(PendingTxItemSchema)
type PendingTxResponse = S.Schema.Type<typeof PendingTxResponseSchema>

const ReceiptResponseSchema = S.Unknown
type ReceiptResponse = S.Schema.Type<typeof ReceiptResponseSchema>

// ==================== 工具函数 ====================

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null
}

function toRawString(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return "0"
  return String(value)
}

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

function mapPendingStatus(state: PendingTxItem["state"]): "pending" | "confirmed" | "failed" {
  if (typeof state === "string") {
    const lowered = state.toLowerCase()
    if (lowered.includes("success") || lowered.includes("confirm")) return "confirmed"
    if (lowered.includes("fail")) return "failed"
    return "pending"
  }
  if (typeof state === "number") {
    if (state >= 2) return "confirmed"
    return "pending"
  }
  return "pending"
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

function isConfirmedReceipt(raw: ReceiptResponse): boolean {
  if (!isRecord(raw)) return false
  return Object.keys(raw).length > 0
}

function canCacheSuccess(result: { success: boolean }): Promise<boolean> {
  return Promise.resolve(result.success)
}

function canCacheBalance(result: BalanceRaw): Promise<boolean> {
  if (typeof result === "string" || typeof result === "number") return Promise.resolve(true)
  return Promise.resolve(result.success)
}

function normalizeBalance(raw: BalanceRaw): { success: boolean; amount: string } {
  if (typeof raw === "string" || typeof raw === "number") {
    return { success: true, amount: toRawString(raw) }
  }
  return { success: raw.success, amount: toRawString(raw.result) }
}

function canCacheBalanceV2(result: BalanceV2Raw): Promise<boolean> {
  if (Array.isArray(result)) return Promise.resolve(true)
  return Promise.resolve(result.success)
}

function normalizeBalanceV2(raw: BalanceV2Raw): BalanceV2Response {
  if (Array.isArray(raw)) return raw
  return raw.result ?? []
}

function logApiFailure(name: string, payload: { success: boolean; error?: unknown }): void {
  if (payload.success) return
  if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
    console.warn(`[tronwallet] ${name} success=false`, payload.error ?? payload)
  }
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

function normalizeTokenContracts(result: TokenListResponse): string[] {
  if (!result.success) return []
  return result.result.data
    .map((item) => item.address)
    .filter((address) => address.length > 0)
    .map((address) => normalizeTronAddress(address))
    .sort()
}

type TronWalletBroadcastDetail = {
  from: string
  to: string
  amount: string
  fee: string
  assetSymbol: string
}

type TronWalletUnsignedPayload = {
  rawTx: TronRawTransaction
  detail: TronWalletBroadcastDetail
  isToken: boolean
}

type TronWalletSignedPayload = {
  signedTx: TronSignedTransaction
  detail: TronWalletBroadcastDetail
  isToken: boolean
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

function estimateTronFee(rawTxHex: string, isToken: boolean): string {
  const rawLength = Math.max(rawTxHex.length, 0)
  const bandwidth = BigInt(Math.floor(rawLength / 2) + 68)
  const bandwidthFee = bandwidth * 1000n // 1 bandwidth = 0.001 TRX = 1000 sun
  const tokenExtra = isToken ? 10_000_000n : 0n // TRC20 预估额外能量消耗
  return (bandwidthFee + tokenExtra).toString()
}

// ==================== Provider 实现 ====================

export class TronWalletProviderEffect extends TronIdentityMixin(TronTransactionMixin(TronWalletBase)) implements ApiProvider {
  private readonly symbol: string
  private readonly decimals: number
  private readonly baseUrl: string
  private readonly pollingInterval: number = 30000
  private readonly tokenListCacheTtl: number = 10 * 60 * 1000

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

  // pendingTx 轮询去重 TTL = pollingInterval / 4
  private get pendingTxCacheTtl(): number {
    return Math.max(1000, Math.floor(this.pollingInterval / 4))
  }

  readonly nativeBalance: StreamInstance<AddressParams, BalanceOutput>
  readonly tokenBalances: StreamInstance<AddressParams, TokenBalancesOutput>
  readonly transactionHistory: StreamInstance<TxHistoryParams, TransactionsOutput>
  readonly transaction: StreamInstance<TransactionParams, TransactionOutput>

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

    this.tokenBalances = createStreamInstanceFromSource<AddressParams, TokenBalancesOutput>(
      `tronwallet.${chainId}.tokenBalances`,
      (params) => provider.createTokenBalancesSource(params)
    )

    this.transaction = createStreamInstanceFromSource<TransactionParams, TransactionOutput>(
      `tronwallet.${chainId}.transaction`,
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

  private createTokenBalancesSource(
    params: AddressParams
  ): Effect.Effect<DataSource<TokenBalancesOutput>> {
    return this.getSharedTokenBalanceSource(params.address)
  }

  private createTransactionSource(
    params: TransactionParams
  ): Effect.Effect<DataSource<TransactionOutput>> {
    const provider = this
    const symbol = this.symbol
    const decimals = this.decimals

    return Effect.gen(function* () {
      const fetchEffect = Effect.gen(function* () {
        const [receipt, pending] = yield* Effect.all([
          provider.fetchTransactionReceipt(params.txHash),
          params.senderId ? provider.fetchPendingTransactions(params.senderId) : Effect.succeed([] as PendingTxResponse),
        ])

        const pendingTx = pending.find((item) => item.txHash === params.txHash)
        const confirmed = isConfirmedReceipt(receipt)

        if (pendingTx) {
          const from = normalizeTronAddress(pendingTx.from)
          const to = normalizeTronAddress(pendingTx.to)
          return {
            hash: pendingTx.txHash,
            from,
            to,
            timestamp: Number(pendingTx.createdTime) || Date.now(),
            status: confirmed ? "confirmed" : mapPendingStatus(pendingTx.state),
            action: "transfer" as const,
            direction: getDirection(pendingTx.from, pendingTx.to, params.senderId ?? from),
            assets: [{
              assetType: "native" as const,
              value: toRawString(pendingTx.value),
              symbol,
              decimals,
            }],
          }
        }

        if (confirmed) {
          const from = params.senderId ? normalizeTronAddress(params.senderId) : ""
          return {
            hash: params.txHash,
            from,
            to: "",
            timestamp: Date.now(),
            status: "confirmed",
            action: "transfer" as const,
            direction: from ? "out" : "in",
            assets: [{
              assetType: "native" as const,
              value: "0",
              symbol,
              decimals,
            }],
          }
        }

        return null
      })

      const source = yield* createPollingSource({
        name: `tronwallet.${provider.chainId}.transaction`,
        fetch: fetchEffect,
        interval: Duration.millis(3000),
      })

      return source
    })
  }

  // ==================== Transaction Service (override) ====================

  async buildTransaction(intent: TransactionIntent): Promise<UnsignedTransaction> {
    if (intent.type !== "transfer") {
      throw new ChainServiceError(
        ChainErrorCodes.NOT_SUPPORTED,
        `Transaction type not supported: ${intent.type}`
      )
    }

    const transferIntent = intent as TransferIntent
    const fromHex = tronAddressToHex(transferIntent.from)
    const toHex = tronAddressToHex(transferIntent.to)
    const hasCustomFee = Boolean(transferIntent.fee)
    const feeRaw = transferIntent.fee?.raw ?? "0"
    const tokenAddress = transferIntent.tokenAddress?.trim()
    const isToken = Boolean(tokenAddress)
    let assetSymbol = this.symbol
    if (tokenAddress) {
      try {
        assetSymbol = await this.resolveTokenSymbol(tokenAddress)
      } catch (error) {
        console.warn("[tronwallet] resolveTokenSymbol failed", error)
        assetSymbol = tokenAddress
      }
    }

    if (isToken && tokenAddress) {
      const contractHex = tronAddressToHex(tokenAddress)
      const feeLimit = hasCustomFee && Number.isFinite(Number(feeRaw))
        ? Number(feeRaw)
        : 100_000_000
      const raw = await Effect.runPromise(
        httpFetch({
          url: `${this.baseUrl}/trans/contract`,
          method: "POST",
          body: {
            owner_address: fromHex,
            contract_address: contractHex,
            function_selector: "transfer(address,uint256)",
            input: [
              { type: "address", value: toHex },
              { type: "uint256", value: transferIntent.amount.toRawString() },
            ],
            fee_limit: feeLimit,
            call_value: 0,
          },
        })
      )

      const rawTx = this.extractTrc20Transaction(raw)
      const estimatedFeeRaw = hasCustomFee
        ? feeRaw
        : estimateTronFee(rawTx.raw_data_hex ?? "", true)
      const detail: TronWalletBroadcastDetail = {
        from: fromHex,
        to: toHex,
        amount: transferIntent.amount.raw,
        fee: estimatedFeeRaw,
        assetSymbol,
      }

      return {
        chainId: this.chainId,
        intentType: "transfer",
        data: {
          rawTx,
          detail,
          isToken: true,
        } satisfies TronWalletUnsignedPayload,
      }
    }

    const rawTx = await Effect.runPromise(
      httpFetch({
        url: `${this.baseUrl}/trans/create`,
        method: "POST",
        body: {
          owner_address: fromHex,
          to_address: toHex,
          amount: Number(transferIntent.amount.raw),
          extra_data: transferIntent.memo,
        },
      })
    )

    const estimatedFeeRaw = hasCustomFee
      ? feeRaw
      : estimateTronFee(rawTx.raw_data_hex ?? "", false)
    const detail: TronWalletBroadcastDetail = {
      from: fromHex,
      to: toHex,
      amount: transferIntent.amount.raw,
      fee: estimatedFeeRaw,
      assetSymbol,
    }

    return {
      chainId: this.chainId,
      intentType: "transfer",
      data: {
        rawTx: rawTx as TronRawTransaction,
        detail,
        isToken: false,
      } satisfies TronWalletUnsignedPayload,
    }
  }

  async signTransaction(unsignedTx: UnsignedTransaction, options: SignOptions): Promise<SignedTransaction> {
    if (!options.privateKey) {
      throw new ChainServiceError(
        ChainErrorCodes.SIGNATURE_FAILED,
        "privateKey is required for Tron signing"
      )
    }

    const payload = unsignedTx.data as TronWalletUnsignedPayload
    const txIdBytes = hexToBytes(payload.rawTx.txID)
    const sigBytes = secp256k1.sign(txIdBytes, options.privateKey, { prehash: false, format: "recovered" })
    const signature = bytesToHex(sigBytes)
    const signedTx: TronSignedTransaction = {
      ...payload.rawTx,
      signature: [signature],
    }

    return {
      chainId: unsignedTx.chainId,
      data: {
        signedTx,
        detail: payload.detail,
        isToken: payload.isToken,
      } satisfies TronWalletSignedPayload,
      signature,
    }
  }

  async broadcastTransaction(signedTx: SignedTransaction): Promise<TransactionHash> {
    const payload = signedTx.data as TronWalletSignedPayload
    const url = payload.isToken ? `${this.baseUrl}/trans/trc20/broadcast` : `${this.baseUrl}/trans/broadcast`

    const result = await Effect.runPromise(
      httpFetch({
        url,
        method: "POST",
        body: {
          ...payload.signedTx,
          detail: payload.detail,
        },
      })
    )

    const response = result as { result?: boolean; txid?: string }
    if (!response.result) {
      throw new ChainServiceError(ChainErrorCodes.TX_BROADCAST_FAILED, "Broadcast failed")
    }
    return payload.signedTx.txID
  }

  // ==================== 共享 Source 管理 ====================

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

          const nativeSource = yield* createPollingSource({
            name: `tronwallet.${provider.chainId}.txHistory.native.${cacheKey}`,
            fetch: provider.fetchNativeHistory({ address: eventAddress, limit: 50 }, true),
            interval: Duration.millis(provider.pollingInterval),
            walletEvents: {
              eventBus,
              chainId: provider.chainId,
              address: eventAddress,
              types: ["tx:confirmed", "tx:sent"],
            },
          })

          const tokenListSource = yield* provider.getSharedTokenListSource()

          const mergeSignal = yield* SubscriptionRef.make(0)

          const bump = SubscriptionRef.update(mergeSignal, (value) => value + 1).pipe(Effect.asVoid)
          const trc20HistoryCache = yield* SubscriptionRef.make<Map<string, Trc20HistoryResponse | null>>(
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

          const trc20Sources = new Map<string, DataSource<Trc20HistoryResponse>>()
          const trc20Fibers = new Map<string, Fiber.RuntimeFiber<void, never>>()

          const attachContract = (contract: string) =>
            Effect.gen(function* () {
              if (trc20Sources.has(contract)) return
              const source = yield* createPollingSource({
                name: `tronwallet.${provider.chainId}.txHistory.trc20.${cacheKey}.${contract}`,
                fetch: provider.fetchTrc20History({ address: eventAddress, limit: 50, contractAddress: contract }, true),
                interval: Duration.millis(provider.pollingInterval),
                immediate: false,
                walletEvents: {
                  eventBus,
                  chainId: provider.chainId,
                  address: eventAddress,
                  types: ["tx:confirmed", "tx:sent"],
                },
              })
              trc20Sources.set(contract, source)
              const fiber = yield* Effect.forkDaemon(
                source.changes.pipe(
                  Stream.runForEach((value) =>
                    SubscriptionRef.update(trc20HistoryCache, (map) => {
                      const next = new Map(map)
                      next.set(contract, value)
                      return next
                    }).pipe(
                      Effect.zipRight(bump)
                    )
                  )
                )
              )
              trc20Fibers.set(contract, fiber)
              yield* Effect.forkDaemon(source.refresh.pipe(Effect.asVoid))
            })

          const detachContract = (contract: string) =>
            Effect.gen(function* () {
              const source = trc20Sources.get(contract)
              if (source) {
                yield* source.stop
                trc20Sources.delete(contract)
              }
              const fiber = trc20Fibers.get(contract)
              if (fiber) {
                yield* Fiber.interrupt(fiber)
                trc20Fibers.delete(contract)
              }
              yield* SubscriptionRef.update(trc20HistoryCache, (map) => {
                const next = new Map(map)
                next.delete(contract)
                return next
              }).pipe(Effect.zipRight(bump))
            })

          const syncContracts = (tokenList: TokenListResponse | null) =>
            Effect.gen(function* () {
              const nextContracts = tokenList ? normalizeTokenContracts(tokenList) : []
              const nextSet = new Set(nextContracts)
              for (const contract of trc20Sources.keys()) {
                if (!nextSet.has(contract)) {
                  yield* detachContract(contract)
                }
              }
              for (const contract of nextSet) {
                if (!trc20Sources.has(contract)) {
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
            name: `tronwallet.${provider.chainId}.txHistory.${cacheKey}`,
            dependsOn: mergeSignal,
            hasChanged: (prev, next) => prev !== next,
            fetch: () =>
              Effect.gen(function* () {
                const native = yield* nativeSource.get
                const nativeTxs = (native?.data ?? []).map((tx): Transaction => {
                  const from = normalizeTronAddress(tx.from)
                  const to = normalizeTronAddress(tx.to)
                  const status = tx.contractRet === "SUCCESS" ? "confirmed" : "failed"
                  return {
                    hash: tx.txID,
                    from,
                    to,
                    timestamp: tx.timestamp,
                    status,
                    blockNumber: tx.blockNumber ? BigInt(String(tx.blockNumber)) : undefined,
                    action: "transfer" as const,
                    direction: getDirection(tx.from, tx.to, eventAddress),
                    assets: [{
                      assetType: "native" as const,
                      value: toRawString(tx.amount),
                      symbol,
                      decimals,
                    }],
                    fee: tx.fee !== undefined
                      ? { value: toRawString(tx.fee), symbol, decimals }
                      : undefined,
                  }
                })

                const trc20Values = [...(yield* SubscriptionRef.get(trc20HistoryCache)).values()]
                const tokenTxs = trc20Values.flatMap((raw) =>
                  (raw?.data ?? []).map((tx): Transaction => {
                    const from = normalizeTronAddress(tx.from)
                    const to = normalizeTronAddress(tx.to)
                    const status = tx.contractRet
                      ? (tx.contractRet === "SUCCESS" ? "confirmed" : "failed")
                      : "confirmed"
                    const tokenSymbol = tx.tokenSymbol ?? tx.token_symbol ?? "TRC20"
                    const tokenDecimals = tx.tokenDecimal ?? tx.token_decimals ?? 0
                    const contractAddressRaw = tx.contractAddress ?? tx.token_address
                    const contractAddress = contractAddressRaw
                      ? normalizeTronAddress(contractAddressRaw)
                      : ""
                    return {
                      hash: tx.txID,
                      from,
                      to,
                      timestamp: tx.timestamp,
                      status,
                      action: "transfer" as const,
                      direction: getDirection(tx.from, tx.to, eventAddress),
                      assets: [{
                        assetType: "token" as const,
                        value: toRawString(tx.value),
                        symbol: tokenSymbol,
                        decimals: tokenDecimals,
                        contractAddress,
                        name: tx.tokenName ?? tx.token_name,
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
            for (const source of trc20Sources.values()) {
              yield* source.stop
            }
            for (const fiber of trc20Fibers.values()) {
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
            name: `tronwallet.${provider.chainId}.balance`,
            dependsOn: txHistorySource.ref,
            hasChanged: hasTransactionListChanged,
            fetch: (_dep, forceRefresh) =>
              provider.fetchBalance(address, forceRefresh).pipe(
                Effect.map((raw): BalanceOutput => {
                  const balance = normalizeBalance(raw)
                  return {
                    amount: Amount.fromRaw(balance.amount, decimals, symbol),
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

  private getSharedTokenBalanceSource(address: string): Effect.Effect<DataSource<TokenBalancesOutput>> {
    const provider = this
    const cacheKey = normalizeTronHex(address)
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
          const txHistorySource = yield* provider.getSharedTxHistorySource(address)

          const source = yield* createDependentSource({
            name: `tronwallet.${provider.chainId}.tokenBalances`,
            dependsOn: txHistorySource.ref,
            hasChanged: hasTransactionListChanged,
            fetch: (dep, forceRefresh) =>
              provider.fetchTokenBalances(address, getContractAddressesFromHistory(dep), forceRefresh).pipe(
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
                    const tokenSymbol = item.symbol ?? "TRC20"
                    const tokenDecimals = item.decimals ?? 0
                    const contractAddress = item.contractAddress
                      ? normalizeTronAddress(item.contractAddress)
                      : undefined
                    list.push({
                      symbol: tokenSymbol,
                      name: item.name ?? tokenSymbol,
                      amount: Amount.fromRaw(toRawString(item.amount), tokenDecimals, tokenSymbol),
                      isNative: false,
                      decimals: tokenDecimals,
                      icon: item.icon,
                      contractAddress,
                    })
                  }

                  return list
                })
              ),
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
            name: `tronwallet.${provider.chainId}.tokenList`,
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

  // ==================== HTTP Fetch Effects ====================

  private fetchBalance(address: string, forceRefresh = false): Effect.Effect<BalanceRaw, FetchError> {
    return httpFetchCached({
      url: `${this.baseUrl}/balance`,
      method: "GET",
      searchParams: { address: tronAddressToHex(address) },
      schema: BalanceRawSchema,
      cacheStrategy: forceRefresh ? "network-first" : "cache-first",
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
    return httpFetchCached({
      url: `${this.baseUrl}/trans/common/history`,
      method: "POST",
      body: {
        address: tronAddressToHex(params.address),
        limit: params.limit ?? 50,
      },
      schema: TxHistoryResponseSchema,
      cacheStrategy: forceRefresh ? "network-first" : "cache-first",
      canCache: canCacheSuccess,
    }).pipe(
      Effect.tap((raw) => logApiFailure("trans/common/history", raw))
    )
  }

  private fetchTrc20History(
    params: TxHistoryParams,
    forceRefresh = false
  ): Effect.Effect<Trc20HistoryResponse, FetchError> {
    if (!params.contractAddress) {
      return Effect.succeed({ success: true, data: [], fingerprint: "", pageSize: 0 })
    }

    return httpFetchCached({
      url: `${this.baseUrl}/trans/trc20/history`,
      method: "POST",
      body: {
        address: tronAddressToHex(params.address),
        limit: params.limit ?? 50,
        contract_address: normalizeTronAddress(params.contractAddress),
      },
      schema: Trc20HistoryResponseSchema,
      cacheStrategy: forceRefresh ? "network-first" : "cache-first",
      canCache: canCacheSuccess,
    }).pipe(
      Effect.tap((raw) => logApiFailure("trans/trc20/history", raw))
    )
  }

  private fetchTransactions(
    params: TxHistoryParams,
    forceRefresh = false
  ): Effect.Effect<{ native: TxHistoryResponse; trc20: Trc20HistoryResponse }, FetchError> {
    return Effect.all({
      native: this.fetchNativeHistory(params, forceRefresh),
      trc20: this.fetchTrc20History(params, forceRefresh).pipe(
        Effect.catchAll(() =>
          Effect.succeed({
            success: false,
            data: [],
          } as Trc20HistoryResponse)
        )
      ),
    })
  }

  private fetchTokenBalances(
    address: string,
    contracts: string[],
    forceRefresh = false
  ): Effect.Effect<{ native: BalanceRaw; tokens: BalanceV2Response }, FetchError> {
    const normalizedAddress = normalizeTronAddress(address)
    const sortedContracts = [...contracts].sort()

    if (sortedContracts.length === 0) {
      const provider = this
      return Effect.gen(function* () {
        const tokenList = yield* provider.fetchTokenList(false)
        const nextContracts = normalizeTokenContracts(tokenList)
        const native = yield* provider.fetchBalance(address, forceRefresh)
        if (nextContracts.length === 0) {
          return {
            native,
            tokens: [],
          }
        }
        const tokens = yield* httpFetchCached({
          url: `${provider.baseUrl}/account/balance/v2`,
          method: "POST",
          body: { address: normalizedAddress, contracts: nextContracts },
          schema: BalanceV2RawSchema,
          cacheStrategy: forceRefresh ? "network-first" : "cache-first",
          canCache: canCacheBalanceV2,
        }).pipe(
          Effect.tap((raw) => {
            if (!Array.isArray(raw)) logApiFailure("account/balance/v2", raw)
          }),
          Effect.map(normalizeBalanceV2),
          Effect.catchAll(() => Effect.succeed([] as BalanceV2Response))
        )
        return {
          native,
          tokens,
        }
      })
    }

    return Effect.all({
      native: this.fetchBalance(address, forceRefresh),
      tokens: httpFetchCached({
        url: `${this.baseUrl}/account/balance/v2`,
        method: "POST",
        body: { address: normalizedAddress, contracts: sortedContracts },
        schema: BalanceV2RawSchema,
        cacheStrategy: forceRefresh ? "network-first" : "cache-first",
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
        chain: "TRON",
      },
      schema: TokenListResponseSchema,
      cacheStrategy: forceRefresh ? "network-first" : "ttl",
      cacheTtl: this.tokenListCacheTtl,
      canCache: canCacheSuccess,
    }).pipe(
      Effect.tap((raw) => logApiFailure("contract/tokens", raw))
    )
  }

  private async resolveTokenSymbol(contractAddress: string): Promise<string> {
    const trimmed = contractAddress.trim()
    if (!trimmed) return contractAddress
    const hex = normalizeTronHex(trimmed)
    const response = await Effect.runPromise(this.fetchTokenList(false))
    const match = response.result.data.find((item) => item.address && normalizeTronHex(item.address) === hex)
    return match?.symbol ?? contractAddress
  }

  private extractTrc20Transaction(raw: unknown): TronRawTransaction {
    if (raw && typeof raw === "object") {
      const record = raw as Record<string, unknown>
      if ("success" in record && record.success === false) {
        throw new ChainServiceError(ChainErrorCodes.TX_BUILD_FAILED, "TRC20 transaction build failed")
      }
      const transaction = record["transaction"]
      if (transaction && typeof transaction === "object" && "txID" in transaction) {
        return transaction as TronRawTransaction
      }
      const result = record["result"]
      if (result && typeof result === "object") {
        const nested = (result as Record<string, unknown>)["transaction"]
        if (nested && typeof nested === "object" && "txID" in nested) {
          return nested as TronRawTransaction
        }
      }
      if ("txID" in record) {
        return record as TronRawTransaction
      }
    }
    throw new ChainServiceError(ChainErrorCodes.TX_BUILD_FAILED, "Invalid TRC20 transaction response")
  }

  private fetchPendingTransactions(address: string): Effect.Effect<PendingTxResponse, FetchError> {
    return httpFetchCached({
      url: `${this.baseUrl}/trans/pending`,
      method: "POST",
      body: {
        address: tronAddressToHex(address),
        assetSymbol: this.symbol,
      },
      schema: PendingTxResponseSchema,
      cacheStrategy: "ttl",
      cacheTtl: this.pendingTxCacheTtl,
    })
  }

  private fetchTransactionReceipt(txHash: string): Effect.Effect<ReceiptResponse, FetchError> {
    return httpFetchCached({
      url: `${this.baseUrl}/trans/receipt`,
      method: "POST",
      body: { txId: txHash },
      schema: ReceiptResponseSchema,
      cacheStrategy: "ttl",
      cacheTtl: this.pendingTxCacheTtl,
    })
  }
}

export function createTronwalletProviderEffect(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type === "tronwallet-v1") {
    return new TronWalletProviderEffect(entry, chainId)
  }
  return null
}
