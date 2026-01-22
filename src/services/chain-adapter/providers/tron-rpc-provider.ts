/**
 * Tron RPC Provider
 * 
 * 使用 Mixin 继承模式组合 Identity 和 Transaction 能力
 */

import { z } from 'zod'
import { keyFetch, interval, deps, derive, transform, pathParams, postBody, throttleError, errorMatchers, apiKey } from '@biochain/key-fetch'
import type { KeyFetchInstance } from '@biochain/key-fetch'
import type { ApiProvider, Balance, Transaction, Direction, BalanceOutput, BlockHeightOutput, TransactionOutput, TransactionsOutput, AddressParams, TxHistoryParams, TransactionParams } from './types'
import {
  BalanceOutputSchema,
  TransactionsOutputSchema,
  TransactionOutputSchema,
  BlockHeightOutputSchema,
  TxHistoryParamsSchema,
  TransactionParamsSchema,
} from './types'
import type { ParsedApiEntry } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import { TronIdentityMixin } from '../tron/identity-mixin'
import { TronTransactionMixin } from '../tron/transaction-mixin'
import { pickApiKey, getApiKey } from './api-key-picker'

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
  block_timestamp: z.number().optional(),
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
type TronTx = z.infer<typeof TronTxSchema>
type TronTxList = z.infer<typeof TronTxListSchema>

// Params Schema for validation
const AddressParamsSchema = z.object({
  address: z.string().min(1, 'Address is required'),
})

// ==================== 工具函数 ====================

// Base58 字符表
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

/**
 * Base58 解码
 */
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

  // 处理前导 '1'
  for (const char of input) {
    if (char !== '1') break
    bytes.push(0)
  }

  return new Uint8Array(bytes.reverse())
}

/**
 * 将 Tron Base58Check 地址转换为 Hex 格式
 * T... -> 41... (不带 0x 前缀)
 */
