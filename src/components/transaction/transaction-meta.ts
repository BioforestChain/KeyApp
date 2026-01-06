import {
  IconArrowUp,
  IconArrowDown,
  IconArrowsExchange,
  IconRepeat,
  IconLock,
  IconLockOpen,
  IconShieldLock,
  IconShieldCheck,
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
  IconClick,
} from '@tabler/icons-react';
import type { Icon } from '@tabler/icons-react';
import type { TransactionStatus, TransactionType } from './types';
import type { TransactionStatusType } from './transaction-status';
import type { Action, Direction } from '@/services/chain-adapter/providers/types';

export type AmountSign = 'auto' | 'always' | 'never';

export interface TransactionVisualMeta {
  Icon: Icon;
  color: string;
  bg: string;
  titleKey: string;
  amountSign: AmountSign;
}

const OUT_META: Pick<TransactionVisualMeta, 'amountSign'> = { amountSign: 'always' };
const IN_META: Pick<TransactionVisualMeta, 'amountSign'> = { amountSign: 'always' };
const NEUTRAL_META: Pick<TransactionVisualMeta, 'amountSign'> = { amountSign: 'always' };

const TYPE_META: Record<TransactionType, TransactionVisualMeta> = {
  // 资产流出 - 红橙色
  send: { Icon: IconArrowUp, color: 'text-tx-out', bg: 'bg-tx-out/10', titleKey: 'type.send', ...OUT_META },
  destroy: { Icon: IconFlame, color: 'text-tx-out', bg: 'bg-tx-out/10', titleKey: 'type.destroy', ...OUT_META },
  emigrate: { Icon: IconLogout, color: 'text-tx-out', bg: 'bg-tx-out/10', titleKey: 'type.emigrate', ...OUT_META },
  destroyEntity: { Icon: IconTrash, color: 'text-tx-out', bg: 'bg-tx-out/10', titleKey: 'type.destroyEntity', ...OUT_META },

  // 资产流入 - 绿色
  receive: { Icon: IconArrowDown, color: 'text-tx-in', bg: 'bg-tx-in/10', titleKey: 'type.receive', ...IN_META },
  grab: { Icon: IconHandGrab, color: 'text-tx-in', bg: 'bg-tx-in/10', titleKey: 'type.grab', ...IN_META },
  immigrate: { Icon: IconLogin, color: 'text-tx-in', bg: 'bg-tx-in/10', titleKey: 'type.immigrate', ...IN_META },
  signFor: { Icon: IconSignature, color: 'text-tx-in', bg: 'bg-tx-in/10', titleKey: 'type.signFor', ...IN_META },

  // 交换 / Swap
  exchange: { Icon: IconArrowsExchange, color: 'text-tx-exchange', bg: 'bg-tx-exchange/10', titleKey: 'type.exchange', ...NEUTRAL_META },
  swap: { Icon: IconRepeat, color: 'text-tx-exchange', bg: 'bg-tx-exchange/10', titleKey: 'type.swap', amountSign: 'never' },

  // 质押/委托 - 紫色
  stake: { Icon: IconLock, color: 'text-tx-lock', bg: 'bg-tx-lock/10', titleKey: 'type.stake', ...NEUTRAL_META },
  unstake: { Icon: IconLockOpen, color: 'text-tx-lock', bg: 'bg-tx-lock/10', titleKey: 'type.unstake', ...NEUTRAL_META },
  trust: { Icon: IconUserShare, color: 'text-tx-lock', bg: 'bg-tx-lock/10', titleKey: 'type.trust', ...NEUTRAL_META },

  // 安全 - 青色
  signature: { Icon: IconShieldLock, color: 'text-tx-security', bg: 'bg-tx-security/10', titleKey: 'type.signature', ...NEUTRAL_META },

  // 创建/发行 - 橙色
  gift: { Icon: IconGift, color: 'text-tx-create', bg: 'bg-tx-create/10', titleKey: 'type.gift', ...NEUTRAL_META },
  issueAsset: { Icon: IconSparkles, color: 'text-tx-create', bg: 'bg-tx-create/10', titleKey: 'type.issueAsset', ...NEUTRAL_META },
  increaseAsset: { Icon: IconCoins, color: 'text-tx-create', bg: 'bg-tx-create/10', titleKey: 'type.increaseAsset', ...NEUTRAL_META },
  mint: { Icon: IconCoins, color: 'text-tx-create', bg: 'bg-tx-create/10', titleKey: 'type.mint', ...NEUTRAL_META },
  issueEntity: { Icon: IconDiamond, color: 'text-tx-create', bg: 'bg-tx-create/10', titleKey: 'type.issueEntity', ...NEUTRAL_META },

  // 系统操作 - 灰蓝色
  locationName: { Icon: IconMapPin, color: 'text-tx-system', bg: 'bg-tx-system/10', titleKey: 'type.locationName', ...NEUTRAL_META },
  dapp: { Icon: IconApps, color: 'text-tx-system', bg: 'bg-tx-system/10', titleKey: 'type.dapp', ...NEUTRAL_META },
  certificate: { Icon: IconCertificate, color: 'text-tx-system', bg: 'bg-tx-system/10', titleKey: 'type.certificate', ...NEUTRAL_META },
  mark: { Icon: IconFileText, color: 'text-tx-system', bg: 'bg-tx-system/10', titleKey: 'type.mark', ...NEUTRAL_META },

  // 合约交互 - 灰蓝色
  approve: { Icon: IconShieldCheck, color: 'text-tx-system', bg: 'bg-tx-system/10', titleKey: 'type.approve', ...NEUTRAL_META },
  interaction: { Icon: IconClick, color: 'text-tx-system', bg: 'bg-tx-system/10', titleKey: 'type.interaction', ...NEUTRAL_META },

  other: { Icon: IconDots, color: 'text-tx-system', bg: 'bg-tx-system/10', titleKey: 'type.other', ...NEUTRAL_META },
};

