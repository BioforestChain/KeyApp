import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { Amount } from '@/types/amount';
import { AddressDisplay } from '../wallet/address-display';
import { AmountDisplay, TimeDisplay } from '../common';
import {
  IconArrowUp as ArrowUp,
  IconArrowDown as ArrowDown,
  IconArrowLeftRight as ArrowLeftRight,
  IconLock as Lock,
  IconLockOpen2 as Unlock,
  IconCheck as Check,
} from '@tabler/icons-react';
import type { Icon } from '@tabler/icons-react';

export type TransactionType = 'send' | 'receive' | 'swap' | 'stake' | 'unstake' | 'approve';
export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

export interface TransactionInfo {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: Amount;
  symbol: string;
  address: string;
  timestamp: Date | string;
  hash?: string | undefined;
}

interface TransactionItemProps {
  transaction: TransactionInfo;
  onClick?: (() => void) | undefined;
  className?: string | undefined;
}

const typeIcons: Record<TransactionType, { Icon: Icon; color: string }> = {
  send: { Icon: ArrowUp, color: 'text-destructive' },
  receive: { Icon: ArrowDown, color: 'text-secondary' },
  swap: { Icon: ArrowLeftRight, color: 'text-primary' },
  stake: { Icon: Lock, color: 'text-primary' },
  unstake: { Icon: Unlock, color: 'text-primary' },
  approve: { Icon: Check, color: 'text-muted-foreground' },
};

const statusColors: Record<TransactionStatus, string> = {
  pending: 'text-yellow-500',
  confirmed: 'text-secondary',
  failed: 'text-destructive',
};

export function TransactionItem({ transaction, onClick, className }: TransactionItemProps) {
  const { t } = useTranslation('transaction');
  const typeIcon = typeIcons[transaction.type];
  const statusColor = statusColors[transaction.status];
  const isClickable = !!onClick;
  const Icon = typeIcon.Icon;

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
      {/* Type Icon */}
      <div
        className={cn(
          'flex size-10 items-center justify-center rounded-full @xs:size-12',
          transaction.type === 'send' && 'bg-destructive/10',
          transaction.type === 'receive' && 'bg-secondary/10',
          transaction.type === 'swap' && 'bg-primary/10',
          (transaction.type === 'stake' || transaction.type === 'unstake') && 'bg-primary/10',
          transaction.type === 'approve' && 'bg-muted',
        )}
      >
        <Icon className={cn('size-5 @xs:size-6', typeIcon.color)} />
      </div>

      {/* Transaction Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium @xs:text-base">{t(`type.${transaction.type}`)}</span>
          {transaction.status !== 'confirmed' && <span className={cn('text-xs', statusColor)}>{t(`status.${transaction.status}`)}</span>}
        </div>
        <p className="text-muted-foreground flex items-center gap-1 text-xs @xs:text-sm">
          <span className="shrink-0">{transaction.type === 'send' ? t('toAddress') : t('fromAddress')}</span>
          <AddressDisplay address={transaction.address} copyable={false} className="min-w-0 flex-1" />
        </p>
      </div>

      {/* Amount & Time */}
      <div className="shrink-0 text-right">
        <AmountDisplay
          value={amountValue}
          symbol={transaction.symbol}
          sign="always"
          color="auto"
          weight="semibold"
          size="sm"
          className="@xs:text-base"
        />
        <TimeDisplay value={transaction.timestamp} className="text-muted-foreground block text-xs" />
      </div>
    </div>
  );
}
