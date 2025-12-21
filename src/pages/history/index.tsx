import { useCallback } from 'react';
import { useNavigation } from '@/stackflow';
import { useTranslation } from 'react-i18next';
import { IconRefresh as RefreshCw, IconFilter as Filter } from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/page-header';
import { TransactionList } from '@/components/transaction/transaction-list';
import { useTransactionHistory, type TransactionFilter } from '@/hooks/use-transaction-history';
import { useCurrentWallet, useEnabledChains } from '@/stores';
import { cn } from '@/lib/utils';
import type { TransactionInfo } from '@/components/transaction/transaction-item';
import type { ChainType } from '@/stores';

/** Period options - labels will be translated */
const PERIOD_OPTIONS: { value: TransactionFilter['period']; labelKey: string }[] = [
  { value: 'all', labelKey: 'transaction:history.filter.allTime' },
  { value: '7d', labelKey: 'transaction:history.filter.days7' },
  { value: '30d', labelKey: 'transaction:history.filter.days30' },
  { value: '90d', labelKey: 'transaction:history.filter.days90' },
];

export function TransactionHistoryPage() {
  const { navigate, goBack } = useNavigation();
  const currentWallet = useCurrentWallet();
  const enabledChains = useEnabledChains();
  const { t } = useTranslation(['transaction', 'common']);
  const { transactions, isLoading, filter, setFilter, refresh } = useTransactionHistory(currentWallet?.id);
  const chainOptions: { value: ChainType | 'all'; labelKey?: string; label?: string }[] = [
    { value: 'all', labelKey: 'transaction:history.filter.allChains' },
    ...enabledChains.map((chain) => ({
      value: chain.id,
      label: chain.name,
    })),
  ];

  // 处理交易点击 - 导航到详情页
  const handleTransactionClick = useCallback(
    (tx: TransactionInfo) => {
      navigate({ to: `/transaction/${tx.id}` });
    },
    [navigate],
  );

  // 处理链过滤器变化
  const handleChainChange = useCallback(
    (chain: ChainType | 'all') => {
      setFilter({ ...filter, chain });
    },
    [filter, setFilter],
  );

  // 处理时间段过滤器变化
  const handlePeriodChange = useCallback(
    (period: TransactionFilter['period']) => {
      setFilter({ ...filter, period });
    },
    [filter, setFilter],
  );

  // 无钱包时显示提示
  if (!currentWallet) {
    return (
      <div className="bg-muted/30 flex min-h-screen flex-col">
        <PageHeader title={t('transaction:history.title')} onBack={goBack} />
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-muted-foreground">{t('transaction:history.noWallet')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 flex min-h-screen flex-col">
      <PageHeader
        title={t('transaction:history.title')}
        onBack={goBack}
        rightAction={
          <button
            onClick={refresh}
            disabled={isLoading}
            className={cn(
              'rounded-full p-2 transition-colors',
              'hover:bg-muted active:bg-muted/80',
              isLoading && 'animate-spin',
            )}
            aria-label={t('common:a11y.refresh')}
          >
            <RefreshCw className="size-5" />
          </button>
        }
      />

      {/* 过滤器栏 */}
      <div className="bg-card border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Filter className="text-muted-foreground size-4" />

          {/* 链选择器 */}
          <select
            value={filter.chain || 'all'}
            onChange={(e) => handleChainChange(e.target.value as ChainType | 'all')}
            className={cn(
              'bg-background rounded-lg border px-3 py-1.5 text-sm',
              'focus:ring-primary/20 focus:ring-2 focus:outline-none',
            )}
            aria-label={t('common:a11y.selectChain')}
          >
            {chainOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.labelKey ? t(option.labelKey) : option.label}
              </option>
            ))}
          </select>

          {/* 时间段选择器 */}
          <select
            value={filter.period || 'all'}
            onChange={(e) => handlePeriodChange(e.target.value as TransactionFilter['period'])}
            className={cn(
              'bg-background rounded-lg border px-3 py-1.5 text-sm',
              'focus:ring-primary/20 focus:ring-2 focus:outline-none',
            )}
            aria-label={t('common:a11y.selectPeriod')}
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </select>
        </div>

        {/* 结果统计 */}
        <p className="text-muted-foreground mt-2 text-xs">
          {t('transaction:history.totalRecords', { count: transactions.length })}
        </p>
      </div>

      {/* 交易列表 */}
      <div className="flex-1 p-4">
        <TransactionList
          transactions={transactions}
          loading={isLoading}
          onTransactionClick={handleTransactionClick}
          emptyTitle={t('transaction:history.emptyTitle')}
          emptyDescription={t('transaction:history.emptyDesc')}
        />
      </div>
    </div>
  );
}
