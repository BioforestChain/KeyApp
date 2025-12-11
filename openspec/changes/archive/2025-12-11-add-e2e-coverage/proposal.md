# Change: Add E2E Coverage with Baseline Screenshots

## Why
Production readiness requires visual regression safety net. Baseline screenshots capture current state before theme audit changes visuals. Playwright tests ensure critical user flows work end-to-end.

## What Changes
- Add Playwright E2E tests for settings, history, notifications pages
- Capture baseline screenshots for all major pages/flows
- Configure visual regression testing infrastructure
- Add screenshot comparison CI workflow

## Impact
- Affected files: `e2e/**`, `.github/workflows/`
- New screenshots: `e2e/screenshots/baseline/`
- Tests: Add ~20-30 E2E test cases
- CI: Visual diff on PR builds
