/**
 * Etherscan API Provider
 * 
 * 提供 EVM 链的交易历史查询能力。
 * 支持 Etherscan/Blockscout API 格式。
 * 同时获取原生交易 (txlist) 和代币交易 (tokentx)。
 */

import { z } from 'zod'
import type { ApiProvider, Transaction, Direction, Action } from './types'
import type { ParsedApiEntry } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config'
import { fetchJson } from './fetch-json'
import { pickApiKey } from './api-key-picker'

function readEnvValue(key: string): string | undefined {
  // Node/Vitest 环境：允许在运行时通过 process.env 覆盖（保证测试可控）
  try {
    const fromProcess = (process as any)?.env?.[key]
    if (typeof fromProcess === 'string' && fromProcess.length > 0) {
      return fromProcess
    }
  } catch {
    // ignore
  }

  // Vite 编译时注入：__API_KEYS__ 是可动态索引的对象字面量
  if (typeof __API_KEYS__ !== 'undefined') {
    const apiKey = __API_KEYS__[key]
    if (typeof apiKey === 'string' && apiKey.length > 0) {
      return apiKey
    }
  }

  return undefined
}

/** EVM Chain IDs */
const EVM_CHAIN_IDS: Record<string, number> = {
  ethereum: 1,
  binance: 56,
  'ethereum-sepolia': 11155111,
  'bsc-testnet': 97,
}

// ========== Zod Schemas for API Response ==========

const NativeTxSchema = z.looseObject({
  hash: z.string(),
  from: z.string(),
  to: z.string(),
  value: z.string(),
  timeStamp: z.string(),
  isError: z.string(),
  blockNumber: z.string(),
  input: z.string().optional(),
  methodId: z.string().optional(),
  functionName: z.string().optional(),
})

const TokenTxSchema = z.looseObject({
  hash: z.string(),
  from: z.string(),
  to: z.string(),
  value: z.string(),
  timeStamp: z.string(),
  blockNumber: z.string(),
  tokenSymbol: z.string(),
  tokenName: z.string(),
  tokenDecimal: z.string(),
  contractAddress: z.string(),
})

const ApiResponseSchema = z.looseObject({
  status: z.string(),
  message: z.string(),
  result: z.unknown(),
})

type NativeTx = z.infer<typeof NativeTxSchema>
type TokenTx = z.infer<typeof TokenTxSchema>

/** 拉取倍数：为了应对分页陷阱，拉取 limit * K 条再聚合 */
const FETCH_MULTIPLIER = 5

export class EtherscanProvider implements ApiProvider {
  readonly type: string
  readonly endpoint: string
  readonly config?: Record<string, unknown>
  
  private readonly chainId: string
  private readonly evmChainId: number
  private readonly symbol: string
  private readonly decimals: number

  constructor(entry: ParsedApiEntry, chainId: string) {
    this.type = entry.type
    this.endpoint = entry.endpoint
    this.config = entry.config
    this.chainId = chainId
    this.evmChainId = EVM_CHAIN_IDS[chainId] ?? 1
    this.symbol = chainConfigService.getSymbol(chainId)
    this.decimals = chainConfigService.getDecimals(chainId)
  }

  get supportsTransactionHistory() {
    return true
  }

  get supportsNativeBalance() {
    return true
  }

  private getApiKey(): string | undefined {
    // 支持两种 API key 配置方式：
    // 1. apiKey: 直接配置（支持逗号分隔多个）
    // 2. apiKeyEnv: 从环境变量读取（支持逗号分隔多个）
    let apiKeyString: string | undefined
    const apiKeyDirect = this.config?.apiKey
    if (typeof apiKeyDirect === 'string' && apiKeyDirect.length > 0) {
      apiKeyString = apiKeyDirect
    } else {
      const apiKeyEnv = this.config?.apiKeyEnv
      if (typeof apiKeyEnv === 'string' && apiKeyEnv.length > 0) {
        apiKeyString = readEnvValue(apiKeyEnv)
      }
    }
    return pickApiKey(apiKeyString, `etherscan:${this.chainId}`)
  }

