## 1. Core Components

- [x] 1.1 `BackupTipsSheet`: Warning about backup importance before showing mnemonic
- [x] 1.2 `MnemonicBackupDisplay`: Shows mnemonic words in grid (reuse existing from T002)
- [x] 1.3 `MnemonicConfirmBackup`: Random word selection verification UI (4 words)
- [x] 1.4 `useMnemonicVerification` hook: Fisher-Yates shuffle + verification logic

## 2. Integration

- [x] 2.1 Extend `/onboarding/create` success step with backup wizard (tips → display → confirm)
- [x] 2.2 Add `skipBackup` flag to wallet storage types
- [x] 2.3 Add "Skip backup" option with warning dialog (sets skipBackup=true)

## 3. Validation

- [x] 3.1 Vitest tests for useMnemonicVerification hook (shuffle, selection, validation)
- [x] 3.2 Vitest tests for MnemonicConfirmBackup component
- [x] 3.3 Storybook stories for backup flow components
- [x] 3.4 `openspec validate add-wallet-backup-verification --strict`
