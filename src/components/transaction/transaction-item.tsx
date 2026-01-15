import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { AddressDisplay } from '../wallet/address-display';
import { ChainIcon } from '../wallet/chain-icon';
import { AmountDisplay, TimeDisplay } from '../common';
import { IconRefresh, IconTrash } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import type { TransactionInfo } from './types';
import { getTransactionStatusColor, getTransactionVisualMeta } from './transaction-meta';

export type { TransactionInfo, TransactionStatus, TransactionType } from './types';

interface TransactionItemProps {
  transaction: TransactionInfo;
  onClick?: (() => void) | undefined;
  className?: string | undefined;
  /** 是否显示链图标（右下角小徽章） */
  showChainIcon?: boolean | undefined;
  /** 重试回调（仅待处理交易）*/
  onRetry?: (() => void) | undefined;
  /** 删除回调（仅待处理交易）*/
  onDelete?: (() => void) | undefined;
}

export function TransactionItem({
  transaction,
  onClick,
  className,
  showChainIcon,
  onRetry,
  onDelete,
}: TransactionItemProps) {
  const { t } = useTranslation('transaction');
  const typeMeta = getTransactionVisualMeta(transaction.type);
  const statusColor = getTransactionStatusColor(transaction.status);
  const isClickable = !!onClick;
  const isPending = transaction.status === 'pending';
  const isFailed = transaction.status === 'failed';
  const hasActions = onRetry || onDelete;
  const Icon = typeMeta.Icon;

  // Get the amount value for display
  const amountValue = transaction.type === 'send'
    ? -Math.abs(transaction.amount.toNumber())
    : transaction.amount.toNumber();

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={isClickable ? (e) => e.key === 'Enter' && onClick?.() : undefined}
      className={cn(
        '@container flex items-center gap-3 rounded-xl p-3 transition-colors',
        isClickable && 'hover:bg-muted/50 active:bg-muted cursor-pointer',
        className,
      )}
    >
      {/* Type Icon with optional Chain Badge */}
      <div className="relative">
        <div
          className={cn(
            'flex size-10 items-center justify-center rounded-full @xs:size-12',
            typeMeta.bg,
            isPending && 'animate-pulse', // 添加脉冲动画for pending状态
          )}
        >
          <Icon className={cn(
            'size-5 @xs:size-6',
            typeMeta.color,
            isPending && 'animate-spin-slow' // 图标旋转动画
          )} />
        </div>
        {showChainIcon && transaction.chain && (
          <ChainIcon
            chain={transaction.chain}
            size="sm"
            className="ring-background absolute -right-0.5 -bottom-0.5 size-4 text-[8px] ring-2"
          />
        )}
      </div>

      {/* Transaction Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium @xs:text-base">{t(`type.${transaction.type}`)}</span>
          {transaction.status !== 'confirmed' && <span className={cn('text-xs', statusColor)}>{t(`status.${transaction.status}`)}</span>}
        </div>
        {transaction.type !== 'signature' && (
          <p className="text-muted-foreground flex items-center gap-1 text-xs @xs:text-sm">
            <span className="shrink-0">{transaction.type === 'send' ? t('toAddress') : t('fromAddress')}</span>
            <AddressDisplay address={transaction.address} copyable={false} className="min-w-0 flex-1" />
          </p>
        )}
      </div>

      {/* Amount & Time or Actions */}
      {hasActions ? (
        <div className="flex shrink-0 flex-col gap-1">
          {isFailed && onRetry && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={(e) => { e.stopPropagation(); onRetry() }}
              title={t('pendingTx.retry')}
            >
              <IconRefresh className="size-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive size-8"
              onClick={(e) => { e.stopPropagation(); onDelete() }}
              title={t('pendingTx.delete')}
            >
              <IconTrash className="size-4" />
            </Button>
          )}
        </div>
      ) : (
        <div className="shrink-0 text-right">
          <AmountDisplay
            value={amountValue}
            symbol={transaction.symbol}
            decimals={transaction.amount.decimals}
            sign={typeMeta.amountSign}
            color="default"
            weight="normal"
            size="sm"
            className={cn('@xs:text-base', typeMeta.color)}
          />
          <TimeDisplay value={transaction.timestamp} className="text-muted-foreground block text-xs" />
        </div>
      )}
    </div>
  );
}
