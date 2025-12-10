# Tasks: Settings Page Foundation

## T008: Settings Page Foundation

### Status: complete

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
- [x] Create `src/pages/settings/language.tsx` or sheet component
- [x] Integrate with i18next `changeLanguage()`
- [x] Persist selection to localStorage/TanStack Store
- [x] Display language names in native script
- [x] Write tests (8 tests): selection, persist, i18n switch
- [x] Write Storybook story

**Acceptance**: Language changes apply immediately, persist across sessions ✅

---

#### T008.3: ViewMnemonicFlow
- [x] Create `src/pages/settings/view-mnemonic.tsx`
- [x] Integrate PasswordConfirmSheet for verification
- [x] Display mnemonic in 4x3 word grid
- [x] Implement 30-second auto-blur timeout
- [x] Implement blur on page leave (visibility API)
- [x] Write tests (13 tests): verify flow, display, timeout, security
- [x] Write Storybook story

**Acceptance**: Mnemonic displays after password, auto-hides, never exposed insecurely ✅

---

#### T008.4: ChangePasswordFlow
- [x] Create `src/pages/settings/change-password.tsx`
- [x] Form with current/new/confirm password fields
- [x] Validate current password against stored
- [x] Password strength indicator
- [x] Update password in secure storage
- [x] Write tests (14 tests): validation, errors, success
- [x] Write Storybook story

**Acceptance**: Password changes successfully with proper validation ✅

---

#### T008.5: CurrencySelector
- [x] Create `src/pages/settings/currency.tsx` or sheet component
- [x] Create preferences store with `currency` state (already exists)
- [x] Update asset displays to use selected currency
- [x] Persist selection
- [x] Write tests (10 tests): selection, persist, display
- [x] Write Storybook story

**Acceptance**: Currency selection persists and affects asset value display ✅

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
