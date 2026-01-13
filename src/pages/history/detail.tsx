import { useCallback, useMemo, useState } from 'react';
import { useKeyFetch } from '@biochain/key-fetch';
import { useTranslation } from 'react-i18next';
import { useNavigation, useActivityParams } from '@/stackflow';
import {
  IconCheck as Check,
  IconShare as Share,
  IconExternalLink as ExternalLink,
} from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/page-header';
import { AddressDisplay } from '@/components/wallet/address-display';
import { AmountDisplay, TimeDisplay, CopyableText } from '@/components/common';
import { TransactionStatus as TransactionStatusBadge } from '@/components/transaction/transaction-status';
import { FeeDisplay } from '@/components/transaction/fee-display';
import { SkeletonCard } from '@/components/common';
import { useTransactionHistoryQuery, type TransactionRecord } from '@/queries';
import { useCurrentWallet, useChainConfigState, chainConfigSelectors } from '@/stores';
import { cn } from '@/lib/utils';
import { clipboardService } from '@/services/clipboard';
import type { TransactionType } from '@/components/transaction/transaction-item';
import { getTransactionStatusMeta, getTransactionVisualMeta } from '@/components/transaction/transaction-meta';
import { Amount } from '@/types/amount';
import { chainConfigService } from '@/services/chain-config';
import { InvalidDataError } from '@/services/chain-adapter/providers';

function parseTxId(id: string | undefined): { chainId: string; hash: string } | null {
  if (!id) return null;
  const [chainId, hash] = id.split('--');
  if (!chainId || !hash) return null;
  return { chainId, hash };
}

function needsEnhancement(record: TransactionRecord | undefined): boolean {
  if (!record) return false;

  if (record.type === 'swap') {
    const assets = record.assets ?? [];
    return assets.length < 2;
  }

  if (record.type === 'approve' || record.type === 'interaction') {
    const method = record.contract?.method;
    const methodId = record.contract?.methodId;
    return !method && !methodId;
  }

  return false;
}

