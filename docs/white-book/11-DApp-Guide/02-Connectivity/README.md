# Connectivity

## Overview

Connectivity describes how DApps (Miniapps) communicate with the KeyApp host environment and the external world.

## BioBridge Protocol

The BioBridge Protocol is the communication layer between the Miniapp (running in an iframe) and the KeyApp Host.

### Message Format

```json
{
  "id": "uuid-v4",
  "method": "wallet_requestAccounts",
  "params": [],
  "jsonrpc": "2.0"
}
```

### Supported Methods

- `wallet_requestAccounts`: Request user address.
- `wallet_sendTransaction`: Request transaction signing.
- `wallet_signMessage`: Request message signing.
- `kv_get`: Read from isolated storage.
- `kv_set`: Write to isolated storage.

## Network Access

Miniapps are sandboxed and cannot access arbitrary network endpoints. All network requests must be proxied or explicitly allowlisted in the manifest.

- **CSP**: Content Security Policy restricts `fetch` / `XHR`.
- **Proxy**: KeyApp provides a proxy service for specific API calls if needed.
