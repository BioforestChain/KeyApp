/**
 * BtcWallet API Provider (Blockbook)
 * 
 * 使用 Mixin 继承模式组合 Identity 和 Transaction 能力
 */

import { z } from 'zod'
import { keyFetch, interval, deps, derive, transform, pathParams, walletApiUnwrap } from '@biochain/key-fetch'
import type { KeyFetchInstance } from '@biochain/key-fetch'
import { BalanceOutputSchema, TransactionsOutputSchema, AddressParamsSchema, TxHistoryParamsSchema } from './types'
import type { ApiProvider, Balance, Transaction, Direction, BalanceOutput, TransactionsOutput, AddressParams, TxHistoryParams } from './types'
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

  readonly #addressInfo: KeyFetchInstance<AddressInfo, AddressParams>
  readonly #addressTx: KeyFetchInstance<AddressInfo, TxHistoryParams>
  readonly nativeBalance: KeyFetchInstance<BalanceOutput, AddressParams>
  readonly transactionHistory: KeyFetchInstance<TransactionsOutput, TxHistoryParams>

  constructor(entry: ParsedApiEntry, chainId: string) {
    super(entry, chainId)
    this.symbol = chainConfigService.getSymbol(chainId)
    this.decimals = chainConfigService.getDecimals(chainId)

    const { endpoint: base, symbol, decimals } = this

    // 区块高度触发器 - 使用 interval 驱动数据更新
    const blockHeightTrigger = keyFetch.create({
      name: `btcwallet.${chainId}.blockTrigger`,
      outputSchema: z.object({ timestamp: z.number() }),
      url: 'internal://trigger',
      use: [
        interval(60_000), // Bitcoin 约 10 分钟出块，60s 轮询合理
        {
          name: 'trigger',
          onFetch: async (_req, _next, ctx) => {
            return ctx.createResponse({ timestamp: Date.now() })
          },
        },
      ],
    })

    this.#addressInfo = keyFetch.create({
      name: `btcwallet.${chainId}.addressInfo`,
      outputSchema: AddressInfoSchema,
      inputSchema: AddressParamsSchema,
      url: `${base}/address/:address`,
      use: [deps(blockHeightTrigger), pathParams(), walletApiUnwrap()],
    })

    this.#addressTx = keyFetch.create({
      name: `btcwallet.${chainId}.addressTx`,
      outputSchema: AddressInfoSchema,
      inputSchema: TxHistoryParamsSchema,
      url: `${base}/address/:address`,
      use: [deps(blockHeightTrigger), pathParams()],
    })

    this.nativeBalance = derive({
      name: `btcwallet.${chainId}.nativeBalance`,
      source: this.#addressInfo,
      outputSchema: BalanceOutputSchema,
      use: [transform<AddressInfo, Balance>({
        transform: (r) => ({ amount: Amount.fromRaw(r.balance, decimals, symbol), symbol }),
      })],
    })

    this.transactionHistory = derive<AddressInfo, TransactionsOutput, TxHistoryParams>({
      name: `btcwallet.${chainId}.transactionHistory`,
      source: this.#addressTx,
      outputSchema: TransactionsOutputSchema,
    }).use(
      transform({
        transform: (r: AddressInfo, ctx) => {
          const addr = ctx.params.address ?? ''
          return (r.transactions ?? []).map(tx => ({
            hash: tx.txid,
            from: tx.vin?.[0]?.addresses?.[0] ?? '',
            to: tx.vout?.[0]?.addresses?.[0] ?? '',
            timestamp: (tx.blockTime ?? 0) * 1000,
            status: (tx.confirmations ?? 0) > 0 ? 'confirmed' as const : 'pending' as const,
            action: 'transfer' as const,
            direction: getDirection(tx.vin ?? [], tx.vout ?? [], addr),
            assets: [{ assetType: 'native' as const, value: tx.vout?.[0]?.value ?? '0', symbol, decimals }],
          })) as Transaction[]
        },
      }),
    )
  }
}

export function createBtcwalletProvider(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type === 'btcwallet-v1') return new BtcWalletProvider(entry, chainId)
  return null
}
