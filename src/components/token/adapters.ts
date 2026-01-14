import type { Token } from '@/stores/wallet'
import type { TokenInfo } from './token-item'

/**
 * Convert wallet Token to component TokenInfo
 * 
 * This adapter bridges the gap between the data layer (Token)
 * and presentation layer (TokenInfo) types.
 */
export function toTokenInfo(token: Token): TokenInfo {
    return {
        symbol: token.symbol,
        name: token.name,
        balance: token.balance,
        decimals: token.decimals,
        // Convert number to string for fiatValue
        fiatValue: token.fiatValue !== undefined ? String(token.fiatValue) : undefined,
        chain: token.chain,
        icon: token.icon,
        change24h: token.change24h,
    }
}

/**
 * Convert array of wallet Tokens to array of component TokenInfos
 */
export function toTokenInfoList(tokens: Token[]): TokenInfo[] {
    return tokens.map(toTokenInfo)
}
