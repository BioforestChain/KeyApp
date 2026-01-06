import type { Amount } from '@/types/amount';
import type { ChainType } from '@/stores';

export type TransactionType =
  | 'send'
  | 'receive'
  | 'signature'
  | 'stake'
  | 'unstake'
  | 'destroy'
  | 'gift'
  | 'grab'
  | 'trust'
  | 'signFor'
  | 'emigrate'
  | 'immigrate'
  | 'exchange'
  | 'swap'
  | 'issueAsset'
  | 'increaseAsset'
  | 'mint'
  | 'issueEntity'
  | 'destroyEntity'
  | 'locationName'
  | 'dapp'
  | 'certificate'
  | 'mark'
  | 'approve'
  | 'interaction'
  | 'other';

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
  /** 链类型，用于显示链图标 */
  chain?: ChainType | undefined;
}