const STATUS_COLOR: Record<TransactionStatus, string> = {
  pending: 'text-yellow-500',
  confirmed: 'text-green-500',
  failed: 'text-destructive',
};

export function getTransactionVisualMeta(type: TransactionType): TransactionVisualMeta {
  return TYPE_META[type] ?? TYPE_META.other;
}

export function getTransactionStatusColor(status: TransactionStatus): string {
  return STATUS_COLOR[status];
}

export interface TransactionStatusMeta {
  badgeStatus: TransactionStatusType;
}

export function getTransactionStatusMeta(status: TransactionStatus): TransactionStatusMeta {
  if (status === 'confirmed') return { badgeStatus: 'success' };
  if (status === 'failed') return { badgeStatus: 'failed' };
  return { badgeStatus: 'pending' };
}

// ==================== Provider Action → UI Type Mapping ====================
// This is the single source of truth for mapping chain-adapter Action to UI TransactionType

const ACTION_TO_UI_TYPE: Partial<Record<Action, TransactionType>> = {
  gift: 'gift',
  grab: 'grab',
  trust: 'trust',
  signFor: 'signFor',
  signature: 'signature',
  emigrate: 'emigrate',
  immigrate: 'immigrate',
  swap: 'swap',
  exchange: 'exchange',
  stake: 'stake',
  unstake: 'unstake',
  issueAsset: 'issueAsset',
  increaseAsset: 'increaseAsset',
  mint: 'mint',
  destroyAsset: 'destroy',
  issueEntity: 'issueEntity',
  destroyEntity: 'destroyEntity',
  locationName: 'locationName',
  dapp: 'dapp',
  certificate: 'certificate',
  mark: 'mark',
  approve: 'approve',
  burn: 'destroy',
  claim: 'receive',
  contract: 'interaction',
};

/**
 * Maps provider Action + Direction to UI TransactionType.
 * This is the canonical mapping - all consumers should use this function.
 */
export function mapActionToTransactionType(action: Action, direction: Direction): TransactionType {
  const mapped = ACTION_TO_UI_TYPE[action];
  if (mapped) return mapped;

  // For transfer/unknown, use direction to determine type
  if (action === 'transfer' || action === 'unknown') {
    if (direction === 'out') return 'send';
    if (direction === 'in') return 'receive';
    return 'other'; // self transfer
  }

  return 'other';
}
