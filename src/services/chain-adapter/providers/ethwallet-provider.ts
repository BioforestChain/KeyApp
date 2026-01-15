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
import { keyFetch, ttl, derive, transform, walletApiUnwrap, postBody } from '@biochain/key-fetch'
import type { KeyFetchInstance } from '@biochain/key-fetch'
import type { ApiProvider, Balance, Transaction, Direction, Action } from './types'
import { BalanceOutputSchema, TransactionsOutputSchema } from './types'
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

  readonly #balanceApi: KeyFetchInstance<typeof BalanceResultSchema>
  readonly #txHistoryApi: KeyFetchInstance<typeof TxHistoryResultSchema>

  readonly nativeBalance: KeyFetchInstance<typeof BalanceOutputSchema>
  readonly transactionHistory: KeyFetchInstance<typeof TransactionsOutputSchema>

  constructor(entry: ParsedApiEntry, chainId: string) {
    super(entry, chainId)
    this.symbol = chainConfigService.getSymbol(chainId)
    this.decimals = chainConfigService.getDecimals(chainId)

    const { endpoint: base, symbol, decimals } = this

    this.#balanceApi = keyFetch.create({
      name: `ethwallet.${chainId}.balanceApi`,
      schema: BalanceResultSchema,
      url: `${base}/balance`,
      method: 'POST',
      use: [postBody(), walletApiUnwrap(), ttl(60_000)],
    })

    this.#txHistoryApi = keyFetch.create({
      name: `ethwallet.${chainId}.txHistoryApi`,
      schema: TxHistoryResultSchema,
      url: `${base}/trans/normal/history`,
      method: 'POST',
      use: [postBody(), walletApiUnwrap(), ttl(5 * 60_000)],
    })

    this.nativeBalance = derive({
      name: `ethwallet.${chainId}.nativeBalance`,
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
      name: `ethwallet.${chainId}.transactionHistory`,
      source: this.#txHistoryApi,
      schema: TransactionsOutputSchema,
      use: [transform<z.infer<typeof TxHistoryResultSchema>, Transaction[]>({
        transform: (raw, ctx) => {
          const address = ((ctx.params.address as string) ?? '').toLowerCase()
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
      })],
    })
  }
}

export function createEthwalletProvider(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type === 'ethwallet-v1') {
    return new EthWalletProvider(entry, chainId)
  }
  return null
}
