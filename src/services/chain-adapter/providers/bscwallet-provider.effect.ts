/**
 * BscWallet API Provider - Effect TS Version (深度重构)
 * 
 * 使用 Effect 原生 Source API 实现响应式数据获取
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

const BalanceApiSchema = S.Struct({
  balance: S.String,
})
type BalanceApi = S.Schema.Type<typeof BalanceApiSchema>

const TxItemSchema = S.Struct({
  hash: S.String,
  from: S.String,
  to: S.String,
  value: S.String,
  timestamp: S.Number,
  status: S.optional(S.String),
})

const TxApiSchema = S.Struct({
  transactions: S.Array(TxItemSchema),
})
type TxApi = S.Schema.Type<typeof TxApiSchema>

// ==================== 工具函数 ====================

function getDirection(from: string, to: string, address: string): Direction {
  const f = from.toLowerCase()
  const t = to.toLowerCase()
  if (f === address && t === address) return "self"
  return f === address ? "out" : "in"
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

  private _eventBus: EventBusService | null = null

  readonly nativeBalance: StreamInstance<AddressParams, BalanceOutput>
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
  }

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

      const fetchEffect = provider.fetchTransactions(params).pipe(
        Effect.map((raw): TransactionsOutput =>
          raw.transactions.map((tx): Transaction => ({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            timestamp: tx.timestamp,
            status: tx.status === "success" ? "confirmed" : "failed",
            action: "transfer" as const,
            direction: getDirection(tx.from, tx.to, address),
            assets: [{
              assetType: "native" as const,
              value: tx.value,
              symbol,
              decimals,
            }],
          }))
        )
      )

      const source = yield* createPollingSource({
        name: `bscwallet.${provider.chainId}.txHistory`,
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
          amount: Amount.fromRaw(raw.balance, decimals, symbol),
          symbol,
        }))
      )

      const source = yield* createDependentSource({
        name: `bscwallet.${provider.chainId}.balance`,
        dependsOn: txHistorySource.ref,
        hasChanged: hasTransactionListChanged,
        fetch: () => fetchEffect,
      })

      return source
    })
  }

  private fetchBalance(address: string): Effect.Effect<BalanceApi, FetchError> {
    return httpFetch({
      url: `${this.baseUrl}/balance?address=${address}`,
      schema: BalanceApiSchema,
    })
  }

  private fetchTransactions(params: TxHistoryParams): Effect.Effect<TxApi, FetchError> {
    return httpFetch({
      url: `${this.baseUrl}/transactions?address=${params.address}&limit=${params.limit ?? 20}`,
      schema: TxApiSchema,
    })
  }
}

export function createBscWalletProviderEffect(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type === "bscwallet-v1") {
    return new BscWalletProviderEffect(entry, chainId)
  }
  return null
}
