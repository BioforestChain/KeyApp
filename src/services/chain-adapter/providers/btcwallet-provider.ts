import { z } from 'zod'
import type { ApiProvider, Balance, Transaction, Direction } from './types'
import type { ParsedApiEntry } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import { fetchJson, observeValueAndInvalidate } from './fetch-json'

const BlockbookErrorSchema = z.looseObject({
  error: z.string(),
})

const BlockbookVinSchema = z.looseObject({
  addresses: z.array(z.string()),
  value: z.string(),
})

const BlockbookVoutSchema = z.looseObject({
  addresses: z.array(z.string()),
  value: z.string(),
})

const BlockbookTxSchema = z.looseObject({
  txid: z.string(),
  blockHeight: z.number(),
  confirmations: z.number(),
  blockTime: z.number(),
  vin: z.array(BlockbookVinSchema),
  vout: z.array(BlockbookVoutSchema),
  fees: z.string().optional(),
})

const BlockbookAddressInfoSchema = z.looseObject({
  address: z.string().optional(),
  balance: z.string(),
  unconfirmedBalance: z.string().optional(),
  txs: z.number().optional(),
  transactions: z.array(BlockbookTxSchema).optional(),
})

function sumValues(items: Array<{ addresses: string[]; value: string }>, address: string): bigint {
  let sum = 0n
  for (const item of items) {
    if (item.addresses.some((a) => a === address)) {
      sum += BigInt(item.value)
    }
  }
  return sum
}

function getDirection(net: bigint): Direction {
  if (net > 0n) return 'in'
  if (net < 0n) return 'out'
  return 'self'
}

export class BtcWalletProvider implements ApiProvider {
  readonly type: string
  readonly endpoint: string
  readonly config?: Record<string, unknown>

  private readonly chainId: string
  private readonly symbol: string
  private readonly decimals: number

  constructor(entry: ParsedApiEntry, chainId: string) {
    this.type = entry.type
    this.endpoint = entry.endpoint
    this.config = entry.config
    this.chainId = chainId
    this.symbol = chainConfigService.getSymbol(chainId)
    this.decimals = chainConfigService.getDecimals(chainId)
  }

  get supportsNativeBalance() {
    return true
  }

  get supportsTransactionHistory() {
    return true
  }

  async getNativeBalance(address: string): Promise<Balance> {
    const info = await this.proxyGet(`/api/v2/address/${address}`, BlockbookAddressInfoSchema, {
      cacheKey: `btcwallet:${this.chainId}:address:${address}`,
      ttlMs: 60_000,
      tags: [`balance:${this.chainId}:${address}`],
    })

    const confirmed = BigInt(info.balance)
    const unconfirmed = BigInt(info.unconfirmedBalance ?? '0')
    const total = confirmed + unconfirmed

    observeValueAndInvalidate({
      key: `balance:${this.chainId}:${address}`,
      value: total.toString(),
      invalidateTags: [`txhistory:${this.chainId}:${address}`],
    })

    return {
      amount: Amount.fromRaw(total.toString(), this.decimals, this.symbol),
      symbol: this.symbol,
    }
  }

  async getTransactionHistory(address: string, limit = 20): Promise<Transaction[]> {
    const info = await this.proxyGet(
      `/api/v2/address/${address}?details=txs&page=1&pageSize=${limit}`,
      BlockbookAddressInfoSchema,
      {
        cacheKey: `btcwallet:${this.chainId}:txs:${address}:${limit}`,
        ttlMs: 5 * 60_000,
        tags: [`txhistory:${this.chainId}:${address}`],
      },
    )

    const txs = info.transactions ?? []
    const results: Transaction[] = txs.map((tx) => {
      const inSum = sumValues(tx.vin, address)
      const outSum = sumValues(tx.vout, address)
      const net = outSum - inSum
      const direction = getDirection(net)
      const value = net < 0n ? (-net).toString() : net.toString()

      const from = direction === 'in'
        ? (tx.vin[0]?.addresses?.[0] ?? '')
        : address

      const toCandidate = tx.vout
        .flatMap((v) => v.addresses)
        .find((a) => a !== address)
      const to = direction === 'out'
        ? (toCandidate ?? address)
        : address

      return {
        hash: tx.txid,
        from,
        to,
        timestamp: tx.blockTime * 1000,
        status: tx.confirmations > 0 ? 'confirmed' : 'pending',
        blockNumber: tx.blockHeight > 0 ? BigInt(tx.blockHeight) : undefined,
        action: 'transfer',
        direction,
        assets: [
          {
            assetType: 'native' as const,
            value,
            symbol: this.symbol,
            decimals: this.decimals,
          },
        ],
      }
    })

    return results.sort((a, b) => b.timestamp - a.timestamp)
  }

  private async proxyGet<T>(
    path: string,
    schema: z.ZodType<T>,
    options?: { cacheKey?: string; ttlMs?: number; tags?: string[] },
  ): Promise<T> {
    const json: unknown = await fetchJson(
      this.endpoint,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: path, method: 'GET' }),
      },
      {
        cacheKey: options?.cacheKey,
        ttlMs: options?.ttlMs,
        tags: options?.tags,
      },
    )

    const err = BlockbookErrorSchema.safeParse(json)
    if (err.success && err.data.error) {
      throw new Error(err.data.error)
    }

    const parsed = schema.safeParse(json)
    if (!parsed.success) {
      throw new Error('Invalid API response')
    }
    return parsed.data
  }
}

export function createBtcwalletProvider(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type === 'btcwallet-v1') {
    return new BtcWalletProvider(entry, chainId)
  }
  return null
}
