/**
 * BtcWallet API Provider (Blockbook) - Effect TS Version (深度重构)
 *
 * 使用 Effect 原生 Source API 实现响应式数据获取
 * - transactionHistory: 定时轮询 + 事件触发
 * - nativeBalance: 依赖 transactionHistory 变化
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
import type { ApiProvider, Direction, BalanceOutput, TransactionsOutput, AddressParams, TxHistoryParams } from "./types"
import type { ParsedApiEntry } from "@/services/chain-config"
import { chainConfigService } from "@/services/chain-config"
import { Amount } from "@/types/amount"
import { BitcoinIdentityMixin } from "../bitcoin/identity-mixin"
import { BitcoinTransactionMixin } from "../bitcoin/transaction-mixin"

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

type AddressInfo = S.Schema.Type<typeof AddressInfoSchema>
type TxItem = S.Schema.Type<typeof TxItemSchema>

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
      `btcwallet.${chainId}.transactionHistory`,
      (params) => provider.createTransactionHistorySource(params)
    )

    // nativeBalance: 依赖 transactionHistory 变化
    this.nativeBalance = createStreamInstanceFromSource<AddressParams, BalanceOutput>(
      `btcwallet.${chainId}.nativeBalance`,
      (params) => provider.createBalanceSource(params)
    )
  }

  // ==================== Source 创建方法 ====================

  private createTransactionHistorySource(
    params: TxHistoryParams
  ): Effect.Effect<DataSource<TransactionsOutput>> {
    const provider = this
    const address = params.address
    const symbol = this.symbol
    const decimals = this.decimals
    const chainId = this.chainId

    return Effect.gen(function* () {
      if (!provider._eventBus) {
        provider._eventBus = yield* createEventBusService
      }
      const eventBus = provider._eventBus

      const fetchEffect = provider.fetchAddressInfo(params.address).pipe(
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
        name: `btcwallet.${provider.chainId}.txHistory`,
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

      const fetchEffect = provider.fetchAddressInfo(params.address).pipe(
        Effect.map((info): BalanceOutput => ({
          amount: Amount.fromRaw(info.balance, decimals, symbol),
          symbol,
        }))
      )

      const source = yield* createDependentSource({
        name: `btcwallet.${provider.chainId}.balance`,
        dependsOn: txHistorySource.ref,
        hasChanged: hasTransactionListChanged,
        fetch: () => fetchEffect,
      })

      return source
    })
  }

  // ==================== HTTP Fetch Effects ====================

  private fetchAddressInfo(address: string): Effect.Effect<AddressInfo, FetchError> {
    return httpFetch({
      url: `${this.baseUrl}/api/v2/address/${address}`,
      schema: AddressInfoSchema,
    })
  }
}

export function createBtcwalletProviderEffect(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type === "btcwallet-v1") return new BtcWalletProviderEffect(entry, chainId)
  return null
}
