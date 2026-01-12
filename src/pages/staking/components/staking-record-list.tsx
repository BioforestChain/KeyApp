/**
 * Staking Record List - Transaction history for mint/burn operations
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IconArrowDownRight as ArrowDownRight,
  IconArrowUpRight as ArrowUpRight,
  IconClock as Clock,
  IconCircleCheck as CheckCircle,
  IconCircleX as XCircle,
  IconLoader2 as Loader2,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { TokenIcon } from '@/components/wallet/token-icon';
import { LoadingSpinner } from '@/components/common';
import { stakingService } from '@/services/staking';
import type { Amount } from '@/types/amount';
import type { StakingTransaction, StakingTxType, StakingTxStatus } from '@/types/staking';
import { cn } from '@/lib/utils';

interface StakingRecordListProps {
  /** Filter by transaction type */
  filterType?: StakingTxType | 'all';
  onRecordClick?: (record: StakingTransaction) => void;
  className?: string;
}

/** Chain display names */
const CHAIN_NAMES: Record<string, string> = {
  ETH: 'Ethereum',
  BSC: 'BNB Chain',
  TRON: 'Tron',
  BFMeta: 'BFMeta',
  BFChain: 'BFChain',
  CCChain: 'CCChain',
  PMChain: 'PMChain',
};

/** Status icon component */
function StatusIcon({ status }: { status: StakingTxStatus }) {
  switch (status) {
    case 'pending':
      return <Clock className="size-4 text-yellow-500" />;
    case 'confirming':
      return <Loader2 className="size-4 animate-spin text-blue-500" />;
    case 'confirmed':
      return <CheckCircle className="size-4 text-green-500" />;
    case 'failed':
      return <XCircle className="text-destructive size-4" />;
  }
}

/** Format timestamp to relative or absolute */
function formatTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  // Less than 1 minute
  if (diff < 60000) return 'Just now';
  // Less than 1 hour
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  // Less than 24 hours
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  // More than 24 hours - show date
  const date = new Date(timestamp);
  return date.toLocaleDateString();
}

/** Format amount with decimals */
function formatAmount(amount: Amount): string {
  const num = amount.toNumber();
  if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
  return num.toFixed(4);
}

/** Single record item */
function RecordItem({ record, onClick }: { record: StakingTransaction; onClick?: () => void }) {
  const { t } = useTranslation('staking');

  const isMint = record.type === 'mint';
  const TypeIcon = isMint ? ArrowDownRight : ArrowUpRight;

  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-card hover:bg-muted/50 flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors"
    >
      {/* Type icon */}
      <div
        className={cn(
          'flex size-10 items-center justify-center rounded-full',
          isMint ? 'bg-green-500/10' : 'bg-orange-500/10',
        )}
      >
        <TypeIcon className={cn('size-5', isMint ? 'text-green-500' : 'text-orange-500')} />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{isMint ? t('mint') : t('burn')}</span>
          <StatusIcon status={record.status} />
        </div>
        <div className="text-muted-foreground flex items-center gap-1 text-xs">
          <span>{CHAIN_NAMES[record.sourceChain]}</span>
          <span>→</span>
          <span>{CHAIN_NAMES[record.targetChain]}</span>
        </div>
      </div>

      {/* Amount */}
      <div className="text-right">
        <div className="flex items-center justify-end gap-1">
          <TokenIcon symbol={record.sourceAsset} size="sm" />
          <span className="font-medium">{formatAmount(record.sourceAmount)}</span>
        </div>
        <div className="text-muted-foreground text-xs">{formatTime(record.createdAt)}</div>
      </div>
    </button>
  );
}

/** Tab options for filtering */
type FilterTab = 'all' | 'mint' | 'burn';

/** Staking record list component */
export function StakingRecordList({ filterType = 'all', onRecordClick, className }: StakingRecordListProps) {
  const { t } = useTranslation('staking');

  // State
  const [records, setRecords] = useState<StakingTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>(filterType === 'all' ? 'all' : filterType);

  // Load records
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    stakingService.getTransactions().then((data: StakingTransaction[]) => {
      if (mounted) {
        setRecords(data);
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Filtered records
  const filteredRecords = useMemo(() => {
    if (activeTab === 'all') return records;
    return records.filter((r) => r.type === activeTab);
  }, [records, activeTab]);

  // Tab buttons
  const tabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: t('history') },
    { id: 'mint', label: t('mint') },
    { id: 'burn', label: t('burn') },
  ];

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    stakingService.getTransactions().then((data: StakingTransaction[]) => {
      setRecords(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground mt-2 text-sm">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Tabs */}
      <div className="flex items-center gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            type="button"
            variant={activeTab === tab.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Button>
        ))}

        {/* Refresh button */}
        <Button type="button" variant="ghost" size="sm" className="ml-auto" onClick={handleRefresh}>
          {t('refresh')}
        </Button>
      </div>

      {/* Record list */}
      {filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">{t('noTransactions')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredRecords.map((record) => (
            <RecordItem key={record.id} record={record} onClick={() => onRecordClick?.(record)} />
          ))}
        </div>
      )}
    </div>
  );
}
