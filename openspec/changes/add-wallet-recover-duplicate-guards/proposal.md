# Change: Add wallet recovery with duplicate guards

## Why
- PDR Epic 1 requires wallet import/recovery functionality
- mpay implements three-level duplicate detection that prevents address collisions
- KeyApp needs same safety guarantees for wallet recovery

## What Changes
- Add `RecoverWalletForm` component with mnemonic input and real-time validation
- Implement three-level duplicate detection (address lookup, multi-chain generation, private key collision)
- Add `CollisionConfirmDialog` for replacement confirmation when collisions detected
- Reuse existing `MnemonicOptionsSheet`, `PasswordConfirmSheet` from create flow
- Route: `/onboarding/recover`

## Impact
- Affected specs: `wallet-onboarding` (extend with recover capability)
- Affected code: onboarding routes, wallet storage queries, address generation utils
- Dependencies: Reuses crypto utils from T002 (create flow)
