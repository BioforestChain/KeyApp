import { cn } from '@/lib/utils'
import { TokenItem, type TokenInfo } from './token-item'
import { EmptyState } from '../common/empty-state'
import { SkeletonList } from '../common/skeleton'

interface TokenListProps {
  tokens: TokenInfo[]
  /** Show skeleton loading state (no tokens yet) */
  loading?: boolean | undefined
  /** Show balance refresh animation (tokens exist but refreshing) */
  refreshing?: boolean | undefined
  showChange?: boolean | undefined
  onTokenClick?: ((token: TokenInfo) => void) | undefined
  emptyTitle?: string | undefined
  emptyDescription?: string | undefined
  emptyAction?: React.ReactNode | undefined
  className?: string | undefined
  testId?: string | undefined
}

export function TokenList({
  tokens,
  loading = false,
  refreshing = false,
  showChange = false,
  onTokenClick,
  emptyTitle = '暂无资产',
  emptyDescription = '转入资产后将显示在这里',
  emptyAction,
  className,
  testId,
}: TokenListProps) {
  if (loading) {
    return <SkeletonList count={3} {...(className && { className })} />
  }

  if (tokens.length === 0) {
    return (
      <EmptyState
        {...(testId && { testId: `${testId}-empty` })}
        title={emptyTitle}
        description={emptyDescription}
        {...(emptyAction && { action: emptyAction })}
        icon={
          <svg className="size-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        }
        {...(className && { className })}
      />
    )
  }

  return (
    <div {...(testId && { 'data-testid': testId })} className={cn('space-y-1', className)}>
      {tokens.map((token) => (
        <TokenItem
          key={`${token.chain}-${token.symbol}`}
          token={token}
          testId={testId ? `token-item-${token.chain}-${token.symbol}` : undefined}
          showChange={showChange}
          loading={refreshing}
          {...(onTokenClick && { onClick: () => onTokenClick(token) })}
        />
      ))}
    </div>
  )
}
