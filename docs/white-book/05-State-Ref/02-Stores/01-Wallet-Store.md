# Wallet Store

> **Code Source**: [`src/stores/wallet.ts`](https://github.com/BioforestChain/KeyApp/blob/main/src/stores/wallet.ts)

## Overview

The Wallet Store manages the user's wallets, chain preferences, and UI selection state.

## State Structure

> **Defined in**: [`src/stores/wallet.ts`](https://github.com/BioforestChain/KeyApp/blob/main/src/stores/wallet.ts)

```typescript
interface WalletState {
  wallets: Wallet[];             // List of all wallets
  currentWalletId: string;       // Currently selected wallet
  selectedChain: ChainType;      // Currently active chain context
  chainPreferences: Record<string, ChainType>; // Per-wallet chain selection
  isInitialized: boolean;        // Initialization status
}
```

## Key Actions

- **`initialize`**: Loads wallets from `walletStorageService` (IndexedDB).
- **`createWallet`**: Generates a new wallet, encrypts secrets, and saves to storage.
- **`setCurrentWallet`**: Switches the active wallet and restores its preferred chain.
- **`refreshBalance`**: Triggers a balance update (proxies to chain adapter).

## Persistence

- **Wallet Data**: Stored in IndexedDB via `WalletStorageService` (encrypted).
- **Preferences**: Chain selection preferences are cached in `localStorage` for fast restore.

## Related Documentation

- **Service**: [Wallet Storage](../../10-Wallet-Guide/01-Account-System/02-Wallet-Storage.md)
- **Adapter**: [Chain Config Store](./02-Chain-Config-Store.md)