  async getNativeBalance(address: string): Promise<Balance> {
    const params = new URLSearchParams({
      module: 'account',
      action: 'balance',
      address,
    })

    // Etherscan v2 统一 API 需要 chainid
    if (this.endpoint.includes('etherscan.io/v2')) {
      params.set('chainid', this.evmChainId.toString())
    }

    const apiKey = this.getApiKey()
    if (apiKey) {
      params.set('apikey', apiKey)
    }

    const url = `${this.endpoint}?${params.toString()}`
    const json: unknown = await fetchJson(url, undefined, {
      cacheKey: `balance:${this.chainId}:${address}`,
      ttlMs: 30_000, // 30s cache
      tags: [`balance:${this.chainId}:${address}`],
    })

    const parsed = ApiResponseSchema.safeParse(json)
    if (!parsed.success) {
      throw new Error('Invalid API response for balance')
    }

    if (parsed.data.status !== '1') {
      throw new Error(`API error: ${parsed.data.message}`)
    }

    const result = parsed.data.result
    if (typeof result !== 'string') {
      throw new Error('Invalid balance result')
    }

    return {
      amount: Amount.fromRaw(result, this.decimals, this.symbol),
      symbol: this.symbol,
    }
  }

  async getTransactionHistory(address: string, limit = 20): Promise<Transaction[]> {
    const fetchLimit = limit * FETCH_MULTIPLIER

    const [nativeTxs, tokenTxs] = await Promise.all([
      this.fetchNativeTransactions(address, fetchLimit),
      this.fetchTokenTransactions(address, fetchLimit),
    ])

    const normalizedAddress = address.toLowerCase()
    const aggregated = this.aggregateByHash(nativeTxs, tokenTxs, normalizedAddress)

    return aggregated
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  }

  /**
   * 按 hash 聚合 txlist + tokentx
   * - txlist 为主时间轴（Source of Truth for status/timestamp）
   * - tokentx 按 hash 贴合到对应 native tx
   * - 优先展示 token 资产，避免"发送 0 ETH"
   */
  private aggregateByHash(
    nativeTxs: NativeTx[],
    tokenTxs: TokenTx[],
    normalizedAddress: string
  ): Transaction[] {
    // 1. 构建 tokenTxsByHash
    const tokenTxsByHash = new Map<string, TokenTx[]>()
    for (const ttx of tokenTxs) {
      const hash = ttx.hash.toLowerCase()
      const existing = tokenTxsByHash.get(hash) ?? []
      existing.push(ttx)
      tokenTxsByHash.set(hash, existing)
    }

    // 2. 遍历 nativeTxs，聚合生成 Transaction
    const results: Transaction[] = []
    const processedHashes = new Set<string>()

    for (const ntx of nativeTxs) {
      const hash = ntx.hash.toLowerCase()
      if (processedHashes.has(hash)) continue
      processedHashes.add(hash)

      const relatedTokenTxs = tokenTxsByHash.get(hash) ?? []
      const tx = this.buildAggregatedTransaction(ntx, relatedTokenTxs, normalizedAddress)
      results.push(tx)
    }

    // 3. 处理"孤儿" token txs（没有对应 native tx 的 token 转账）
    // 这种情况可能发生在：native tx 被挤出窗口，但 token tx 仍在窗口内
    for (const [hash, ttxs] of tokenTxsByHash) {
      if (processedHashes.has(hash)) continue
      processedHashes.add(hash)

      const tx = this.buildOrphanTokenTransaction(ttxs, normalizedAddress)
      results.push(tx)
    }

    return results
  }

  /**
   * 为"孤儿" token txs 构建 Transaction（没有对应的 native tx）
   */
  private buildOrphanTokenTransaction(
    tokenTxs: TokenTx[],
    normalizedAddress: string
  ): Transaction {
    const primaryToken = this.selectPrimaryToken(tokenTxs, normalizedAddress)!
    const direction = this.getDirection(primaryToken.from, primaryToken.to, normalizedAddress)

    const assets: Transaction['assets'] = tokenTxs.slice(0, 3).map(ttx => ({
      assetType: 'token' as const,
      value: ttx.value,
      symbol: ttx.tokenSymbol,
      decimals: parseInt(ttx.tokenDecimal, 10),
      contractAddress: ttx.contractAddress,
      name: ttx.tokenName,
    }))

    return {
      hash: primaryToken.hash,
      from: primaryToken.from,
      to: primaryToken.to,
      timestamp: parseInt(primaryToken.timeStamp, 10) * 1000,
      status: 'confirmed', // 没有 native tx 无法知道 isError，假定成功
      blockNumber: BigInt(primaryToken.blockNumber),
      action: 'transfer',
      direction,
      assets,
    }
  }

