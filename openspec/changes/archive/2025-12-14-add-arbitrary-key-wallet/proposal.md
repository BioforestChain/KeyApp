# Change: Add arbitrary key wallet creation for BioforestChain

## Status

**READY** - Approved on 2025-12-14 (CST). Safe to start implementation.

## Why

BioforestChain's unique feature is that wallet secrets can be **any arbitrary string**, not just BIP39 mnemonics. This is explicitly stated in CLAUDE.md acceptance criteria #1:

> bioforestChain密钥的特殊之处在于它可以是任意字符串，而不是非得是助记词，因此需要一个textarea或者类似textarea的组件可以进行自由输入

Currently:
- `src/lib/crypto/bioforest.ts` already supports `createBioforestKeypair(secret: string)` with any string
- `src/pages/onboarding/recover.tsx` only supports BIP39 mnemonic input via `RecoverWalletForm`
- Users cannot import BioforestChain wallets using non-mnemonic secrets (e.g., passphrases, custom strings)

## What Changes

- **NEW**: `ArbitraryKeyInput` component - textarea-based input for arbitrary secret strings
- **NEW**: Key type selection UI - choose between "Standard Mnemonic" or "Arbitrary Key (BioforestChain)"
- **NEW**: Multi-chain address preview - show derived addresses for **enabled** Bioforest chains (default set comes from chain-config)
- **NEW**: Security warning dialog - inform users about the risks of using non-mnemonic secrets
- **MODIFIED**: Recovery flow routing - branch to appropriate input based on key type selection
- **NEW**: i18n keys for all new UI text in en/zh-CN/zh-TW/ar

## Impact

- **Affected specs**: `wallet-onboarding` (new capability - creates spec from archived delta)
- **Affected code**:
  - `src/components/onboarding/arbitrary-key-input.tsx` (new)
  - `src/components/onboarding/key-type-selector.tsx` (new)
  - `src/components/onboarding/chain-address-preview.tsx` (new)
  - `src/pages/onboarding/recover.tsx` (modify to add key type branching)
  - `src/i18n/locales/*/onboarding.json` (add new keys)
- **Dependencies**:
  - Uses existing `createBioforestKeypair()` for secret→keypair
  - Uses chain-config enabled Bioforest configs for preview/derivation (bundled default ships with a built-in set; do not hardcode names/count)
  - Uses existing chain-config crypto adapters (e.g. `deriveBioforestAddressesFromChainConfigs(...)`)

## Scope Notes

- **IN**: `src/pages/onboarding/recover.tsx` (wallet recovery onboarding flow)
- **OUT (follow-up change)**: `src/pages/wallet/import.tsx` (wallet import entry remains mnemonic-only until explicitly scoped)

## Security Considerations

Arbitrary secrets pose higher risk than BIP39 mnemonics:
- Lower entropy if user chooses weak passphrase
- No checksum validation
- No standardized backup format

Mitigation: Mandatory security warning before proceeding with arbitrary key import.

## Approval Checklist (Closed)

- [x] Wallet storage shape (backward compatible with existing `bfm_wallets` payloads): **Option A (minimal)**
  - Add `keyType: 'mnemonic' | 'arbitrary'` (legacy wallets default to `mnemonic`)
  - Keep `encryptedMnemonic` as the encrypted secret container for both mnemonic and arbitrary key wallets

- [x] Entry points scope: keep `src/pages/wallet/import.tsx` **OUT** (follow-up change if needed)
