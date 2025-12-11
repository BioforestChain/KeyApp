# Change: Refactor i18n to Multi-file Namespace Structure

## Why
User requested namespace-based file splitting per react-i18next best practices. Current single-file approach (650+ lines per locale) reduces maintainability and makes collaborative editing difficult. Multi-file structure enables lazy loading per namespace for bundle optimization.

Ref: https://react.i18next.com/guides/multiple-translation-files

## What Changes
- Split `en.json` → `en/{common,wallet,transaction,security,staking,dweb,error,settings}.json`
- Split `zh-CN.json` → `zh-CN/{...}.json`
- Split `zh-TW.json` → `zh-TW/{...}.json`
- Sync `ar.json` with English keys (placeholders for untranslated)
- Update `src/i18n/index.ts` to load namespaces
- Update all `t()` calls to use namespace prefix if needed

## Impact
- Affected files: `src/i18n/index.ts`, `src/i18n/locales/**/*`
- No new keys - pure structural refactoring
- Bundle optimization potential via lazy namespace loading
- Tests: Update i18n tests to validate split files
