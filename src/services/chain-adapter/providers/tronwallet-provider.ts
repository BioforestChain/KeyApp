/**
 * TronWallet API Provider
 * 
 * 使用 Mixin 继承模式组合 Identity 和 Transaction 能力
 * 
 * API 格式:
 * - 余额: { success: boolean, result: string|number }
 * - 交易历史: { success: boolean, data: TronNativeTx[] }
 */

import { z } from 'zod'
import { keyFetch, ttl, derive, transform, walletApiUnwrap, postBody } from '@biochain/key-fetch'
import type { KeyFetchInstance } from '@biochain/key-fetch'
import type { ApiProvider, Balance, Transaction, Direction } from './types'
import { BalanceOutputSchema, TransactionsOutputSchema } from './types'
import type { ParsedApiEntry } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import { TronIdentityMixin } from '../tron/identity-mixin'
import { TronTransactionMixin } from '../tron/transaction-mixin'

// ==================== Schema 定义 ====================

const BalanceResultSchema = z.union([z.string(), z.number().transform(v => String(v))])

const TronNativeTxSchema = z.object({
  txID: z.string(),
  from: z.string(),
  to: z.string(),
  amount: z.number(),
  timestamp: z.number(),
  contractRet: z.string().optional(),
}).passthrough()

const TxHistoryApiSchema = z.object({
  success: z.boolean(),
  data: z.array(TronNativeTxSchema),
}).passthrough()

type TronNativeTx = z.infer<typeof TronNativeTxSchema>

// ==================== 工具函数 ====================

function getDirection(from: string, to: string, address: string): Direction {
  const f = from.toLowerCase(), t = to.toLowerCase()
  if (f === address && t === address) return 'self'
  if (f === address) return 'out'
  return 'in'
}

// ==================== Base Class for Mixins ====================

class TronWalletBase {
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

export class TronWalletProvider extends TronIdentityMixin(TronTransactionMixin(TronWalletBase)) implements ApiProvider {
  private readonly symbol: string
  private readonly decimals: number

  readonly #balanceApi: KeyFetchInstance<typeof BalanceResultSchema>
  readonly #txHistoryApi: KeyFetchInstance<typeof TxHistoryApiSchema>

  readonly nativeBalance: KeyFetchInstance<typeof BalanceOutputSchema>
  readonly transactionHistory: KeyFetchInstance<typeof TransactionsOutputSchema>

  constructor(entry: ParsedApiEntry, chainId: string) {
    super(entry, chainId)
    this.symbol = chainConfigService.getSymbol(chainId)
    this.decimals = chainConfigService.getDecimals(chainId)

    const { endpoint: base, symbol, decimals } = this

    this.#balanceApi = keyFetch.create({
      name: `tronwallet.${chainId}.balanceApi`,
      schema: BalanceResultSchema,
      url: `${base}/balance`,
      method: 'POST',
      use: [postBody(), walletApiUnwrap(), ttl(60_000)],
    })

    this.#txHistoryApi = keyFetch.create({
      name: `tronwallet.${chainId}.txHistoryApi`,
      schema: TxHistoryApiSchema,
      url: `${base}/transactions`,
      use: [ttl(5 * 60_000)],
    })

    this.nativeBalance = derive({
      name: `tronwallet.${chainId}.nativeBalance`,
      source: this.#balanceApi,
      schema: BalanceOutputSchema,
      use: [transform<string, Balance>({
        transform: (raw) => ({
          amount: Amount.fromRaw(raw, decimals, symbol),
          symbol,
        }),
      })],
    })

    this.transactionHistory = derive({
      name: `tronwallet.${chainId}.transactionHistory`,
      source: this.#txHistoryApi,
      schema: TransactionsOutputSchema,
      use: [transform<z.infer<typeof TxHistoryApiSchema>, Transaction[]>({
        transform: (raw, ctx) => {
          if (!raw.success) return []
          const addr = ((ctx.params.address as string) ?? '').toLowerCase()
          return raw.data.map((tx): Transaction => ({
            hash: tx.txID,
            from: tx.from,
            to: tx.to,
            timestamp: tx.timestamp,
            status: tx.contractRet === 'SUCCESS' ? 'confirmed' : 'failed',
            action: 'transfer' as const,
            direction: getDirection(tx.from, tx.to, addr),
            assets: [{
              assetType: 'native' as const,
              value: String(tx.amount),
              symbol,
              decimals,
            }],
          }))
        },
      })],
    })
  }
}

export function createTronwalletProvider(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type === 'tronwallet-v1') return new TronWalletProvider(entry, chainId)
  return null
}
