# Settings Capability Specification

## ADDED Requirements

### Requirement: Settings Page Layout

The app SHALL provide a Settings ("我的") page with organized sections for wallet, security, and preferences.

#### Scenario: User views settings page

**Given** user is authenticated
**When** user navigates to settings page
**Then** page displays:
- Header with wallet avatar and name
- Wallet management section (钱包管理, 地址簿) - placeholder for later
- Security section (应用锁, 查看助记词, 修改密码)
- Preferences section (语言, 货币单位, 外观)
- About section (关于)

#### Scenario: User navigates to setting item

**Given** user is on settings page
**When** user taps a setting item
**Then** app navigates to corresponding detail page or opens sheet

### Requirement: Language Selection

The app SHALL support 6 languages with immediate switching (Story 9.1).

Supported languages:
- 简体中文 (zh-CN)
- 繁體中文 (zh-TW)
- English (en)
- 日本語 (ja)
- 한국어 (ko)
- العربية (ar)

#### Scenario: User changes language

**Given** user is on language selection page
**When** user selects "日本語"
**Then** UI immediately switches to Japanese
**And** selection is persisted to storage

#### Scenario: Language names display

**Given** user opens language selection
**When** page renders
**Then** each language is displayed in its native script

### Requirement: View Mnemonic

The app SHALL allow viewing mnemonic after password verification (Story 6.2).

#### Scenario: User views mnemonic successfully

**Given** user taps "查看助记词"
**When** password confirmation sheet appears
**And** user enters correct password
**Then** app navigates to mnemonic display page
**And** 12/24 words display in 4x3/6x4 grid

#### Scenario: Mnemonic auto-hides for security

**Given** mnemonic is displayed
**When** 30 seconds pass without interaction
**Then** mnemonic is blurred/hidden
**And** user must tap to reveal again

#### Scenario: Mnemonic hides on leave

**Given** mnemonic is displayed
**When** user navigates away or app backgrounds
**Then** mnemonic is immediately hidden

### Requirement: Change Password

The app SHALL allow password changes with validation (Story 6.3).

#### Scenario: User changes password successfully

**Given** user is on change password page
**When** user enters current password correctly
**And** enters new password (min 8 chars)
**And** confirms new password matches
**Then** password is updated
**And** success message displays
**And** user returns to settings

#### Scenario: Current password incorrect

**Given** user enters wrong current password
**When** form is submitted
**Then** error "当前密码不正确" displays

#### Scenario: New passwords don't match

**Given** user enters mismatched new/confirm passwords
**When** form is submitted
**Then** error "两次输入的密码不一致" displays

### Requirement: Currency Selection

The app SHALL support display currency selection (Story 9.2).

Supported currencies:
- USD ($)
- CNY (¥)
- EUR (€)
- JPY (¥)
- KRW (₩)

#### Scenario: User changes currency

**Given** user is on currency selection
**When** user selects "CNY (¥)"
**Then** selection is persisted
**And** asset values throughout app display in CNY

## Component Architecture

Page Structure:
```
src/pages/settings/
├── index.tsx           // SettingsPage
├── language.tsx        // LanguageSelector
├── currency.tsx        // CurrencySelector
├── view-mnemonic.tsx   // ViewMnemonicPage
└── change-password.tsx // ChangePasswordPage
```

State Management:
```typescript
interface PreferencesState {
  language: 'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'ko' | 'ar'
  currency: 'USD' | 'CNY' | 'EUR' | 'JPY' | 'KRW'
}
```

## Test Coverage Target

| Requirement | Tests |
|-------------|-------|
| Settings Page Layout | ~8 |
| Language Selection | ~10 |
| View Mnemonic | ~12 |
| Change Password | ~10 |
| Currency Selection | ~6 |
| **Total** | **~46** |