function tronAddressToHex(address: string): string {
  if (address.startsWith('41') && address.length === 42) {
    return address // 已经是 hex 格式
  }
  if (!address.startsWith('T')) {
    throw new Error(`Invalid Tron address: ${address}`)
  }

  // Base58Check 解码后取前 21 字节（去掉 4 字节校验和）
  const decoded = base58Decode(address)
  const addressBytes = decoded.slice(0, 21)

  // 转为 hex
  return Array.from(addressBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

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

  readonly #accountApi: KeyFetchInstance<TronAccount, AddressParams>
  readonly #blockApi: KeyFetchInstance<TronNowBlock>
  readonly #txListApi: KeyFetchInstance<TronTxList, TxHistoryParams>
  readonly #txByIdApi: KeyFetchInstance<TronTx, TransactionParams>

  readonly nativeBalance: KeyFetchInstance<BalanceOutput, AddressParams>
  readonly transactionHistory: KeyFetchInstance<TransactionsOutput, TxHistoryParams>
  readonly transaction: KeyFetchInstance<TransactionOutput, TransactionParams>
  readonly blockHeight: KeyFetchInstance<BlockHeightOutput>

  constructor(entry: ParsedApiEntry, chainId: string) {
    super(entry, chainId)
    this.symbol = chainConfigService.getSymbol(chainId)
    this.decimals = chainConfigService.getDecimals(chainId)

    const baseUrl = this.endpoint
    const symbol = this.symbol
    const decimals = this.decimals

    // 读取 API Key
    const tronApiKey = getApiKey(this.config?.apiKeyEnv as string, `trongrid-${chainId}`)

    // API Key 插件（TronGrid 使用 TRON-PRO-API-KEY 头）
    const tronApiKeyPlugin = apiKey({
      header: 'TRON-PRO-API-KEY',
      key: tronApiKey,
    })

    // 共享的 429 错误节流插件
    const tronThrottleError = throttleError({
      match: errorMatchers.httpStatus(429),
    })

    // 基础 API fetcher
    // 区块 API - 使用 interval 轮询
    this.#blockApi = keyFetch.create({
      name: `tron-rpc.${chainId}.blockApi`,
      outputSchema: TronNowBlockSchema,
      url: `${baseUrl}/wallet/getnowblock`,
      method: 'POST',
      use: [interval(30_000), tronApiKeyPlugin, tronThrottleError], // 节约 API 费用，至少 30s 轮询
    })

    // 账户信息 - 由 blockApi 驱动
    this.#accountApi = keyFetch.create({
      name: `tron-rpc.${chainId}.accountApi`,
      outputSchema: TronAccountSchema,
      inputSchema: AddressParamsSchema,
      url: `${baseUrl}/wallet/getaccount`,
      method: 'POST',
      use: [
        deps(this.#blockApi),
        postBody({
          transform: (params) => ({
            address: tronAddressToHex(params.address as string),
          }),
        }),
        tronApiKeyPlugin,
        tronThrottleError,
      ],
    })

    // 交易列表 - 由 blockApi 驱动
    this.#txListApi = keyFetch.create({
      name: `tron-rpc.${chainId}.txListApi`,
      outputSchema: TronTxListSchema,
      inputSchema: TxHistoryParamsSchema,
      url: `${baseUrl}/v1/accounts/:address/transactions`,
      use: [deps(this.#blockApi), pathParams(), tronApiKeyPlugin, tronThrottleError],
    })

    // 派生视图
    this.nativeBalance = derive({
      name: `tron-rpc.${chainId}.nativeBalance`,
      source: this.#accountApi,
      outputSchema: BalanceOutputSchema,
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
      outputSchema: BlockHeightOutputSchema,
      use: [
        transform<TronNowBlock, bigint>({
          transform: (raw) => BigInt(raw.block_header?.raw_data?.number ?? 0),
        }),
      ],
    })

    this.transactionHistory = derive({
      name: `tron-rpc.${chainId}.transactionHistory`,
      source: this.#txListApi,
      outputSchema: TransactionsOutputSchema,

    }).use(transform({
      transform: (raw: TronTxList, ctx): Transaction[] => {
        if (!raw.success || !raw.data) return []

        const address = (ctx.params.address ?? '').toLowerCase()

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
            timestamp: tx.block_timestamp ?? tx.raw_data?.timestamp ?? 0,
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
    }),)

    // transaction: 单笔交易查询 - 由 blockApi 驱动
    this.#txByIdApi = keyFetch.create({
      name: `tron-rpc.${chainId}.txById`,
      outputSchema: TronTxSchema,
      inputSchema: TransactionParamsSchema,
      url: `${baseUrl}/wallet/gettransactionbyid`,
      method: 'POST',

    }).use(deps(this.#blockApi),
      postBody({
        transform: (params) => ({ value: params.txHash }),
      }),
      tronApiKeyPlugin,
      tronThrottleError,
    )

    this.transaction = derive({
      name: `tron-rpc.${chainId}.transaction`,
      source: this.#txByIdApi,
      outputSchema: TransactionOutputSchema,
      use: [
        transform<z.infer<typeof TronTxSchema>, Transaction | null>({
          transform: (tx) => {
            if (!tx.txID) return null

            const contract = tx.raw_data?.contract?.[0]
            const value = contract?.parameter?.value
            const from = value?.owner_address ?? ''
            const to = value?.to_address ?? ''

            // 判断状态：如果没有 ret，说明是 pending
            let status: 'pending' | 'confirmed' | 'failed'
            if (!tx.ret || tx.ret.length === 0) {
              status = 'pending'
            } else {
              status = tx.ret[0]?.contractRet === 'SUCCESS' ? 'confirmed' : 'failed'
            }

            return {
              hash: tx.txID,
              from,
              to,
              timestamp: tx.block_timestamp ?? tx.raw_data?.timestamp ?? 0,
              status,
              action: 'transfer' as const,
              direction: 'out', // TODO: 根据 address 判断
              assets: [{
                assetType: 'native' as const,
                value: (value?.amount ?? 0).toString(),
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

export function createTronRpcProvider(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type === 'tron-rpc' || entry.type === 'tron-rpc-pro') {
    return new TronRpcProvider(entry, chainId)
  }
  return null
}
