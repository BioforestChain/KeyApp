# Change: Add wallet backup verification

## Why

- PDR Epic 1 requires mnemonic backup verification to ensure users have recorded recovery phrase
- Prevents user lockout scenarios by verifying mnemonic was actually saved
- mpay implements Fisher-Yates shuffle verification with proven UX

## What Changes

- Add `BackupTipsSheet` component: Warning about backup importance
- Add `MnemonicBackupDisplay` component: Shows words in protected grid
- Add `MnemonicConfirmBackup` component: Random word selection verification (4 words)
- Add `useMnemonicVerification` hook: Fisher-Yates shuffle + verification logic
- Extend `/onboarding/create` flow with backup wizard after wallet creation
- Add `skipBackup` flag to wallet storage (user can skip with warning)

## Impact

- **Affected specs**: `wallet-onboarding` (add backup verification requirement)
- **Affected code**: Onboarding create flow, wallet storage types
- **Dependencies**: Existing MnemonicDisplay from T002, crypto utils from T002/T003
