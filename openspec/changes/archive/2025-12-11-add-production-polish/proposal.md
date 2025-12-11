# Proposal: T020 Production Polish

## Summary

Production readiness audit and polish covering visual consistency, accessibility, i18n completeness, and performance optimization before DWEB integration phase.

## Motivation

With T001-T019 complete (1041 unit tests, 72 E2E tests), the application has solid functional coverage. Before proceeding to DWEB integration (deferred), we need to ensure production-grade quality across non-functional dimensions:

1. **Visual Consistency**: Ensure uniform spacing, colors, and typography across all pages
2. **Accessibility**: Ensure screen reader support, keyboard navigation, and WCAG 2.1 AA compliance
3. **i18n Completeness**: Verify all user-facing strings are translated across 4 locales
4. **Performance**: Optimize bundle size, implement lazy loading for large chunks

## Current State Analysis

| Dimension | Status | Evidence |
|-----------|--------|----------|
| i18n | Good | 4 locales (ar/en/zh-CN/zh-TW), 13 namespaces, 688 key-lines |
| A11y | Partial | 109 aria/role/tabIndex usages across 48 files |
| Bundle | Warning | 263KB gzipped main, but 773KB raw chunk triggers warning |
| Visual | Unknown | OKLCH color system in place (T015), needs audit |

## Scope

### In Scope
- S1: Visual consistency audit (spacing, colors, typography alignment)
- S2: i18n completeness check (missing keys, RTL support verification)
- S3: Accessibility audit (screen reader, keyboard nav, focus management)
- S4: Performance audit (bundle analysis, code splitting, lazy loading)

### Out of Scope
- DWEB/Plaoc integration (deferred)
- New feature development
- Auth/biometric features (deferred)
- Version upgrade UI (deferred)

## Success Criteria

1. All pages pass manual visual review against design system
2. No missing i18n keys in any locale
3. All interactive elements are keyboard accessible
4. Bundle size warning eliminated (<500KB per chunk)
5. Lighthouse accessibility score >= 90

## Dependencies

- None (all prerequisite work T001-T019 complete)

## Risks

| Risk | Mitigation |
|------|------------|
| Large refactoring scope | Prioritize audit over fix; track issues in subtasks |
| Performance regressions | Measure before/after with bundle analyzer |
