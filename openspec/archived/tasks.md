## 1. File Structure Refactoring
- [x] 1.1 Create script `scripts/i18n-split.ts` to split JSON by namespace
- [x] 1.2 Generate `en/{namespace}.json` files from `en.json`
- [x] 1.3 Generate `zh-CN/{namespace}.json` files
- [x] 1.4 Generate `zh-TW/{namespace}.json` files
- [x] 1.5 Sync `ar/{namespace}.json` with English keys (placeholder values)
- [x] 1.6 Remove old single-file JSONs

## 2. i18n Config Update
- [x] 2.1 Update `src/i18n/index.ts` to import namespace files
- [x] 2.2 Configure i18next with namespace support (`ns`, `defaultNS`)
- [x] 2.3 Set default namespace to 'common'

## 3. Component Updates
- [x] 3.1 Audit t() calls for namespace prefix requirements
- [x] 3.2 Update any calls needing explicit namespace (e.g., `t('wallet:createWallet')`)
- [x] 3.3 Test RTL with Arabic locale

## 4. Testing & Validation
- [x] 4.1 Update i18n tests for split file structure
- [x] 4.2 Verify all 930 tests pass (934 actual)
- [x] 4.3 Storybook locale switching verification
- [x] 4.4 Run `pnpm lint && pnpm test --run`

## Reference
- react-i18next multi-file docs: https://react.i18next.com/guides/multiple-translation-files
- T014 extraction output: `src/i18n/locales/*.json`
- Draft analysis: `.cccc/work/draft-refactor-i18n-multi-file.md`
