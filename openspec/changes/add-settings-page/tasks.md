# Tasks: Settings Page Foundation

## T008: Settings Page Foundation

### Status: in_progress

### Tasks

#### T008.1: SettingsPage Layout
- [x] Create `src/pages/settings/index.tsx` with section structure
- [x] Create `SettingsItem` component with icon, label, value, chevron
- [x] Create `SettingsSection` component for grouping
- [x] Add TanStack Router route configuration
- [x] Write tests (19 tests)
- [x] Write Storybook story

**Acceptance**: Settings page renders with proper sections, navigation works ✅

---

#### T008.2: LanguageSelector
- [ ] Create `src/pages/settings/language.tsx` or sheet component
- [ ] Integrate with i18next `changeLanguage()`
- [ ] Persist selection to localStorage/TanStack Store
- [ ] Display language names in native script
- [ ] Write tests (~10 tests): selection, persist, i18n switch
- [ ] Write Storybook story

**Acceptance**: Language changes apply immediately, persist across sessions

---

#### T008.3: ViewMnemonicFlow
- [ ] Create `src/pages/settings/view-mnemonic.tsx`
- [ ] Integrate PasswordConfirmSheet for verification
- [ ] Display mnemonic in 4x3 word grid
- [ ] Implement 30-second auto-blur timeout
- [ ] Implement blur on page leave (visibility API)
- [ ] Write tests (~12 tests): verify flow, display, timeout, security
- [ ] Write Storybook story

**Acceptance**: Mnemonic displays after password, auto-hides, never exposed insecurely

---

#### T008.4: ChangePasswordFlow
- [ ] Create `src/pages/settings/change-password.tsx`
- [ ] Form with current/new/confirm password fields
- [ ] Validate current password against stored
- [ ] Password strength indicator
- [ ] Update password in secure storage
- [ ] Write tests (~10 tests): validation, errors, success
- [ ] Write Storybook story

**Acceptance**: Password changes successfully with proper validation

---

#### T008.5: CurrencySelector
- [ ] Create `src/pages/settings/currency.tsx` or sheet component
- [ ] Create preferences store with `currency` state
- [ ] Update asset displays to use selected currency
- [ ] Persist selection
- [ ] Write tests (~6 tests): selection, persist, display
- [ ] Write Storybook story

**Acceptance**: Currency selection persists and affects asset value display

---

## Dependencies

- PasswordConfirmSheet (exists from Phase 1.5)
- i18next setup (exists)
- TanStack Router (exists)

## Estimated Test Count

| Task | Tests |
|------|-------|
| T008.1 SettingsPage | ~8 |
| T008.2 LanguageSelector | ~10 |
| T008.3 ViewMnemonicFlow | ~12 |
| T008.4 ChangePasswordFlow | ~10 |
| T008.5 CurrencySelector | ~6 |
| **Total** | **~46** |
