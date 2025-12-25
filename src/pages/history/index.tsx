import { useCallback, useEffect, useMemo } from 'react';
import { useNavigation } from '@/stackflow';
import { useTranslation } from 'react-i18next';
import { IconRefresh as RefreshCw, IconFilter as Filter } from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/page-header';
import { TransactionList } from '@/components/transaction/transaction-list';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTransactionHistoryQuery, type TransactionFilter } from '@/queries';
import { useCurrentWallet, useEnabledChains, useSelectedChain } from '@/stores';
import { cn } from '@/lib/utils';
import type { TransactionInfo } from '@/components/transaction/transaction-item';
import type { ChainType } from '@/stores';

export function TransactionHistoryPage() {
  const { navigate, goBack } = useNavigation();
  const currentWallet = useCurrentWallet();
  const enabledChains = useEnabledChains();
  const selectedChain = useSelectedChain();
  const { t } = useTranslation(['transaction', 'common']);
  // 使用 TanStack Query 管理交易历史
  const { transactions, isLoading, isFetching, filter, setFilter, refresh } = useTransactionHistoryQuery(currentWallet?.id);

  const periodOptions = useMemo(() => [
    { value: 'all' as const, label: t('history.filter.allTime') },
    { value: '7d' as const, label: t('history.filter.days7') },
    { value: '30d' as const, label: t('history.filter.days30') },
    { value: '90d' as const, label: t('history.filter.days90') },
  ], [t]);

  const chainOptions = useMemo(() => [
    { value: 'all' as const, label: t('history.filter.allChains') },
    ...enabledChains.map((chain) => ({
      value: chain.id,
      label: chain.name,
    })),
  ], [t, enabledChains]);

  // 初始化时设置默认过滤器为当前选中的网络
  useEffect(() => {
    if (selectedChain && filter.chain !== selectedChain) {
      setFilter({ ...filter, chain: selectedChain });
    }
  }, []);

  // 处理交易点击 - 导航到详情页
  const handleTransactionClick = useCallback(
    (tx: TransactionInfo) => {
      if (!tx.id) {
        console.warn('[TransactionHistory] Transaction has no id:', tx);
        return;
      }
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
            disabled={isFetching}
            className={cn(
              'rounded-full p-2 transition-colors',
              'hover:bg-muted active:bg-muted/80',
              isFetching && 'animate-spin',
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
          <Select
            value={filter.chain || 'all'}
            onValueChange={(value) => handleChainChange(value as ChainType | 'all')}
          >
            <SelectTrigger size="sm" aria-label={t('common:a11y.selectChain')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {chainOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 时间段选择器 */}
          <Select
            value={filter.period || 'all'}
            onValueChange={(value) => handlePeriodChange(value as TransactionFilter['period'])}
          >
            <SelectTrigger size="sm" aria-label={t('common:a11y.selectPeriod')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
