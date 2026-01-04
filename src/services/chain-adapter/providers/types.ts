/**
 * API Provider 类型定义
 * 
 * 每个 ApiProvider 实现特定 API 的部分能力。
 * ChainProvider 聚合多个 ApiProvider，通过能力发现动态代理方法调用。
 */

import type { Amount } from '@/types/amount'
import type { ParsedApiEntry } from '@/services/chain-config'

/** 余额信息 */
export interface Balance {
  amount: Amount
  symbol: string
}

/** 交易信息 */
export interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  symbol: string
  timestamp: number
  status: 'pending' | 'confirmed' | 'failed'
  blockNumber?: bigint
}

/** 手续费估算 */
export interface FeeEstimate {
  slow: Amount
  standard: Amount
  fast: Amount
}

/**
 * API Provider 接口
 * 
 * 每个方法都是可选的，Provider 只实现它支持的方法。
 * ChainProvider 通过 `supports()` 检查是否有 Provider 实现了某方法。
 */
export interface ApiProvider {
  /** Provider 类型 (来自配置的 key，如 "biowallet-v1") */
  readonly type: string
  /** API 端点 */
  readonly endpoint: string
  /** 额外配置 */
  readonly config?: Record<string, unknown>

  // ===== 可选实现的方法 =====
  
  /** 查询原生代币余额 */
  getNativeBalance?(address: string): Promise<Balance>
  
  /** 查询交易历史 */
  getTransactionHistory?(address: string, limit?: number): Promise<Transaction[]>
  
  /** 查询单笔交易 */
  getTransaction?(hash: string): Promise<Transaction | null>
  
  /** 估算手续费 */
  estimateFee?(from: string, to: string, amount: Amount): Promise<FeeEstimate>
  
  /** 广播已签名交易 */
  broadcastTransaction?(signedTx: string): Promise<string>
  
  /** 获取当前区块高度 */
  getBlockHeight?(): Promise<bigint>
}

/** ApiProvider 可调用的方法名 */
export type ApiProviderMethod = keyof Omit<ApiProvider, 'type' | 'endpoint' | 'config'>

/** ApiProvider 工厂函数 */
export type ApiProviderFactory = (entry: ParsedApiEntry, chainId: string) => ApiProvider | null
