/**
 * Tron RPC Provider
 * 
 * 提供 Tron 链的余额和区块高度查询能力。
 */

import { z } from 'zod'
import type { ApiProvider, Balance, Transaction, Direction } from './types'
import type { ParsedApiEntry } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import { fetchJson, observeValueAndInvalidate } from './fetch-json'
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

const TronAccountSchema = z.looseObject({
  balance: z.number().optional(),
  address: z.string().optional(),
})

const TronNowBlockSchema = z.looseObject({
  block_header: z
    .looseObject({
      raw_data: z
        .looseObject({
          number: z.number().optional(),
        })
        .optional(),
    })
    .optional(),
})

const TronTxSchema = z.looseObject({
  txID: z.string(),
  raw_data: z.looseObject({
    contract: z.array(z.looseObject({
      parameter: z.looseObject({
        value: z.looseObject({
          amount: z.number().optional(),
          owner_address: z.string().optional(),
          to_address: z.string().optional(),
        }).optional(),
      }).optional(),
      type: z.string().optional(),
    })).optional(),
    timestamp: z.number().optional(),
  }).optional(),
  ret: z.array(z.looseObject({
    contractRet: z.string().optional(),
  })).optional(),
})

const TronTxListSchema = z.looseObject({
  success: z.boolean(),
  data: z.array(TronTxSchema).optional(),
})

// TRC-20 Token 交易 Schema
const Trc20TxSchema = z.looseObject({
  transaction_id: z.string(),
  token_info: z.looseObject({
    symbol: z.string(),
    address: z.string(),
    decimals: z.number(),
    name: z.string().optional(),
  }),
  block_timestamp: z.number(),
  from: z.string(),
  to: z.string(),
  type: z.string(),
  value: z.string(),
})

const Trc20TxListSchema = z.looseObject({
  success: z.boolean(),
  data: z.array(Trc20TxSchema).optional(),
})

type TronTx = z.infer<typeof TronTxSchema>
type Trc20Tx = z.infer<typeof Trc20TxSchema>

/** 拉取倍数：应对分页陷阱 */
const FETCH_MULTIPLIER = 5

export class TronRpcProvider implements ApiProvider {
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

  private async api<T>(path: string, schema: z.ZodType<T>, body?: unknown, options?: { ttlMs?: number; tags?: string[] }): Promise<T> {
    const url = `${this.endpoint}${path}`

    const headers: Record<string, string> = {}
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json'
    }

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

    const apiKey = pickApiKey(apiKeyString, `trongrid:${this.chainId}`)
    if (apiKey) {
      headers['TRON-PRO-API-KEY'] = apiKey
    }

    const init: RequestInit = body !== undefined
      ? { method: 'POST', headers, body: JSON.stringify(body) }
      : { method: 'GET', headers }

    const json: unknown = await fetchJson(url, init, {
      cacheKey: `tron:${this.type}:${url}:${typeof init.body === 'string' ? init.body : ''}`,
      ttlMs: options?.ttlMs ?? 0,
      tags: options?.ttlMs ? options?.tags : undefined,
    })

