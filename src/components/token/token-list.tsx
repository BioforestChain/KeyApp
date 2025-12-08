import { cn } from '@/lib/utils'
import { TokenItem, type TokenInfo } from './token-item'
import { EmptyState } from '../common/empty-state'
import { SkeletonList } from '../common/skeleton'

interface TokenListProps {
  tokens: TokenInfo[]
  loading?: boolean
  showChange?: boolean
  onTokenClick?: (token: TokenInfo) => void
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: React.ReactNode
  className?: string
}

export function TokenList({
  tokens,
  loading = false,
  showChange = false,
  onTokenClick,
  emptyTitle = '暂无资产',
  emptyDescription = '转入资产后将显示在这里',
  emptyAction,
  className,
}: TokenListProps) {
  if (loading) {
    return <SkeletonList count={3} className={className} />
  }

  if (tokens.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
        icon={
          <svg className="size-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        }
        className={className}
      />
    )
  }

  return (
    <div className={cn('space-y-1', className)}>
      {tokens.map((token) => (
        <TokenItem
          key={`${token.chain}-${token.symbol}`}
          token={token}
          showChange={showChange}
          onClick={onTokenClick ? () => onTokenClick(token) : undefined}
        />
      ))}
    </div>
  )
}
