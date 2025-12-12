# Design: mpay Data Migration

## Context
mpay stores wallet data in IndexedDB (`walletv2-idb`) with two object stores:
- `mainWalletStore`: Identity wallets with encrypted mnemonics
- `chainAddressInfoStore`: Chain addresses with encrypted private keys

Settings are in localStorage under `👨‍👩‍👧‍👦walletAppSetting`.

KeyApp runs on the same domain, so IndexedDB is accessible. Migration must:
1. Detect mpay data without user action
2. Verify user password before decryption
3. Transform and import data atomically
4. Provide clear progress feedback

## Goals / Non-Goals
**Goals:**
- Zero data loss during migration
- Single password entry (reuse for KeyApp)
- Clear error recovery (retry, skip, manual import fallback)
- E2E testable with mocked IndexedDB

**Non-Goals:**
- Cross-domain migration (different origin)
- Partial migration (all-or-nothing)
- mpay data deletion (user choice post-migration)

## Decisions

### D1: Same-domain IndexedDB access
- **Decision**: Direct IndexedDB read using `idb-keyval` pattern
- **Rationale**: KeyApp replaces mpay on same domain; no CORS issues
- **Alternative**: Export/import file - rejected (adds friction)

### D2: Password verification strategy
- **Decision**: Attempt decrypt of first wallet's mnemonic as validation
- **Rationale**: Reuses existing CryptoService; confirms password works
- **Alternative**: Store password hash - rejected (mpay doesn't store it)

### D3: Atomic import with rollback
- **Decision**: Transaction-based import; rollback on any failure
- **Rationale**: Prevents partial state; user can retry
- **Alternative**: Progressive import - rejected (complex recovery)

### D4: Migration state persistence
- **Decision**: Store `migration_status` in localStorage during process
- **Rationale**: Resume if app closes mid-migration
- **States**: `detected` | `in_progress` | `completed` | `skipped`

## Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Detect     │────▶│  Password    │────▶│  Transform  │
│  mpay IDB   │     │  Verify      │     │  Data       │
└─────────────┘     └──────────────┘     └─────────────┘
                           │                    │
                           ▼                    ▼
                    ┌──────────────┐     ┌─────────────┐
                    │  Decrypt     │────▶│  Import to  │
                    │  Wallets     │     │  KeyApp     │
                    └──────────────┘     └─────────────┘
```

## Type Mappings

| mpay Type | KeyApp Type | Notes |
|-----------|-------------|-------|
| `$MainWalletV2` | `Wallet` | Map `importPhrase` → `encryptedMnemonic` |
| `$ChainAddressInfoV2` | `ChainAddress` | Map `privateKey` → `encryptedPrivateKey` |
| `$WalletAppSettings` | `AppSettings` | Map password/biometric settings |

## Risks / Trade-offs

| Risk | Severity | Mitigation |
|------|----------|------------|
| IndexedDB corruption | Medium | Validate data structure before import |
| Password mismatch | Low | Clear error message; allow retry |
| Interrupted migration | Medium | Resume from `migration_status` |
| Type drift from mpay | Low | Version check; fail gracefully |

## Open Questions
- Q1: Should migration delete mpay data after success? → Defer to user preference
- Q2: Support multiple wallets from mpay? → Yes, iterate all entries
