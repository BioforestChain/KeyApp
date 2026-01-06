import { z } from 'zod'
import type { ApiProvider, Balance, Transaction, Direction } from './types'
import type { ParsedApiEntry } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import { fetchJson, observeValueAndInvalidate } from './fetch-json'
import { sha256 } from '@noble/hashes/sha2.js'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js'

/** Base58 alphabet used by Tron */
const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

const BalanceResponseSchema = z.union([
  z.string(),
  z.number().transform((v) => String(v)),
])

const TronHistorySchema = z.looseObject({
  data: z.array(z.unknown()),
  success: z.boolean(),
  fingerprint: z.string().optional(),
})

const TronNativeTxSchema = z.looseObject({
  contractRet: z.string().optional(),
  txID: z.string(),
  blockNumber: z.number().optional(),
  from: z.string(),
  to: z.string(),
  amount: z.number(),
  timestamp: z.number(),
})

const TronTrc20TxSchema = z.looseObject({
  txID: z.string(),
  from: z.string(),
  to: z.string(),
  value: z.string(),
  token_symbol: z.string(),
  token_address: z.string(),
  token_name: z.string(),
  token_decimals: z.number(),
  timestamp: z.number(),
})

type TronNativeTx = z.infer<typeof TronNativeTxSchema>
type TronTrc20Tx = z.infer<typeof TronTrc20TxSchema>

const FETCH_MULTIPLIER = 5

