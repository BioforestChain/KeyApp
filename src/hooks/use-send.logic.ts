import type { AssetInfo } from '@/types/asset';
import type { Amount } from '@/types/amount';
import { isValidBioforestAddress } from '@/lib/crypto';
import { isValidAddress } from '@/components/transfer/address-input';
import i18n from '@/i18n';

const t = i18n.t.bind(i18n);

export function isValidRecipientAddress(address: string, isBioforestChain: boolean): boolean {
  if (!address.trim()) return false;
  if (isBioforestChain) return isValidBioforestAddress(address);
  return isValidAddress(address);
}

export function validateAddressInput(address: string, isBioforestChain: boolean, fromAddress?: string): string | null {
  if (!address.trim()) return t('error:validation.enterRecipientAddress');
  if (!isValidRecipientAddress(address, isBioforestChain)) return t('error:validation.invalidAddressFormat');
  // BioChain 不允许自己给自己转账 // i18n-ignore
  if (isBioforestChain && fromAddress && address.trim() === fromAddress.trim())
    return t('error:validation.cannotTransferToSelf');
  return null;
}

export function validateAmountInput(amount: Amount | null, asset: AssetInfo | null): string | null {
  if (!amount) return t('error:validation.enterAmount');
  if (!asset) return null;

  if (!amount.isPositive()) return t('error:validation.enterValidAmount');
  if (amount.gt(asset.amount)) return t('error:insufficientFunds');

  return null;
}

export function canProceedToConfirm(options: {
  toAddress: string;
  amount: Amount | null;
  asset: AssetInfo | null;
  isBioforestChain: boolean;
  feeAmount?: Amount | null;
  feeLoading?: boolean;
}): boolean {
  const { toAddress, amount, asset, isBioforestChain, feeAmount, feeLoading } = options;
  if (!asset || !amount || feeLoading || !feeAmount) return false;

  return (
    toAddress.trim() !== '' &&
    isValidRecipientAddress(toAddress, isBioforestChain) &&
    amount.isPositive() &&
    amount.lte(asset.amount)
  );
}

export type FeeAdjustResult = { status: 'ok'; adjustedAmount?: Amount } | { status: 'error'; message: string };

export function adjustAmountForFee(amount: Amount | null, asset: AssetInfo, fee: Amount): FeeAdjustResult {
  if (!amount) return { status: 'error', message: t('error:validation.enterValidAmount') };

  const balance = asset.amount;

  // Only deduct fee from balance if transferring the same asset as fee
  // e.g., BioChain: fee is BFM, but transferring CPCC - don't mix them
  const isSameAsset = asset.assetType === fee.symbol;

  if (isSameAsset) {
    // Same asset: amount + fee must <= balance
    if (amount.add(fee).lte(balance)) return { status: 'ok' };
    if (!amount.eq(balance)) return { status: 'error', message: t('error:insufficientFunds') };

    const maxSendable = balance.sub(fee);
    if (!maxSendable.isPositive()) return { status: 'error', message: t('error:insufficientFunds') };

    return {
      status: 'ok',
      adjustedAmount: maxSendable,
    };
  } else {
    // Different asset: just check amount <= balance (fee is paid separately)
    if (amount.lte(balance)) return { status: 'ok' };
    return { status: 'error', message: t('error:insufficientFunds') };
  }
}
