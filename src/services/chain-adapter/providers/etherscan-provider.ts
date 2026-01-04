/**
 * Etherscan API Provider
 * 
 * 提供 EVM 链的交易历史查询能力。
 * 支持 Etherscan v2 API (统一接口，通过 chainid 区分链)
 */

import type { ApiProvider, Transaction } from './types'
import type { ParsedApiEntry } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config'

/** EVM Chain IDs */
const EVM_CHAIN_IDS: Record<string, number> = {
  ethereum: 1,
  binance: 56,
  'ethereum-sepolia': 11155111,
  'bsc-testnet': 97,
}

interface EtherscanTx {
  hash: string
  from: string
  to: string
  value: string
  timeStamp: string
  isError: string
  blockNumber: string
}

interface EtherscanResponse {
  status: string
  message: string
  result: EtherscanTx[] | string
}

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

  async getTransactionHistory(address: string, limit = 20): Promise<Transaction[]> {
    try {
      const apiKey = (this.config?.apiKey as string) ?? ''
      const params = new URLSearchParams({
        chainid: this.evmChainId.toString(),
        module: 'account',
        action: 'txlist',
        address,
        startblock: '0',
        endblock: '99999999',
        page: '1',
        offset: limit.toString(),
        sort: 'desc',
      })
      
      if (apiKey) {
        params.set('apikey', apiKey)
      }

      const url = `${this.endpoint}?${params.toString()}`
      const response = await fetch(url)
      
      if (!response.ok) {
        console.warn(`[EtherscanProvider] HTTP ${response.status}`)
        return []
      }

      const json = await response.json() as EtherscanResponse
      
      if (json.status !== '1' || !Array.isArray(json.result)) {
        // status !== '1' 可能是 "No transactions found" 等情况
        return []
      }

      return json.result.map((tx): Transaction => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        symbol: this.symbol,
        timestamp: parseInt(tx.timeStamp, 10) * 1000,
        status: tx.isError === '0' ? 'confirmed' : 'failed',
        blockNumber: BigInt(tx.blockNumber),
      }))
    } catch (error) {
      console.warn('[EtherscanProvider] Error fetching transactions:', error)
      return []
    }
  }
}

/** 工厂函数 */
export function createEtherscanProvider(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  // 匹配 etherscan-* 或 *scan-* 类型
  if (entry.type.includes('etherscan') || entry.type.includes('scan')) {
    return new EtherscanProvider(entry, chainId)
  }
  return null
}
