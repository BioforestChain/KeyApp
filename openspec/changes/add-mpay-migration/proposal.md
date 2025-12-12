# Change: Add mpay Data Migration

## Why
Existing mpay users have wallets stored in IndexedDB (`walletv2-idb`) and settings in localStorage. KeyApp must detect and migrate this data to ensure smooth upgrade without data loss or re-import friction.

## What Changes
- Add migration detection service (check mpay IndexedDB existence)
- Add migration wizard UI (password verify, confirm import, progress indicator)
- Add data transformer (mpay `$MainWalletV2`/`$ChainAddressInfoV2` → KeyApp format)
- Add migration E2E tests with mocked mpay data

## Impact
- Affected specs: new `migration` capability
- Affected code: `src/services/migration/`, `src/pages/onboarding/`, `src/components/`
- User experience: First-launch detects mpay data → prompts migration → seamless transition
