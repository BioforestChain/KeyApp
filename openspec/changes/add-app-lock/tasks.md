# Tasks: App Lock (Password-Only MVP)

## 1. Settings & Routing

- [ ] 1.1 Add “应用锁” settings page + route
- [ ] 1.2 Hide TabBar on lock route (avoid visual clash)

## 2. State & Persistence

- [ ] 2.1 Add `appLockStore` persisted setting: `passwordLockEnabled`
- [ ] 2.2 Add runtime state (non-persisted): `isUnlocked` + `redirectTo`

## 3. Guard + Lock Screen

- [ ] 3.1 Add lock screen route (e.g. `/lock?to=...`)
- [ ] 3.2 Add root guard (`beforeLoad` + `throw redirect(...)`) with allowlist (onboarding + lock route)
- [ ] 3.3 Redirect back to requested route after unlock
- [ ] 3.4 Do not enforce lock when no wallet exists
- [ ] 3.5 Ensure cold start guard sees persisted wallet state (avoid bypass window)

## 4. Password Verification

- [ ] 4.1 Verify password by decrypting at least one wallet encrypted secret (try current wallet first)
- [ ] 4.2 Handle wallets missing encrypted secret (user-visible error)

## 5. Tests

- [ ] 5.1 Vitest: store + guard decisions (allowlist, locked/unlocked)
- [ ] 5.2 Vitest: password verification (success/fail)
- [ ] 5.3 Playwright: enable lock → reload → lock screen blocks → unlock redirects
- [ ] 5.4 Vitest: cold start enforcement (no-wallet vs has-wallet cases)

## 6. i18n + Storybook

- [ ] 6.1 Add i18n keys for Settings + lock screen
- [ ] 6.2 Storybook stories for lock screen and settings page states
