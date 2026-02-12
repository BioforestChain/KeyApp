# Connectivity

## Overview

Connectivity describes how DApps (Miniapps) communicate with the KeyApp host environment and the external world.

## BioBridge Protocol

The BioBridge Protocol is the communication layer between the Miniapp (running in an iframe) and the KeyApp Host.

### Message Format

```json
{
  "id": "uuid-v4",
  "method": "bio_requestAccounts",
  "params": [],
  "jsonrpc": "2.0"
}
```

### Supported Methods (Core)

- `bio_requestAccounts`: Request user address list.
- `bio_createTransaction`: Build unsigned transaction.
- `bio_signTransaction`: Sign unsigned transaction.
- `bio_sendTransaction`: Request transfer authorization and broadcast.
- `bio_destroyAsset`: Request destroy authorization.

### Amount Semantics Standard

- See: [`02-Amount-Semantics-Standard.md`](./02-Amount-Semantics-Standard.md)
- Key rule: all transaction `amount` fields use raw integer string (minimum unit).

## Network Access

Miniapps are sandboxed and cannot access arbitrary network endpoints. All network requests must be proxied or explicitly allowlisted in the manifest.

- **CSP**: Content Security Policy restricts `fetch` / `XHR`.
- **Proxy**: KeyApp provides a proxy service for specific API calls if needed.
