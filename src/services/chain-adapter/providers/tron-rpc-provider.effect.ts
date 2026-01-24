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
import { chainConfigService } from "@/services/chain-config"
import { Amount } from "@/types/amount"
import { TronIdentityMixin } from "../tron/identity-mixin"
import { TronTransactionMixin } from "../tron/transaction-mixin"
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

function tronAddressToHex(address: string): string {
  if (address.startsWith("41") && address.length === 42) return address
  if (!address.startsWith("T")) throw new Error(`Invalid Tron address: ${address}`)
  const decoded = base58Decode(address)
  const addressBytes = decoded.slice(0, 21)
  return Array.from(addressBytes).map((b) => b.toString(16).padStart(2, "0")).join("")
}

function getDirection(from: string, to: string, address: string): Direction {
  const fromLower = from.toLowerCase()
  const toLower = to.toLowerCase()
  const addrLower = address.toLowerCase()
  if (fromLower === addrLower && toLower === addrLower) return "self"
  if (fromLower === addrLower) return "out"
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
    const provider = this

    return Effect.gen(function* () {
      const fetchEffect = provider.fetchNowBlock().pipe(
        Effect.map((raw): BlockHeightOutput =>
          BigInt(raw.block_header?.raw_data?.number ?? 0)
        )
      )

      const source = yield* createPollingSource({
        name: `tron-rpc.${provider.chainId}.blockHeight`,
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
    const address = params.address.toLowerCase()
    const symbol = this.symbol
    const decimals = this.decimals
    const chainId = this.chainId

    return Effect.gen(function* () {
      // 获取或创建 Provider 级别共享的 EventBus
      if (!provider._eventBus) {
        provider._eventBus = yield* getWalletEventBus()
      }
      const eventBus = provider._eventBus

      const fetchEffect = provider.fetchTransactionList(params.address).pipe(
        Effect.map((raw): TransactionsOutput => {
          if (!raw.success || !raw.data) return []

          return raw.data.map((tx): Transaction => {
            const contract = tx.raw_data?.contract?.[0]
            const value = contract?.parameter?.value
            const from = value?.owner_address ?? ""
            const to = value?.to_address ?? ""
            const status = tx.ret?.[0]?.contractRet === "SUCCESS" ? "confirmed" : "failed"

            return {
              hash: tx.txID,
              from,
              to,
              timestamp: tx.block_timestamp ?? tx.raw_data?.timestamp ?? 0,
              status: status as "confirmed" | "failed",
              action: "transfer" as const,
              direction: getDirection(from, to, address),
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
        name: `tron-rpc.${provider.chainId}.txHistory`,
        fetch: fetchEffect,
        interval: Duration.millis(provider.pollingInterval),
        // 使用 walletEvents 配置，按 chainId + address 过滤事件
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
      // 先创建 transactionHistory source 作为依赖
      const txHistorySource = yield* provider.createTransactionHistorySource({
        address: params.address,
        limit: 1,
      })

      const fetchEffect = provider.fetchAccount(params.address).pipe(
        Effect.map((raw): BalanceOutput => ({
          amount: Amount.fromRaw((raw.balance ?? 0).toString(), decimals, symbol),
          symbol,
        }))
      )

      // 依赖 transactionHistory 变化
      const source = yield* createDependentSource({
        name: `tron-rpc.${provider.chainId}.balance`,
        dependsOn: txHistorySource.ref,
        hasChanged: hasTransactionListChanged,
        fetch: () => fetchEffect,
      })

      return source
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
          const from = value?.owner_address ?? ""
          const to = value?.to_address ?? ""

          let status: "pending" | "confirmed" | "failed"
          if (!tx.ret || tx.ret.length === 0) {
            status = "pending"
          } else {
            status = tx.ret[0]?.contractRet === "SUCCESS" ? "confirmed" : "failed"
          }

          return {
            hash: tx.txID,
            from,
            to,
            timestamp: tx.block_timestamp ?? tx.raw_data?.timestamp ?? 0,
            status,
            action: "transfer" as const,
            direction: "out",
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

  private fetchNowBlock(): Effect.Effect<TronNowBlock, FetchError> {
    return httpFetch({
      url: `${this.baseUrl}/wallet/getnowblock`,
      method: "POST",
      headers: this.headers,
      schema: TronNowBlockSchema,
    })
  }

  private fetchAccount(address: string): Effect.Effect<TronAccount, FetchError> {
    return httpFetch({
      url: `${this.baseUrl}/wallet/getaccount`,
      method: "POST",
      headers: this.headers,
      body: { address: tronAddressToHex(address) },
      schema: TronAccountSchema,
    })
  }

  private fetchTransactionList(address: string): Effect.Effect<TronTxList, FetchError> {
    return httpFetch({
      url: `${this.baseUrl}/v1/accounts/${address}/transactions`,
      headers: this.headers,
      schema: TronTxListSchema,
    })
  }

  private fetchTransactionById(txHash: string): Effect.Effect<TronTx, FetchError> {
    return httpFetch({
      url: `${this.baseUrl}/wallet/gettransactionbyid`,
      method: "POST",
      headers: this.headers,
      body: { value: txHash },
      schema: TronTxSchema,
    })
  }
}

export function createTronRpcProviderEffect(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type === "tron-rpc" || entry.type === "tron-rpc-pro") {
    return new TronRpcProviderEffect(entry, chainId)
  }
  return null
}
