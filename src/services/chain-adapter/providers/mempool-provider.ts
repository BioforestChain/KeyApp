/**
 * Mempool.space API Provider
 * 
 * 使用 Mixin 继承模式组合 Identity 和 Transaction 能力
 */

import { z } from 'zod'
import { keyFetch, ttl, derive, transform, pathParams } from '@biochain/key-fetch'
import type { KeyFetchInstance } from '@biochain/key-fetch'
import type { ApiProvider, Balance, Transaction, Direction } from './types'
import { BalanceOutputSchema, TransactionsOutputSchema, BlockHeightOutputSchema } from './types'
import type { ParsedApiEntry } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import { BitcoinIdentityMixin } from '../bitcoin/identity-mixin'
import { BitcoinTransactionMixin } from '../bitcoin/transaction-mixin'

const AddressInfoSchema = z.object({
  chain_stats: z.object({ funded_txo_sum: z.number(), spent_txo_sum: z.number() }),
}).passthrough()

const TxSchema = z.object({
  txid: z.string(),
  vin: z.array(z.object({ prevout: z.object({ scriptpubkey_address: z.string().optional() }).optional() }).passthrough()),
  vout: z.array(z.object({ scriptpubkey_address: z.string().optional(), value: z.number().optional() }).passthrough()),
  status: z.object({ confirmed: z.boolean(), block_time: z.number().optional() }),
}).passthrough()

const TxListSchema = z.array(TxSchema)
const BlockHeightApiSchema = z.number()

type AddressInfo = z.infer<typeof AddressInfoSchema>
type TxList = z.infer<typeof TxListSchema>

function getDirection(vin: any[], vout: any[], address: string): Direction {
  const isFrom = vin?.some(v => v.prevout?.scriptpubkey_address === address)
  const isTo = vout?.some(v => v.scriptpubkey_address === address)
  if (isFrom && isTo) return 'self'
  return isFrom ? 'out' : 'in'
}

// ==================== Base Class for Mixins ====================

class MempoolBase {
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

export class MempoolProvider extends BitcoinIdentityMixin(BitcoinTransactionMixin(MempoolBase)) implements ApiProvider {
  private readonly symbol: string
  private readonly decimals: number

  readonly #addressInfo: KeyFetchInstance<typeof AddressInfoSchema>
  readonly #txList: KeyFetchInstance<typeof TxListSchema>
  readonly #blockHeight: KeyFetchInstance<typeof BlockHeightApiSchema>

  readonly nativeBalance: KeyFetchInstance<typeof BalanceOutputSchema>
  readonly transactionHistory: KeyFetchInstance<typeof TransactionsOutputSchema>
  readonly blockHeight: KeyFetchInstance<typeof BlockHeightOutputSchema>

  constructor(entry: ParsedApiEntry, chainId: string) {
    super(entry, chainId)
    this.symbol = chainConfigService.getSymbol(chainId)
    this.decimals = chainConfigService.getDecimals(chainId)

    const { endpoint: base, symbol, decimals } = this

    this.#addressInfo = keyFetch.create({ name: `mempool.${chainId}.addressInfo`, schema: AddressInfoSchema, url: `${base}/address/:address`, use: [pathParams(), ttl(60_000)] })
    this.#txList = keyFetch.create({ name: `mempool.${chainId}.txList`, schema: TxListSchema, url: `${base}/address/:address/txs`, use: [pathParams(), ttl(5 * 60_000)] })
    this.#blockHeight = keyFetch.create({ name: `mempool.${chainId}.blockHeightApi`, schema: BlockHeightApiSchema, url: `${base}/blocks/tip/height`, use: [ttl(30_000)] })

    this.nativeBalance = derive({
      name: `mempool.${chainId}.nativeBalance`,
      source: this.#addressInfo,
      schema: BalanceOutputSchema,
      use: [transform<AddressInfo, Balance>({
        transform: (r) => {
          const balance = r.chain_stats.funded_txo_sum - r.chain_stats.spent_txo_sum
          return { amount: Amount.fromRaw(balance.toString(), decimals, symbol), symbol }
        },
      })],
    })

    this.transactionHistory = derive({
      name: `mempool.${chainId}.transactionHistory`,
      source: this.#txList,
      schema: TransactionsOutputSchema,
      use: [transform<TxList, Transaction[]>({
        transform: (r, ctx) => {
          const addr = (ctx.params.address as string) ?? ''
          return r.map(tx => ({
            hash: tx.txid,
            from: tx.vin[0]?.prevout?.scriptpubkey_address ?? '',
            to: tx.vout[0]?.scriptpubkey_address ?? '',
            timestamp: (tx.status.block_time ?? 0) * 1000,
            status: tx.status.confirmed ? 'confirmed' as const : 'pending' as const,
            action: 'transfer' as const,
            direction: getDirection(tx.vin, tx.vout, addr),
            assets: [{ assetType: 'native' as const, value: (tx.vout[0]?.value ?? 0).toString(), symbol, decimals }],
          }))
        },
      })],
    })

    this.blockHeight = derive({
      name: `mempool.${chainId}.blockHeight`,
      source: this.#blockHeight,
      schema: BlockHeightOutputSchema,
      use: [transform<number, bigint>({ transform: (r) => BigInt(r) })],
    })
  }
}

export function createMempoolProvider(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type.startsWith('mempool-')) return new MempoolProvider(entry, chainId)
  return null
}