  /**
   * 构建聚合后的 Transaction
   */
  private buildAggregatedTransaction(
    ntx: NativeTx,
    tokenTxs: TokenTx[],
    normalizedAddress: string
  ): Transaction {
    const hasTokens = tokenTxs.length > 0
    const isContractCall = this.isContractCall(ntx)
    const methodId = isContractCall ? this.getMethodId(ntx) : null
    
    // Action: methodId 识别 > 有 token 则 transfer > 合约调用 > 普通转账
    let action = this.detectAction(ntx)
    if (action === 'contract' && hasTokens) {
      // 有 token 事件但方法未识别：视为 transfer
      action = 'transfer'
    }

    // 选择主 token event（优先包含当前地址参与的、value 最大的）
    const primaryToken = this.selectPrimaryToken(tokenTxs, normalizedAddress)
    
    // from/to 与 direction：有 token 时用 token 的对手方
    let from: string
    let to: string
    if (primaryToken) {
      from = primaryToken.from
      to = primaryToken.to
    } else {
      from = ntx.from
      to = ntx.to
    }
    const direction = this.getDirection(from, to, normalizedAddress)

    // Assets：token 优先，native value > 0 时也附加
    const assets: Transaction['assets'] = []
    
    // 添加 token assets（最多 3 条）
    for (const ttx of tokenTxs.slice(0, 3)) {
      assets.push({
        assetType: 'token' as const,
        value: ttx.value,
        symbol: ttx.tokenSymbol,
        decimals: parseInt(ttx.tokenDecimal, 10),
        contractAddress: ttx.contractAddress,
        name: ttx.tokenName,
      })
    }
    
    // native value > 0 时附加（或无 token 时作为主资产）
    if (ntx.value !== '0' || assets.length === 0) {
      assets.push({
        assetType: 'native' as const,
        value: ntx.value,
        symbol: this.symbol,
        decimals: this.decimals,
      })
    }

    // 对 assets 排序：token 在前，native 在后；swap 场景下 in 的 token 优先
    if (action === 'swap' && assets.length > 1) {
      assets.sort((a, b) => {
        // token 优先
        if (a.assetType === 'token' && b.assetType !== 'token') return -1
        if (a.assetType !== 'token' && b.assetType === 'token') return 1
        // 同为 token 时，in 的优先（基于 primaryToken 方向）
        return 0
      })
    }

    return {
      hash: ntx.hash,
      from,
      to,
      timestamp: parseInt(ntx.timeStamp, 10) * 1000,
      status: ntx.isError === '0' ? 'confirmed' : 'failed',
      blockNumber: BigInt(ntx.blockNumber),
      action,
      direction,
      assets,
      contract: isContractCall ? {
        address: ntx.to,
        method: ntx.functionName ?? undefined,
        methodId: methodId ?? undefined,
      } : undefined,
    }
  }

  /**
   * 选择主 token event（优先包含当前地址的、value 最大的）
   */
  private selectPrimaryToken(tokenTxs: TokenTx[], normalizedAddress: string): TokenTx | null {
    if (tokenTxs.length === 0) return null
    if (tokenTxs.length === 1) return tokenTxs[0]

    // 优先选择包含当前地址的（from 或 to）
    const involving = tokenTxs.filter(
      t => t.from.toLowerCase() === normalizedAddress || t.to.toLowerCase() === normalizedAddress
    )
    const candidates = involving.length > 0 ? involving : tokenTxs

    // 按 value 绝对值排序，取最大的
    return candidates.reduce((max, t) => {
      const maxVal = BigInt(max.value)
      const tVal = BigInt(t.value)
      return tVal > maxVal ? t : max
    })
  }

  private async fetchNativeTransactions(address: string, limit: number): Promise<NativeTx[]> {
    const params = this.buildParams('txlist', address, limit)
    const data = await this.fetchApi(params, `etherscan:${this.type}:txlist:${address}:${limit}`)

    return data
      .map(item => NativeTxSchema.safeParse(item))
      .filter((r): r is z.SafeParseSuccess<NativeTx> => r.success)
      .map(r => r.data)
  }

  private async fetchTokenTransactions(address: string, limit: number): Promise<TokenTx[]> {
    const params = this.buildParams('tokentx', address, limit)
    const data = await this.fetchApi(params, `etherscan:${this.type}:tokentx:${address}:${limit}`)

    return data
      .map(item => TokenTxSchema.safeParse(item))
      .filter((r): r is z.SafeParseSuccess<TokenTx> => r.success)
      .map(r => r.data)
  }

