/**
 * Moralis API Provider
 * 
 * 使用 Mixin 继承模式组合 Identity 和 Transaction 能力
 * 支持 EVM 链的 Token 余额查询和交易历史
 */

import { z } from 'zod'
import { keyFetch, interval, deps, derive, transform, throttleError, errorMatchers } from '@biochain/key-fetch'
import type { KeyFetchInstance, FetchPlugin } from '@biochain/key-fetch'
import type {
  ApiProvider,
  TokenBalance,
  Transaction,
  Direction,
  Action,
  BalanceOutput,
  TokenBalancesOutput,
  TransactionsOutput,
  AddressParams,
  TxHistoryParams,
} from './types'
import {
  BalanceOutputSchema,
  TokenBalancesOutputSchema,
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

// ==================== 链 ID 映射 ====================

const MORALIS_CHAIN_MAP: Record<string, string> = {
  'eth-mainnet': 'eth',
  'bsc-mainnet': 'bsc',
  'polygon-mainnet': 'polygon',
  'avalanche-mainnet': 'avalanche',
  'fantom-mainnet': 'fantom',
  'arbitrum-mainnet': 'arbitrum',
  'optimism-mainnet': 'optimism',
  'base-mainnet': 'base',
}

// ==================== Schema 定义 ====================

// 原生余额响应
const NativeBalanceResponseSchema = z.object({
  balance: z.string(),
})

// Token 余额响应
const TokenBalanceItemSchema = z.object({
  token_address: z.string(),
  symbol: z.string(),
  name: z.string(),
  decimals: z.number(),
  balance: z.string(),
  logo: z.string().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  possible_spam: z.boolean().optional(),
  verified_contract: z.boolean().optional(),
  total_supply: z.string().nullable().optional(),
  security_score: z.number().nullable().optional(),
})

const TokenBalancesResponseSchema = z.array(TokenBalanceItemSchema)

// 钱包历史响应
const NativeTransferSchema = z.object({
  from_address: z.string(),
  to_address: z.string(),
  value: z.string(),
  value_formatted: z.string().optional(),
  direction: z.enum(['send', 'receive']).optional(),
  token_symbol: z.string().optional(),
  token_logo: z.string().optional(),
})

const Erc20TransferSchema = z.object({
  from_address: z.string(),
  to_address: z.string(),
  value: z.string(),
  value_formatted: z.string().optional(),
  token_name: z.string().optional(),
  token_symbol: z.string().optional(),
  token_decimals: z.string().optional(),
  token_logo: z.string().optional(),
  address: z.string(), // token contract address
})

const WalletHistoryItemSchema = z.object({
  hash: z.string(),
  from_address: z.string(),
  to_address: z.string().nullable(),
  value: z.string(),
  block_timestamp: z.string(),
  block_number: z.string(),
  receipt_status: z.string().optional(),
  transaction_fee: z.string().optional(),
  category: z.string().optional(),
  summary: z.string().optional(),
  possible_spam: z.boolean().optional(),
  from_address_entity: z.string().nullable().optional(),
  to_address_entity: z.string().nullable().optional(),
  native_transfers: z.array(NativeTransferSchema).optional(),
  erc20_transfers: z.array(Erc20TransferSchema).optional(),
})

const WalletHistoryResponseSchema = z.object({
  result: z.array(WalletHistoryItemSchema),
  cursor: z.string().nullable().optional(),
  page: z.number().optional(),
  page_size: z.number().optional(),
})

type NativeBalanceResponse = z.infer<typeof NativeBalanceResponseSchema>
type TokenBalanceItem = z.infer<typeof TokenBalanceItemSchema>
type WalletHistoryResponse = z.infer<typeof WalletHistoryResponseSchema>
type WalletHistoryItem = z.infer<typeof WalletHistoryItemSchema>

// ==================== 工具函数 ====================

function getDirection(from: string, to: string, address: string): Direction {
  const fromLower = from.toLowerCase()
  const toLower = to.toLowerCase()
  const addrLower = address.toLowerCase()
  if (fromLower === addrLower && toLower === addrLower) return 'self'
  if (fromLower === addrLower) return 'out'
  return 'in'
}

function mapCategory(category: string | undefined): Action {
  switch (category) {
    case 'send':
    case 'receive':
      return 'transfer'
    case 'token send':
    case 'token receive':
      return 'transfer'
    case 'nft send':
    case 'nft receive':
      return 'transfer'
    case 'approve':
      return 'approve'
    case 'contract interaction':
      return 'contract'
    default:
      return 'transfer'
  }
}

// ==================== Base Class for Mixins ====================

class MoralisBase {
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

export class MoralisProvider extends EvmIdentityMixin(EvmTransactionMixin(MoralisBase)) implements ApiProvider {
  private readonly symbol: string
  private readonly decimals: number
  private readonly moralisChain: string

  readonly #nativeBalanceApi: KeyFetchInstance<NativeBalanceResponse, AddressParams>
  readonly #tokenBalancesApi: KeyFetchInstance<TokenBalanceItem[], AddressParams>
  readonly #walletHistoryApi: KeyFetchInstance<WalletHistoryResponse, TxHistoryParams>

  readonly nativeBalance: KeyFetchInstance<BalanceOutput, AddressParams>
  readonly tokenBalances: KeyFetchInstance<TokenBalancesOutput, AddressParams>
  readonly transactionHistory: KeyFetchInstance<TransactionsOutput, TxHistoryParams>

  constructor(entry: ParsedApiEntry, chainId: string) {
    super(entry, chainId)
    this.symbol = chainConfigService.getSymbol(chainId)
    this.decimals = chainConfigService.getDecimals(chainId)

    // 映射 Moralis 链名
    this.moralisChain = MORALIS_CHAIN_MAP[chainId]
    if (!this.moralisChain) {
      throw new Error(`[MoralisProvider] Unsupported chain: ${chainId}`)
    }

    const baseUrl = this.endpoint
    const symbol = this.symbol
    const decimals = this.decimals
    const moralisChain = this.moralisChain

    // 读取 API Key
    const apiKey = getApiKey('MORALIS_API_KEY', `moralis-${chainId}`)
    if (!apiKey) {
      throw new Error(`[MoralisProvider] MORALIS_API_KEY is required`)
    }

    // API Key Header 插件
    const moralisApiKeyPlugin: FetchPlugin = {
      name: 'moralis-api-key',
      onFetch: async (request, next) => {
        const headers = new Headers(request.headers)
        headers.set('X-API-Key', apiKey)
        headers.set('accept', 'application/json')
        return next(new Request(request.url, { ...request, headers }))
      },
    }

    // 429 节流
    const moralisThrottleError = throttleError({
      match: errorMatchers.any(
        errorMatchers.httpStatus(429),
        errorMatchers.contains('Schema 验证失败'),
      ),
    })

    // 原生余额 API
    this.#nativeBalanceApi = keyFetch.create({
      name: `moralis.${chainId}.nativeBalanceApi`,
      outputSchema: NativeBalanceResponseSchema,
      inputSchema: AddressParamsSchema,
      url: (params) => `${baseUrl}/${params.address}/balance?chain=${moralisChain}`,
      use: [
        interval(15_000),
        moralisApiKeyPlugin,
        moralisThrottleError,
      ],
    })

    // Token 余额 API
    this.#tokenBalancesApi = keyFetch.create({
      name: `moralis.${chainId}.tokenBalancesApi`,
      outputSchema: TokenBalancesResponseSchema,
      inputSchema: AddressParamsSchema,
      url: (params) => `${baseUrl}/${params.address}/erc20?chain=${moralisChain}`,
      use: [
        interval(30_000), // Token 余额变化较慢
        moralisApiKeyPlugin,
        moralisThrottleError,
      ],
    })

    // 钱包历史 API
    this.#walletHistoryApi = keyFetch.create({
      name: `moralis.${chainId}.walletHistoryApi`,
      outputSchema: WalletHistoryResponseSchema,
      inputSchema: TxHistoryParamsSchema,
      url: (params) => `${baseUrl}/wallets/${params.address}/history?chain=${moralisChain}&limit=${params.limit ?? 20}`,
      use: [
        interval(15_000),
        moralisApiKeyPlugin,
        moralisThrottleError,
      ],
    })

    // 派生：原生余额
    this.nativeBalance = derive({
      name: `moralis.${chainId}.nativeBalance`,
      source: this.#nativeBalanceApi,
      outputSchema: BalanceOutputSchema,
      use: [
        transform<NativeBalanceResponse, BalanceOutput>({
          transform: (raw) => ({
            amount: Amount.fromRaw(raw.balance, decimals, symbol),
            symbol,
          }),
        }),
      ],
    })

    // 派生：Token 余额列表（含原生代币）
    this.tokenBalances = derive({
      name: `moralis.${chainId}.tokenBalances`,
      source: this.#tokenBalancesApi,
      outputSchema: TokenBalancesOutputSchema,
      use: [
        deps(this.#nativeBalanceApi), // 依赖原生余额
        transform<TokenBalanceItem[], TokenBalance[]>({
          transform: (tokens, ctx) => {
            const result: TokenBalance[] = []

            // 添加原生代币（从依赖获取）
            const nativeBalanceData = ctx.deps?.get(this.#nativeBalanceApi) as NativeBalanceResponse | undefined
            if (nativeBalanceData) {
              result.push({
                symbol,
                name: symbol,
                amount: Amount.fromRaw(nativeBalanceData.balance, decimals, symbol),
                isNative: true,
                decimals,
              })
            }

            // 添加 ERC20 代币
            for (const token of tokens) {
              result.push({
                symbol: token.symbol,
                name: token.name,
                amount: Amount.fromRaw(token.balance, token.decimals, token.symbol),
                isNative: false,
                decimals: token.decimals,
                icon: token.logo ?? token.thumbnail ?? undefined,
                contractAddress: token.token_address,
                metadata: {
                  possibleSpam: token.possible_spam,
                  securityScore: token.security_score,
                  verified: token.verified_contract,
                  totalSupply: token.total_supply ?? undefined,
                },
              })
            }

            return result
          },
        }),
      ],
    })

    // 派生：交易历史
    this.transactionHistory = derive<WalletHistoryResponse, TransactionsOutput, TxHistoryParams>({
      name: `moralis.${chainId}.transactionHistory`,
      source: this.#walletHistoryApi,
      outputSchema: TransactionsOutputSchema,
    }).use(transform({
      transform: (raw: WalletHistoryResponse, ctx): Transaction[] => {
        const address = ((ctx.params.address as string) ?? '').toLowerCase()

        return raw.result
          .filter(item => !item.possible_spam)
          .map((item): Transaction => {
            const direction = getDirection(item.from_address, item.to_address ?? '', address)
            const action = mapCategory(item.category)

            // 确定资产类型
            const hasErc20 = item.erc20_transfers && item.erc20_transfers.length > 0
            const hasNative = item.native_transfers && item.native_transfers.length > 0

            // 构建资产列表
            const assets: Transaction['assets'] = []

            if (hasErc20) {
              for (const transfer of item.erc20_transfers!) {
                assets.push({
                  assetType: 'token',
                  value: transfer.value,
                  symbol: transfer.token_symbol ?? 'Unknown',
                  decimals: parseInt(transfer.token_decimals ?? '18', 10),
                  contractAddress: transfer.address,
                  name: transfer.token_name,
                  logoUrl: transfer.token_logo ?? undefined,
                })
              }
            }

            if (hasNative || assets.length === 0) {
              // 添加原生资产
              const nativeValue = hasNative
                ? item.native_transfers![0].value
                : item.value
              assets.unshift({
                assetType: 'native',
                value: nativeValue,
                symbol,
                decimals,
              })
            }

            return {
              hash: item.hash,
              from: item.from_address,
              to: item.to_address ?? '',
              timestamp: new Date(item.block_timestamp).getTime(),
              status: item.receipt_status === '1' ? 'confirmed' : 'failed',
              blockNumber: BigInt(item.block_number),
              action,
              direction,
              assets,
              fee: item.transaction_fee ? {
                value: item.transaction_fee,
                symbol,
                decimals,
              } : undefined,
              fromEntity: item.from_address_entity ?? undefined,
              toEntity: item.to_address_entity ?? undefined,
              summary: item.summary,
            }
          })
      },
    }))
  }
}

export function createMoralisProvider(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type === 'moralis') {
    try {
      return new MoralisProvider(entry, chainId)
    } catch (err) {
      console.warn(`[MoralisProvider] Failed to create provider for ${chainId}:`, err)
      return null
    }
  }
  return null
}
