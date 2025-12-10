## 1. Core Components

- [x] 1.1 `RecoverWalletForm`: mnemonic textarea with real-time BIP39 validation, word count support (12/15/18/21/24/36)
- [x] 1.2 `useDuplicateDetection` hook: three-level check (address lookup, multi-chain gen, private key collision)
- [x] 1.3 `useMultiChainAddressGeneration` hook: generate addresses for all chains (Bitcoin: 4 purposes 44/49/84/86)
- [x] 1.4 `CollisionConfirmDialog`: replacement confirmation UI when private key collision detected

## 2. Integration

- [x] 2.1 Route `/onboarding/recover`: wizard with form → password setup → success
- [x] 2.2 Reuse `MnemonicOptionsSheet`, password validation from create flow
- [x] 2.3 Wallet name auto-generation ("Wallet 1", "Wallet 2", fill gaps)
- [x] 2.4 Store recovered wallet with `skipBackup=true`

## 3. Validation

- [x] 3.1 Vitest tests for duplicate detection hooks (all three levels)
- [x] 3.2 Vitest tests for RecoverWalletForm (validation, error states)
- [x] 3.3 Storybook stories for recovery flow
- [x] 3.4 `openspec validate add-wallet-recover-duplicate-guards --strict`
