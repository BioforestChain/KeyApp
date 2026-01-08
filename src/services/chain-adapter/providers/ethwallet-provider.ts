import { z } from 'zod'
import type { ApiProvider, Balance, Transaction, Direction, Action } from './types'
import type { ParsedApiEntry } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import { fetchJson, observeValueAndInvalidate } from './fetch-json'

const WalletApiBalanceSchema = z.looseObject({
  success: z.boolean(),
  result: z.union([z.string(), z.number().transform((v) => String(v))]),
})

const WalletApiHistorySchema = z.looseObject({
  success: z.boolean(),
  result: z.looseObject({
    status: z.string().optional(),
    result: z.array(z.unknown()),
  }),
})

const NativeTxSchema = z.looseObject({
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
})

const TokenTxSchema = z.looseObject({
  blockNumber: z.string(),
  timeStamp: z.string(),
  hash: z.string(),
  from: z.string(),
  to: z.string(),
  value: z.string(),
  tokenName: z.string(),
  tokenSymbol: z.string(),
  tokenDecimal: z.string(),
  contractAddress: z.string(),
})

type NativeTx = z.infer<typeof NativeTxSchema>
type TokenTx = z.infer<typeof TokenTxSchema>

const FETCH_MULTIPLIER = 5

function getDirection(from: string, to: string, normalizedAddress: string): Direction {
  const fromLower = from.toLowerCase()
  const toLower = to.toLowerCase()

  if (fromLower === normalizedAddress && toLower === normalizedAddress) return 'self'
  if (fromLower === normalizedAddress) return 'out'
  return 'in'
}

function detectAction(tx: NativeTx): Action {
  const value = tx.value
  if (value && value !== '0') return 'transfer'
  return 'contract'
}

function selectPrimaryToken(tokenTxs: TokenTx[], normalizedAddress: string): TokenTx | null {
  if (tokenTxs.length === 0) return null
  if (tokenTxs.length === 1) return tokenTxs[0]

  const involving = tokenTxs.filter(
    (t) => t.from.toLowerCase() === normalizedAddress || t.to.toLowerCase() === normalizedAddress,
  )
  const candidates = involving.length > 0 ? involving : tokenTxs

  return candidates.reduce((max, t) => {
    const maxVal = BigInt(max.value)
    const tVal = BigInt(t.value)
    return tVal > maxVal ? t : max
  })
}

export class EthWalletProvider implements ApiProvider {
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
    const url = new URL(`${this.endpoint}/balance`)
    url.searchParams.set('address', address)

    const json: unknown = await fetchJson(url.toString(), undefined, {
      cacheKey: `ethwallet:${this.chainId}:balance:${address}`,
      ttlMs: 60_000,
      tags: [`balance:${this.chainId}:${address}`],
    })
    const parsed = WalletApiBalanceSchema.safeParse(json)
    if (!parsed.success || !parsed.data.success) {
      throw new Error('Invalid API response')
    }

    const balanceValue = parsed.data.result

    observeValueAndInvalidate({
      key: `balance:${this.chainId}:${address}`,
      value: balanceValue,
      invalidateTags: [`txhistory:${this.chainId}:${address}`],
    })

