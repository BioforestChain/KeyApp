/**
 * Transaction Detail Page
 * 
 * 使用 ChainProviderGate 包裹确保 ChainProvider 存在
 */

import { useCallback, useMemo, useState } from 'react';
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
import { InvalidDataError, type Transaction } from '@/services/chain-adapter/providers';
import { ChainProviderGate, useChainProvider } from '@/contexts';
import { useCurrentWallet, useChainConfigState, chainConfigSelectors } from '@/stores';
import { cn } from '@/lib/utils';
import { clipboardService } from '@/services/clipboard';
import type { TransactionType } from '@/components/transaction/transaction-item';
import { getTransactionStatusMeta, getTransactionVisualMeta } from '@/components/transaction/transaction-meta';
import { Amount } from '@/types/amount';
import keyFetch from '@biochain/key-fetch';

// Action 到 TransactionType 的映射
const ACTION_TO_TYPE: Record<string, TransactionType> = {
  transfer: 'send', swap: 'swap', exchange: 'exchange', approve: 'approve',
  signature: 'signature', stake: 'stake', unstake: 'unstake', mint: 'mint',
  burn: 'destroy', gift: 'gift', grab: 'grab', trust: 'trust', signFor: 'signFor',
  emigrate: 'emigrate', immigrate: 'immigrate', issueAsset: 'issueAsset',
  increaseAsset: 'increaseAsset', destroyAsset: 'destroy', issueEntity: 'issueEntity',
  destroyEntity: 'destroyEntity', locationName: 'locationName', dapp: 'dapp',
  certificate: 'certificate', mark: 'mark', contract: 'interaction', unknown: 'other',
  revoke: 'approve', claim: 'receive',
}

// 将 API Transaction 转换为页面使用的格式
interface AdaptedTransaction {
  hash: string
  from: string
  to: string
  address: string  // 根据 direction 确定的显示地址
  timestamp: number
  status: 'pending' | 'confirmed' | 'failed'
  type: TransactionType
  direction: 'in' | 'out' | 'self'
  amount: Amount
  symbol: string
  chain?: string
  assets?: Transaction['assets']
  fee?: Amount  // 转换为 Amount 对象
  contract?: Transaction['contract']
  blockNumber?: bigint
  confirmations?: number  // 可选，需要额外计算
}

function adaptTransaction(tx: Transaction, chainId?: string): AdaptedTransaction {
  const action = tx.action
  const direction = tx.direction
  const type = action === 'transfer'
    ? (direction === 'in' ? 'receive' : 'send')
    : (ACTION_TO_TYPE[action] ?? 'other')

  const asset = tx.assets[0]
  const value = asset.assetType === 'nft' ? '1' : asset.value
  const decimals = asset.assetType === 'nft' ? 0 : asset.decimals
  const symbol = asset.assetType === 'nft' ? 'NFT' : asset.symbol

  // 根据 direction 确定显示的地址
  const address = direction === 'in' ? tx.from : tx.to

  return {
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    address,
    timestamp: tx.timestamp,
    status: tx.status,
    type,
    direction,
    amount: Amount.fromRaw(value, decimals, symbol),
    symbol,
    chain: chainId,
    assets: tx.assets,
    fee: tx.fee ? Amount.fromRaw(tx.fee.value, tx.fee.decimals, tx.fee.symbol) : undefined,
    contract: tx.contract,
    blockNumber: tx.blockNumber,
  }
}

// 安全获取资产的 value/decimals/symbol（NFT 没有这些字段）
function getAssetAmount(asset: NonNullable<Transaction['assets']>[0] | undefined): { value: string, decimals: number, symbol: string } | null {
  if (!asset) return null
  if (asset.assetType === 'nft') return null
  return { value: asset.value, decimals: asset.decimals, symbol: asset.symbol }
}

function parseTxId(id: string | undefined): { chainId: string; hash: string } | null {
  if (!id) return null;
  const [chainId, hash] = id.split('--');
  if (!chainId || !hash) return null;
  return { chainId, hash };
}

// ==================== 内部组件：使用 ChainProvider 获取交易数据 ====================

interface TransactionDetailContentProps {
  hash: string
  chainId: string
  /** Optional pre-loaded transaction data (serialized JSON). When provided, skips network fetch */
  txData?: string
  onBack: () => void
}

