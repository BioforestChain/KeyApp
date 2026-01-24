# Change: Align providers with biowallet pendingTx/txHistory sync

## Why
Pending transaction confirmations currently trigger txHistory refresh only for biowallet because other providers use isolated event buses. This causes stale transaction history and pending list mismatches across chains.

## What Changes
- Use the shared wallet event bus for all providers that register walletEvents.
- Ensure transactionHistory sources for every provider react to tx:confirmed/tx:sent events.
- Keep biowallet behavior as the benchmark for sync semantics.

## Impact
- Affected specs: sync-transactions (new)
- Affected code: provider effect files using walletEvents, shared wallet-event-bus usage
