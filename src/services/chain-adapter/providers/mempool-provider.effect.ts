/**
 * Mempool.space API Provider - Effect TS Version (深度重构)
 *
 * 使用 Effect 原生 Source API 实现响应式数据获取
 * - blockHeight: 定时轮询
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
  type FetchError,
  type DataSource,
  type EventBusService,
} from "@biochain/chain-effect"
import type { StreamInstance } from "@biochain/chain-effect"
import { getWalletEventBus } from "@/services/chain-adapter/wallet-event-bus"
import type { ApiProvider, Direction, BalanceOutput, BlockHeightOutput, TransactionsOutput, AddressParams, TxHistoryParams } from "./types"
import type { ParsedApiEntry } from "@/services/chain-config"
import { chainConfigService } from "@/services/chain-config"
import { Amount } from "@/types/amount"
import { BitcoinIdentityMixin } from "../bitcoin/identity-mixin"
import { BitcoinTransactionMixin } from "../bitcoin/transaction-mixin"

// ==================== Effect Schema 定义 ====================

const AddressInfoSchema = S.Struct({
  chain_stats: S.Struct({
    funded_txo_sum: S.Number,
    spent_txo_sum: S.Number,
  }),
})

const TxSchema = S.Struct({
  txid: S.String,
  vin: S.Array(S.Struct({
    prevout: S.optional(S.Struct({
      scriptpubkey_address: S.optional(S.String),
    })),
  })),
  vout: S.Array(S.Struct({
    scriptpubkey_address: S.optional(S.String),
    value: S.optional(S.Number),
  })),
  status: S.Struct({
    confirmed: S.Boolean,
    block_time: S.optional(S.Number),
  }),
})

const TxListSchema = S.Array(TxSchema)

type AddressInfo = S.Schema.Type<typeof AddressInfoSchema>
type Tx = S.Schema.Type<typeof TxSchema>
type TxList = S.Schema.Type<typeof TxListSchema>

// ==================== 工具函数 ====================

function getDirection(vin: Tx["vin"], vout: Tx["vout"], address: string): Direction {
  const isFrom = vin?.some((v) => v.prevout?.scriptpubkey_address === address)
  const isTo = vout?.some((v) => v.scriptpubkey_address === address)
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

class MempoolBase {
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

export class MempoolProviderEffect extends BitcoinIdentityMixin(BitcoinTransactionMixin(MempoolBase)) implements ApiProvider {
  private readonly symbol: string
  private readonly decimals: number
  private readonly baseUrl: string
  private readonly pollingInterval: number = 60000

  private _eventBus: EventBusService | null = null

  readonly nativeBalance: StreamInstance<AddressParams, BalanceOutput>
  readonly transactionHistory: StreamInstance<TxHistoryParams, TransactionsOutput>
  readonly blockHeight: StreamInstance<unknown, BlockHeightOutput>

  constructor(entry: ParsedApiEntry, chainId: string) {
    super(entry, chainId)
    this.symbol = chainConfigService.getSymbol(chainId)
    this.decimals = chainConfigService.getDecimals(chainId)
    this.baseUrl = this.endpoint

    const provider = this

    // blockHeight: 定时轮询
    this.blockHeight = createStreamInstanceFromSource<unknown, BlockHeightOutput>(
      `mempool.${chainId}.blockHeight`,
      () => provider.createBlockHeightSource()
    )

    // transactionHistory: 定时轮询 + 事件触发
    this.transactionHistory = createStreamInstanceFromSource<TxHistoryParams, TransactionsOutput>(
      `mempool.${chainId}.transactionHistory`,
      (params) => provider.createTransactionHistorySource(params)
    )

    // nativeBalance: 依赖 transactionHistory 变化
    this.nativeBalance = createStreamInstanceFromSource<AddressParams, BalanceOutput>(
      `mempool.${chainId}.nativeBalance`,
      (params) => provider.createBalanceSource(params)
    )
  }

  // ==================== Source 创建方法 ====================

  private createBlockHeightSource(): Effect.Effect<DataSource<BlockHeightOutput>> {
    const provider = this

    return Effect.gen(function* () {
      const fetchEffect = provider.fetchBlockHeight().pipe(
        Effect.map((height): BlockHeightOutput => BigInt(height))
      )

      const source = yield* createPollingSource({
        name: `mempool.${provider.chainId}.blockHeight`,
        fetch: fetchEffect,
        interval: Duration.millis(provider.pollingInterval),
      })

      return source
    })
  }

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
        provider._eventBus = yield* getWalletEventBus()
      }
      const eventBus = provider._eventBus

      const fetchEffect = provider.fetchTransactionHistory(params.address).pipe(
        Effect.map((txList): TransactionsOutput =>
          txList.map((tx) => ({
            hash: tx.txid,
            from: tx.vin[0]?.prevout?.scriptpubkey_address ?? "",
            to: tx.vout[0]?.scriptpubkey_address ?? "",
            timestamp: (tx.status.block_time ?? 0) * 1000,
            status: tx.status.confirmed ? ("confirmed" as const) : ("pending" as const),
            action: "transfer" as const,
            direction: getDirection(tx.vin, tx.vout, address),
            assets: [{
              assetType: "native" as const,
              value: (tx.vout[0]?.value ?? 0).toString(),
              symbol,
              decimals,
            }],
          }))
        )
      )

      const source = yield* createPollingSource({
        name: `mempool.${provider.chainId}.txHistory`,
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
        Effect.map((info): BalanceOutput => {
          const balance = info.chain_stats.funded_txo_sum - info.chain_stats.spent_txo_sum
          return { amount: Amount.fromRaw(balance.toString(), decimals, symbol), symbol }
        })
      )

      const source = yield* createDependentSource({
        name: `mempool.${provider.chainId}.balance`,
        dependsOn: txHistorySource.ref,
        hasChanged: hasTransactionListChanged,
        fetch: () => fetchEffect,
      })

      return source
    })
  }

  // ==================== HTTP Fetch Effects ====================

  private fetchBlockHeight(): Effect.Effect<number, FetchError> {
    return httpFetch({
      url: `${this.baseUrl}/blocks/tip/height`,
    })
  }

  private fetchAddressInfo(address: string): Effect.Effect<AddressInfo, FetchError> {
    return httpFetch({
      url: `${this.baseUrl}/address/${address}`,
      schema: AddressInfoSchema,
    })
  }

  private fetchTransactionHistory(address: string): Effect.Effect<TxList, FetchError> {
    return httpFetch({
      url: `${this.baseUrl}/address/${address}/txs`,
      schema: TxListSchema,
    })
  }
}

export function createMempoolProviderEffect(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type.startsWith("mempool-")) return new MempoolProviderEffect(entry, chainId)
  return null
}
