import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { Amount } from '@/types/amount';
import { AddressDisplay } from '../wallet/address-display';
import { AmountDisplay, TimeDisplay } from '../common';
import {
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

export type TransactionType =
  | 'send' | 'receive' | 'signature'
  | 'stake' | 'unstake' | 'destroy'
  | 'gift' | 'grab' | 'trust' | 'signFor'
  | 'emigrate' | 'immigrate' | 'exchange'
  | 'issueAsset' | 'increaseAsset'
  | 'issueEntity' | 'destroyEntity'
  | 'locationName' | 'dapp' | 'certificate' | 'mark' | 'other';

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

// 颜色按类别归类，图标各不相同
const typeIcons: Record<TransactionType, { Icon: Icon; color: string; bg: string }> = {
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
          typeIcon.bg,
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
        {transaction.type !== 'signature' && (
        <p className="text-muted-foreground flex items-center gap-1 text-xs @xs:text-sm">
          <span className="shrink-0">{transaction.type === 'send' ? t('toAddress') : t('fromAddress')}</span>
          <AddressDisplay address={transaction.address} copyable={false} className="min-w-0 flex-1" />
        </p>
        )}
      </div>

      {/* Amount & Time */}
      <div className="shrink-0 text-right">
        <AmountDisplay
          value={amountValue}
          symbol={transaction.symbol}
          sign="always"
          color="default"
          weight="normal"
          size="sm"
          className={cn('@xs:text-base', typeIcon.color)}
        />
        <TimeDisplay value={transaction.timestamp} className="text-muted-foreground block text-xs" />
      </div>
    </div>
  );
}
