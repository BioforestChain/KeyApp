import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { TransactionItem, type TransactionInfo } from './transaction-item';
import { EmptyState, SkeletonList } from '@biochain/key-ui';
import { getLocale } from '../common';

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
  testId?: string | undefined;
}

function groupByDate(transactions: TransactionInfo[], locale: string): Map<string, TransactionInfo[]> {
  const groups = new Map<string, TransactionInfo[]>();

  transactions.forEach((tx) => {
    // timestamp 可能是 number (毫秒), string, 或 Date 对象
    const date = tx.timestamp instanceof Date ? tx.timestamp : new Date(tx.timestamp);
    const key = date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

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
  emptyTitle = '暂无交易记录', // i18n-ignore: default prop
  emptyDescription = '您的交易记录将显示在这里', // i18n-ignore: default prop
  emptyAction,
  className,
  showChainIcon = false,
  testId,
}: TransactionListProps) {
  const { i18n } = useTranslation();
  const locale = getLocale(i18n.language);

  if (loading) {
    return <SkeletonList count={5} {...(className && { className })} />;
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        {...(testId && { testId: `${testId}-empty` })}
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

  const grouped = groupByDate(transactions, locale);

  return (
    <div {...(testId && { 'data-testid': testId })} className={cn('space-y-4', className)}>
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