export function TransactionDetailPage() {
  const { t } = useTranslation(['transaction', 'common']);
  const { goBack } = useNavigation();
  const { txId } = useActivityParams<{ txId: string }>();
  const currentWallet = useCurrentWallet();
  const chainConfigState = useChainConfigState();
  const { transactions, isLoading } = useTransactionHistoryQuery(currentWallet?.id);

  const txFromHistory = useMemo<TransactionRecord | undefined>(() => {
    return transactions.find((tx) => tx.id === txId);
  }, [transactions, txId]);

  const parsedTxId = useMemo(() => parseTxId(txId), [txId]);

  // 构建交易详情查询 URL
  const txDetailUrl = useMemo(() => {
    if (!parsedTxId || txFromHistory) return null;
    const baseUrl = chainConfigService.getApiUrl(parsedTxId.chainId);
    if (!baseUrl) return null;
    return `${baseUrl}/transactions/query?signature=${parsedTxId.hash}`;
  }, [parsedTxId, txFromHistory]);

  // 使用 keyFetch 获取交易详情
  const txDetailQuery = useKeyFetch<{
    success: boolean;
    result?: { trs?: Array<{ transaction: { signature: string } }> };
  }>(txDetailUrl, {
    enabled: !!currentWallet?.id && !!txId && (!txFromHistory || needsEnhancement(txFromHistory)),
  });

  const enhancedTransaction = txDetailQuery.data ? txFromHistory : undefined;
  const transaction = enhancedTransaction ?? txFromHistory;

  const isPageLoading = isLoading || txDetailQuery.isLoading;

  // 获取链配置（用于构建浏览器 URL）
  const chainConfig = useMemo(() => {
    const chainId = transaction?.chain ?? parsedTxId?.chainId;
    if (!chainId) return null;
    return chainConfigSelectors.getChainById(chainConfigState, chainId);
  }, [chainConfigState, parsedTxId?.chainId, transaction?.chain]);

  // 构建交易浏览器 URL（没有配置则返回 null）
  const explorerTxUrl = useMemo(() => {
    const queryTx = chainConfig?.explorer?.queryTx;
    const hash = transaction?.hash ?? parsedTxId?.hash;
    if (!queryTx || !hash) return null;
    return queryTx.replace(':signature', hash);
  }, [chainConfig?.explorer?.queryTx, parsedTxId?.hash, transaction?.hash]);

  // 在浏览器中打开
  const handleOpenInExplorer = useCallback(() => {
    if (explorerTxUrl) {
      window.open(explorerTxUrl, '_blank', 'noopener,noreferrer');
    }
  }, [explorerTxUrl]);

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
  if (isPageLoading) {
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

  if (txDetailQuery.error instanceof InvalidDataError) {
    const fallbackHash = parsedTxId?.hash;

    return (
      <div className="bg-muted/30 flex min-h-screen flex-col">
        <PageHeader title={t('detail.title')} onBack={handleBack} />
        <div className="flex-1 space-y-4 p-4">
          <div className="bg-card flex items-center justify-center rounded-xl p-6 shadow-sm">
            <p className="text-muted-foreground">{t('detail.invalidData')}</p>
          </div>

          {fallbackHash && (
            <div className="bg-card space-y-3 rounded-xl p-4 shadow-sm">
              <h3 className="text-muted-foreground text-sm font-medium">{t('detail.hash')}</h3>
              <CopyableText
                text={fallbackHash}
                className="text-muted-foreground text-xs"
              />

              <div className="flex gap-2">
                <button
                  onClick={handleOpenInExplorer}
                  disabled={!explorerTxUrl}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5',
                    'bg-background border transition-colors',
                    'hover:bg-muted active:bg-muted/80',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                  )}
                >
                  <ExternalLink className="size-4" />
                  <span className="text-sm">{t('detail.openInExplorer')}</span>
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
  const typeMeta = getTransactionVisualMeta(txType);
  const TxIcon = typeMeta.Icon;

  const swapFromAsset = transaction.type === 'swap' ? transaction.assets?.[0] : undefined;
  const swapToAsset = transaction.type === 'swap' ? transaction.assets?.[1] : undefined;
  const contractAddress = transaction.contract?.address || transaction.to;
  const contractMethod = transaction.contract?.method;
  const contractMethodId = transaction.contract?.methodId;

  const contractMethodLabel = contractMethod ? t(`method.${contractMethod}`, { defaultValue: contractMethod }) : null;

  const swapHeaderFrom = swapFromAsset
    ? Amount.fromRaw(swapFromAsset.value, swapFromAsset.decimals, swapFromAsset.symbol)
    : null;
  const swapHeaderTo = swapToAsset
    ? Amount.fromRaw(swapToAsset.value, swapToAsset.decimals, swapToAsset.symbol)
    : null;

  return (
    <div className="bg-muted/30 flex min-h-screen flex-col">
      <PageHeader title={t('detail.title')} onBack={handleBack} />

      <div className="flex-1 space-y-4 p-4">
        {/* 状态头 */}
        <div className="bg-card flex flex-col items-center gap-3 rounded-xl p-6 shadow-sm">
          <div className={cn('flex size-16 items-center justify-center rounded-full', typeMeta.bg)}>
            <TxIcon className={cn('size-8', typeMeta.color)} />
          </div>

          <div className="text-center">
            <p className="text-muted-foreground text-sm">{t(`type.${transaction.type}`, { defaultValue: transaction.type })}</p>
            {transaction.type === 'swap' && swapHeaderFrom && swapHeaderTo ? (
              <div className={cn('flex items-center justify-center gap-2', typeMeta.color)}>
                <AmountDisplay
                  value={swapHeaderFrom.toNumber()}
                  symbol={swapHeaderFrom.symbol}
                  decimals={swapHeaderFrom.decimals}
                  sign="never"
                  color="default"
                  weight="normal"
                  size="lg"
                />
                <span className="text-lg">→</span>
                <AmountDisplay
                  value={swapHeaderTo.toNumber()}
                  symbol={swapHeaderTo.symbol}
                  decimals={swapHeaderTo.decimals}
                  sign="never"
                  color="default"
                  weight="normal"
                  size="lg"
                />
              </div>
            ) : (
              <AmountDisplay
                value={transaction.type === 'send' ? -Math.abs(transaction.amount.toNumber()) : transaction.amount.toNumber()}
                symbol={transaction.symbol}
                sign={typeMeta.amountSign}
                color="default"
                weight="normal"
                size="xl"
                className={typeMeta.color}
              />
            )}
          </div>

          <TransactionStatusBadge
            status={getTransactionStatusMeta(transaction.status).badgeStatus}
            label={t(`transaction:status.${transaction.status}`)}
          />
        </div>

        {/* 详细信息 */}
        <div className="bg-card space-y-3 rounded-xl p-4 shadow-sm">
          <h3 className="text-muted-foreground text-sm font-medium">{t('detail.info')}</h3>

          {/* 地址 */}
          {transaction.from && transaction.to ? (
            <>
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground text-sm">{t('detail.fromAddress')}</span>
                <AddressDisplay address={transaction.from} copyable className="text-sm" />
              </div>

              <div className="bg-border h-px" />

              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground text-sm">{t('detail.toAddress')}</span>
                <AddressDisplay address={transaction.to} copyable className="text-sm" />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground text-sm">
                {transaction.type === 'send' ? t('detail.toAddress') : t('detail.fromAddress')}
              </span>
              <AddressDisplay address={transaction.address} copyable className="text-sm" />
            </div>
          )}

          <div className="bg-border h-px" />

          {/* Swap */}
          {transaction.type === 'swap' && (swapFromAsset || swapToAsset) && (
            <>
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground text-sm">{t('detail.swapFrom')}</span>
                <span className="text-sm font-medium">
                  {swapFromAsset ? (
                    <AmountDisplay
                      value={Amount.fromRaw(swapFromAsset.value, swapFromAsset.decimals, swapFromAsset.symbol).toNumber()}
                      symbol={swapFromAsset.symbol}
                      decimals={swapFromAsset.decimals}
                      sign="never"
                      color="default"
                      size="sm"
                    />
                  ) : (
                    '-'
                  )}
                </span>
              </div>

              <div className="bg-border h-px" />

              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground text-sm">{t('detail.swapTo')}</span>
                <span className="text-sm font-medium">
                  {swapToAsset ? (
                    <AmountDisplay
                      value={Amount.fromRaw(swapToAsset.value, swapToAsset.decimals, swapToAsset.symbol).toNumber()}
                      symbol={swapToAsset.symbol}
                      decimals={swapToAsset.decimals}
                      sign="never"
                      color="default"
                      size="sm"
                    />
                  ) : (
                    '-'
                  )}
                </span>
              </div>

              <div className="bg-border h-px" />
            </>
          )}

          {/* 合约信息 */}
          {(transaction.type === 'approve' || transaction.type === 'interaction' || transaction.type === 'swap') && contractAddress && (
            <>
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground text-sm">{t('detail.contractAddress')}</span>
                <AddressDisplay address={contractAddress} copyable className="text-sm" />
              </div>

              {(transaction.type === 'approve' || transaction.type === 'interaction') && (
                <>
                  <div className="bg-border h-px" />
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground text-sm">{t('detail.method')}</span>
                    <span className="text-sm font-medium font-mono">
                      {contractMethodLabel || contractMethodId || t('common:unknown')}
                    </span>
                  </div>

                  {transaction.type === 'approve' && (
                    <>
                      <div className="bg-border h-px" />
                      <div className="flex items-center justify-between py-2">
                        <span className="text-muted-foreground text-sm">{t('detail.spender')}</span>
                        <span className="text-sm font-medium">{t('common:unknown')}</span>
                      </div>

                      <div className="bg-border h-px" />
                      <div className="flex items-center justify-between py-2">
                        <span className="text-muted-foreground text-sm">{t('detail.allowance')}</span>
                        <span className="text-sm font-medium">{t('common:unknown')}</span>
                      </div>
                    </>
                  )}
                </>
              )}

              <div className="bg-border h-px" />
            </>
          )}

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
            <CopyableText
              text={transaction.hash}
              className="text-muted-foreground text-xs"
            />

            <div className="flex gap-2">
              <button
                onClick={handleOpenInExplorer}
                disabled={!explorerTxUrl}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5',
                  'bg-background border transition-colors',
                  'hover:bg-muted active:bg-muted/80',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
              >
                <ExternalLink className="size-4" />
                <span className="text-sm">{t('detail.openInExplorer')}</span>
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
