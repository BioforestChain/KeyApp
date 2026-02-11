import { describe, expect, it } from 'vitest';
import {
  formatMiniappTransferAmountForDisplay,
  isMiniappRawAmount,
  parseMiniappTransferAmountRaw,
} from '../miniapp-transfer-amount';

describe('miniapp-transfer-amount', () => {
  it('accepts raw integer amount', () => {
    expect(isMiniappRawAmount('1000000000')).toBe(true);
    expect(isMiniappRawAmount(' 1000000000 ')).toBe(true);
  });

  it('rejects non-raw amount', () => {
    expect(isMiniappRawAmount('10.00000000')).toBe(false);
    expect(isMiniappRawAmount('-100')).toBe(false);
    expect(isMiniappRawAmount('1e9')).toBe(false);
  });

  it('parses raw amount with decimals correctly', () => {
    const amount = parseMiniappTransferAmountRaw('1000000000', 8, 'USDT');
    expect(amount.toRawString()).toBe('1000000000');
    expect(amount.toFormatted({ trimTrailingZeros: false })).toBe('10.00000000');
  });

  it('formats display amount from raw', () => {
    expect(formatMiniappTransferAmountForDisplay('1000000000', 8, 'USDT')).toBe('10.00000000');
  });

  it('throws when amount is not raw integer', () => {
    expect(() => parseMiniappTransferAmountRaw('10.00000000', 8, 'USDT')).toThrow('Invalid miniapp transfer amount');
  });
});
