import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation, useActivityParams } from '@/stackflow';
import {
  IconCopy as Copy,
  IconCheck as Check,
  IconShare as Share,
  IconArrowUp,
  IconArrowDown,
  IconArrowsExchange,
  IconLock,
  IconLockOpen,
  IconShieldLock,
  IconFlame,
  IconGift,
  IconHandGrab,
  IconUserShare,
  IconSignature,
  IconLogout,
  IconLogin,
  IconSparkles,
  IconCoins,
  IconDiamond,
  IconTrash,
  IconMapPin,
  IconApps,
  IconCertificate,
  IconFileText,
  IconDots,
} from '@tabler/icons-react';
import type { Icon } from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/page-header';
import { AddressDisplay } from '@/components/wallet/address-display';
import { AmountDisplay, TimeDisplay } from '@/components/common';
import { TransactionStatus as TransactionStatusBadge } from '@/components/transaction/transaction-status';
import { FeeDisplay } from '@/components/transaction/fee-display';
import { SkeletonCard } from '@/components/common/skeleton';
import { useTransactionHistoryQuery, type TransactionRecord } from '@/queries';
import { useCurrentWallet, useChainConfigState, chainConfigSelectors } from '@/stores';
import { cn } from '@/lib/utils';
import { clipboardService } from '@/services/clipboard';
import type { TransactionType } from '@/components/transaction/transaction-item';

// 交易类型图标和颜色配置
const typeConfig: Record<TransactionType, { Icon: Icon; color: string; bg: string }> = {
  // 资产流出 - 红橙色
  send:          { Icon: IconArrowUp,       color: 'text-tx-out', bg: 'bg-tx-out/10' },
  destroy:       { Icon: IconFlame,         color: 'text-tx-out', bg: 'bg-tx-out/10' },
  emigrate:      { Icon: IconLogout,        color: 'text-tx-out', bg: 'bg-tx-out/10' },
  destroyEntity: { Icon: IconTrash,         color: 'text-tx-out', bg: 'bg-tx-out/10' },
  // 资产流入 - 绿色
  receive:       { Icon: IconArrowDown,     color: 'text-tx-in', bg: 'bg-tx-in/10' },
  grab:          { Icon: IconHandGrab,      color: 'text-tx-in', bg: 'bg-tx-in/10' },
  immigrate:     { Icon: IconLogin,         color: 'text-tx-in', bg: 'bg-tx-in/10' },
  signFor:       { Icon: IconSignature,     color: 'text-tx-in', bg: 'bg-tx-in/10' },
  // 交换 - 蓝色
  exchange:      { Icon: IconArrowsExchange, color: 'text-tx-exchange', bg: 'bg-tx-exchange/10' },
  // 质押/委托 - 紫色
  stake:         { Icon: IconLock,          color: 'text-tx-lock', bg: 'bg-tx-lock/10' },
  unstake:       { Icon: IconLockOpen,      color: 'text-tx-lock', bg: 'bg-tx-lock/10' },
  trust:         { Icon: IconUserShare,     color: 'text-tx-lock', bg: 'bg-tx-lock/10' },
  // 安全 - 青色
  signature:     { Icon: IconShieldLock,    color: 'text-tx-security', bg: 'bg-tx-security/10' },
  // 创建/发行 - 橙色
  gift:          { Icon: IconGift,          color: 'text-tx-create', bg: 'bg-tx-create/10' },
  issueAsset:    { Icon: IconSparkles,      color: 'text-tx-create', bg: 'bg-tx-create/10' },
  increaseAsset: { Icon: IconCoins,         color: 'text-tx-create', bg: 'bg-tx-create/10' },
  issueEntity:   { Icon: IconDiamond,       color: 'text-tx-create', bg: 'bg-tx-create/10' },
  // 系统操作 - 灰蓝色
  locationName:  { Icon: IconMapPin,        color: 'text-tx-system', bg: 'bg-tx-system/10' },
  dapp:          { Icon: IconApps,          color: 'text-tx-system', bg: 'bg-tx-system/10' },
  certificate:   { Icon: IconCertificate,   color: 'text-tx-system', bg: 'bg-tx-system/10' },
  mark:          { Icon: IconFileText,      color: 'text-tx-system', bg: 'bg-tx-system/10' },
  other:         { Icon: IconDots,          color: 'text-tx-system', bg: 'bg-tx-system/10' },
};

