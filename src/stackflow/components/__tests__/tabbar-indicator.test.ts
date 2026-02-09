import { describe, expect, it } from 'vitest';
import { deriveTabbarIconOpacity, normalizeTabbarProgress } from '../tabbar-indicator';

describe('tabbar-indicator helpers', () => {
  it('normalizes non-finite progress to safe bounds', () => {
    expect(normalizeTabbarProgress(Number.NaN)).toBe(0);
    expect(normalizeTabbarProgress(Number.POSITIVE_INFINITY)).toBe(0);
    expect(normalizeTabbarProgress(Number.NEGATIVE_INFINITY)).toBe(0);
  });

  it('clamps progress into [0, 1]', () => {
    expect(normalizeTabbarProgress(-0.2)).toBe(0);
    expect(normalizeTabbarProgress(0.25)).toBe(0.25);
    expect(normalizeTabbarProgress(2)).toBe(1);
  });

  it('never returns NaN opacity when progress is invalid', () => {
    const opacity = deriveTabbarIconOpacity({
      progress: Number.NaN,
      pageCount: 3,
      index: 1,
    });

    expect(Number.isFinite(opacity)).toBe(true);
    expect(opacity).toBeGreaterThanOrEqual(0);
    expect(opacity).toBeLessThanOrEqual(1);
  });

  it('computes center icon opacity as active item', () => {
    expect(deriveTabbarIconOpacity({ progress: 0.5, pageCount: 3, index: 1 })).toBe(1);
    expect(deriveTabbarIconOpacity({ progress: 0.5, pageCount: 3, index: 0 })).toBe(0);
    expect(deriveTabbarIconOpacity({ progress: 0.5, pageCount: 3, index: 2 })).toBe(0);
  });
});
