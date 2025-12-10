# Change: Wallet creation flow (create-first slice)

## Why
- Need to implement PDR Epic 1 create-wallet path using the new component set (PasswordConfirmSheet, MnemonicConfirm) before import/backup slices.
- Keep onboarding work layered to reduce review risk and enable parallel validation.

## What Changes
- Add delta specs for wallet creation: name/password form, mnemonic language/length selection, skipBackup flag, creation success handling.
- Define tasks for TanStack Router wizard screens and wiring to wallet store/adapters (no duplicate/backup/biometric scope here).

## Impact
- Affected specs: `wallet-onboarding` (new delta for create flow).
- Affected code (future implementation): onboarding routes, password step, creation success screen; reuses existing core components.