    const parsed = schema.safeParse(json)
    if (!parsed.success) {
      throw new Error('Invalid API response')
    }
    return parsed.data
  }

  async getNativeBalance(address: string): Promise<Balance> {
    // Tron 地址需要转换为 hex 格式或使用 base58
    const account = await this.api('/wallet/getaccount', TronAccountSchema, {
      address,
      visible: true,
    }, {
      ttlMs: 60_000,
      tags: [`balance:${this.chainId}:${address}`],
    })

    const balanceSun = account.balance ?? 0
    observeValueAndInvalidate({
      key: `balance:${this.chainId}:${address}`,
      value: balanceSun.toString(),
      invalidateTags: [`txhistory:${this.chainId}:${address}`],
    })

    return {
      amount: Amount.fromRaw(balanceSun.toString(), this.decimals, this.symbol),
      symbol: this.symbol,
    }
  }

  async getBlockHeight(): Promise<bigint> {
    const block = await this.api('/wallet/getnowblock', TronNowBlockSchema, undefined, { ttlMs: 10_000 })
    const height = block.block_header?.raw_data?.number ?? 0
    return BigInt(height)
  }

  async getTransactionHistory(address: string, limit = 20): Promise<Transaction[]> {
    const fetchLimit = limit * FETCH_MULTIPLIER

    const [nativeTxs, trc20Txs] = await Promise.all([
      this.fetchNativeTransactions(address, fetchLimit),
      this.fetchTrc20Transactions(address, fetchLimit),
    ])

    const normalizedAddress = address.toLowerCase()
    const aggregated = this.aggregateByTxId(nativeTxs, trc20Txs, normalizedAddress)

    return aggregated
      .toSorted((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  }

  /**
   * 按 txID 聚合原生交易和 TRC-20 交易
   */
  private aggregateByTxId(
    nativeTxs: TronTx[],
    trc20Txs: Trc20Tx[],
    normalizedAddress: string
  ): Transaction[] {
    // 1. 构建 trc20TxsByTxId
    const trc20TxsByTxId = new Map<string, Trc20Tx[]>()
    for (const ttx of trc20Txs) {
      const txId = ttx.transaction_id.toLowerCase()
      const existing = trc20TxsByTxId.get(txId) ?? []
      existing.push(ttx)
      trc20TxsByTxId.set(txId, existing)
    }

    // 2. 遍历原生交易，聚合生成 Transaction
    const results: Transaction[] = []
    const processedTxIds = new Set<string>()

    for (const ntx of nativeTxs) {
      const txId = ntx.txID.toLowerCase()
      if (processedTxIds.has(txId)) continue
      processedTxIds.add(txId)

      const relatedTrc20Txs = trc20TxsByTxId.get(txId) ?? []
      const tx = this.buildAggregatedTransaction(ntx, relatedTrc20Txs, normalizedAddress)
      if (tx) {
        results.push(tx)
      }
    }

    // 3. 处理孤儿 TRC-20 交易
    for (const [txId, ttxs] of trc20TxsByTxId) {
      if (processedTxIds.has(txId)) continue
      processedTxIds.add(txId)

      const tx = this.buildOrphanTrc20Transaction(ttxs, normalizedAddress)
      results.push(tx)
    }

    return results
  }

  /**
   * 判断原生交易是否应该被过滤（智能过滤 Option A + 安全白名单）
   * 
   * 保留规则（命中任意一条即保留）：
   * 1. 核心系统行为：Freeze/Unfreeze/Vote/Withdraw/AccountCreate/Transfer
   * 2. 资产变动：有 TRC-20 事件 或 TRX amount > 0
   * 3. 异常反馈：交易失败（用户需要看到失败记录）
   * 4. 关键操作：approve 授权（Swap 前的必要步骤）
   * 
   * 丢弃规则：
   * - TriggerSmartContract + 成功 + 0 TRX + 无 TRC-20 + 非 approve → 噪音
   */
  private shouldFilterTransaction(ntx: TronTx, hasTrc20Events: boolean): boolean {
    const contract = ntx.raw_data?.contract?.[0]
    const contractType = contract?.type ?? ''
    const nativeAmount = contract?.parameter?.value?.amount ?? 0
    const txStatus = ntx.ret?.[0]?.contractRet

    // 规则 1：核心系统行为，永不过滤
    const whitelistTypes = [
      'TransferContract',
      'TransferAssetContract',
      'FreezeBalanceContract',
      'FreezeBalanceV2Contract',
      'UnfreezeBalanceContract',
      'UnfreezeBalanceV2Contract',
      'VoteWitnessContract',
      'AccountCreateContract',
      'WithdrawBalanceContract',
      'WithdrawExpireUnfreezeContract',
    ]
    if (whitelistTypes.includes(contractType)) {
      return false
    }

    // 规则 2a：有 TRC-20 事件关联的，不过滤
    if (hasTrc20Events) {
      return false
    }

    // 规则 2b：有原生资产变动的，不过滤
    if (nativeAmount > 0) {
      return false
    }

    // 规则 3：失败交易必须保留（用户需要看到失败记录，避免重复操作）
    if (txStatus !== 'SUCCESS') {
      return false
    }

    // 规则 4：approve 授权操作必须保留（Swap 前的必要步骤）
    if (this.isApproveTransaction(ntx)) {
      return false
    }

    // 丢弃：TriggerSmartContract + 成功 + 0 TRX + 无 TRC-20 + 非 approve → 噪音
    if (contractType === 'TriggerSmartContract') {
      return true
    }

    return false
  }

  /**
   * 检测是否为 approve 授权交易
   * ERC-20/TRC-20 approve 的 MethodID: 0x095ea7b3
   */
  private isApproveTransaction(ntx: TronTx): boolean {
    const contract = ntx.raw_data?.contract?.[0]
    if (contract?.type !== 'TriggerSmartContract') {
      return false
    }

    // Tron 的 data 字段包含合约调用数据
    const data = contract?.parameter?.value?.data
    if (!data || typeof data !== 'string') {
      return false
    }

    // approve(address,uint256) 的 MethodID
    const APPROVE_METHOD_ID = '095ea7b3'
    return data.toLowerCase().startsWith(APPROVE_METHOD_ID)
  }

  /**
   * 构建聚合后的 Transaction
   */
  private buildAggregatedTransaction(
    ntx: TronTx,
    trc20Txs: Trc20Tx[],
    normalizedAddress: string
  ): Transaction | null {
    const contract = ntx.raw_data?.contract?.[0]
    const contractType = contract?.type ?? ''
    const value = contract?.parameter?.value
    const status: Transaction['status'] = ntx.ret?.[0]?.contractRet === 'SUCCESS' ? 'confirmed' : 'failed'
    const hasTokens = trc20Txs.length > 0

    // 智能过滤：无意义的合约调用
    if (this.shouldFilterTransaction(ntx, hasTokens)) {
      return null
    }

    // Action 识别
    let action = this.detectAction(contractType)
    if (action === 'contract' && hasTokens) {
      action = 'transfer'
    }
    // approve 授权操作
    if (action === 'contract' && this.isApproveTransaction(ntx)) {
      action = 'approve'
    }

    // 选择主 token event
    const primaryToken = this.selectPrimaryToken(trc20Txs, normalizedAddress)

    // from/to 与 direction
    let from: string
    let to: string
    if (primaryToken) {
      from = primaryToken.from
      to = primaryToken.to
    } else {
      from = value?.owner_address ?? ''
      to = value?.to_address ?? ''
    }
    const direction = this.getDirection(from, to, normalizedAddress)

    // Assets 构建
    const assets: Transaction['assets'] = []

    // 添加 TRC-20 assets（最多 3 条）
    for (const ttx of trc20Txs.slice(0, 3)) {
      assets.push({
        assetType: 'token' as const,
        value: ttx.value,
        symbol: ttx.token_info.symbol,
        decimals: ttx.token_info.decimals,
        contractAddress: ttx.token_info.address,
        name: ttx.token_info.name,
      })
    }

    // 原生 value > 0 时附加
    const nativeAmount = value?.amount ?? 0
    if (nativeAmount > 0 || assets.length === 0) {
      assets.push({
        assetType: 'native' as const,
        value: nativeAmount.toString(),
        symbol: this.symbol,
        decimals: this.decimals,
      })
    }

    return {
      hash: ntx.txID,
      from,
      to,
      timestamp: ntx.raw_data?.timestamp ?? 0,
      status,
      action,
      direction,
      assets,
    }
  }

  /**
   * 为孤儿 TRC-20 交易构建 Transaction
   */
  private buildOrphanTrc20Transaction(
    trc20Txs: Trc20Tx[],
    normalizedAddress: string
  ): Transaction {
    const primaryToken = this.selectPrimaryToken(trc20Txs, normalizedAddress)!
    const direction = this.getDirection(primaryToken.from, primaryToken.to, normalizedAddress)

    const assets: Transaction['assets'] = trc20Txs.slice(0, 3).map(ttx => ({
      assetType: 'token' as const,
      value: ttx.value,
      symbol: ttx.token_info.symbol,
      decimals: ttx.token_info.decimals,
      contractAddress: ttx.token_info.address,
      name: ttx.token_info.name,
    }))

    return {
      hash: primaryToken.transaction_id,
      from: primaryToken.from,
      to: primaryToken.to,
      timestamp: primaryToken.block_timestamp,
      status: 'confirmed',
      action: 'transfer',
      direction,
      assets,
    }
  }

  /**
   * 选择主 TRC-20 token（优先包含当前地址的、value 最大的）
   */
  private selectPrimaryToken(trc20Txs: Trc20Tx[], normalizedAddress: string): Trc20Tx | null {
    if (trc20Txs.length === 0) return null
    if (trc20Txs.length === 1) return trc20Txs[0]

    const involving = trc20Txs.filter(
      t => t.from.toLowerCase() === normalizedAddress || t.to.toLowerCase() === normalizedAddress
    )
    const candidates = involving.length > 0 ? involving : trc20Txs

    return candidates.reduce((max, t) => {
      const maxVal = BigInt(max.value)
      const tVal = BigInt(t.value)
      return tVal > maxVal ? t : max
    })
  }

  /**
   * 检测 Tron 交易类型
   */
  private detectAction(contractType: string): Transaction['action'] {
    switch (contractType) {
      case 'TransferContract':
      case 'TransferAssetContract':
        return 'transfer'
      case 'TriggerSmartContract':
        return 'contract'
      case 'FreezeBalanceContract':
      case 'FreezeBalanceV2Contract':
      case 'VoteWitnessContract':
        return 'stake'
      case 'UnfreezeBalanceContract':
      case 'UnfreezeBalanceV2Contract':
        return 'unstake'
      case 'WithdrawExpireUnfreezeContract':
        return 'claim'
      default:
        return 'transfer'
    }
  }

  private async fetchNativeTransactions(address: string, limit: number): Promise<TronTx[]> {
    const result = await this.api(
      `/v1/accounts/${address}/transactions?limit=${limit}`,
      TronTxListSchema,
      undefined,
      { ttlMs: 5 * 60_000, tags: [`txhistory:${this.chainId}:${address}`] },
    )
    if (!result.success) {
      throw new Error('Tron API error')
    }
    return result.data ?? []
  }

  private async fetchTrc20Transactions(address: string, limit: number): Promise<Trc20Tx[]> {
    const result = await this.api(
      `/v1/accounts/${address}/transactions/trc20?limit=${limit}`,
      Trc20TxListSchema,
      undefined,
      { ttlMs: 5 * 60_000, tags: [`txhistory:${this.chainId}:${address}`] },
    )
    if (!result.success) {
      throw new Error('Tron API error')
    }
    return result.data ?? []
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
}

/** 工厂函数 */
export function createTronRpcProvider(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type === 'tron-rpc' || entry.type === 'tron-rpc-pro') {
    return new TronRpcProvider(entry, chainId)
  }
  return null
}
