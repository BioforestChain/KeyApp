/**
 * BtcWallet API Provider (Blockbook)
 * 
 * 使用 Mixin 继承模式组合 Identity 和 Transaction 能力
 */

import { z } from 'zod'
import { keyFetch, ttl, derive, transform, pathParams, walletApiUnwrap } from '@biochain/key-fetch'
import type { KeyFetchInstance } from '@biochain/key-fetch'
import type { ApiProvider, Balance, Transaction, Direction } from './types'
import { BalanceOutputSchema, TransactionsOutputSchema } from './types'
import type { ParsedApiEntry } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import { BitcoinIdentityMixin } from '../bitcoin/identity-mixin'
import { BitcoinTransactionMixin } from '../bitcoin/transaction-mixin'

// ==================== Schema 定义 ====================

const AddressInfoSchema = z.object({
  balance: z.string(),
  txs: z.number().optional(),
  transactions: z.array(z.object({
    txid: z.string(),
    vin: z.array(z.object({ addresses: z.array(z.string()).optional() }).passthrough()).optional(),
    vout: z.array(z.object({ addresses: z.array(z.string()).optional(), value: z.string().optional() }).passthrough()).optional(),
    blockTime: z.number().optional(),
    confirmations: z.number().optional(),
  }).passthrough()).optional(),
}).passthrough()

type AddressInfo = z.infer<typeof AddressInfoSchema>

// ==================== 工具函数 ====================

function getDirection(vin: any[], vout: any[], address: string): Direction {
  const isFrom = vin?.some(v => v.addresses?.includes(address))
  const isTo = vout?.some(v => v.addresses?.includes(address))
  if (isFrom && isTo) return 'self'
  return isFrom ? 'out' : 'in'
}

// ==================== Base Class for Mixins ====================

class BtcWalletBase {
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

export class BtcWalletProvider extends BitcoinIdentityMixin(BitcoinTransactionMixin(BtcWalletBase)) implements ApiProvider {
  private readonly symbol: string
  private readonly decimals: number

  readonly #addressInfo: KeyFetchInstance<typeof AddressInfoSchema>
  readonly nativeBalance: KeyFetchInstance<typeof BalanceOutputSchema>
  readonly transactionHistory: KeyFetchInstance<typeof TransactionsOutputSchema>

  constructor(entry: ParsedApiEntry, chainId: string) {
    super(entry, chainId)
    this.symbol = chainConfigService.getSymbol(chainId)
    this.decimals = chainConfigService.getDecimals(chainId)

    const { endpoint: base, symbol, decimals } = this

    this.#addressInfo = keyFetch.create({
      name: `btcwallet.${chainId}.addressInfo`,
      schema: AddressInfoSchema,
      url: `${base}/address/:address`,
      use: [pathParams(), walletApiUnwrap(), ttl(60_000)],
    })

    this.nativeBalance = derive({
      name: `btcwallet.${chainId}.nativeBalance`,
      source: this.#addressInfo,
      schema: BalanceOutputSchema,
      use: [transform<AddressInfo, Balance>({
        transform: (r) => ({ amount: Amount.fromRaw(r.balance, decimals, symbol), symbol }),
      })],
    })

    this.transactionHistory = derive({
      name: `btcwallet.${chainId}.transactionHistory`,
      source: this.#addressInfo,
      schema: TransactionsOutputSchema,
      use: [transform<AddressInfo, Transaction[]>({
        transform: (r, ctx) => {
          const addr = (ctx.params.address as string) ?? ''
          return (r.transactions ?? []).map(tx => ({
            hash: tx.txid,
            from: tx.vin?.[0]?.addresses?.[0] ?? '',
            to: tx.vout?.[0]?.addresses?.[0] ?? '',
            timestamp: (tx.blockTime ?? 0) * 1000,
            status: (tx.confirmations ?? 0) > 0 ? 'confirmed' as const : 'pending' as const,
            action: 'transfer' as const,
            direction: getDirection(tx.vin ?? [], tx.vout ?? [], addr),
            assets: [{ assetType: 'native' as const, value: tx.vout?.[0]?.value ?? '0', symbol, decimals }],
          }))
        },
      })],
    })
  }
}

export function createBtcwalletProvider(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type === 'btcwallet-v1') return new BtcWalletProvider(entry, chainId)
  return null
}
