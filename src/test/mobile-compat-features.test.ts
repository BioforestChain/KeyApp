import { describe, expect, it } from 'vitest'
import {
  collectModernPolyfills,
  detectMobileCompatFeaturesInCode,
  MOBILE_COMPAT_FEATURES,
} from '../../scripts/mobile-compat-features'

describe('mobile compat feature detectors', () => {
  it('detects Promise.withResolvers', () => {
    const features = detectMobileCompatFeaturesInCode('const d = Promise.withResolvers();')
    expect(features.map((item) => item.id)).toContain('promise.withResolvers')
  })

  it('detects Set.prototype.intersection from set variable usage', () => {
    const features = detectMobileCompatFeaturesInCode('const pending = new Set(); pending.intersection(new Set());')
    expect(features.map((item) => item.id)).toContain('set.intersection')
  })

  it('collects expected core-js modules for selected features', () => {
    const selected = MOBILE_COMPAT_FEATURES.filter((item) => item.id === 'promise.withResolvers' || item.id === 'set.union')
    expect(collectModernPolyfills(selected)).toEqual(['es.promise.with-resolvers', 'es.set.union.v2'])
  })
})
