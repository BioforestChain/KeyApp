## 1. Infrastructure Setup
- [x] 1.1 Configure Playwright ~~with Storybook integration~~ (uses dev:mock - valid alternative)
- [x] 1.2 Set up screenshot baseline directory structure (`e2e/__screenshots__/`)
- [x] 1.3 Configure visual comparison thresholds (2% pixel, 30% color)

## 2. Baseline Screenshots ✅ COMPLETE (28 screenshots)
- [x] 2.1 Capture home page screenshots (home-with-wallet, home-chain-selector, 01-home-empty)
- [x] 2.2 Capture wallet pages (wallet-create 01-07, wallet-import 01-02, wallet-list, wallet-detail)
- [x] 2.3 Capture transaction pages (send-empty/filled/insufficient, receive-page, history-empty, token-detail)
- [x] 2.4 Capture settings pages (settings-main, settings-language, settings-currency)
- [x] 2.5 Capture notification pages (notifications-empty, address-book-empty)

## 3. E2E Test Cases ✅ CORE COMPLETE (50 tests passing)
- [x] 3.1 Settings screenshots (language, currency pages captured)
- [x] 3.2 Transaction pages tested (send form validation, chain switching)
- [x] 3.3 Notification page screenshot captured
- [x] 3.4 Wallet flow tests (create, import, list, detail)

## 4. CI Integration (Deferred - not blocking T015)
- [ ] 4.1 Add visual regression workflow to GitHub Actions
- [ ] 4.2 Configure screenshot diff reporting on PRs
- [ ] 4.3 Document visual testing process in README

## Reference
- Storybook test runner: https://storybook.js.org/docs/writing-tests/test-runner
- Playwright visual comparisons: https://playwright.dev/docs/test-snapshots
- Current pages: src/pages/{home,settings,history,notification}/

## Notes
- Primary goal achieved: 28 baseline screenshots captured before T015 Theme Audit
- 50 E2E tests + 934 unit tests passing
- CI integration deferred to post-T015 iteration
