# Bitcoin Provider (UTXO)

> **Code Source**: `src/services/chain-adapter/providers/btcwallet-provider.effect.ts`

## Overview

The `BtcWalletProviderEffect` implements the `ApiProvider` interface for Bitcoin-like UTXO chains. It relies on a Blockbook-compatible backend API (btcwallet) to fetch balances, transaction history, and single-transaction detail. It also uses Blockbook endpoints for fee estimation, UTXO collection, and raw-transaction broadcast.

## Architecture

```mermaid
graph TD
    A[ChainProvider] --> B[BtcWalletProviderEffect]
    B --> C[btcwallet-v1 (Blockbook Proxy)]
    C --> D[Bitcoin Node]
```

## Implementation Details

### Class Structure

- **Class**: `BtcWalletProviderEffect`
- **Implements**: `ApiProvider`
- **Location**: `src/services/chain-adapter/providers/btcwallet-provider.effect.ts`

### Key Features

1. **Native Balance**:
   - Fetches address info via `/api/v2/address/{address}?details=txs`.
   - Balance derived from Blockbook `balance` field.
   - Cache: TTL 5s (browser cache).

2. **Transaction History**:
   - Uses the same address info endpoint (`details=txs`) and maps `vin/vout`.
   - Cache: TTL 5s (browser cache).

3. **Single Transaction Detail**:
   - Fetches `/api/v2/tx/{txid}` and maps to standard `TransactionOutput`.
   - Cache: TTL 5s (browser cache).

4. **Fee Estimate / UTXO / Broadcast**:
   - Fee estimate: `/api/v2/estimatefee/{blocks}`
   - UTXO list: `/api/v2/utxo/{address}`
   - Broadcast raw tx: `/api/v2/sendtx/{hex}`

### Data Models

#### Blockbook Response Schemas (Proxy)

btcwallet 使用 Blockbook 代理，所有请求通过 walletapi POST 代理执行：

```ts
POST /wallet/btc/blockbook
body: { url: "/api/v2/address/{address}", method: "GET" }
```

#### Logic: Direction & Value

The provider calculates the net value change for the user's address to determine the transaction direction:

- **Incoming (`in`)**: Net value > 0.
- **Outgoing (`out`)**: Net value < 0.
- **Self (`self`)**: Net value = 0 (e.g., consolidation).

```typescript
const inSum = sumValues(tx.vin, address)
const outSum = sumValues(tx.vout, address)
const net = outSum - inSum
```

## Configuration

- **Type**: `btcwallet-v1`
- **Endpoint**: URL of the Blockbook API (e.g., `https://btc.bioforest.io`).
- **Chain ID**: Passed during initialization to fetch symbol and decimals.

## Caching Strategy (httpFetchCached)

| Data | Strategy | TTL |
|------|----------|-----|
| Address Info / History | ttl | 5s |
| Transaction Detail | ttl | 5s |
| UTXO | ttl | 15s |
| Estimate Fee | ttl | 30s |

## Error Handling

- Validates API responses using Zod schemas (`BlockbookErrorSchema`, `BlockbookAddressInfoSchema`).
- Throws specific errors for API failures or invalid data.

## Future Improvements

- [ ] Support for XPUB derived addresses.
- [ ] Enhanced fee strategy (multi-target).
