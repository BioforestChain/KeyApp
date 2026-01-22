/**
 * Etherscan V1 API Provider
 * 
 * 使用 Mixin 继承模式组合 Identity 和 Transaction 能力
 * V1 API 作为 V2 的兜底方案
 */

import { z } from 'zod'
import { keyFetch, interval, deps, derive, transform, searchParams, throttleError, errorMatchers } from '@biochain/key-fetch'
import type { KeyFetchInstance, FetchPlugin } from '@biochain/key-fetch'
import type { ApiProvider, Balance, Transaction, Direction, BalanceOutput, TransactionsOutput, AddressParams, TxHistoryParams } from './types'
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
import { getApiKey } from './api-key-picker'

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

// EVM Chain IDs - preserved for future use
// const EVM_CHAIN_IDS: Record<string, number> = {
//   ethereum: 1,
//   binance: 56,
//   'ethereum-sepolia': 11155111,
//   'bsc-testnet': 97,
// }

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

export class EtherscanV1Provider extends EvmIdentityMixin(EvmTransactionMixin(EtherscanBase)) implements ApiProvider {
  private readonly symbol: string
  private readonly decimals: number

  readonly #balanceApi: KeyFetchInstance<ApiResponse, AddressParams>
  readonly #txListApi: KeyFetchInstance<ApiResponse, TxHistoryParams>

  readonly nativeBalance: KeyFetchInstance<BalanceOutput, AddressParams>
  readonly transactionHistory: KeyFetchInstance<TransactionsOutput, TxHistoryParams>

  constructor(entry: ParsedApiEntry, chainId: string) {
    super(entry, chainId)
    // EVM chain ID determined by chainId parameter
    this.symbol = chainConfigService.getSymbol(chainId)
    this.decimals = chainConfigService.getDecimals(chainId)

    const baseUrl = this.endpoint
    const symbol = this.symbol
    const decimals = this.decimals

    // 读取 API Key
    const etherscanApiKey = getApiKey(this.config?.apiKeyEnv as string, `etherscan-${chainId}`)

    // API Key 插件（Etherscan 使用 apikey 查询参数）
    const etherscanApiKeyPlugin: FetchPlugin = {
      name: 'etherscan-api-key',
      onFetch: async (request, next) => {
        if (etherscanApiKey) {
          const url = new URL(request.url)
          url.searchParams.set('apikey', etherscanApiKey)
          return next(new Request(url.toString(), request))
        }
        return next(request)
      },
    }

    // 共享 429 节流
    const etherscanThrottleError = throttleError({
      match: errorMatchers.httpStatus(429),
    })

    // 区块高度 API - 使用 Etherscan 的 proxy 模块
    const blockHeightApi = keyFetch.create({
      name: `etherscan.${chainId}.blockHeight`,
      outputSchema: ApiResponseSchema,
      url: `${baseUrl}`,
      use: [
        interval(12_000), // EVM 链约 12s 出块
        searchParams({
          transform: () => ({
            module: 'proxy',
            action: 'eth_blockNumber',
          }),
        }),
        etherscanApiKeyPlugin,
        etherscanThrottleError,
      ],
    })

    // 余额查询 - 由 blockHeightApi 驱动
    this.#balanceApi = keyFetch.create({
      name: `etherscan.${chainId}.balanceApi`,
      outputSchema: ApiResponseSchema,
      inputSchema: AddressParamsSchema,
      url: `${baseUrl}`,
      use: [
        deps(blockHeightApi),
        searchParams({
          transform: ((params) => ({
            module: 'account',
            action: 'balance',
            address: params.address,
            tag: 'latest',
          })),
        }),
        etherscanApiKeyPlugin,
        etherscanThrottleError,
      ],
    })

    // 交易历史 - 由 blockHeightApi 驱动
    this.#txListApi = keyFetch.create({
      name: `etherscan.${chainId}.txListApi`,
      outputSchema: ApiResponseSchema,
      inputSchema: TxHistoryParamsSchema,
      url: `${baseUrl}`,
      use: [
        deps(blockHeightApi),
        searchParams({
          transform: ((params) => ({
            module: 'account',
            action: 'txlist',
            address: params.address,
            page: '1',
            offset: String(params.limit ?? 20),
            sort: 'desc',
          })),
        }),
        etherscanApiKeyPlugin,
        etherscanThrottleError,
      ],
    })

    this.nativeBalance = derive({
      name: `etherscan.${chainId}.nativeBalance`,
      source: this.#balanceApi,
      outputSchema: BalanceOutputSchema,
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

    this.transactionHistory = derive<ApiResponse, TransactionsOutput, TxHistoryParams>({
      name: `etherscan.${chainId}.transactionHistory`,
      source: this.#txListApi,
      outputSchema: TransactionsOutputSchema,
    }).use(transform({
      transform: (raw: ApiResponse, ctx): Transaction[] => {
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
    }),)
  }
}

export function createEtherscanV1Provider(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type === 'etherscan-v1' || entry.type.includes('blockscout')) {
    return new EtherscanV1Provider(entry, chainId)
  }
  return null
}
