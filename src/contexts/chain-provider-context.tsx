/**
 * ChainProvider Context
 * 
 * 提供统一的 ChainProvider 注入，确保钱包相关页面始终有有效的 provider。
 * 使用 Gate 模式：无效时提前返回，避免条件式 hooks 问题。
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { getChainProvider, type ChainProvider } from '@/services/chain-adapter/providers'

// ==================== Context ====================

const ChainProviderContext = createContext<ChainProvider | null>(null)

// ==================== Gate Component ====================

interface ChainProviderGateProps {
    chainId: string | null | undefined
    children: ReactNode
    /** 无 provider 时的降级渲染 */
    fallback?: ReactNode
}

/**
 * ChainProvider 门卫组件
 * 
 * 确保子组件渲染时 ChainProvider 一定存在。
 * 无效 chainId 时渲染 fallback 或 null。
 * 
 * @example
 * ```tsx
 * <ChainProviderGate chainId={selectedChain} fallback={<ChainNotSupported />}>
 *   <WalletContent />
 * </ChainProviderGate>
 * ```
 */
export function ChainProviderGate({ chainId, children, fallback = null }: ChainProviderGateProps) {
    const provider = useMemo(
        () => (chainId ? getChainProvider(chainId) : null),
        [chainId]
    )

    if (!provider) {
        return <>{fallback}</>
    }

    // 使用 key 强制在 chainId 变化时重新挂载 children
    // 这确保了 hooks 状态被重置，避免 hooks 顺序问题
    return (
        <ChainProviderContext.Provider value={provider} key={chainId}>
            {children}
        </ChainProviderContext.Provider>
    )
}

// ==================== Hooks ====================

/**
 * 获取 ChainProvider（必须在 ChainProviderGate 内使用）
 * 
 * @throws 如果在 Gate 外使用会抛出错误
 * 
 * @example
 * ```tsx
 * function WalletContent() {
 *   const provider = useChainProvider()
 *   const { data } = provider.nativeBalance.useState({ address })
 *   // ...
 * }
 * ```
 */
export function useChainProvider(): ChainProvider {
    const provider = useContext(ChainProviderContext)
    if (!provider) {
        throw new Error(
            'useChainProvider must be used within ChainProviderGate. ' +
            'Make sure to wrap your component with <ChainProviderGate chainId={...}>.'
        )
    }
    return provider
}

/**
 * 获取 ChainProvider（可选，允许 null）
 * 
 * 用于不确定是否在 Gate 内的场景
 */
export function useChainProviderOptional(): ChainProvider | null {
    return useContext(ChainProviderContext)
}
