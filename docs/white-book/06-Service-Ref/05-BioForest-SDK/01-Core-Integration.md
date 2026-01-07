# BioForest SDK Integration

> **Code Source**: [`src/services/bioforest-sdk/index.ts`](https://github.com/BioforestChain/KeyApp/blob/main/src/services/bioforest-sdk/index.ts)

## Overview

This module serves as the **exclusive** bridge to the low-level `bfchain-core` library. It manages the dynamic loading of the heavy SDK bundle and provides high-level helpers for transaction operations.

## Architecture

- **Lazy Loading**: The core bundle (`bioforest-chain-bundle.js`) is imported only when needed to optimize startup time.
- **Genesis Management**: Fetches and caches genesis blocks from `/configs/genesis/{chainId}.json`.
- **Core Isolation**: Creates isolated `BFChainCore` instances for each chain to prevent state pollution.

## Key Functions

### `createTransferTransaction`
Constructs a native asset transfer transaction.
- automatically fetches the latest block height (`applyBlockHeight`).
- calculates minimum fees via `getTransferTransactionMinFee`.
- handles "Second Secret" (Payment Password) logic (v1/v2 compatibility).

### `broadcastTransaction`
Submits a signed transaction to the network via the configured RPC endpoint.
- **Error Handling**: Parses chain-specific error codes (e.g., `minFee` requirements).

### `verifyTwoStepSecret`
Validates the user's payment password against the stored second public key.
- Supports both legacy (v1) and modern (v2) key derivation algorithms.
