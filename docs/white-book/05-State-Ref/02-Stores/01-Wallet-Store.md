# Wallet Store

## Overview

The Wallet Store manages the user's wallets, chain preferences, and UI selection state.

## State Structure

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
