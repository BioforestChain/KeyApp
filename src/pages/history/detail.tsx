import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation, useActivityParams } from '@/stackflow';
import {
  IconCopy as Copy,
  IconExternalLink as ExternalLink,
  IconCheck as Check,
  IconClock as Clock,
  IconCircleX as XCircle,
} from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/page-header';
import { AddressDisplay } from '@/components/wallet/address-display';
import { AmountDisplay, TimeDisplay } from '@/components/common';
import { TransactionStatus as TransactionStatusBadge } from '@/components/transaction/transaction-status';
import { FeeDisplay } from '@/components/transaction/fee-display';
import { useTransactionHistory, type TransactionRecord } from '@/hooks/use-transaction-history';
import { useCurrentWallet } from '@/stores';
import { cn } from '@/lib/utils';
import { useState } from 'react';

/** 状态映射 (TransactionInfo.status -> TransactionStatusType) */
const STATUS_MAP: Record<string, 'success' | 'failed' | 'pending'> = {
  confirmed: 'success',
  pending: 'pending',
  failed: 'failed',
};

/** 链浏览器 URL 映射 */
const EXPLORER_URLS: Record<string, string> = {
  ethereum: 'https://etherscan.io/tx/',
  tron: 'https://tronscan.org/#/transaction/',
  bitcoin: 'https://blockstream.info/tx/',
  binance: 'https://bscscan.com/tx/',
};

export function TransactionDetailPage() {
  const { t } = useTranslation('transaction');
  const { goBack } = useNavigation();
  const { txId } = useActivityParams<{ txId: string }>();
  const currentWallet = useCurrentWallet();
  const { transactions } = useTransactionHistory(currentWallet?.id);

  const [copied, setCopied] = useState(false);

  // 查找交易
  const transaction = useMemo<TransactionRecord | undefined>(() => {
    return transactions.find((tx) => tx.id === txId);
  }, [transactions, txId]);

  // 复制交易哈希
  const handleCopyHash = useCallback(async () => {
    if (transaction?.hash) {
      await navigator.clipboard.writeText(transaction.hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [transaction?.hash]);

  // 在浏览器中查看
  const handleViewExplorer = useCallback(() => {
    if (transaction?.hash && transaction?.chain) {
      const baseUrl = EXPLORER_URLS[transaction.chain];
      if (baseUrl) {
        window.open(baseUrl + transaction.hash, '_blank');
      }
    }
  }, [transaction]);

  // 返回
  const handleBack = useCallback(() => {
    goBack();
  }, [goBack]);

  // 无钱包
  if (!currentWallet) {
    return (
      <div className="bg-muted/30 flex min-h-screen flex-col">
        <PageHeader title={t('detail.title')} onBack={handleBack} />
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-muted-foreground">{t('history.noWallet')}</p>
        </div>
      </div>
    );
  }

  // 交易未找到
  if (!transaction) {
    return (
      <div className="bg-muted/30 flex min-h-screen flex-col">
        <PageHeader title={t('detail.title')} onBack={handleBack} />
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-muted-foreground">{t('detail.notFound')}</p>
        </div>
      </div>
    );
  }

  const statusIcon = {
    pending: <Clock className="size-8 text-yellow-500" />,
    confirmed: <Check className="text-secondary size-8" />,
    failed: <XCircle className="text-destructive size-8" />,
  }[transaction.status];

  return (
    <div className="bg-muted/30 flex min-h-screen flex-col">
      <PageHeader title={t('detail.title')} onBack={handleBack} />

      <div className="flex-1 space-y-4 p-4">
        {/* 状态头 */}
        <div className="bg-card flex flex-col items-center gap-3 rounded-xl p-6 shadow-sm">
          <div
            className={cn(
              'flex size-16 items-center justify-center rounded-full',
              transaction.status === 'pending' && 'bg-yellow-500/10',
              transaction.status === 'confirmed' && 'bg-secondary/10',
              transaction.status === 'failed' && 'bg-destructive/10',
            )}
          >
            {statusIcon}
          </div>

          <div className="text-center">
            <p className="text-muted-foreground text-sm">{t(`type.${transaction.type}`, { defaultValue: transaction.type })}</p>
            <AmountDisplay
              value={transaction.type === 'send' ? -Math.abs(parseFloat(transaction.amount)) : transaction.amount}
              symbol={transaction.symbol}
              sign="always"
              color="auto"
              weight="bold"
              size="xl"
            />
          </div>

          <TransactionStatusBadge
            status={STATUS_MAP[transaction.status] || 'pending'}
            label={t(`status.${transaction.status}`)}
          />
        </div>

        {/* 详细信息 */}
        <div className="bg-card space-y-3 rounded-xl p-4 shadow-sm">
          <h3 className="text-muted-foreground text-sm font-medium">{t('detail.info')}</h3>

          {/* 地址 */}
          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground text-sm">
              {transaction.type === 'send' ? t('detail.toAddress') : t('detail.fromAddress')}
            </span>
            <AddressDisplay address={transaction.address} copyable className="text-sm" />
          </div>

          <div className="bg-border h-px" />

          {/* 时间 */}
          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground text-sm">{t('detail.time')}</span>
            <TimeDisplay value={transaction.timestamp} format="datetime" className="text-sm" />
          </div>

          <div className="bg-border h-px" />

          {/* 链 */}
          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground text-sm">{t('detail.network')}</span>
            <span className="text-sm font-medium capitalize">{transaction.chain}</span>
          </div>

          {/* 手续费 */}
          {transaction.fee && (
            <>
              <div className="bg-border h-px" />
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground text-sm">{t('detail.fee')}</span>
                <FeeDisplay
                  amount={transaction.fee}
                  symbol={transaction.feeSymbol || transaction.symbol}
                  className="text-sm"
                />
              </div>
            </>
          )}

          {/* 区块号 */}
          {transaction.blockNumber && (
            <>
              <div className="bg-border h-px" />
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground text-sm">{t('detail.blockHeight')}</span>
                <span className="text-sm font-medium">{transaction.blockNumber.toLocaleString()}</span>
              </div>
            </>
          )}

          {/* 确认数 */}
          {transaction.confirmations !== undefined && transaction.confirmations > 0 && (
            <>
              <div className="bg-border h-px" />
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground text-sm">{t('detail.confirmations')}</span>
                <span className="text-sm font-medium">{transaction.confirmations}</span>
              </div>
            </>
          )}
        </div>

        {/* 交易哈希 */}
        {transaction.hash && (
          <div className="bg-card space-y-3 rounded-xl p-4 shadow-sm">
            <h3 className="text-muted-foreground text-sm font-medium">{t('detail.hash')}</h3>
            <p className="text-muted-foreground font-mono text-xs break-all">{transaction.hash}</p>

            <div className="flex gap-2">
              <button
                onClick={handleCopyHash}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5',
                  'bg-background border transition-colors',
                  'hover:bg-muted active:bg-muted/80',
                )}
              >
                {copied ? (
                  <>
                    <Check className="text-secondary size-4" />
                    <span className="text-sm">{t('detail.copied')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-4" />
                    <span className="text-sm">{t('detail.copyHash')}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleViewExplorer}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5',
                  'bg-background border transition-colors',
                  'hover:bg-muted active:bg-muted/80',
                )}
              >
                <ExternalLink className="size-4" />
                <span className="text-sm">{t('detail.viewExplorer')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
