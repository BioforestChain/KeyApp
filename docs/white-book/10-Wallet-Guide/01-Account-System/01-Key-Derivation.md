# Key Derivation

## Overview

KeyApp uses a unified key derivation strategy based on standard BIP protocols where applicable, while respecting chain-specific requirements.

## Master Seed

The root of all keys is a **12 or 24 word mnemonic phrase** (BIP-39). This mnemonic is converted into a binary seed which is then used to derive chain-specific keys.

> **Note**: For BioForest chains, the mnemonic string itself (UTF-8 encoded) acts as the seed for Ed25519 key generation, rather than the BIP-39 binary seed. This is a legacy compatibility requirement.

## Derivation Paths

| Chain Kind | Algorithm | Path / Method | Standard |
|------------|-----------|---------------|----------|
| **BioForest** | Ed25519 | `sha256(mnemonic)` | Custom |
| **Bitcoin** | Secp256k1 | `m/84'/0'/0'/0/0` | BIP-84 (Native SegWit) |
| **Ethereum** | Secp256k1 | `m/44'/60'/0'/0/0` | BIP-44 |
| **Tron** | Secp256k1 | `m/44'/195'/0'/0/0` | BIP-44 |

## Implementation

### Unified Interface

Address derivation is exposed via the `IIdentityService` interface implemented by each chain adapter.

```typescript
interface IIdentityService {
  deriveAddress(seed: Uint8Array, index?: number): Promise<string>;
  deriveAddresses(seed: Uint8Array, startIndex: number, count: number): Promise<string[]>;
}
```

### Usage

The helper function `deriveWalletChainAddresses` acts as the single entry point for deriving addresses for a user's wallet across multiple selected chains.

```typescript
// src/services/chain-adapter/derive-wallet-chain-addresses.ts
export async function deriveWalletChainAddresses(params) {
  // Iterates through selected chains and calls provider.deriveAddress
}
```

### Specific Implementations

- **BioForest (`BioforestIdentityService`)**:
  - Uses `createBioforestKeypair(seedString)`.
  - Same keypair for all indices (no HD support yet).

- **Bitcoin (`BitcoinIdentityService`)**:
  - Uses `deriveBitcoinKey(mnemonic, 84, index)`.
  - Supports full HD derivation.

## Security Considerations

- **Memory**: Mnemonics are kept in memory only during the derivation process and cleared immediately after.
- **Storage**: Keys are never stored in plain text. See [Wallet Storage](./02-Wallet-Storage.md) for encryption details.