function decodeBase58(str: string): Uint8Array {
  let num = BigInt(0)
  for (const char of str) {
    const index = ALPHABET.indexOf(char)
    if (index === -1) throw new Error('Invalid base58')
    num = num * 58n + BigInt(index)
  }

  const hex = num.toString(16).padStart(50, '0')
  const bytes = new Uint8Array(25)
  for (let i = 0; i < 25; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

function encodeBase58(bytes: Uint8Array): string {
  let num = BigInt(0)
  for (const byte of bytes) {
    num = num * 256n + BigInt(byte)
  }

  let result = ''
  while (num > 0n) {
    const rem = Number(num % 58n)
    num = num / 58n
    result = ALPHABET[rem] + result
  }

  for (const byte of bytes) {
    if (byte === 0) result = ALPHABET[0] + result
    else break
  }

  return result
}

function tronBase58ToHex(address: string): string {
  const decoded = decodeBase58(address)
  const payload = decoded.slice(0, 21)
  return bytesToHex(payload)
}

function tronHexToBase58(hexAddress: string): string {
  const raw = hexAddress.startsWith('0x') ? hexAddress.slice(2) : hexAddress
  const payload = hexToBytes(raw)
  const checksum = sha256(sha256(payload)).slice(0, 4)
  const full = new Uint8Array([...payload, ...checksum])
  return encodeBase58(full)
}

function toTronBase58Address(address: string): string {
  return address.startsWith('T') ? address : tronHexToBase58(address)
}

function getDirection(from: string, to: string, normalizedAddress: string): Direction {
  const fromLower = from.toLowerCase()
  const toLower = to.toLowerCase()

  if (fromLower === normalizedAddress && toLower === normalizedAddress) return 'self'
  if (fromLower === normalizedAddress) return 'out'
  return 'in'
}

export class TronWalletProvider implements ApiProvider {
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
    const hexAddress = address.startsWith('T') ? tronBase58ToHex(address) : address
    const url = new URL(`${this.endpoint}/balance`)
    url.searchParams.set('address', hexAddress)

    const json: unknown = await fetchJson(url.toString(), undefined, {
      cacheKey: `tronwallet:${this.chainId}:balance:${address}`,
      ttlMs: 60_000,
      tags: [`balance:${this.chainId}:${address}`],
    })
    const parsed = BalanceResponseSchema.safeParse(json)
    if (!parsed.success) {
      throw new Error('Invalid API response')
    }

    observeValueAndInvalidate({
      key: `balance:${this.chainId}:${address}`,
      value: parsed.data,
      invalidateTags: [`txhistory:${this.chainId}:${address}`],
    })

    return {
      amount: Amount.fromRaw(parsed.data, this.decimals, this.symbol),
      symbol: this.symbol,
    }
  }

  async getTransactionHistory(address: string, limit = 20): Promise<Transaction[]> {
    const fetchLimit = limit * FETCH_MULTIPLIER
    const hexAddress = address.startsWith('T') ? tronBase58ToHex(address) : address

    const [nativeTxs, trc20Txs] = await Promise.all([
      this.fetchHistory<TronNativeTx>(
        `${this.endpoint}/trans/common/history`,
        hexAddress,
        address,
        fetchLimit,
        TronNativeTxSchema,
        'common',
      ),
      this.fetchHistory<TronTrc20Tx>(
        `${this.endpoint}/trans/trc20/history`,
        hexAddress,
        address,
        fetchLimit,
        TronTrc20TxSchema,
        'trc20',
      ),
    ])

    const normalizedAddress = address.toLowerCase()
    const tokenById = new Map<string, TronTrc20Tx[]>()
    for (const t of trc20Txs) {
      const id = t.txID.toLowerCase()
      const existing = tokenById.get(id) ?? []
      existing.push(t)
      tokenById.set(id, existing)
    }

    const results: Transaction[] = []
    const processed = new Set<string>()

    for (const tx of nativeTxs) {
      const id = tx.txID.toLowerCase()
      if (processed.has(id)) continue
      processed.add(id)

      const relatedTokens = tokenById.get(id) ?? []
      if (relatedTokens.length > 0) {
        const primary = relatedTokens[0]
        const from = toTronBase58Address(primary.from)
        const to = toTronBase58Address(primary.to)
        results.push({
          hash: primary.txID,
          from,
          to,
          timestamp: primary.timestamp,
          status: 'confirmed',
          blockNumber: tx.blockNumber !== undefined ? BigInt(tx.blockNumber) : undefined,
          action: 'transfer',
          direction: getDirection(from, to, normalizedAddress),
          assets: [
            {
              assetType: 'token' as const,
              value: primary.value,
              symbol: primary.token_symbol,
              decimals: primary.token_decimals,
              contractAddress: toTronBase58Address(primary.token_address),
              name: primary.token_name,
            },
          ],
        })
        continue
      }

      const from = toTronBase58Address(tx.from)
      const to = toTronBase58Address(tx.to)
      results.push({
        hash: tx.txID,
        from,
        to,
        timestamp: tx.timestamp,
        status: 'confirmed',
        blockNumber: tx.blockNumber !== undefined ? BigInt(tx.blockNumber) : undefined,
        action: 'transfer',
        direction: getDirection(from, to, normalizedAddress),
        assets: [
          {
            assetType: 'native' as const,
            value: String(tx.amount),
            symbol: this.symbol,
            decimals: this.decimals,
          },
        ],
      })
    }

    for (const tx of trc20Txs) {
      const id = tx.txID.toLowerCase()
      if (processed.has(id)) continue
      processed.add(id)

      const from = toTronBase58Address(tx.from)
      const to = toTronBase58Address(tx.to)
      results.push({
        hash: tx.txID,
        from,
        to,
        timestamp: tx.timestamp,
        status: 'confirmed',
        action: 'transfer',
        direction: getDirection(from, to, normalizedAddress),
        assets: [
          {
            assetType: 'token' as const,
            value: tx.value,
            symbol: tx.token_symbol,
            decimals: tx.token_decimals,
            contractAddress: toTronBase58Address(tx.token_address),
            name: tx.token_name,
          },
        ],
      })
    }

    return results
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  }

  private async fetchHistory<T>(
    url: string,
    hexAddress: string,
    tagAddress: string,
    limit: number,
    itemSchema: z.ZodType<T>,
    kind: string,
  ): Promise<T[]> {
    const json: unknown = await fetchJson(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: hexAddress, limit }),
      },
      {
        cacheKey: `tronwallet:${this.chainId}:${kind}:${hexAddress}:${limit}`,
        ttlMs: 5 * 60_000,
        tags: [`txhistory:${this.chainId}:${tagAddress}`],
      },
    )

    const parsed = TronHistorySchema.safeParse(json)
    if (!parsed.success || !parsed.data.success) {
      throw new Error('Upstream API error')
    }

    return parsed.data.data
      .map((item) => itemSchema.safeParse(item))
      .filter((r): r is z.SafeParseSuccess<T> => r.success)
      .map((r) => r.data)
  }
}

export function createTronwalletProvider(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type === 'tronwallet-v1') {
    return new TronWalletProvider(entry, chainId)
  }
  return null
}
