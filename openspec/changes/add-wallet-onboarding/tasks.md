## 1. Specification
- [ ] 1.1 Confirm mpay onboarding behaviors are mirrored in spec deltas (password rules, mnemonic options, backup + biometric gates).

## 2. Implementation
- [ ] 2.1 Build wallet creation/import wizard with TanStack Router; carry mnemonic language/length, skipBackup flag, and addWallet/backUrl params.
- [ ] 2.2 Implement password + biometric flow: desktop goes straight to creation; mobile prompts OS biometric with retry cooldown and disable handling.
- [ ] 2.3 Implement duplicate-guarded mnemonic import (BFMeta duplicate check + private-key overlap confirmation).
- [ ] 2.4 Implement backup reveal + 4-word confirmation that flips `skipBackup` to false on success.
- [ ] 2.5 Tests: Vitest + Testing Library for form rules; Storybook happy/edge states; Playwright for full create/import+backup path.

## 3. Validation
- [ ] 3.1 Run `openspec validate add-wallet-onboarding --strict`.
