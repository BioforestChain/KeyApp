# Change: Add Theme Audit

## Why
KeyApp needs visual consistency with mpay brand guidelines for smooth user migration. Current implementation uses OKLCH color system but requires verification against mpay's established palette, typography hierarchy, and spacing patterns. E2E baselines (28 screenshots) now protect against unintended regressions.

## What Changes
- Audit color palette against mpay brand colors (primary purple, secondary green, status colors)
- Verify typography hierarchy (DM Sans variable, DM Mono, DM Serif Display)
- Review spacing consistency using Tailwind 4.x design tokens
- Compare dark mode implementation with mpay night theme
- Document any intentional deviations with rationale

## Impact
- Affected files: `src/styles/globals.css`, component styles, Tailwind config
- Visual changes: Potential color/spacing refinements
- Protected by: 28 E2E baseline screenshots (regression detection)
- Tests: E2E visual regression suite catches unintended changes

## Audit Scope
1. **Color Palette**
   - Primary: purple tones (OKLCH 65% 0.25 290)
   - Secondary: green tones (OKLCH 70% 0.2 145)
   - Chain colors: ethereum blue, tron red, binance yellow, bitcoin orange
   - Status: success green, warning yellow, error red

2. **Typography**
   - Font families: DM Sans (body), DM Mono (addresses), DM Serif Display (headings)
   - Size scale: text-xs through text-4xl
   - Line heights and letter spacing

3. **Spacing**
   - Component padding/margins
   - Card/sheet spacing
   - Button sizing consistency

4. **Dark Mode**
   - Background/foreground inversion
   - Color contrast ratios (WCAG AA minimum)