function TransactionDetailContent({ hash, chainId, txData, onBack }: TransactionDetailContentProps) {
  const { t } = useTranslation(['transaction', 'common']);
  const chainConfigState = useChainConfigState();

  // 使用 useChainProvider() 获取确保非空的 provider
  const chainProvider = useChainProvider();

  // 解析传入的初始数据（用于即时显示，避免加载闪烁）
  const initialTransaction = useMemo(
    () => txData ? keyFetch.superjson.parse<Transaction>(txData) : null,
    [txData]
  );

  // 始终订阅链上交易状态，实现实时更新（当交易确认时自动刷新）
  // 即使有 initialTransaction 也要订阅，以便获取最新状态
  const { data: fetchedTransaction, isLoading, error } = chainProvider.transaction.useState(
    { txHash: hash },
    { enabled: !!hash }
  );

  // 优先使用链上获取的最新数据，若尚未加载则使用初始数据
  const rawTransaction = fetchedTransaction ?? initialTransaction;

  // 转换为页面使用的格式
  const transaction = useMemo(
    () => rawTransaction ? adaptTransaction(rawTransaction, chainId) : null,
    [rawTransaction, chainId]
  )

  // 获取链配置（用于构建浏览器 URL）
  const chainConfig = useMemo(() => {
    const cid = transaction?.chain ?? chainId;
    if (!cid) return null;
    return chainConfigSelectors.getChainById(chainConfigState, cid);
  }, [chainConfigState, chainId, transaction?.chain]);

  // 构建交易浏览器 URL（没有配置则返回 null）
  const explorerTxUrl = useMemo(() => {
    const queryTx = chainConfig?.explorer?.queryTx;
    if (!queryTx || !hash) return null;
    return queryTx.replace(':signature', hash);
  }, [chainConfig?.explorer?.queryTx, hash]);

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

  // 加载中（只有当没有初始数据且正在加载时才显示骨架屏）
  if (isLoading && !initialTransaction) {
    return (
      <div className="bg-muted/30 flex min-h-screen flex-col">
        <PageHeader title={t('detail.title')} onBack={onBack} />
        <div className="flex-1 space-y-4 p-4">
          <SkeletonCard className="h-48" />
          <SkeletonCard className="h-64" />
          <SkeletonCard className="h-32" />
        </div>
      </div>
    );
  }

  if (error instanceof InvalidDataError) {
    return (
      <div className="bg-muted/30 flex min-h-screen flex-col">
        <PageHeader title={t('detail.title')} onBack={onBack} />
        <div className="flex-1 space-y-4 p-4">
          <div className="bg-card flex items-center justify-center rounded-xl p-6 shadow-sm">
            <p className="text-muted-foreground">{t('detail.invalidData')}</p>
          </div>

          {hash && (
            <div className="bg-card space-y-3 rounded-xl p-4 shadow-sm">
              <h3 className="text-muted-foreground text-sm font-medium">{t('detail.hash')}</h3>
              <CopyableText
                text={hash}
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
        <PageHeader title={t('detail.title')} onBack={onBack} />
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

  const swapFromAssetRaw = transaction.type === 'swap' ? transaction.assets?.[0] : undefined;
  const swapToAssetRaw = transaction.type === 'swap' ? transaction.assets?.[1] : undefined;
  const swapFromAsset = getAssetAmount(swapFromAssetRaw);
  const swapToAsset = getAssetAmount(swapToAssetRaw);
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
      <PageHeader title={t('detail.title')} onBack={onBack} />

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
                  amount={transaction.fee?.toNumber?.() ?? 0}
                  symbol={transaction.fee?.symbol ?? ''}
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
        {hash && (
          <div className="bg-card space-y-3 rounded-xl p-4 shadow-sm">
            <h3 className="text-muted-foreground text-sm font-medium">{t('detail.hash')}</h3>
            <CopyableText
              text={hash}
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

// ==================== 主组件：使用 ChainProviderGate 包裹 ====================

export function TransactionDetailPage() {
  const { t } = useTranslation(['transaction', 'common']);
  const { goBack } = useNavigation();
  const { txId, txData } = useActivityParams<{ txId: string; txData?: string }>();
  const currentWallet = useCurrentWallet();

  // 解析 txId 获取 chainId 和 hash
  const parsedTxId = useMemo(() => parseTxId(txId), [txId]);

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

  // 无效的 txId
  if (!parsedTxId) {
    return (
      <div className="bg-muted/30 flex min-h-screen flex-col">
        <PageHeader title={t('detail.title')} onBack={handleBack} />
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-muted-foreground">{t('detail.notFound')}</p>
        </div>
      </div>
    );
  }

  // 使用 ChainProviderGate 包裹内容
  return (
    <ChainProviderGate
      chainId={parsedTxId.chainId}
      fallback={
        <div className="bg-muted/30 flex min-h-screen flex-col">
          <PageHeader title={t('detail.title')} onBack={handleBack} />
          <div className="flex flex-1 items-center justify-center p-4">
            <p className="text-muted-foreground">Chain not supported</p>
          </div>
        </div>
      }
    >
      <TransactionDetailContent
        hash={parsedTxId.hash}
        chainId={parsedTxId.chainId}
        txData={txData}
        onBack={handleBack}
      />
    </ChainProviderGate>
  );
}
