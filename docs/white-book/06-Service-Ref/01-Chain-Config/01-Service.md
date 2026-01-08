# Chain Config Service

> **Code Source**: [`src/services/chain-config/service.ts`](https://github.com/BioforestChain/KeyApp/blob/main/src/services/chain-config/service.ts)

## Overview

The `ChainConfigService` provides a unified interface for querying blockchain configurations. It abstracts the complexity of `chainConfigStore` and provides helper methods for adapters.

## Core Capabilities

### 1. Configuration Access
- **`getConfig(chainId)`**: Retrieves the full `ChainConfig` object.
- **`getDecimals(chainId)`**, **`getSymbol(chainId)`**: Quick access to chain metadata.

### 2. API Discovery
The service implements a pattern-based API discovery mechanism to support various provider types:

- **`getApi(chainId)`**: Returns all available API endpoints.
- **`getRpcUrl(chainId)`**: Finds the primary RPC endpoint (matches `*-rpc`).
- **`getBiowalletApi(chainId)`**: Finds BioWallet-specific APIs (matches `biowallet-*`).
- **`getEtherscanApi(chainId)`**: Finds block explorer APIs.

### 3. Explorer Integration
Provides template-based URL generation for:
- Transaction links: `getTxQueryUrl`
- Address links: `getAddressQueryUrl`

## Usage Example

```typescript
import { chainConfigService } from '@/services/chain-config';

// Get RPC URL for a chain
const rpcUrl = chainConfigService.getRpcUrl('ethereum');

// Get decimals
const decimals = chainConfigService.getDecimals('bfmeta');
```
