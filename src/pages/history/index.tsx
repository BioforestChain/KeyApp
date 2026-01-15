import { useCallback, useMemo, useState } from 'react';
import { useNavigation } from '@/stackflow';
import { useTranslation } from 'react-i18next';
import { IconRefresh as RefreshCw, IconFilter as Filter } from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/page-header';
import { TransactionList } from '@/components/transaction/transaction-list';
import { PendingTxList } from '@/components/transaction/pending-tx-list';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChainProviderGate, useChainProvider } from '@/contexts';
import { useCurrentWallet, useEnabledChains, useSelectedChain } from '@/stores';
import { usePendingTransactions } from '@/hooks/use-pending-transactions';
import { cn } from '@/lib/utils';
import { toTransactionInfoList, type TransactionInfo } from '@/components/transaction';
import type { ChainType } from '@/stores';

/** 交易历史过滤器 */
interface TransactionFilter {
  chain?: ChainType | 'all';
  period?: '7d' | '30d' | '90d' | 'all';
}

interface TransactionHistoryPageProps {
  initialChain?: ChainType | 'all' | undefined;
}

// ==================== 内部内容组件：使用 useChainProvider ====================

interface HistoryContentProps {
  targetChain: ChainType;
  address: string;
  filter: TransactionFilter;
  setFilter: React.Dispatch<React.SetStateAction<TransactionFilter>>;
  walletId: string;
}

function HistoryContent({ targetChain, address, filter, setFilter, walletId }: HistoryContentProps) {
  const { navigate, goBack } = useNavigation();
  const enabledChains = useEnabledChains();
  const { t } = useTranslation(['transaction', 'common']);

  // 使用 useChainProvider() 获取确保非空的 provider
  const chainProvider = useChainProvider();

  // 直接调用，不需要条件判断
  const { data: rawTransactions, isLoading, isFetching, refetch } = chainProvider.transactionHistory.useState(
    { address, limit: 50 },
    { enabled: !!address }
  );

  // 获取 pending transactions
  const {
    transactions: pendingTransactions,
    deleteTransaction: deletePendingTx,
    retryTransaction: retryPendingTx,
  } = usePendingTransactions(walletId);

  // 客户端过滤：按时间段
  const transactions = useMemo(() => {
    if (!rawTransactions) return [];
    const period = filter.period;
    if (!period || period === 'all') return rawTransactions;

    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return rawTransactions.filter((tx) => tx.timestamp >= cutoff);
  }, [rawTransactions, filter.period]);

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

  const handleTransactionClick = useCallback(
    (tx: TransactionInfo) => {
      if (!tx.id) return;
      navigate({ to: `/transaction/${tx.id}` });
    },
    [navigate],
  );

  const handleChainChange = useCallback(
    (chain: ChainType | 'all') => {
      setFilter((prev) => ({ ...prev, chain }));
    },
    [setFilter],
  );

  const handlePeriodChange = useCallback(
    (period: TransactionFilter['period']) => {
      setFilter((prev) => ({ ...prev, period }));
    },
    [setFilter],
  );

  const handleRefresh = useCallback(async () => {
    await refetch?.();
  }, [refetch]);

  return (
    <div className="bg-muted/30 flex min-h-screen flex-col">
      <PageHeader
        title={t('transaction:history.title')}
        onBack={goBack}
        rightAction={
          <button
            onClick={handleRefresh}
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
        <div className="flex items-center gap-3">
          <Filter className="text-muted-foreground size-4" />

          {/* 链选择器 */}
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground text-xs">{t('history.filter.chainLabel')}</span>
            <Select
              value={filter.chain || 'all'}
              onValueChange={(value) => handleChainChange(value as ChainType | 'all')}
            >
              <SelectTrigger size="sm" aria-label={t('common:a11y.selectChain')}>
                <SelectValue>
                  {chainOptions.find((o) => o.value === (filter.chain || 'all'))?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {chainOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 时间段选择器 */}
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground text-xs">{t('history.filter.periodLabel')}</span>
            <Select
              value={filter.period || 'all'}
              onValueChange={(value) => handlePeriodChange(value as TransactionFilter['period'])}
            >
              <SelectTrigger size="sm" aria-label={t('common:a11y.selectPeriod')}>
                <SelectValue>
                  {periodOptions.find((o) => o.value === (filter.period || 'all'))?.label}
                </SelectValue>
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
        </div>

        {/* 结果统计 */}
        <p className="text-muted-foreground mt-2 text-xs">
          {t('transaction:history.totalRecords', { count: transactions.length })}
        </p>
      </div>

      {/* 交易列表 */}
      <div className="flex-1 space-y-4 p-4">
        {/* Pending Transactions */}
        {pendingTransactions.length > 0 && (
          <PendingTxList
            transactions={pendingTransactions}
            onRetry={retryPendingTx}
            onDelete={deletePendingTx}
          />
        )}

        {/* Confirmed Transactions */}
        <TransactionList
          transactions={toTransactionInfoList(transactions ?? [], targetChain)}
          loading={isLoading}
          onTransactionClick={handleTransactionClick}
          emptyTitle={t('transaction:history.emptyTitle')}
          emptyDescription={t('transaction:history.emptyDesc')}
          showChainIcon
        />
      </div>
    </div>
  );
}

// ==================== 主组件：使用 ChainProviderGate 包裹 ====================

export function TransactionHistoryPage({ initialChain }: TransactionHistoryPageProps) {
  const { goBack } = useNavigation();
  const currentWallet = useCurrentWallet();
  const selectedChain = useSelectedChain();
  const { t } = useTranslation(['transaction', 'common']);

  // 过滤器状态（内部管理）
  const [filter, setFilter] = useState<TransactionFilter>({
    chain: initialChain ?? selectedChain,
    period: 'all',
  });

  // 获取当前链地址
  const targetChain = filter.chain === 'all' ? selectedChain : filter.chain;
  const currentChainAddress = currentWallet?.chainAddresses?.find(
    (ca) => ca.chain === targetChain
  );
  const address = currentChainAddress?.address ?? '';

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

  // 使用 ChainProviderGate 包裹内容
  return (
    <ChainProviderGate
      chainId={targetChain}
      fallback={
        <div className="bg-muted/30 flex min-h-screen flex-col">
          <PageHeader title={t('transaction:history.title')} onBack={goBack} />
          <div className="flex flex-1 items-center justify-center p-4">
            <p className="text-muted-foreground">Chain not supported</p>
          </div>
        </div>
      }
    >
      <HistoryContent
        targetChain={targetChain as ChainType}
        address={address}
        filter={filter}
        setFilter={setFilter}
        walletId={currentWallet.id}
      />
    </ChainProviderGate>
  );
}
