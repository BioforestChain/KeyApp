/**
 * EVM RPC Provider
 * 
 * 使用 Mixin 继承模式组合 Identity 和 Transaction 能力
 */

import { z } from 'zod'
import { keyFetch, interval, deps, derive, transform, combine, postBody } from '@biochain/key-fetch'
import type { KeyFetchInstance } from '@biochain/key-fetch'
import type { ApiProvider, Balance, BalanceOutput, BlockHeightOutput, TransactionOutput, AddressParams, TransactionParams } from './types'
import { BalanceOutputSchema, BlockHeightOutputSchema, TransactionOutputSchema, AddressParamsSchema, TransactionParamsSchema } from './types'
import type { ParsedApiEntry } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import { EvmIdentityMixin } from '../evm/identity-mixin'
import { EvmTransactionMixin } from '../evm/transaction-mixin'
import type { Transaction } from './transaction-schema'

const RpcResponseSchema = z.object({
  jsonrpc: z.string(),
  id: z.number(),
  result: z.string(),
}).passthrough()

// EVM Transaction RPC Response
const EvmTxRpcSchema = z.object({
  jsonrpc: z.string(),
  id: z.number(),
  result: z.object({
    hash: z.string(),
    from: z.string(),
    to: z.string().nullable(),
    value: z.string(),
    blockNumber: z.string().nullable(),
    input: z.string(),
  }).passthrough().nullable(),
})

// EVM Transaction Receipt RPC Response
const EvmReceiptRpcSchema = z.object({
  jsonrpc: z.string(),
  id: z.number(),
  result: z.object({
    status: z.string(),
    blockNumber: z.string(),
    transactionHash: z.string(),
  }).passthrough().nullable(),
})

type RpcResponse = z.infer<typeof RpcResponseSchema>
type EvmTxRpc = z.infer<typeof EvmTxRpcSchema>
type EvmReceiptRpc = z.infer<typeof EvmReceiptRpcSchema>

// ==================== Base Class for Mixins ====================

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

// ==================== Provider 实现 (使用 Mixin 继承) ====================

export class EvmRpcProvider extends EvmIdentityMixin(EvmTransactionMixin(EvmRpcBase)) implements ApiProvider {
  private readonly symbol: string
  private readonly decimals: number

  readonly #balanceRpc: KeyFetchInstance<RpcResponse, AddressParams>
  readonly #blockRpc: KeyFetchInstance<RpcResponse>
  readonly #txByHashRpc: KeyFetchInstance<EvmTxRpc, TransactionParams>
  readonly #txReceiptRpc: KeyFetchInstance<EvmReceiptRpc, TransactionParams>

  readonly nativeBalance: KeyFetchInstance<BalanceOutput, AddressParams>
  readonly blockHeight: KeyFetchInstance<BlockHeightOutput>
  readonly transaction: KeyFetchInstance<TransactionOutput, TransactionParams>

  constructor(entry: ParsedApiEntry, chainId: string) {
    super(entry, chainId)
    this.symbol = chainConfigService.getSymbol(chainId)
    this.decimals = chainConfigService.getDecimals(chainId)

    const { endpoint: rpc, symbol, decimals } = this

    // 区块高度 RPC - 使用 interval 轮询
    this.#blockRpc = keyFetch.create({
      name: `evm-rpc.${chainId}.blockRpc`,
      outputSchema: RpcResponseSchema,
      url: rpc,
      method: 'POST',
      use: [
        interval(12_000), // EVM 链约 12-15s 出块
        postBody({
          transform: () => ({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_blockNumber',
            params: [],
          }),
        }),
      ],
    })

    // 余额查询 - 由 blockRpc 驱动
    this.#balanceRpc = keyFetch.create({
      name: `evm-rpc.${chainId}.balanceRpc`,
      outputSchema: RpcResponseSchema,
      inputSchema: AddressParamsSchema,
      url: rpc,
      method: 'POST',
      use: [
        deps(this.#blockRpc),
        postBody({
          transform: (params) => ({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getBalance',
            params: [params.address, 'latest'],
          }),
        }),
      ],
    })

    // eth_getTransactionByHash - 由 blockRpc 驱动
    this.#txByHashRpc = keyFetch.create({
      name: `evm-rpc.${chainId}.txByHash`,
      outputSchema: EvmTxRpcSchema,
      inputSchema: TransactionParamsSchema,
      url: rpc,
      method: 'POST',
      use: [
        deps(this.#blockRpc), // 交易状态会随区块变化
        postBody({
          transform: (params) => ({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getTransactionByHash',
            params: [params.txHash],
          }),
        }),
      ],
    })

    // eth_getTransactionReceipt - 由 blockRpc 驱动
    this.#txReceiptRpc = keyFetch.create({
      name: `evm-rpc.${chainId}.txReceipt`,
      outputSchema: EvmReceiptRpcSchema,
      inputSchema: TransactionParamsSchema,
      url: rpc,
      method: 'POST',
      use: [
        deps(this.#blockRpc), // Receipt 状态会随区块变化
        postBody({
          transform: (params) => ({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getTransactionReceipt',
            params: [params.txHash],
          }),
        }),
      ],
    })

    this.nativeBalance = derive({
      name: `evm-rpc.${chainId}.nativeBalance`,
      source: this.#balanceRpc,
      outputSchema: BalanceOutputSchema,
      use: [transform<RpcResponse, Balance>({
        transform: (r) => {
          const hex = r.result
          const value = BigInt(hex).toString()
          return { amount: Amount.fromRaw(value, decimals, symbol), symbol }
        },
      })],
    })

    this.blockHeight = derive({
      name: `evm-rpc.${chainId}.blockHeight`,
      source: this.#blockRpc,
      outputSchema: BlockHeightOutputSchema,
      use: [transform<RpcResponse, bigint>({ transform: (r) => BigInt(r.result) })],
    })

    // transaction: combine tx + receipt
    this.transaction = combine({
      name: `evm-rpc.${chainId}.transaction`,
      outputSchema: TransactionOutputSchema,
      sources: {
        tx: this.#txByHashRpc,
        receipt: this.#txReceiptRpc,
      },
      inputSchema: z.object({ txHash: z.string() }),
      transformParams: (params) => ({
        tx: { txHash: params.txHash },
        receipt: { txHash: params.txHash },
      }),
      use: [
        transform({
          transform: (results: {
            tx: z.infer<typeof EvmTxRpcSchema>,
            receipt: z.infer<typeof EvmReceiptRpcSchema>
          }): Transaction | null => {
            const tx = results.tx.result
            const receipt = results.receipt.result

            if (!tx) return null

            // 判断状态
            let status: 'pending' | 'confirmed' | 'failed'
            if (!receipt) {
              status = 'pending'
            } else {
              status = receipt.status === '0x1' ? 'confirmed' : 'failed'
            }

            // 解析 value
            const value = BigInt(tx.value || '0x0').toString()

            return {
              hash: tx.hash,
              from: tx.from,
              to: tx.to ?? '',
              timestamp: Date.now(), // TODO: 从 block 获取真实时间戳
              status,
              blockNumber: receipt?.blockNumber ? BigInt(receipt.blockNumber) : undefined,
              action: tx.to ? 'transfer' : 'contract',
              direction: 'out', // TODO: 根据 address 判断
              assets: [{
                assetType: 'native' as const,
                value,
                symbol,
                decimals,
              }],
            }
          },
        }),
      ],
    })
  }
}

export function createEvmRpcProvider(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type.endsWith('-rpc') && (entry.type.includes('ethereum') || entry.type.includes('bsc'))) {
    return new EvmRpcProvider(entry, chainId)
  }
  return null
}