/** 状态映射 (TransactionInfo.status -> TransactionStatusType) */
const STATUS_MAP: Record<string, 'success' | 'failed' | 'pending'> = {
  confirmed: 'success',
  pending: 'pending',
  failed: 'failed',
};

export function TransactionDetailPage() {
  const { t } = useTranslation('transaction');
  const { goBack } = useNavigation();
  const { txId } = useActivityParams<{ txId: string }>();
  const currentWallet = useCurrentWallet();
  const chainConfigState = useChainConfigState();
  const { transactions, isLoading } = useTransactionHistoryQuery(currentWallet?.id);

  const [copied, setCopied] = useState(false);

  // 查找交易
  const transaction = useMemo<TransactionRecord | undefined>(() => {
    return transactions.find((tx) => tx.id === txId);
  }, [transactions, txId]);

  // 获取链配置（用于构建浏览器 URL）
  const chainConfig = useMemo(() => {
    if (!transaction?.chain) return null;
    return chainConfigSelectors.getChainById(chainConfigState, transaction.chain);
  }, [chainConfigState, transaction?.chain]);

  // 构建交易浏览器 URL（没有配置则返回 null）
  const explorerTxUrl = useMemo(() => {
    const queryTx = chainConfig?.explorer?.queryTx;
    if (!queryTx || !transaction?.hash) return null;
    return queryTx.replace(':signature', transaction.hash);
  }, [transaction?.hash, chainConfig?.explorer?.queryTx]);

  // 复制交易哈希
  const handleCopyHash = useCallback(async () => {
    if (transaction?.hash) {
      await clipboardService.write({ text: transaction.hash });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [transaction?.hash]);

  // 分享（复制浏览器链接）
  const [shared, setShared] = useState(false);
  const handleShare = useCallback(async () => {
    if (!explorerTxUrl) return;
    await clipboardService.write({ text: explorerTxUrl });
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  }, [explorerTxUrl]);

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

  // 加载中
  if (isLoading) {
    return (
      <div className="bg-muted/30 flex min-h-screen flex-col">
        <PageHeader title={t('detail.title')} onBack={handleBack} />
        <div className="flex-1 space-y-4 p-4">
          <SkeletonCard className="h-48" />
          <SkeletonCard className="h-64" />
          <SkeletonCard className="h-32" />
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

  // 获取交易类型配置
  const txType = transaction.type as TransactionType;
  const config = typeConfig[txType] || typeConfig.other;
  const TxIcon = config.Icon;

  return (
    <div className="bg-muted/30 flex min-h-screen flex-col">
      <PageHeader title={t('detail.title')} onBack={handleBack} />

      <div className="flex-1 space-y-4 p-4">
        {/* 状态头 */}
        <div className="bg-card flex flex-col items-center gap-3 rounded-xl p-6 shadow-sm">
          <div className={cn('flex size-16 items-center justify-center rounded-full', config.bg)}>
            <TxIcon className={cn('size-8', config.color)} />
          </div>

          <div className="text-center">
            <p className="text-muted-foreground text-sm">{t(`type.${transaction.type}`, { defaultValue: transaction.type })}</p>
            <AmountDisplay
              value={transaction.type === 'send' ? -Math.abs(transaction.amount.toNumber()) : transaction.amount.toNumber()}
              symbol={transaction.symbol}
              sign="always"
              color="default"
              weight="normal"
              size="xl"
              className={config.color}
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
                  amount={transaction.fee.toNumber()}
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
                    <Check className="text-green-500 size-4" />
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
                onClick={handleShare}
                disabled={!explorerTxUrl}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5',
                  'bg-background border transition-colors',
                  'hover:bg-muted active:bg-muted/80',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
              >
                {shared ? (
                  <>
                    <Check className="text-green-500 size-4" />
                    <span className="text-sm">{t('detail.copied')}</span>
                  </>
                ) : (
                  <>
                    <Share className="size-4" />
                    <span className="text-sm">{t('detail.share')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