    return {
      amount: Amount.fromRaw(balanceValue, this.decimals, this.symbol),
      symbol: this.symbol,
    }
  }

  async getTransactionHistory(address: string, limit = 20): Promise<Transaction[]> {
    const fetchLimit = limit * FETCH_MULTIPLIER

    const [nativeTxs, tokenTxs] = await Promise.all([
      this.fetchHistory<NativeTx>(`${this.endpoint}/trans/normal/history`, address, fetchLimit, NativeTxSchema, 'normal'),
      this.fetchHistory<TokenTx>(`${this.endpoint}/trans/erc20/history`, address, fetchLimit, TokenTxSchema, 'erc20'),
    ])

    const normalizedAddress = address.toLowerCase()
    const tokenTxsByHash = new Map<string, TokenTx[]>()
    for (const t of tokenTxs) {
      const hash = t.hash.toLowerCase()
      const existing = tokenTxsByHash.get(hash) ?? []
      existing.push(t)
      tokenTxsByHash.set(hash, existing)
    }

    const results: Transaction[] = []
    const processed = new Set<string>()

    for (const ntx of nativeTxs) {
      const hash = ntx.hash.toLowerCase()
      if (processed.has(hash)) continue
      processed.add(hash)

      const relatedTokens = tokenTxsByHash.get(hash) ?? []
      const primaryToken = selectPrimaryToken(relatedTokens, normalizedAddress)

      if (primaryToken) {
        results.push({
          hash: primaryToken.hash,
          from: primaryToken.from,
          to: primaryToken.to,
          timestamp: Number(primaryToken.timeStamp) * 1000,
          status: 'confirmed',
          blockNumber: BigInt(primaryToken.blockNumber),
          action: 'transfer',
          direction: getDirection(primaryToken.from, primaryToken.to, normalizedAddress),
          assets: [
            {
              assetType: 'token' as const,
              value: primaryToken.value,
              symbol: primaryToken.tokenSymbol,
              decimals: parseInt(primaryToken.tokenDecimal, 10),
              contractAddress: primaryToken.contractAddress,
              name: primaryToken.tokenName,
            },
          ],
          contract: {
            address: ntx.to,
            method: ntx.functionName ?? undefined,
            methodId: ntx.methodId ?? undefined,
          },
        })
        continue
      }

      results.push({
        hash: ntx.hash,
        from: ntx.from,
        to: ntx.to,
        timestamp: Number(ntx.timeStamp) * 1000,
        status: ntx.isError === '1' ? 'failed' : 'confirmed',
        blockNumber: BigInt(ntx.blockNumber),
        action: detectAction(ntx),
        direction: getDirection(ntx.from, ntx.to, normalizedAddress),
        assets: [
          {
            assetType: 'native' as const,
            value: ntx.value,
            symbol: this.symbol,
            decimals: this.decimals,
          },
        ],
        contract: ntx.value === '0' ? {
          address: ntx.to,
          method: ntx.functionName ?? undefined,
          methodId: ntx.methodId ?? undefined,
        } : undefined,
      })
    }

    for (const ttx of tokenTxs) {
      const hash = ttx.hash.toLowerCase()
      if (processed.has(hash)) continue
      processed.add(hash)

      results.push({
        hash: ttx.hash,
        from: ttx.from,
        to: ttx.to,
        timestamp: Number(ttx.timeStamp) * 1000,
        status: 'confirmed',
        blockNumber: BigInt(ttx.blockNumber),
        action: 'transfer',
        direction: getDirection(ttx.from, ttx.to, normalizedAddress),
        assets: [
          {
            assetType: 'token' as const,
            value: ttx.value,
            symbol: ttx.tokenSymbol,
            decimals: parseInt(ttx.tokenDecimal, 10),
            contractAddress: ttx.contractAddress,
            name: ttx.tokenName,
          },
        ],
      })
    }

    return results
      .toSorted((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  }

  private async fetchHistory<T>(
    url: string,
    address: string,
    limit: number,
    itemSchema: z.ZodType<T>,
    kind: string,
  ): Promise<T[]> {
    const json: unknown = await fetchJson(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, page: 1, offset: limit }),
      },
      {
        cacheKey: `ethwallet:${this.chainId}:${kind}:${address}:${limit}`,
        ttlMs: 5 * 60_000,
        tags: [`txhistory:${this.chainId}:${address}`],
      },
    )

    const parsed = WalletApiHistorySchema.safeParse(json)
    if (!parsed.success || !parsed.data.success) {
      throw new Error('Invalid API response')
    }

    return parsed.data.result.result
      .map((item) => itemSchema.safeParse(item))
      .filter((r): r is z.SafeParseSuccess<T> => r.success)
      .map((r) => r.data)
  }
}

export function createEthwalletProvider(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type === 'ethwallet-v1') {
    return new EthWalletProvider(entry, chainId)
  }
  return null
}
