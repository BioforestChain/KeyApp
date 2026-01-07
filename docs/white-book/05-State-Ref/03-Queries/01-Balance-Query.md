# Balance Query

## Overview

The Balance Query hook (`useBalanceQuery`) manages the fetching and caching of account balances using TanStack Query.

## Configuration

| Setting | Value | Reason |
|---------|-------|--------|
| `staleTime` | 30s | Prevents redundant requests on quick tab switches. |
| `gcTime` | 5m | Keeps data available in cache for a reasonable time. |
| `refetchInterval` | 60s | Background polling to keep balances fresh. |

## Query Key

Keys are hierarchical to support granular invalidation:

- `['balance', walletId, chainId]`

## Integration

The query function actually delegates to `walletActions.refreshBalance`, which updates the synchronous `walletStore`. This hybrid approach allows the Query to handle the timing/caching while the Store remains the single source of truth for the UI data.
