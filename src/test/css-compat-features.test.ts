import { describe, expect, it } from 'vitest'
import { detectCssCompatFeaturesInCode } from '../../scripts/css-compat-features'

describe('css compat feature detectors', () => {
  it('detects field-sizing as unsupported feature', () => {
    const features = detectCssCompatFeaturesInCode('.a{field-sizing:content;}')
    expect(features.map((item) => item.feature.id)).toContain('field-sizing')
  })

  it('detects scroll-driven animation related features', () => {
    const features = detectCssCompatFeaturesInCode(
      '@supports (animation-timeline: scroll()) {.a{scroll-timeline: --x block; animation-timeline: view();}}',
    )
    expect(features.map((item) => item.feature.id)).toContain('scroll-driven-animations')
  })

  it('detects scrollbar-width as partial support feature', () => {
    const features = detectCssCompatFeaturesInCode('.a{scrollbar-width:thin;}')
    const target = features.find((item) => item.feature.id === 'css-scrollbar-standard')
    expect(target?.feature.support).toBe('partial')
  })
})
