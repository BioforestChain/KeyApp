# Change: Add i18n Completeness

## Why
KeyApp currently has 74 i18n keys across 3 locales (en, zh-CN, ar), while mpay has 218 unique keys (492 usages across 59 files). This gap prevents production readiness and smooth user migration from mpay. The ~144-170 key gap must be closed before release.

## What Changes
- Create extraction script to migrate mpay XLF keys to i18next JSON format
- Transform SCREAMING_SNAKE_CASE to camelCase with namespace organization
- Expand all three locale files (en.json, zh-CN.json, ar.json) with comprehensive coverage
- Leverage mpay's existing zh-Hans.xlf and zh-Hant.xlf translations
- Add i18n validation testing to ensure key parity across locales

## Impact
- Affected files: `src/i18n/locales/*.json`, scripts for extraction
- New keys: ~150-170 keys across common, wallet, transaction, security, staking namespaces
- Tests: 3-5 new tests for i18n validation
- Source: mpay `locale/messages.en-US.xlf` (218 keys), `messages.zh-Hans.xlf`, `messages.zh-Hant.xlf`

## Migration Strategy
1. **Extract** all 218 mpay keys to JSON mapping
2. **Transform** key naming convention (SCREAMING_SNAKE_CASE → camelCase)
3. **Organize** into i18next namespaces matching KeyApp structure
4. **Filter** against KeyApp component usage (remove deprecated/unused mpay keys)
5. **Validate** key parity across all locales
