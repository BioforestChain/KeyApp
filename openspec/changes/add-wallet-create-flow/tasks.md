## 1. Specification
- [ ] 1.1 Align create-flow requirements with add-wallet-onboarding base spec (language/length options, skipBackup default true).

## 2. Implementation (create-only scope)
- [ ] 2.1 Route scaffold: `/onboarding/create` wizard (name+pwd+tip+agreement) → `/onboarding/create/password` (PasswordConfirmSheet reuse) → `/onboarding/create/success`.
- [ ] 2.2 Form rules: name ≤12 chars, password 8-30 no whitespace, confirm match, optional tip ≤50, agreement required; language (en/zh-Hans/zh-Hant) and length (12/15/18/21/24/36).
- [ ] 2.3 Mnemonic generation: generate per selection; set `skipBackup=true`; set walletAppSettings.password/passwordLock; set `lastWalletActivate` for first wallet.
- [ ] 2.4 Success screen: show amount placeholder + CTA to backup later (sets backUrl) or enter app.
- [ ] 2.5 State/test harness: Vitest + RTL for validation + happy path; Storybook stories for each step.

## 3. Validation
- [ ] 3.1 Run `pnpm test --filter onboarding-create` (or project=unit tagged)
- [ ] 3.2 Run Storybook stories (create flow) via `pnpm test:storybook`
- [ ] 3.3 `openspec validate add-wallet-create-flow --strict`
