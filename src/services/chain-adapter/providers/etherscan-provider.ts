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

  async getTransactionHistory(address: string, limit = 20): Promise<Transaction[]> {
    try {
      // 并行获取原生交易和代币交易
      const [nativeTxs, tokenTxs] = await Promise.all([
        this.fetchNativeTransactions(address, limit),
        this.fetchTokenTransactions(address, limit),
      ])

      // 转换并合并
      const normalizedAddress = address.toLowerCase()
      const nativeResults = nativeTxs.map(tx => this.convertNativeTx(tx, normalizedAddress))
      const tokenResults = tokenTxs.map(tx => this.convertTokenTx(tx, normalizedAddress))

      // 合并、按时间排序、去重、限制数量
      const merged = [...nativeResults, ...tokenResults]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit)

      return merged
    } catch (error) {
      console.warn('[EtherscanProvider] Error fetching transactions:', error)
      return []
    }
  }

  private async fetchNativeTransactions(address: string, limit: number): Promise<NativeTx[]> {
    const params = this.buildParams('txlist', address, limit)
    const response = await this.fetchApi(params)
    
    if (!response.success || !Array.isArray(response.data)) {
      return []
    }

    return response.data
      .map(item => NativeTxSchema.safeParse(item))
      .filter((r): r is z.SafeParseSuccess<NativeTx> => r.success)
      .map(r => r.data)
  }

  private async fetchTokenTransactions(address: string, limit: number): Promise<TokenTx[]> {
    const params = this.buildParams('tokentx', address, limit)
    const response = await this.fetchApi(params)
    
    if (!response.success || !Array.isArray(response.data)) {
      return []
    }

    return response.data
      .map(item => TokenTxSchema.safeParse(item))
      .filter((r): r is z.SafeParseSuccess<TokenTx> => r.success)
      .map(r => r.data)
  }

  private buildParams(action: string, address: string, limit: number): URLSearchParams {
    const apiKey = (this.config?.apiKey as string) ?? ''
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
    
    if (apiKey) {
      params.set('apikey', apiKey)
    }

    return params
  }

  private async fetchApi(params: URLSearchParams): Promise<{ success: boolean; data: unknown[] }> {
    try {
      const url = `${this.endpoint}?${params.toString()}`
      const response = await fetch(url)
      
      if (!response.ok) {
        console.warn(`[EtherscanProvider] HTTP ${response.status}`)
        return { success: false, data: [] }
      }

      const json: unknown = await response.json()
      const parsed = ApiResponseSchema.safeParse(json)
      
      if (!parsed.success || parsed.data.status !== '1') {
        return { success: false, data: [] }
      }

      const result = parsed.data.result
      if (!Array.isArray(result)) {
        return { success: false, data: [] }
      }

      return { success: true, data: result }
    } catch {
      return { success: false, data: [] }
    }
  }

  private convertNativeTx(tx: NativeTx, normalizedAddress: string): Transaction {
    const direction = this.getDirection(tx.from, tx.to, normalizedAddress)
    const action = this.detectAction(tx)
    const hasValue = tx.value !== '0'
    
    return {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      timestamp: parseInt(tx.timeStamp, 10) * 1000,
      status: tx.isError === '0' ? 'confirmed' : 'failed',
      blockNumber: BigInt(tx.blockNumber),
      action,
      direction,
      assets: [{
        assetType: 'native' as const,
        value: tx.value,
        symbol: this.symbol,
        decimals: this.decimals,
      }],
      contract: action === 'contract' ? {
        address: tx.to,
        method: tx.functionName ?? undefined,
        methodId: tx.methodId ?? undefined,
      } : undefined,
    }
  }

  private convertTokenTx(tx: TokenTx, normalizedAddress: string): Transaction {
    const direction = this.getDirection(tx.from, tx.to, normalizedAddress)
    
    return {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      timestamp: parseInt(tx.timeStamp, 10) * 1000,
      status: 'confirmed',
      blockNumber: BigInt(tx.blockNumber),
      action: 'transfer',
      direction,
      assets: [{
        assetType: 'token' as const,
        value: tx.value,
        symbol: tx.tokenSymbol,
        decimals: parseInt(tx.tokenDecimal, 10),
        contractAddress: tx.contractAddress,
        name: tx.tokenName,
      }],
    }
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
    if (tx.input && tx.input !== '0x' && tx.input.length > 2) {
      // 尝试识别常见方法
      const methodId = tx.methodId ?? tx.input.slice(0, 10)
      
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
      
      return methodMap[methodId.toLowerCase()] ?? 'contract'
    }
    
    // 普通转账
    return 'transfer'
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
