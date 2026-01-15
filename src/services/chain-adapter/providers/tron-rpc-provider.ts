/**
 * Tron RPC Provider
 * 
 * 使用 Mixin 继承模式组合 Identity 和 Transaction 能力
 */

import { z } from 'zod'
import { keyFetch, ttl, derive, transform, pathParams } from '@biochain/key-fetch'
import type { KeyFetchInstance } from '@biochain/key-fetch'
import type { ApiProvider, Balance, Transaction, Direction } from './types'
import {
  BalanceOutputSchema,
  TransactionsOutputSchema,
  BlockHeightOutputSchema,
} from './types'
import type { ParsedApiEntry } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import { TronIdentityMixin } from '../tron/identity-mixin'
import { TronTransactionMixin } from '../tron/transaction-mixin'

// ==================== Schema 定义 ====================

const TronAccountSchema = z.object({
  balance: z.number().optional(),
  address: z.string().optional(),
}).passthrough()

const TronNowBlockSchema = z.object({
  block_header: z.object({
    raw_data: z.object({
      number: z.number().optional(),
    }).optional(),
  }).optional(),
}).passthrough()

const TronTxSchema = z.object({
  txID: z.string(),
  raw_data: z.object({
    contract: z.array(z.object({
      parameter: z.object({
        value: z.object({
          amount: z.number().optional(),
          owner_address: z.string().optional(),
          to_address: z.string().optional(),
        }).optional(),
      }).optional(),
      type: z.string().optional(),
    })).optional(),
    timestamp: z.number().optional(),
  }).optional(),
  ret: z.array(z.object({
    contractRet: z.string().optional(),
  })).optional(),
}).passthrough()

const TronTxListSchema = z.object({
  success: z.boolean(),
  data: z.array(TronTxSchema).optional(),
}).passthrough()

type TronAccount = z.infer<typeof TronAccountSchema>
type TronNowBlock = z.infer<typeof TronNowBlockSchema>
type TronTxList = z.infer<typeof TronTxListSchema>

// Params Schema for validation
const AddressParamsSchema = z.object({
  address: z.string().min(1, 'Address is required'),
})

// ==================== 工具函数 ====================

function getDirection(from: string, to: string, address: string): Direction {
  const fromLower = from.toLowerCase()
  const toLower = to.toLowerCase()
  if (fromLower === address && toLower === address) return 'self'
  if (fromLower === address) return 'out'
  return 'in'
}

// ==================== Base Class for Mixins ====================

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

// ==================== Provider 实现 (使用 Mixin 继承) ====================

export class TronRpcProvider extends TronIdentityMixin(TronTransactionMixin(TronRpcBase)) implements ApiProvider {
  private readonly symbol: string
  private readonly decimals: number

  readonly #accountApi: KeyFetchInstance<typeof TronAccountSchema>
  readonly #blockApi: KeyFetchInstance<typeof TronNowBlockSchema>
  readonly #txListApi: KeyFetchInstance<typeof TronTxListSchema>

  readonly nativeBalance: KeyFetchInstance<typeof BalanceOutputSchema>
  readonly transactionHistory: KeyFetchInstance<typeof TransactionsOutputSchema>
  readonly blockHeight: KeyFetchInstance<typeof BlockHeightOutputSchema>

  constructor(entry: ParsedApiEntry, chainId: string) {
    super(entry, chainId)
    this.symbol = chainConfigService.getSymbol(chainId)
    this.decimals = chainConfigService.getDecimals(chainId)

    const baseUrl = this.endpoint
    const symbol = this.symbol
    const decimals = this.decimals

    // 基础 API fetcher
    this.#accountApi = keyFetch.create({
      name: `tron-rpc.${chainId}.accountApi`,
      schema: TronAccountSchema,
      url: `${baseUrl}/wallet/getaccount`,
      method: 'POST',
      use: [ttl(60_000)],
    })

    this.#blockApi = keyFetch.create({
      name: `tron-rpc.${chainId}.blockApi`,
      schema: TronNowBlockSchema,
      url: `${baseUrl}/wallet/getnowblock`,
      method: 'POST',
      use: [ttl(10_000)],
    })

    this.#txListApi = keyFetch.create({
      name: `tron-rpc.${chainId}.txListApi`,
      schema: TronTxListSchema,
      paramsSchema: AddressParamsSchema,
      url: `${baseUrl}/v1/accounts/:address/transactions`,
      use: [pathParams(), ttl(5 * 60_000)],
    })

    // 派生视图
    this.nativeBalance = derive({
      name: `tron-rpc.${chainId}.nativeBalance`,
      source: this.#accountApi,
      schema: BalanceOutputSchema,
      use: [
        transform<TronAccount, Balance>({
          transform: (raw) => ({
            amount: Amount.fromRaw((raw.balance ?? 0).toString(), decimals, symbol),
            symbol,
          }),
        }),
      ],
    })

    this.blockHeight = derive({
      name: `tron-rpc.${chainId}.blockHeight`,
      source: this.#blockApi,
      schema: BlockHeightOutputSchema,
      use: [
        transform<TronNowBlock, bigint>({
          transform: (raw) => BigInt(raw.block_header?.raw_data?.number ?? 0),
        }),
      ],
    })

    this.transactionHistory = derive({
      name: `tron-rpc.${chainId}.transactionHistory`,
      source: this.#txListApi,
      schema: TransactionsOutputSchema,
      use: [
        transform<TronTxList, Transaction[]>({
          transform: (raw, ctx) => {
            if (!raw.success || !raw.data) return []

            const address = ((ctx.params.address as string) ?? '').toLowerCase()

            return raw.data.map((tx): Transaction => {
              const contract = tx.raw_data?.contract?.[0]
              const value = contract?.parameter?.value
              const from = value?.owner_address ?? ''
              const to = value?.to_address ?? ''
              const direction = getDirection(from, to, address)
              const status = tx.ret?.[0]?.contractRet === 'SUCCESS' ? 'confirmed' : 'failed'

              return {
                hash: tx.txID,
                from,
                to,
                timestamp: tx.raw_data?.timestamp ?? 0,
                status,
                action: 'transfer' as const,
                direction,
                assets: [{
                  assetType: 'native' as const,
                  value: (value?.amount ?? 0).toString(),
                  symbol,
                  decimals,
                }],
              }
            })
          },
        }),
      ],
    })
  }
}

export function createTronRpcProvider(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type === 'tron-rpc' || entry.type === 'tron-rpc-pro') {
    return new TronRpcProvider(entry, chainId)
  }
  return null
}
