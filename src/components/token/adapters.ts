import type { TokenInfo } from './token-item'
import type { TokenBalance } from '@/services/chain-adapter/providers/types'

// toTokenInfo 和 toTokenInfoList 已移除
// Token 类型不再存在于 walletStore，余额数据从 chain-provider 获取
// 使用 tokenBalanceToTokenInfo 和 tokenBalancesToTokenInfoList 代替


/**
 * Convert keyFetch TokenBalance to component TokenInfo
 * 
 * This adapter bridges keyFetch's TokenBalance type to the UI's TokenInfo type.
 * Used by send/destroy pages when migrating from walletStore to keyFetch.
 */
export function tokenBalanceToTokenInfo(token: TokenBalance, chain: string): TokenInfo {
    return {
        symbol: token.symbol,
        name: token.name,
        balance: token.amount.toFormatted(),
        decimals: token.decimals,
        fiatValue: undefined, // Price data not available in TokenBalance
        chain,
        icon: token.icon,
        change24h: 0, // Price change not available in TokenBalance
        contractAddress: token.contractAddress,
    }
}

/**
 * Convert array of keyFetch TokenBalances to array of component TokenInfos
 */
export function tokenBalancesToTokenInfoList(tokens: TokenBalance[], chain: string): TokenInfo[] {
    return tokens.map(t => tokenBalanceToTokenInfo(t, chain))
}
