import { Amount } from '@/types/amount';

const RAW_AMOUNT_PATTERN = /^\d+$/;

export function isRawAmountString(value: string): boolean {
  return RAW_AMOUNT_PATTERN.test(value.trim());
}

export function parseRawAmount(value: string, decimals: number, symbol: string): Amount {
  const normalized = value.trim();
  if (!RAW_AMOUNT_PATTERN.test(normalized)) {
    throw new Error('Invalid raw amount');
  }
  return Amount.fromRaw(normalized, decimals, symbol);
}
