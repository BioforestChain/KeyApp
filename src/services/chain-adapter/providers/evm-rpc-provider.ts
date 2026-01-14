/**
 * EVM RPC Provider
 * 
 * 使用 Mixin 继承模式组合 Identity 和 Transaction 能力
 */

import { z } from 'zod'
import { keyFetch, ttl, derive, transform } from '@biochain/key-fetch'
import type { KeyFetchInstance } from '@biochain/key-fetch'
import type { ApiProvider, Balance } from './types'
import { BalanceOutputSchema, BlockHeightOutputSchema } from './types'
import type { ParsedApiEntry } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import { EvmIdentityMixin } from '../evm/identity-mixin'
import { EvmTransactionMixin } from '../evm/transaction-mixin'

const RpcResponseSchema = z.object({
  jsonrpc: z.string(),
  id: z.number(),
  result: z.string(),
}).passthrough()

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

  readonly nativeBalance: KeyFetchInstance<typeof BalanceOutputSchema>
  readonly blockHeight: KeyFetchInstance<typeof BlockHeightOutputSchema>

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
  }
}

export function createEvmRpcProvider(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type.endsWith('-rpc') && (entry.type.includes('ethereum') || entry.type.includes('bsc'))) {
    return new EvmRpcProvider(entry, chainId)
  }
  return null
}
