import { useMemo } from 'react'
import { useKeyFetch } from '@biochain/key-fetch'
import { chainConfigService } from '@/services/chain-config'
import { useChainConfigState } from '@/stores/chain-config'
import type { TokenInfo } from '@/components/token/token-item'
import type { TransactionInfo } from '@/components/transaction/transaction-item'
import type { ChainType } from '@/stores'
import { Amount } from '@/types/amount'
import { mapActionToTransactionType } from '@/components/transaction/transaction-meta'

export interface AddressPortfolioResult {
  tokens: TokenInfo[]
  transactions: TransactionInfo[]
  tokensLoading: boolean
  transactionsLoading: boolean
  tokensRefreshing: boolean
  tokensSupported: boolean
  tokensFallbackReason?: string
  transactionsSupported: boolean
  transactionsFallbackReason?: string
}

export interface UseAddressPortfolioOptions {
  enabled?: boolean
  transactionLimit?: number
}

export const addressPortfolioKeys = {
  all: ['addressPortfolio'] as const,
  tokens: (chainId: string, address: string) => ['addressPortfolio', 'tokens', chainId, address] as const,
  transactions: (chainId: string, address: string) => ['addressPortfolio', 'transactions', chainId, address] as const,
}

/** 余额 API 响应类型 */
interface BalanceResponse {
  success: boolean
  result?: {
    assets?: Array<{ symbol: string; balance: string }>
  }
}

/** 交易 API 响应类型 */
interface TransactionResponse {
  success: boolean
  result?: {
    trs?: Array<{
      height: number
      transaction: {
        signature: string
        senderId: string
        recipientId?: string
        fee: string
        timestamp: number
        asset?: {
          transferAsset?: {
            amount: string
          }
        }
      }
    }>
  }
}

/**
 * 构建余额查询 URL
 */
function buildBalanceUrl(chainId: string, address: string): string | null {
  if (!chainId || !address) return null
  const baseUrl = chainConfigService.getBiowalletApi(chainId)
  if (!baseUrl) return null
  return `${baseUrl}/address/asset?address=${address}`
}

/**
 * 构建交易查询 URL
 */
function buildTransactionsUrl(chainId: string, address: string, limit: number): string | null {
  if (!chainId || !address) return null
  const baseUrl = chainConfigService.getBiowalletApi(chainId)
  if (!baseUrl) return null
  return `${baseUrl}/transactions/query?address=${address}&limit=${limit}`
}

/**
 * 地址资产组合查询 Hook
 * 
 * 纯粹的数据获取，不依赖 Wallet Store，适用于：
 * - 任意地址查询（不一定是自己的钱包）
 * - Stories 测试
 * - 地址查询页面
 * 
 * 使用 keyFetch 响应式订阅，当区块更新时自动刷新
 */
export function useAddressPortfolio(
  chainId: ChainType,
  address: string,
  options: UseAddressPortfolioOptions = {}
): AddressPortfolioResult {
  const { enabled = true, transactionLimit = 20 } = options
  const chainConfigState = useChainConfigState()
  
  const isReady = !!chainConfigState.snapshot && !!address
  const tokensEnabled = enabled && isReady
  const transactionsEnabled = enabled && isReady

  // 构建 URL
  const balanceUrl = useMemo(
    () => tokensEnabled ? buildBalanceUrl(chainId, address) : null,
    [chainId, address, tokensEnabled]
  )
  
  const transactionsUrl = useMemo(
    () => transactionsEnabled ? buildTransactionsUrl(chainId, address, transactionLimit) : null,
    [chainId, address, transactionLimit, transactionsEnabled]
  )

  // 使用 keyFetch 订阅余额
  const tokensQuery = useKeyFetch<BalanceResponse>(balanceUrl, {
    enabled: tokensEnabled,
  })

  // 使用 keyFetch 订阅交易
  const transactionsQuery = useKeyFetch<TransactionResponse>(transactionsUrl, {
    enabled: transactionsEnabled,
    init: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address,
        page: 1,
        pageSize: transactionLimit,
        sort: -1,
      }),
    },
  })

  // 转换余额数据
  const tokens: TokenInfo[] = useMemo(() => {
    if (!tokensQuery.data?.success || !tokensQuery.data.result?.assets) return []
    return tokensQuery.data.result.assets.map(asset => ({
      symbol: asset.symbol,
      name: asset.symbol,
      balance: asset.balance,
      decimals: chainConfigService.getDecimals(chainId),
      chain: chainId,
    }))
  }, [tokensQuery.data, chainId])

  // 转换交易数据
  const transactions: TransactionInfo[] = useMemo(() => {
    if (!transactionsQuery.data?.success || !transactionsQuery.data.result?.trs) return []
    const decimals = chainConfigService.getDecimals(chainId)
    const symbol = chainConfigService.getSymbol(chainId)
    
    return transactionsQuery.data.result.trs.map(item => {
      const tx = item.transaction
      const amountRaw = tx.asset?.transferAsset?.amount ?? '0'
      const counterpartyAddress = tx.recipientId ?? tx.senderId
      const uiType = mapActionToTransactionType('transfer', 'out')
      
      return {
        id: tx.signature,
        type: uiType,
        status: 'confirmed' as const,
        amount: Amount.fromRaw(amountRaw, decimals, symbol),
        symbol,
        address: counterpartyAddress,
        timestamp: new Date(tx.timestamp),
        hash: tx.signature,
        chain: chainId,
      }
    })
  }, [transactionsQuery.data, chainId])

  return {
    tokens,
    transactions,
    tokensLoading: tokensEnabled && tokensQuery.isLoading,
    transactionsLoading: transactionsEnabled && transactionsQuery.isLoading,
    tokensRefreshing: tokensQuery.isFetching && !tokensQuery.isLoading,
    tokensSupported: tokensEnabled ? !tokensQuery.error : false,
    tokensFallbackReason: tokensEnabled ? tokensQuery.error?.message : 'Provider not ready',
    transactionsSupported: transactionsEnabled ? !transactionsQuery.error : false,
    transactionsFallbackReason: transactionsEnabled ? transactionsQuery.error?.message : 'Provider not ready',
  }
}
