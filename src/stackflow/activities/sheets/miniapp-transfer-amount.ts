import { Amount } from '@/types/amount';

const RAW_AMOUNT_PATTERN = /^\d+$/;

export function isMiniappRawAmount(value: string): boolean {
  const normalized = value.trim();
  return RAW_AMOUNT_PATTERN.test(normalized);
}

export function parseMiniappTransferAmountRaw(value: string, decimals: number, symbol: string): Amount {
  const normalized = value.trim();
  if (!RAW_AMOUNT_PATTERN.test(normalized)) {
    throw new Error('Invalid miniapp transfer amount');
  }
  return Amount.fromRaw(normalized, decimals, symbol);
}

export function formatMiniappTransferAmountForDisplay(value: string, decimals: number, symbol: string): string {
  return parseMiniappTransferAmountRaw(value, decimals, symbol).toFormatted({ trimTrailingZeros: false });
}