  private buildParams(action: string, address: string, limit: number): URLSearchParams {
    const params = new URLSearchParams({
      module: 'account',
      action,
      address,
      startblock: '0',
      endblock: '99999999',
      page: '1',
      offset: limit.toString(),
      sort: 'desc',
    })
    
    // Etherscan v2 统一 API 需要 chainid
    if (this.endpoint.includes('etherscan.io/v2')) {
      params.set('chainid', this.evmChainId.toString())
    }
    
    const apiKey = this.getApiKey()
    if (apiKey) {
      params.set('apikey', apiKey)
    }

    return params
  }

  private async fetchApi(params: URLSearchParams, cacheKey: string): Promise<unknown[]> {
    const url = `${this.endpoint}?${params.toString()}`
    const address = params.get('address') ?? ''
    const json: unknown = await fetchJson(url, undefined, {
      cacheKey,
      ttlMs: 5 * 60_000,
      tags: address ? [`txhistory:${this.chainId}:${address}`] : undefined,
    })

    const parsed = ApiResponseSchema.safeParse(json)
    if (!parsed.success) {
      throw new Error('Invalid API response')
    }

    const status = parsed.data.status
    const message = parsed.data.message.toLowerCase()

    if (status === '0' && message.includes('no transactions')) {
      return []
    }
    if (status !== '1') {
      throw new Error('Upstream API error')
    }

    const result = parsed.data.result
    if (!Array.isArray(result)) {
      throw new Error('Invalid API result')
    }

    return result
  }

  private getDirection(from: string, to: string, address: string): Direction {
    const fromLower = from.toLowerCase()
    const toLower = to.toLowerCase()
    
    if (fromLower === address && toLower === address) {
      return 'self'
    }
    if (fromLower === address) {
      return 'out'
    }
    return 'in'
  }

  private detectAction(tx: NativeTx): Action {
    // 有 input data 表示合约调用
    if (this.isContractCall(tx)) {
      const methodId = this.getMethodId(tx)
      if (!methodId) return 'contract'
      
      // 常见方法签名
      const methodMap: Record<string, Action> = {
        '0xa9059cbb': 'transfer',   // transfer(address,uint256)
        '0x095ea7b3': 'approve',    // approve(address,uint256)
        '0x23b872dd': 'transfer',   // transferFrom(address,address,uint256)
        '0x38ed1739': 'swap',       // swapExactTokensForTokens
        '0x7ff36ab5': 'swap',       // swapExactETHForTokens
        '0x18cbafe5': 'swap',       // swapExactTokensForETH
        '0xa694fc3a': 'stake',      // stake(uint256)
        '0x2e1a7d4d': 'unstake',    // withdraw(uint256)
        '0x3ccfd60b': 'claim',      // withdraw()
        '0x4e71d92d': 'claim',      // claim()
        '0x40c10f19': 'mint',       // mint(address,uint256)
        '0x42966c68': 'burn',       // burn(uint256)
      }
      
      return methodMap[methodId] ?? 'contract'
    }
    
    // 普通转账
    return 'transfer'
  }

  private isContractCall(tx: NativeTx): boolean {
    const input = tx.input ?? ''
    return input !== '0x' && input !== '0x0' && input !== '0x00' && input.length > 2
  }

  private getMethodId(tx: NativeTx): string | null {
    const rawMethodId = (tx.methodId ?? '').toLowerCase()

    // Some APIs return methodId = "0x" even when input contains the real selector.
    if (rawMethodId && rawMethodId !== '0x' && rawMethodId !== '0x0' && rawMethodId !== '0x00') {
      if (rawMethodId.startsWith('0x') && rawMethodId.length === 10) return rawMethodId
      if (!rawMethodId.startsWith('0x') && rawMethodId.length === 8) return `0x${rawMethodId}`
    }

    const input = (tx.input ?? '').toLowerCase()
    if (input.startsWith('0x') && input.length >= 10) {
      return input.slice(0, 10)
    }
    if (!input.startsWith('0x') && input.length >= 8) {
      return `0x${input.slice(0, 8)}`
    }

    return null
  }
}

/** 工厂函数 */
export function createEtherscanProvider(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  // 匹配 etherscan-*, blockscout-*, 或 *scan-* 类型
  if (entry.type.includes('etherscan') || entry.type.includes('blockscout') || entry.type.includes('scan')) {
    return new EtherscanProvider(entry, chainId)
  }
  return null
}
