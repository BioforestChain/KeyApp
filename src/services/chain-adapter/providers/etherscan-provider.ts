/**
 * Etherscan API Provider
 * 
 * 使用 Mixin 继承模式组合 Identity 和 Transaction 能力
 */

import { z } from 'zod'
import { keyFetch, ttl, derive, transform, searchParams } from '@biochain/key-fetch'
import type { KeyFetchInstance } from '@biochain/key-fetch'
import type { ApiProvider, Balance, Transaction, Direction, AddressParams, TxHistoryParams } from './types'
import {
  BalanceOutputSchema,
  TransactionsOutputSchema,
  AddressParamsSchema,
  TxHistoryParamsSchema,
} from './types'
import type { ParsedApiEntry } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import { EvmIdentityMixin } from '../evm/identity-mixin'
import { EvmTransactionMixin } from '../evm/transaction-mixin'

// ==================== Schema 定义 ====================

const ApiResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  result: z.unknown(),
}).passthrough()

const NativeTxSchema = z.object({
  hash: z.string(),
  from: z.string(),
  to: z.string(),
  value: z.string(),
  timeStamp: z.string(),
  isError: z.string(),
  blockNumber: z.string(),
  input: z.string().optional(),
  methodId: z.string().optional(),
  functionName: z.string().optional(),
}).passthrough()

type ApiResponse = z.infer<typeof ApiResponseSchema>
type NativeTx = z.infer<typeof NativeTxSchema>

// ==================== EVM Chain IDs ====================

const EVM_CHAIN_IDS: Record<string, number> = {
  ethereum: 1,
  binance: 56,
  'ethereum-sepolia': 11155111,
  'bsc-testnet': 97,
}

// ==================== 工具函数 ====================

function getDirection(from: string, to: string, address: string): Direction {
  const fromLower = from.toLowerCase()
  const toLower = to.toLowerCase()
  if (fromLower === address && toLower === address) return 'self'
  if (fromLower === address) return 'out'
  return 'in'
}

// ==================== Base Class for Mixins ====================

class EtherscanBase {
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

export class EtherscanProvider extends EvmIdentityMixin(EvmTransactionMixin(EtherscanBase)) implements ApiProvider {
  private readonly symbol: string
  private readonly decimals: number

  readonly #balanceApi: KeyFetchInstance<typeof ApiResponseSchema>
  readonly #txListApi: KeyFetchInstance<typeof ApiResponseSchema>

  readonly nativeBalance: KeyFetchInstance<typeof BalanceOutputSchema>
  readonly transactionHistory: KeyFetchInstance<typeof TransactionsOutputSchema>

  constructor(entry: ParsedApiEntry, chainId: string) {
    super(entry, chainId)
    this._evmChainId = EVM_CHAIN_IDS[chainId] ?? 1
    this.symbol = chainConfigService.getSymbol(chainId)
    this.decimals = chainConfigService.getDecimals(chainId)

    const baseUrl = this.endpoint
    const symbol = this.symbol
    const decimals = this.decimals

    this.#balanceApi = keyFetch.create({
      name: `etherscan.${chainId}.balanceApi`,
      schema: ApiResponseSchema,
      paramsSchema: AddressParamsSchema,
      url: `${baseUrl}`,
      use: [
        searchParams({
          transform: ((params: AddressParams) => ({
            module: 'account',
            action: 'balance',
            address: params.address,
            tag: 'latest',
          })) as unknown as (params: Record<string, unknown>) => Record<string, unknown>,
        }),
        ttl(30_000),
      ],
    })

    this.#txListApi = keyFetch.create({
      name: `etherscan.${chainId}.txListApi`,
      schema: ApiResponseSchema,
      paramsSchema: TxHistoryParamsSchema,
      url: `${baseUrl}`,
      use: [
        searchParams({
          transform: ((params: TxHistoryParams) => ({
            module: 'account',
            action: 'txlist',
            address: params.address,
            page: '1',
            offset: String(params.limit ?? 20),
            sort: 'desc',
          })) as unknown as (params: Record<string, unknown>) => Record<string, unknown>,
        }),
        ttl(5 * 60_000),
      ],
    })

    this.nativeBalance = derive({
      name: `etherscan.${chainId}.nativeBalance`,
      source: this.#balanceApi,
      schema: BalanceOutputSchema,
      use: [
        transform<ApiResponse, Balance>({
          transform: (raw) => {
            const result = raw.result
            if (typeof result !== 'string') throw new Error('Invalid balance result')
            return {
              amount: Amount.fromRaw(result, decimals, symbol),
              symbol,
            }
          },
        }),
      ],
    })

    this.transactionHistory = derive({
      name: `etherscan.${chainId}.transactionHistory`,
      source: this.#txListApi,
      schema: TransactionsOutputSchema,
      use: [
        transform<ApiResponse, Transaction[]>({
          transform: (raw, ctx) => {
            const result = raw.result
            if (!Array.isArray(result)) return []

            const address = ((ctx.params.address as string) ?? '').toLowerCase()

            return result
              .map(item => NativeTxSchema.safeParse(item))
              .filter((r): r is z.ZodSafeParseSuccess<NativeTx> => r.success)
              .map((r): Transaction => {
                const tx = r.data
                const direction = getDirection(tx.from, tx.to, address)
                return {
                  hash: tx.hash,
                  from: tx.from,
                  to: tx.to,
                  timestamp: parseInt(tx.timeStamp, 10) * 1000,
                  status: tx.isError === '0' ? 'confirmed' : 'failed',
                  blockNumber: BigInt(tx.blockNumber),
                  action: 'transfer' as const,
                  direction,
                  assets: [{
                    assetType: 'native' as const,
                    value: tx.value,
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

export function createEtherscanProvider(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type.includes('etherscan') || entry.type.includes('blockscout') || entry.type.includes('scan')) {
    return new EtherscanProvider(entry, chainId)
  }
  return null
}
