/**
 * EthWallet API Provider - Effect TS Version (深度重构)
 * 
 * 使用 Effect 原生 Source API 实现响应式数据获取
 * - transactionHistory: 定时轮询 + 事件触发
 * - balance: 依赖 transactionHistory 变化
 */

import { Effect, Duration } from "effect"
import { Schema as S } from "effect"
import {
  httpFetch,
  createStreamInstanceFromSource,
  createPollingSource,
  createDependentSource,
  createEventBusService,
  type FetchError,
  type DataSource,
  type EventBusService,
} from "@biochain/chain-effect"
import type { StreamInstance } from "@biochain/chain-effect"
import type {
  ApiProvider,
  Transaction,
  Direction,
  Action,
  BalanceOutput,
  TransactionsOutput,
  AddressParams,
  TxHistoryParams,
} from "./types"
import type { ParsedApiEntry } from "@/services/chain-config"
import { chainConfigService } from "@/services/chain-config"
import { Amount } from "@/types/amount"
import { EvmIdentityMixin } from "../evm/identity-mixin"
import { EvmTransactionMixin } from "../evm/transaction-mixin"

// ==================== Effect Schema 定义 ====================

const BalanceResponseSchema = S.Struct({
  success: S.Boolean,
  result: S.Union(S.String, S.Number),
})
type BalanceResponse = S.Schema.Type<typeof BalanceResponseSchema>

const NativeTxSchema = S.Struct({
  blockNumber: S.String,
  timeStamp: S.String,
  hash: S.String,
  from: S.String,
  to: S.String,
  value: S.String,
  isError: S.optional(S.String),
  input: S.optional(S.String),
  methodId: S.optional(S.String),
  functionName: S.optional(S.String),
})
type NativeTx = S.Schema.Type<typeof NativeTxSchema>

const TxHistoryResponseSchema = S.Struct({
  success: S.Boolean,
  result: S.Struct({
    status: S.optional(S.String),
    result: S.Array(NativeTxSchema),
  }),
})
type TxHistoryResponse = S.Schema.Type<typeof TxHistoryResponseSchema>

// ==================== 工具函数 ====================

function getDirection(from: string, to: string, address: string): Direction {
  const fromLower = from.toLowerCase()
  const toLower = to.toLowerCase()
  if (fromLower === address && toLower === address) return "self"
  if (fromLower === address) return "out"
  return "in"
}

function detectAction(tx: NativeTx): Action {
  if (tx.value && tx.value !== "0") return "transfer"
  return "contract"
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

class EthWalletBase {
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

export class EthWalletProviderEffect extends EvmIdentityMixin(EvmTransactionMixin(EthWalletBase)) implements ApiProvider {
  private readonly symbol: string
  private readonly decimals: number
  private readonly baseUrl: string

  private readonly pollingInterval: number = 30000

  // Provider 级别共享的 EventBus
  private _eventBus: EventBusService | null = null

  readonly nativeBalance: StreamInstance<AddressParams, BalanceOutput>
  readonly transactionHistory: StreamInstance<TxHistoryParams, TransactionsOutput>

  constructor(entry: ParsedApiEntry, chainId: string) {
    super(entry, chainId)
    this.symbol = chainConfigService.getSymbol(chainId)
    this.decimals = chainConfigService.getDecimals(chainId)
    this.baseUrl = this.endpoint

    const provider = this

    // transactionHistory: 定时轮询 + 事件触发
    this.transactionHistory = createStreamInstanceFromSource<TxHistoryParams, TransactionsOutput>(
      `ethwallet.${chainId}.transactionHistory`,
      (params) => provider.createTransactionHistorySource(params)
    )

    // nativeBalance: 依赖 transactionHistory 变化
    this.nativeBalance = createStreamInstanceFromSource<AddressParams, BalanceOutput>(
      `ethwallet.${chainId}.nativeBalance`,
      (params) => provider.createBalanceSource(params)
    )
  }

  // ==================== Source 创建方法 ====================

  private createTransactionHistorySource(
    params: TxHistoryParams
  ): Effect.Effect<DataSource<TransactionsOutput>> {
    const provider = this
    const address = params.address.toLowerCase()
    const symbol = this.symbol
    const decimals = this.decimals
    const chainId = this.chainId

    return Effect.gen(function* () {
      if (!provider._eventBus) {
        provider._eventBus = yield* createEventBusService
      }
      const eventBus = provider._eventBus

      const fetchEffect = provider.fetchTransactionHistory(params).pipe(
        Effect.map((raw): TransactionsOutput => {
          if (!raw.result?.result) return []
          return raw.result.result.map((tx): Transaction => ({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            timestamp: parseInt(tx.timeStamp, 10) * 1000,
            status: tx.isError === "1" ? "failed" : "confirmed",
            blockNumber: BigInt(tx.blockNumber),
            action: detectAction(tx),
            direction: getDirection(tx.from, tx.to, address),
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
        name: `ethwallet.${provider.chainId}.txHistory`,
        fetch: fetchEffect,
        interval: Duration.millis(provider.pollingInterval),
        walletEvents: {
          eventBus,
          chainId,
          address: params.address,
          types: ["tx:confirmed", "tx:sent"],
        },
      })

      return source
    })
  }

  private createBalanceSource(
    params: AddressParams
  ): Effect.Effect<DataSource<BalanceOutput>> {
    const provider = this
    const symbol = this.symbol
    const decimals = this.decimals

    return Effect.gen(function* () {
      const txHistorySource = yield* provider.createTransactionHistorySource({
        address: params.address,
        limit: 1,
      })

      const fetchEffect = provider.fetchBalance(params.address).pipe(
        Effect.map((raw): BalanceOutput => ({
          amount: Amount.fromRaw(String(raw.result), decimals, symbol),
          symbol,
        }))
      )

      const source = yield* createDependentSource({
        name: `ethwallet.${provider.chainId}.balance`,
        dependsOn: txHistorySource.ref,
        hasChanged: hasTransactionListChanged,
        fetch: () => fetchEffect,
      })

      return source
    })
  }

  // ==================== HTTP Fetch Effects ====================

  private fetchBalance(address: string): Effect.Effect<BalanceResponse, FetchError> {
    return httpFetch({
      url: `${this.baseUrl}/balance`,
      method: "POST",
      body: { address },
      schema: BalanceResponseSchema,
    })
  }

  private fetchTransactionHistory(params: TxHistoryParams): Effect.Effect<TxHistoryResponse, FetchError> {
    return httpFetch({
      url: `${this.baseUrl}/trans/normal/history`,
      method: "POST",
      body: { address: params.address, limit: params.limit ?? 20 },
      schema: TxHistoryResponseSchema,
    })
  }
}

export function createEthwalletProviderEffect(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type === "ethwallet-v1") {
    return new EthWalletProviderEffect(entry, chainId)
  }
  return null
}
