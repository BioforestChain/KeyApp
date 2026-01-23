/**
 * EVM RPC Provider - Effect TS Version (深度重构)
 *
 * 使用 Effect 原生 Source API 实现响应式数据获取
 * - blockHeight: 定时轮询
 * - nativeBalance: 依赖 blockHeight 变化
 * - transaction: 依赖 blockHeight 变化
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
} from "@biochain/chain-effect"
import type { StreamInstance } from "@biochain/chain-effect"
import type { ApiProvider, BalanceOutput, BlockHeightOutput, TransactionOutput, AddressParams, TransactionParams, Action, Transaction } from "./types"
import type { ParsedApiEntry } from "@/services/chain-config"
import { chainConfigService } from "@/services/chain-config"
import { Amount } from "@/types/amount"
import { EvmIdentityMixin } from "../evm/identity-mixin"
import { EvmTransactionMixin } from "../evm/transaction-mixin"

// ==================== Effect Schema 定义 ====================

const RpcResponseSchema = S.Struct({
  jsonrpc: S.String,
  id: S.Number,
  result: S.String,
})

const EvmTxResultSchema = S.Struct({
  hash: S.String,
  from: S.String,
  to: S.NullOr(S.String),
  value: S.String,
  blockNumber: S.NullOr(S.String),
  input: S.String,
})

const EvmTxRpcSchema = S.Struct({
  jsonrpc: S.String,
  id: S.Number,
  result: S.NullOr(EvmTxResultSchema),
})

const EvmReceiptResultSchema = S.Struct({
  status: S.String,
  blockNumber: S.String,
  transactionHash: S.String,
})

const EvmReceiptRpcSchema = S.Struct({
  jsonrpc: S.String,
  id: S.Number,
  result: S.NullOr(EvmReceiptResultSchema),
})

type RpcResponse = S.Schema.Type<typeof RpcResponseSchema>
type EvmTxRpc = S.Schema.Type<typeof EvmTxRpcSchema>
type EvmReceiptRpc = S.Schema.Type<typeof EvmReceiptRpcSchema>

// ==================== 判断区块高度是否变化 ====================

function hasBlockHeightChanged(
  prev: BlockHeightOutput | null,
  next: BlockHeightOutput
): boolean {
  if (prev === null) return true
  return prev !== next
}

// ==================== Base Class ====================

class EvmRpcBase {
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

export class EvmRpcProviderEffect extends EvmIdentityMixin(EvmTransactionMixin(EvmRpcBase)) implements ApiProvider {
  private readonly symbol: string
  private readonly decimals: number
  private readonly pollingInterval: number = 30000

  readonly nativeBalance: StreamInstance<AddressParams, BalanceOutput>
  readonly blockHeight: StreamInstance<unknown, BlockHeightOutput>
  readonly transaction: StreamInstance<TransactionParams, TransactionOutput>

  constructor(entry: ParsedApiEntry, chainId: string) {
    super(entry, chainId)
    this.symbol = chainConfigService.getSymbol(chainId)
    this.decimals = chainConfigService.getDecimals(chainId)

    const provider = this

    // 区块高度: 定时轮询
    this.blockHeight = createStreamInstanceFromSource<unknown, BlockHeightOutput>(
      `evm-rpc.${chainId}.blockHeight`,
      () => provider.createBlockHeightSource()
    )

    // 原生余额: 依赖 blockHeight 变化
    this.nativeBalance = createStreamInstanceFromSource<AddressParams, BalanceOutput>(
      `evm-rpc.${chainId}.nativeBalance`,
      (params) => provider.createBalanceSource(params)
    )

    // 单笔交易查询: 依赖 blockHeight 变化
    this.transaction = createStreamInstanceFromSource<TransactionParams, TransactionOutput>(
      `evm-rpc.${chainId}.transaction`,
      (params) => provider.createTransactionSource(params)
    )
  }

  // ==================== Source 创建方法 ====================

  private createBlockHeightSource(): Effect.Effect<DataSource<BlockHeightOutput>> {
    const provider = this

    return Effect.gen(function* () {
      const fetchEffect = provider.fetchBlockNumber().pipe(
        Effect.map((res): BlockHeightOutput => BigInt(res.result))
      )

      const source = yield* createPollingSource({
        name: `evm-rpc.${provider.chainId}.blockHeight`,
        fetch: fetchEffect,
        interval: Duration.millis(provider.pollingInterval),
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
      const blockHeightSource = yield* provider.createBlockHeightSource()

      const fetchEffect = provider.fetchBalance(params.address).pipe(
        Effect.map((res): BalanceOutput => {
          const value = BigInt(res.result).toString()
          return { amount: Amount.fromRaw(value, decimals, symbol), symbol }
        })
      )

      const source = yield* createDependentSource({
        name: `evm-rpc.${provider.chainId}.balance`,
        dependsOn: blockHeightSource.ref,
        hasChanged: hasBlockHeightChanged,
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
      const blockHeightSource = yield* provider.createBlockHeightSource()

      const fetchEffect = Effect.gen(function* () {
        const [txRes, receiptRes] = yield* Effect.all([
          provider.fetchTransaction(params.txHash),
          provider.fetchTransactionReceipt(params.txHash),
        ])

        const tx = txRes.result
        const receipt = receiptRes.result

        if (!tx) return null

        let status: "pending" | "confirmed" | "failed"
        if (!receipt) {
          status = "pending"
        } else {
          status = receipt.status === "0x1" ? "confirmed" : "failed"
        }

        const value = BigInt(tx.value || "0x0").toString()

        const blockNumber = receipt?.blockNumber ? BigInt(receipt.blockNumber) : undefined

        const base: Transaction = {
          hash: tx.hash,
          from: tx.from,
          to: tx.to ?? "",
          timestamp: Date.now(),
          status,
          action: (tx.to ? "transfer" : "contract") as Action,
          direction: "out" as const,
          assets: [{
            assetType: "native" as const,
            value,
            symbol,
            decimals,
          }],
        }

        return blockNumber === undefined ? base : { ...base, blockNumber }
      })

      const source = yield* createDependentSource({
        name: `evm-rpc.${provider.chainId}.transaction`,
        dependsOn: blockHeightSource.ref,
        hasChanged: hasBlockHeightChanged,
        fetch: () => fetchEffect,
      })

      return source
    })
  }

  // ==================== HTTP Fetch Effects ====================

  private fetchBlockNumber(): Effect.Effect<RpcResponse, FetchError> {
    return httpFetch({
      url: this.endpoint,
      method: "POST",
      body: { jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] },
      schema: RpcResponseSchema,
    })
  }

  private fetchBalance(address: string): Effect.Effect<RpcResponse, FetchError> {
    return httpFetch({
      url: this.endpoint,
      method: "POST",
      body: {
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getBalance",
        params: [address, "latest"],
      },
      schema: RpcResponseSchema,
    })
  }

  private fetchTransaction(txHash: string): Effect.Effect<EvmTxRpc, FetchError> {
    return httpFetch({
      url: this.endpoint,
      method: "POST",
      body: {
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getTransactionByHash",
        params: [txHash],
      },
      schema: EvmTxRpcSchema,
    })
  }

  private fetchTransactionReceipt(txHash: string): Effect.Effect<EvmReceiptRpc, FetchError> {
    return httpFetch({
      url: this.endpoint,
      method: "POST",
      body: {
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getTransactionReceipt",
        params: [txHash],
      },
      schema: EvmReceiptRpcSchema,
    })
  }
}

export function createEvmRpcProviderEffect(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type.endsWith("-rpc") && (entry.type.includes("ethereum") || entry.type.includes("bsc"))) {
    return new EvmRpcProviderEffect(entry, chainId)
  }
  return null
}
