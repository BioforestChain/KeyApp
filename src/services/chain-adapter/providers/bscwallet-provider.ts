/**
 * BscWallet API Provider
 * 
 * 使用 Mixin 继承模式组合 Identity 和 Transaction 能力
 */

import { z } from 'zod'
import { keyFetch, interval, deps, derive, transform } from '@biochain/key-fetch'
import type { KeyFetchInstance, } from '@biochain/key-fetch'
import { BalanceOutputSchema, TransactionsOutputSchema, AddressParamsSchema, TxHistoryParamsSchema } from './types'
import type { ApiProvider, Balance, BalanceOutput, TransactionsOutput, AddressParams, TxHistoryParams, Direction } from './types'
import type { ParsedApiEntry } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import { EvmIdentityMixin } from '../evm/identity-mixin'
import { EvmTransactionMixin } from '../evm/transaction-mixin'

const BalanceApiSchema = z.object({ balance: z.string() }).passthrough()
const TxApiSchema = z.object({
  transactions: z.array(z.object({
    hash: z.string(), from: z.string(), to: z.string(), value: z.string(),
    timestamp: z.number(), status: z.string().optional(),
  }).passthrough()),
}).passthrough()

type BalanceApi = z.infer<typeof BalanceApiSchema>
type TxApi = z.infer<typeof TxApiSchema>

function getDirection(from: string, to: string, address: string): Direction {
  const f = from.toLowerCase(), t = to.toLowerCase()
  if (f === address && t === address) return 'self'
  return f === address ? 'out' : 'in'
}

// ==================== Base Class for Mixins ====================

class BscWalletBase {
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

export class BscWalletProvider extends EvmIdentityMixin(EvmTransactionMixin(BscWalletBase)) implements ApiProvider {
  private readonly symbol: string
  private readonly decimals: number

  readonly #balanceApi: KeyFetchInstance<BalanceApi, AddressParams>
  readonly #txApi: KeyFetchInstance<TxApi, TxHistoryParams>
  readonly nativeBalance: KeyFetchInstance<BalanceOutput, AddressParams>
  readonly transactionHistory: KeyFetchInstance<TransactionsOutput, TxHistoryParams>

  constructor(entry: ParsedApiEntry, chainId: string) {
    super(entry, chainId)
    this.symbol = chainConfigService.getSymbol(chainId)
    this.decimals = chainConfigService.getDecimals(chainId)

    const { endpoint: base, symbol, decimals } = this

    // 区块高度触发器 - 使用 interval 驱动数据更新
    const blockHeightTrigger = keyFetch.create({
      name: `bscwallet.${chainId}.blockTrigger`,
      outputSchema: z.object({ timestamp: z.number() }),
      url: 'internal://trigger',
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

    this.#balanceApi = keyFetch.create({
      name: `bscwallet.${chainId}.balanceApi`,
      outputSchema: BalanceApiSchema,
      inputSchema: AddressParamsSchema,
      url: `${base}/balance`,
      use: [deps(blockHeightTrigger)]
    })
    this.#txApi = keyFetch.create({
      name: `bscwallet.${chainId}.txApi`,
      outputSchema: TxApiSchema,
      inputSchema: TxHistoryParamsSchema,
      url: `${base}/transactions`,
      use: [deps(blockHeightTrigger)]
    })

    this.nativeBalance = derive({
      name: `bscwallet.${chainId}.nativeBalance`,
      source: this.#balanceApi,
      outputSchema: BalanceOutputSchema,
      use: [transform<BalanceApi, Balance>({ transform: (r) => ({ amount: Amount.fromRaw(r.balance, decimals, symbol), symbol }) })],
    })

    this.transactionHistory = keyFetch.create({
      name: `bscwallet.${chainId}.transactionHistory`,
      inputSchema: TxHistoryParamsSchema,
      outputSchema: TransactionsOutputSchema,
      url: `${base}/transactions`,
    }).use(
      deps(this.#txApi),
      transform({
        transform: (r: z.output<typeof TxApiSchema>, ctx) => {
          const addr = ctx.params.address.toLowerCase()
          return r.transactions.map(tx => ({
            hash: tx.hash, from: tx.from, to: tx.to, timestamp: tx.timestamp,
            status: tx.status === 'success' ? 'confirmed' as const : 'failed' as const,
            action: 'transfer' as const, direction: getDirection(tx.from, tx.to, addr),
            assets: [{ assetType: 'native' as const, value: tx.value, symbol, decimals }],
          }))
        },
      }),
    )
  }
}

export function createBscWalletProvider(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type === 'bscwallet-v1') return new BscWalletProvider(entry, chainId)
  return null
}
