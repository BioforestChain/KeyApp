/**
 * EVM RPC Provider
 * 
 * 使用 Mixin 继承模式组合 Identity 和 Transaction 能力
 */

import { z } from 'zod'
import { keyFetch, ttl, derive, transform, combine, postBody } from '@biochain/key-fetch'
import type { KeyFetchInstance } from '@biochain/key-fetch'
import type { ApiProvider, Balance } from './types'
import { BalanceOutputSchema, BlockHeightOutputSchema, TransactionOutputSchema } from './types'
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

  readonly #balanceRpc: KeyFetchInstance<typeof RpcResponseSchema>
  readonly #blockRpc: KeyFetchInstance<typeof RpcResponseSchema>
  readonly #txByHashRpc: KeyFetchInstance<typeof EvmTxRpcSchema>
  readonly #txReceiptRpc: KeyFetchInstance<typeof EvmReceiptRpcSchema>

  readonly nativeBalance: KeyFetchInstance<typeof BalanceOutputSchema>
  readonly blockHeight: KeyFetchInstance<typeof BlockHeightOutputSchema>
  readonly transaction: KeyFetchInstance<typeof TransactionOutputSchema>

  constructor(entry: ParsedApiEntry, chainId: string) {
    super(entry, chainId)
    this.symbol = chainConfigService.getSymbol(chainId)
    this.decimals = chainConfigService.getDecimals(chainId)

    const { endpoint: rpc, symbol, decimals } = this

    this.#balanceRpc = keyFetch.create({
      name: `evm-rpc.${chainId}.balanceRpc`,
      schema: RpcResponseSchema,
      url: rpc,
      method: 'POST',
      use: [ttl(10_000)],
    })

    this.#blockRpc = keyFetch.create({
      name: `evm-rpc.${chainId}.blockRpc`,
      schema: RpcResponseSchema,
      url: rpc,
      method: 'POST',
      use: [ttl(10_000)],
    })

    // eth_getTransactionByHash
    this.#txByHashRpc = keyFetch.create({
      name: `evm-rpc.${chainId}.txByHash`,
      schema: EvmTxRpcSchema,
      paramsSchema: z.object({ txHash: z.string() }),
      url: rpc,
      method: 'POST',
      use: [
        postBody({
          transform: (params) => ({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getTransactionByHash',
            params: [params.txHash],
          }),
        }),
        ttl(10_000),
      ],
    })

    // eth_getTransactionReceipt
    this.#txReceiptRpc = keyFetch.create({
      name: `evm-rpc.${chainId}.txReceipt`,
      schema: EvmReceiptRpcSchema,
      paramsSchema: z.object({ txHash: z.string() }),
      url: rpc,
      method: 'POST',
      use: [
        postBody({
          transform: (params) => ({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getTransactionReceipt',
            params: [params.txHash],
          }),
        }),
        ttl(10_000),
      ],
    })

    this.nativeBalance = derive({
      name: `evm-rpc.${chainId}.nativeBalance`,
      source: this.#balanceRpc,
      schema: BalanceOutputSchema,
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
      schema: BlockHeightOutputSchema,
      use: [transform<RpcResponse, bigint>({ transform: (r) => BigInt(r.result) })],
    })

    // transaction: combine tx + receipt
    this.transaction = combine({
      name: `evm-rpc.${chainId}.transaction`,
      schema: TransactionOutputSchema,
      sources: {
        tx: this.#txByHashRpc,
        receipt: this.#txReceiptRpc,
      },
      paramsSchema: z.object({ txHash: z.string() }),
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
