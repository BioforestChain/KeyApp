import { useMemo } from 'react'
import { WalletAddressPortfolioView, type WalletAddressPortfolioViewProps } from './wallet-address-portfolio-view'
import type { ChainType } from '@/stores'
import { ChainProviderGate, useChainProvider } from '@/contexts'
import type { TokenInfo } from '@/components/token/token-item'
import { toTransactionInfoList } from '@/components/transaction/adapters'

export interface WalletAddressPortfolioFromProviderProps {
    chainId: ChainType
    address: string
    chainName?: string
    onTokenClick?: WalletAddressPortfolioViewProps['onTokenClick']
    onTransactionClick?: WalletAddressPortfolioViewProps['onTransactionClick']
    className?: string
    testId?: string
}

/**
 * 从 Provider 获取地址资产组合（内部实现）
 *
 * 使用 ChainProvider 响应式 API 获取数据，复用 WalletAddressPortfolioView 展示。
 */
function WalletAddressPortfolioFromProviderInner({
    chainId,
    address,
    chainName,
    onTokenClick,
    onTransactionClick,
    className,
    testId,
}: WalletAddressPortfolioFromProviderProps) {
    const chainProvider = useChainProvider()

    // 使用新的响应式 API
    const { data: tokens = [], isLoading: tokensLoading } = chainProvider.allBalances.useState(
        { address },
        { enabled: !!address }
    )

    const { data: txResult, isLoading: transactionsLoading } = chainProvider.transactionHistory.useState(
        { address, limit: 50 },
        { enabled: !!address }
    )

    // 转换为 TokenInfo 格式
    const tokenInfoList: TokenInfo[] = useMemo(() => {
        return tokens.map((token) => ({
            symbol: token.symbol,
            name: token.name,
            chain: chainId,
            balance: token.amount.toFormatted(),
            decimals: token.decimals,
            fiatValue: undefined,
            change24h: 0,
            icon: token.icon,
        }))
    }, [tokens, chainId])

    // 转换交易历史格式
    const transactions = useMemo(() => {
        if (!txResult) return []
        return toTransactionInfoList(txResult, chainId)
    }, [txResult, chainId])

    return (
        <WalletAddressPortfolioView
            chainId={chainId}
            chainName={chainName}
            tokens={tokenInfoList}
            transactions={transactions}
            tokensLoading={tokensLoading}
            transactionsLoading={transactionsLoading}
            tokensRefreshing={false}
            tokensSupported={chainProvider.supportsTokenBalances || chainProvider.supportsNativeBalance}
            tokensFallbackReason={undefined}
            transactionsSupported={chainProvider.supportsTransactionHistory}
            transactionsFallbackReason={undefined}
            onTokenClick={onTokenClick}
            onTransactionClick={onTransactionClick}
            className={className}
            testId={testId}
        />
    )
}

/**
 * 从 Provider 获取地址资产组合
 *
 * 使用 ChainProviderGate 确保 ChainProvider 可用，再使用响应式 API 获取数据。
 * 适用于 Stories 测试和任意地址查询场景。
 */
export function WalletAddressPortfolioFromProvider(props: WalletAddressPortfolioFromProviderProps) {
    return (
        <ChainProviderGate
            chainId={props.chainId}
            fallback={
                <div className="flex h-96 items-center justify-center">
                    <div className="text-muted-foreground text-center">
                        <p>Chain not supported: {props.chainId}</p>
                    </div>
                </div>
            }
        >
            <WalletAddressPortfolioFromProviderInner {...props} />
        </ChainProviderGate>
    )
}
