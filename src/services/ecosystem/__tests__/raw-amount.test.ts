import { describe, expect, it } from 'vitest';

import { isRawAmountString, parseRawAmount } from '../raw-amount';

describe('raw amount helpers', () => {
  it('accepts integer raw amount string', () => {
    expect(isRawAmountString('1000000000')).toBe(true);
    expect(isRawAmountString(' 1000000000 ')).toBe(true);
  });

  it('rejects formatted and non-decimal values', () => {
    expect(isRawAmountString('10.00000000')).toBe(false);
    expect(isRawAmountString('-100')).toBe(false);
    expect(isRawAmountString('1e9')).toBe(false);
    expect(isRawAmountString('0x10')).toBe(false);
  });

  it('parses raw amount with decimals correctly', () => {
    const amount = parseRawAmount('1000000000', 8, 'USDT');
    expect(amount.toRawString()).toBe('1000000000');
    expect(amount.toFormatted({ trimTrailingZeros: false })).toBe('10.00000000');
  });

  it('throws for non-raw amount', () => {
    expect(() => parseRawAmount('10.00000000', 8, 'USDT')).toThrow('Invalid raw amount');
  });
});
