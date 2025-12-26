import { cn } from '@/lib/utils';
import { TransactionItem, type TransactionInfo } from './transaction-item';
import { EmptyState } from '../common/empty-state';
import { SkeletonList } from '../common/skeleton';

interface TransactionListProps {
  transactions: TransactionInfo[];
  loading?: boolean | undefined;
  onTransactionClick?: ((transaction: TransactionInfo) => void) | undefined;
  emptyTitle?: string | undefined;
  emptyDescription?: string | undefined;
  emptyAction?: React.ReactNode | undefined;
  className?: string | undefined;
  /** 是否显示链图标（右下角小徽章） */
  showChainIcon?: boolean | undefined;
}

function groupByDate(transactions: TransactionInfo[]): Map<string, TransactionInfo[]> {
  const groups = new Map<string, TransactionInfo[]>();
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now.getTime() - 86400000).toDateString();

  transactions.forEach((tx) => {
    const date = typeof tx.timestamp === 'string' ? new Date(tx.timestamp) : tx.timestamp;
    const dateStr = date.toDateString();

    let key: string;
    if (dateStr === today) {
      key = '今天';
    } else if (dateStr === yesterday) {
      key = '昨天';
    } else {
      key = date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
    }

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(tx);
  });

  return groups;
}

export function TransactionList({
  transactions,
  loading = false,
  onTransactionClick,
  emptyTitle = '暂无交易记录',
  emptyDescription = '您的交易记录将显示在这里',
  emptyAction,
  className,
  showChainIcon = false,
}: TransactionListProps) {
  if (loading) {
    return <SkeletonList count={5} {...(className && { className })} />;
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        {...(emptyAction && { action: emptyAction })}
        icon={
          <svg className="size-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        }
        {...(className && { className })}
      />
    );
  }

  const grouped = groupByDate(transactions);

  return (
    <div className={cn('space-y-4', className)}>
      {Array.from(grouped.entries()).map(([date, txs]) => (
        <div key={date}>
          <h3 className="text-muted-foreground mb-1 px-3 text-xs font-medium">{date}</h3>
          <div className="space-y-1">
            {txs.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                showChainIcon={showChainIcon}
                {...(onTransactionClick && { onClick: () => onTransactionClick(tx) })}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
