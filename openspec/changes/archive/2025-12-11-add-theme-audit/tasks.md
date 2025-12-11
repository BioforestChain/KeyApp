## 1. Color Palette Audit
- [ ] 1.1 Extract mpay color values from source (SCSS/CSS variables)
- [ ] 1.2 Compare with KeyApp OKLCH colors in globals.css
- [ ] 1.3 Document differences and propose adjustments
- [ ] 1.4 Update color tokens if needed

## 2. Typography Audit
- [ ] 2.1 Verify font family imports and weights
- [ ] 2.2 Audit text size scale usage across components
- [ ] 2.3 Check line-height and letter-spacing consistency

## 3. Spacing Audit
- [ ] 3.1 Review Tailwind spacing tokens (4px base unit)
- [ ] 3.2 Audit component padding/margin patterns
- [ ] 3.3 Verify card/sheet container spacing

## 4. Dark Mode Verification
- [ ] 4.1 Test dark mode toggle functionality
- [ ] 4.2 Verify color contrast ratios (WCAG AA)
- [ ] 4.3 Check chain colors in dark mode

## 5. Visual Regression Check
- [ ] 5.1 Run E2E screenshots after any changes
- [ ] 5.2 Review visual diffs for intended changes
- [ ] 5.3 Update baselines for approved changes

## Reference
- TDD.md: OKLCH color definitions (lines 932-980)
- mpay source: `src/styles/` for original design tokens
- E2E baselines: `e2e/__screenshots__/` (28 files)
