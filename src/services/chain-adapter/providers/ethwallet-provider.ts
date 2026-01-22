/**
 * EthWallet API Provider
 * 
 * 使用 Mixin 继承模式组合 Identity 和 Transaction 能力
 * 
 * API 格式:
 * - 余额: { success: boolean, result: string }
 * - 交易历史: { success: boolean, result: { status: string, result: NativeTx[] } }
 */

import { z } from 'zod'
import { keyFetch, interval, deps, derive, transform, walletApiUnwrap, postBody } from '@biochain/key-fetch'
import type { KeyFetchInstance, } from '@biochain/key-fetch'
import type { ApiProvider, Balance, Transaction, Direction, Action, BalanceOutput, TransactionsOutput, AddressParams, TxHistoryParams } from './types'
import { BalanceOutputSchema, TransactionsOutputSchema, AddressParamsSchema, TxHistoryParamsSchema } from './types'
import type { ParsedApiEntry } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import { EvmIdentityMixin } from '../evm/identity-mixin'
import { EvmTransactionMixin } from '../evm/transaction-mixin'

// ==================== Schema 定义 ====================

const BalanceResultSchema = z.union([z.string(), z.number().transform(v => String(v))])

const NativeTxSchema = z.object({
  blockNumber: z.string(),
  timeStamp: z.string(),
  hash: z.string(),
  from: z.string(),
  to: z.string(),
  value: z.string(),
  isError: z.string().optional(),
  input: z.string().optional(),
  methodId: z.string().optional(),
  functionName: z.string().optional(),
}).passthrough()

const TxHistoryResultSchema = z.object({
  status: z.string().optional(),
  result: z.array(NativeTxSchema),
}).passthrough()

type BalanceResult = z.infer<typeof BalanceResultSchema>
type TxHistoryResult = z.infer<typeof TxHistoryResultSchema>
type NativeTx = z.infer<typeof NativeTxSchema>

// ==================== 工具函数 ====================

function getDirection(from: string, to: string, address: string): Direction {
  const fromLower = from.toLowerCase()
  const toLower = to.toLowerCase()
  if (fromLower === address && toLower === address) return 'self'
  if (fromLower === address) return 'out'
  return 'in'
}

function detectAction(tx: NativeTx): Action {
  const value = tx.value
  if (value && value !== '0') return 'transfer'
  return 'contract'
}

// ==================== Base Class for Mixins ====================

class EthWalletBase {
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

export class EthWalletProvider extends EvmIdentityMixin(EvmTransactionMixin(EthWalletBase)) implements ApiProvider {
  private readonly symbol: string
  private readonly decimals: number

  readonly #balanceApi: KeyFetchInstance<BalanceResult, AddressParams>
  readonly #txHistoryApi: KeyFetchInstance<TxHistoryResult, TxHistoryParams>

  readonly nativeBalance: KeyFetchInstance<BalanceOutput, AddressParams>
  readonly transactionHistory: KeyFetchInstance<TransactionsOutput, TxHistoryParams>

  constructor(entry: ParsedApiEntry, chainId: string) {
    super(entry, chainId)
    this.symbol = chainConfigService.getSymbol(chainId)
    this.decimals = chainConfigService.getDecimals(chainId)

    const { endpoint: base, symbol, decimals } = this

    // 区块高度 - 使用简单的轮询机制（第三方 API 可能没有专门的 blockHeight 端点）
    // 我们使用 interval 来驱动其他数据源的更新
    const blockHeightTrigger = keyFetch.create({
      name: `ethwallet.${chainId}.blockTrigger`,
      outputSchema: z.object({ timestamp: z.number() }),
      url: 'internal://trigger', // 虚拟 URL
      use: [
        interval(30_000), // 节约 API 费用，至少 30s 轮询
        {
          name: 'trigger',
          onFetch: async (_req, _next, ctx) => {
            return ctx.createResponse({ timestamp: Date.now() })
          },
        },
      ],
    })

    // 余额查询 - 由 blockHeightTrigger 驱动
    this.#balanceApi = keyFetch.create({
      name: `ethwallet.${chainId}.balanceApi`,
      outputSchema: BalanceResultSchema,
      inputSchema: AddressParamsSchema,
      url: `${base}/balance`,
      method: 'POST',
      use: [deps(blockHeightTrigger), postBody(), walletApiUnwrap()],
    })

    // 交易历史 - 由 blockHeightTrigger 驱动
    this.#txHistoryApi = keyFetch.create({
      name: `ethwallet.${chainId}.txHistoryApi`,
      outputSchema: TxHistoryResultSchema,
      inputSchema: TxHistoryParamsSchema,
      url: `${base}/trans/normal/history`,
      method: 'POST',
      use: [deps(blockHeightTrigger), postBody(), walletApiUnwrap()],
    })

    this.nativeBalance = derive({
      name: `ethwallet.${chainId}.nativeBalance`,
      source: this.#balanceApi,
      outputSchema: BalanceOutputSchema,
      use: [transform<string, Balance>({
        transform: (raw) => ({
          amount: Amount.fromRaw(raw, decimals, symbol),
          symbol,
        }),
      })],
    })

    this.transactionHistory = keyFetch.create({
      name: `ethwallet.${chainId}.transactionHistory`,
      inputSchema: TxHistoryParamsSchema,
      outputSchema: TransactionsOutputSchema,
      url: `${base}/trans/normal/history`,
      method: 'POST',
    }).use(
      deps(this.#txHistoryApi),
      postBody(),
      transform({
        transform: (raw: TxHistoryResult, ctx) => {
          console.log('QAQ', raw)
          const address = ctx.params.address.toLowerCase()
          return raw.result.map((tx): Transaction => ({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            timestamp: parseInt(tx.timeStamp, 10) * 1000,
            status: tx.isError === '1' ? 'failed' : 'confirmed',
            blockNumber: BigInt(tx.blockNumber),
            action: detectAction(tx),
            direction: getDirection(tx.from, tx.to, address),
            assets: [{
              assetType: 'native' as const,
              value: tx.value,
              symbol,
              decimals,
            }],
          }))
        },
      }),
      walletApiUnwrap(),
    )
  }
}

export function createEthwalletProvider(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type === 'ethwallet-v1') {
    return new EthWalletProvider(entry, chainId)
  }
  return null
}
