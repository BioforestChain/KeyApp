# Tasks: Add Arbitrary Key Wallet Creation

## 1. Component Development

- [x] 1.1 Create `ArbitraryKeyInput` component
  - Textarea for multiline secret input
  - Character count display
  - Clear button
  - Hide/show toggle for sensitive content
  - Accessibility: proper labels and ARIA attributes

- [x] 1.2 Create `KeyTypeSelector` component
  - Radio group: "Standard Mnemonic (BIP39)" vs "Arbitrary Key (BioforestChain)"
  - Visual indicator showing which chains support each type
  - Default selection: Standard Mnemonic

- [x] 1.3 Create `ChainAddressPreview` component
  - Display derived addresses for enabled Bioforest chains (driven by chain-config enabled set)
  - Show chain icon, name, and truncated address
  - Copy address functionality
  - Skeleton loading state during derivation

- [x] 1.4 Create `SecurityWarningDialog` component
  - Modal explaining risks of arbitrary keys
  - Checkbox: "I understand the risks"
  - Confirm/Cancel buttons
  - Link to documentation (optional)

## 2. Component Tests & Stories

- [x] 2.1 Write Vitest tests for `ArbitraryKeyInput`
  - Input change handling
  - Clear functionality
  - Show/hide toggle
  - Empty state validation

- [x] 2.2 Write Vitest tests for `KeyTypeSelector`
  - Selection change
  - Default value
  - Disabled state

- [x] 2.3 Write Vitest tests for `ChainAddressPreview`
  - Renders enabled Bioforest chains (based on provided enabled chain-config set)
  - Copy functionality
  - Loading state

- [x] 2.4 Write Vitest tests for `SecurityWarningDialog`
  - Checkbox interaction
  - Confirm/Cancel actions
  - Confirm disabled until checkbox checked

- [x] 2.5 Create Storybook stories for all new components
  - Default states
  - Interactive variants
  - Dark mode appearance

## 3. Page Integration

- [x] 3.1 Modify `src/pages/onboarding/recover.tsx`
  - Add key type selection step before mnemonic/arbitrary input
  - Branch to appropriate input component based on selection
  - Handle arbitrary key submission flow

- [x] 3.2 Implement arbitrary key wallet creation logic
  - Use enabled Bioforest chain-configs for address generation (e.g. `deriveBioforestAddressesFromChainConfigs(...)`)
  - Show address preview before final confirmation
  - Encrypt secret with user password
  - Store wallet with `keyType: 'arbitrary'` flag

- [x] 3.3 Add security warning gate
  - Show `SecurityWarningDialog` when arbitrary key type selected
  - Block progress until user acknowledges risks
  - Store acknowledgment in session (don't persist)

## 4. Internationalization

- [x] 4.1 Add i18n keys to `src/i18n/locales/en/onboarding.json`
- [x] 4.2 Add i18n keys to `src/i18n/locales/zh-CN/onboarding.json`
- [x] 4.3 Add i18n keys to `src/i18n/locales/zh-TW/onboarding.json`
- [x] 4.4 Add i18n keys to `src/i18n/locales/ar/onboarding.json`

Required keys:
- `keyType.title` - "Select Key Type"
- `keyType.mnemonic` - "Standard Mnemonic (BIP39)"
- `keyType.mnemonicDesc` - "12-24 word recovery phrase"
- `keyType.arbitrary` - "Arbitrary Key"
- `keyType.arbitraryDesc` - "Any text as wallet secret (BioforestChain only)"
- `arbitraryKey.placeholder` - "Enter your secret key..."
- `arbitraryKey.hint` - "This can be any text: passphrase, password, or custom string"
- `securityWarning.title` - "Security Warning"
- `securityWarning.message` - "Arbitrary keys may have lower security than standard mnemonics..."
- `securityWarning.acknowledge` - "I understand the risks"
- `addressPreview.title` - "Your Addresses"
- `addressPreview.subtitle` - "These addresses will be generated from your secret"

## 5. Validation & Quality

- [x] 5.1 Run full test suite: `pnpm test`
- [x] 5.2 Run Storybook build: `pnpm build-storybook`
- [x] 5.3 Verify dark mode appearance
- [x] 5.4 Test RTL layout (Arabic)
- [x] 5.5 Manual E2E testing of complete flow
