# Proposal: Settings Page Foundation

## Summary

Add Settings ("我的") page with essential user preferences and security features. This is the foundation for Phase 4 personalization.

## Motivation

- **Essential for MVP**: Users need ability to manage security and preferences
- **PDR Coverage**: Epic 6 (Security), Epic 9 (Preferences), Epic 10.1 ("我的" page)
- **Foundation for Localization**: Language switching enables future i18n work

## Scope

### Must Have (MVP)
| Feature | PDR Reference | Notes |
|---------|---------------|-------|
| Settings page layout | Story 10.1 | "我的" page structure |
| Language switching | Story 9.1 | 6 languages per Appendix B |
| View mnemonic | Story 6.2 | Password verify → display |

### Should Have (This Change)
| Feature | PDR Reference | Notes |
|---------|---------------|-------|
| Change password | Story 6.3 | Current → New password flow |
| Currency unit | Story 9.2 | USD/CNY/EUR/JPY/KRW display |

### Deferred
| Feature | PDR Reference | Why Deferred |
|---------|---------------|--------------|
| App lock / biometric | Story 6.1 | Needs Capacitor plugin |
| Network settings | Story 9.4 | Complex, low priority |
| Wallet management | Story 9.3 | Separate change scope |

## Technical Approach

1. **SettingsPage** - Main layout with navigation sections
2. **LanguageSelector** - i18next integration with persist
3. **ViewMnemonicFlow** - Password verify → secure display
4. **ChangePasswordFlow** - Current → New → Confirm
5. **CurrencySelector** - Display preference with TanStack Store

## Test Coverage Target

~46 new tests across 5 sub-tasks

## Dependencies

- Existing i18n setup (i18next)
- PasswordConfirmSheet (Phase 1.5)
- TanStack Store for preferences persist

## Risks

- **R1**: Language switching may need app reload (mitigate: test hot-switch)
- **R2**: Mnemonic display security (mitigate: timeout + blur on leave)
