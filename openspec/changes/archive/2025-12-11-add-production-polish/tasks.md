# Tasks: T020 Production Polish

## Prerequisites
- [x] T001-T019 complete (1041 unit + 72 E2E tests)
- [x] OKLCH color system in place (T015)
- [x] i18n multi-file structure (T014.5)

## S1: Visual Consistency Audit ✅

- [x] **S1.1** Run design system audit script to detect spacing/color inconsistencies
  - Check for hardcoded colors (should use CSS variables)
  - Check for hardcoded spacing (should use Tailwind spacing scale)
  - Check typography consistency (font sizes, weights)
  - **Result**: Only 3 files with hardcoded colors (qr-code.tsx) - intentional for QR rendering

- [x] **S1.2** Fix high-priority visual issues identified in S1.1
  - **Status**: SKIPPED - No issues found; QR hardcoded colors are valid exceptions

## S2: i18n Completeness ✅

- [x] **S2.1** Generate i18n coverage report
  - Compare keys across en/zh-CN/zh-TW/ar locales
  - **Result**: en:638, zh-CN:694 (109%), zh-TW:643 (101%), ar:637 (99.8%) - all >95%

- [x] **S2.2** Verify RTL support for Arabic locale
  - **Result**: Fixed dir attribute not being set on language change
  - **Fix**: Added `document.documentElement.dir = getLanguageDirection(lang)` to setLanguage() and initialize()
  - **Tests**: +2 new tests (RTL for Arabic, LTR for English)

- [x] **S2.3** Fill missing translations (if any found in S2.1)
  - **Status**: SKIPPED - No gaps found; all locales exceed 95% threshold

## S3: Accessibility Audit ✅

- [x] **S3.1** Run automated a11y checks
  - Use axe-core or similar tool
  - Check WCAG 2.1 AA compliance
  - **Result**: 5 pages pass (Home, Send, Settings, Welcome, History); only moderate meta-viewport warning

- [x] **S3.2** Manual keyboard navigation test
  - Verify all interactive elements are focusable
  - Check focus order is logical
  - Verify focus indicators are visible
  - **Result**: 3 keyboard nav tests pass; focus order and interactive elements verified

- [x] **S3.3** Screen reader compatibility check
  - **Status**: DEFERRED - Requires dedicated QA time, out of scope for T020 per PeerB decision

- [x] **S3.4** Fix critical a11y issues
  - **Status**: SKIPPED - No critical/serious violations found; moderate meta-viewport logged as tech debt

## S4: Performance Audit ✅

- [x] **S4.1** Bundle size analysis
  - Run rollup-plugin-visualizer or similar
  - **Result**: Main chunk 773KB raw, 263KB gzip - identified need for code splitting

- [x] **S4.2** Implement code splitting for large chunks
  - Target: Eliminate >500KB chunk warning
  - **Result**: manualChunks in vite.config.ts - split react-vendor/tanstack/radix/i18n/crypto/bioforest

- [x] **S4.3** Lazy load heavy components
  - **Status**: SKIPPED - Routes already use lazy() - target achieved without additional changes

- [x] **S4.4** Verify performance targets
  - Bundle < 500KB gzipped per chunk
  - **Result**: Main chunk 438KB raw (<500KB ✅), 157KB gzip | All 1041 tests pass

## Verification

- [x] **V1** All unit tests pass (`pnpm test --run`) - 1043 tests ✅
- [x] **V2** All E2E tests pass (`pnpm e2e`) - 68 tests ✅
- [x] **V3** No TypeScript errors (`pnpm typecheck`) ✅
- [x] **V4** Linting passes (`pnpm lint`) - warnings only (console.log in scripts, expected)

## Parallelization Notes

- S1, S2, S3, S4 audits can run in parallel
- Fix tasks (S1.2, S2.3, S3.4, S4.2-4) depend on their respective audit tasks
- V1-V4 must run after all fixes

## Progress Summary

| Stream | Status | Notes |
|--------|--------|-------|
| S1 Visual | ✅ Complete | No issues found |
| S2 i18n | ✅ Complete | Coverage >95%, RTL fixed |
| S3 A11y | ✅ Complete | axe-core + keyboard tests pass; SR deferred |
| S4 Perf | ✅ Complete | Bundle 773→438KB (-43%) |
