# Onboarding & Security Components

> Source: [src/components/onboarding/](https://github.com/aspect-build/aspect-workflows/tree/main/src/components/onboarding) | [src/components/security/](https://github.com/aspect-build/aspect-workflows/tree/main/src/components/security) | [src/components/authorize/](https://github.com/aspect-build/aspect-workflows/tree/main/src/components/authorize) | [src/components/migration/](https://github.com/aspect-build/aspect-workflows/tree/main/src/components/migration)

## Overview

Domain components for wallet creation/import, security setup, DApp authorization, and migration flows.

---

## Onboarding Components

### ChainSelector
**Source**: `src/components/onboarding/chain-selector.tsx`

Multi-chain network selection with grouping by chain type.

```tsx
interface ChainSelectorProps {
  chains: ChainConfig[];
  selectedChains: string[];
  onSelectionChange: (chainIds: string[]) => void;
  favoriteChains?: string[];
  onFavoriteChange?: (chainIds: string[]) => void;
  showSearch?: boolean;
}
```

**Features**:
- Groups chains by `chainKind` (bioforest, evm, bitcoin, tron, custom)
- Search/filter functionality
- Favorite chains support
- Batch selection per group

### ChainAddressPreview
**Source**: `src/components/onboarding/chain-address-preview.tsx`

Preview of derived addresses for selected chains.

### KeyTypeSelector
**Source**: `src/components/onboarding/key-type-selector.tsx`

Selection between mnemonic and arbitrary key import.

### ArbitraryKeyInput
**Source**: `src/components/onboarding/arbitrary-key-input.tsx`

Private key/WIF input with validation.

### RecoverWalletForm
**Source**: `src/components/onboarding/recover-wallet-form.tsx`

Complete wallet recovery form with mnemonic input.

### MnemonicConfirmBackup
**Source**: `src/components/onboarding/mnemonic-confirm-backup.tsx`

Interactive mnemonic backup verification.

```tsx
interface MnemonicConfirmBackupProps {
  mnemonic: string[];
  onConfirm: () => void;
  onCancel: () => void;
}
```

### BackupTipsSheet
**Source**: `src/components/onboarding/backup-tips-sheet.tsx`

Security tips bottom sheet before backup.

### CollisionConfirmDialog
**Source**: `src/components/onboarding/collision-confirm-dialog.tsx`

Warning dialog when wallet already exists.

### CreateWalletSuccess
**Source**: `src/components/onboarding/create-wallet-success.tsx`

Success screen after wallet creation.

### ImportWalletSuccess
**Source**: `src/components/onboarding/import-wallet-success.tsx`

Success screen after wallet import.

### SecurityWarningDialog
**Source**: `src/components/onboarding/security-warning-dialog.tsx`

Generic security warning dialog.

---

## Security Components

### PatternLock
**Source**: `src/components/security/pattern-lock.tsx`

9-dot pattern lock with touch/mouse gesture support.

```tsx
interface PatternLockProps {
  value?: number[];
  onChange?: (pattern: number[]) => void;
  onComplete?: (pattern: number[]) => void;
  minPoints?: number;
  disabled?: boolean;
  error?: boolean;
  success?: boolean;
  size?: number;
}
```

**Features**:
- Touch and mouse gesture drawing
- Keyboard accessibility (Tab + Space/Enter)
- Error shake animation with fade-out
- Visual feedback for selection state

### PatternLockSetup
**Source**: `src/components/security/pattern-lock-setup.tsx`

Two-phase pattern creation (create + confirm).

### PasswordInput
**Source**: `src/components/security/password-input.tsx`

Password input with strength indicator.

```tsx
interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  showStrength?: boolean;
  minLength?: number;
  requireUppercase?: boolean;
  requireNumber?: boolean;
  requireSpecial?: boolean;
}
```

### MnemonicDisplay
**Source**: `src/components/security/mnemonic-display.tsx`

Read-only mnemonic word grid display.

### MnemonicInput
**Source**: `src/components/security/mnemonic-input.tsx`

Editable mnemonic input with word suggestions.

### MnemonicConfirm
**Source**: `src/components/security/mnemonic-confirm.tsx`

Shuffled word selection for backup verification.

---

## Authorize Components

### AppInfoCard
**Source**: `src/components/authorize/AppInfoCard.tsx`

DApp information display for authorization.

```tsx
interface AppInfoCardProps {
  appInfo: {
    name: string;
    icon?: string;
    url: string;
    description?: string;
  };
}
```

### PermissionList
**Source**: `src/components/authorize/PermissionList.tsx`

Requested permissions checklist.

### BalanceWarning
**Source**: `src/components/authorize/BalanceWarning.tsx`

Warning when transaction exceeds balance.

### TransactionDetails
**Source**: `src/components/authorize/TransactionDetails.tsx`

Transaction parameters for approval.

---

## Migration Components

### WhatsNewSheet
**Source**: `src/components/migration/WhatsNewSheet.tsx`

New version features announcement.

### MigrationProgressStep
**Source**: `src/components/migration/MigrationProgressStep.tsx`

Migration progress indicator.

### MigrationCompleteStep
**Source**: `src/components/migration/MigrationCompleteStep.tsx`

Migration success with summary.

---

## Onboarding Flow

```
┌──────────────────────────────────────────────────────────────┐
│                      Welcome Screen                          │
│         [Create Wallet]    [Import Wallet]                   │
└──────────────────────────────────────────────────────────────┘
              │                        │
              ▼                        ▼
┌─────────────────────┐    ┌─────────────────────────────────┐
│   ChainSelector     │    │      KeyTypeSelector            │
│  (Select Networks)  │    │  [Mnemonic]  [Private Key]      │
└─────────────────────┘    └─────────────────────────────────┘
              │                   │              │
              ▼                   ▼              ▼
┌─────────────────────┐  ┌────────────┐  ┌────────────────────┐
│ MnemonicConfirmBackup│  │MnemonicInput│  │ArbitraryKeyInput  │
│  (Verify Backup)    │  │(12/24 words)│  │(Private Key/WIF)  │
└─────────────────────┘  └────────────┘  └────────────────────┘
              │                   │              │
              └───────────────────┴──────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────┐
│                    Security Setup                            │
│          [PatternLockSetup] or [PasswordInput]               │
└──────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────┐
│                  CreateWalletSuccess                         │
│                  ImportWalletSuccess                         │
└──────────────────────────────────────────────────────────────┘
```

---

## DApp Authorization Flow

```
┌────────────────────────────────────────────────────┐
│              Authorization Request                 │
│  ┌──────────────────────────────────────────────┐ │
│  │              AppInfoCard                     │ │
│  │  [App Icon]  App Name                        │ │
│  │              https://dapp.example.com        │ │
│  └──────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────┐ │
│  │            PermissionList                    │ │
│  │  ☑ View wallet addresses                    │ │
│  │  ☑ Request transaction signing              │ │
│  │  ☐ Auto-approve small transactions          │ │
│  └──────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────┐ │
│  │          TransactionDetails (if tx)          │ │
│  │  To: 0x1234...                               │ │
│  │  Value: 0.1 ETH                              │ │
│  └──────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────┐ │
│  │          BalanceWarning (if needed)          │ │
│  └──────────────────────────────────────────────┘ │
│              [Reject]    [Approve]               │
└────────────────────────────────────────────────────┘
```

---

## Integration Points

| Component | Service | Store |
|-----------|---------|-------|
| ChainSelector | `chain-config` | `chainConfigStore` |
| PatternLock | `biometric` | - |
| MnemonicInput | `wallet-service` | - |
| AppInfoCard | `miniapp-runtime` | - |
| MigrationProgressStep | `migration-service` | - |

---

## Related Documentation

- [Key Derivation](../../10-Wallet-Guide/01-Account-System/01-Key-Derivation.md)
- [Biometric Service](../../04-Platform-Ref/02-Biometric.md)
- [Migration Service](../../06-Service-Ref/03-Migration/01-Mpay-Migration.md)
- [MiniApp Runtime](../../01-Kernel-Ref/01-Overview.md)
