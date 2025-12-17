import { cn } from '@/lib/utils';
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
  amount: string;
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

const typeConfig: Record<TransactionType, { label: string; Icon: Icon; color: string }> = {
  send: { label: '发送', Icon: ArrowUp, color: 'text-destructive' },
  receive: { label: '接收', Icon: ArrowDown, color: 'text-secondary' },
  swap: { label: '兑换', Icon: ArrowLeftRight, color: 'text-primary' },
  stake: { label: '质押', Icon: Lock, color: 'text-primary' },
  unstake: { label: '解押', Icon: Unlock, color: 'text-primary' },
  approve: { label: '授权', Icon: Check, color: 'text-muted-foreground' },
};

const statusConfig: Record<TransactionStatus, { label: string; color: string }> = {
  pending: { label: '处理中', color: 'text-yellow-500' },
  confirmed: { label: '已确认', color: 'text-secondary' },
  failed: { label: '失败', color: 'text-destructive' },
};

export function TransactionItem({ transaction, onClick, className }: TransactionItemProps) {
  const type = typeConfig[transaction.type];
  const status = statusConfig[transaction.status];
  const isClickable = !!onClick;
  const Icon = type.Icon;

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
        <Icon className={cn('size-5 @xs:size-6', type.color)} />
      </div>

      {/* Transaction Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium @xs:text-base">{type.label}</span>
          {transaction.status !== 'confirmed' && <span className={cn('text-xs', status.color)}>{status.label}</span>}
        </div>
        <p className="text-muted-foreground flex items-center gap-1 text-xs @xs:text-sm">
          <span className="shrink-0">{transaction.type === 'send' ? '至' : '从'}</span>
          <AddressDisplay address={transaction.address} copyable={false} className="min-w-0 flex-1" />
        </p>
      </div>

      {/* Amount & Time */}
      <div className="shrink-0 text-right">
        <AmountDisplay
          value={transaction.type === 'send' ? -Math.abs(parseFloat(transaction.amount)) : transaction.amount}
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
