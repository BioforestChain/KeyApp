## 1. Extraction & Transformation
- [x] 1.1 Create `scripts/i18n-extract.ts` to parse mpay XLF files
- [x] 1.2 Extract all trans-units from `messages.en-US.xlf` → JSON mapping
- [x] 1.3 Extract zh-Hans translations from `messages.zh-Hans.xlf`
- [x] 1.4 Transform SCREAMING_SNAKE_CASE to camelCase keys
- [x] 1.5 Organize into namespaces (common, wallet, transaction, settings, security, staking, dweb)

## 2. Key Filtering & Mapping
- [x] 2.1 Map mpay key categories to KeyApp namespaces:
  - CONFIRM/CANCEL/BACK/NEXT → common.*
  - ADD_WALLET/CREATE_WALLET/IMPORT_WALLET → wallet.*
  - TRANSFER/RECEIVE/SEND/BALANCE → transaction.*
  - SETTINGS/PASSWORD/FINGERPRINT → settings.* / security.*
  - STAKE/MINT/BURN/UNSTAKE → staking.*
  - AUTHORIZE/SIGNATURE → dweb.*
- [x] 2.2 Filter deprecated/unused keys (SKIP_KEYS in script)
- [x] 2.3 Identify gaps between mpay keys and KeyApp component needs

## 3. Locale File Updates
- [x] 3.1 Update `src/i18n/locales/en.json` with new keys (586 keys extracted, 74→650 lines)
- [x] 3.2 Update `src/i18n/locales/zh-CN.json` from zh-Hans translations (642 keys, 74→706 lines)
- [x] 3.3 Added `src/i18n/locales/zh-TW.json` from zh-Hant translations (631 keys, 645 lines)
- [ ] 3.4 Update `src/i18n/locales/ar.json` (Arabic - needs expansion, still at 74 lines)
- [ ] 3.5 Ensure all keys have translations across all locales (no missing keys)

## 4. Component Audit
- [ ] 4.1 Scan all pages for hardcoded strings not using t()
- [ ] 4.2 Replace any remaining hardcoded strings with i18n keys
- [ ] 4.3 Verify RTL support for Arabic locale in components

## 5. Testing & Validation
- [ ] 5.1 Add `i18n-keys.test.ts` to verify key parity across locales
- [ ] 5.2 Add test for missing translations detection
- [x] 5.3 Run `pnpm lint && pnpm test --run` (922 tests passing)
- [ ] 5.4 Manual verification in Storybook with locale switching

## Reference
- mpay source: `/Users/kzf/Dev/bioforestChain/legacy-apps/apps/mpay/src/locale/`
  - messages.en-US.xlf (586 keys extracted)
  - messages.zh-Hans.xlf (642 keys)
  - messages.zh-Hant.xlf (631 keys)
- Analysis: `.cccc/work/i18n-gap-analysis.md`
- Script: `scripts/i18n-extract.ts` (supports --dry mode)
