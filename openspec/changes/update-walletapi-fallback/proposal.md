# Change: WalletAPI tx fallback + cache gating

## Why
WalletAPI BSC tx history can return `success:true` with `result.status:"0"/message:"NOTOK"`, which is a logical failure. Treating it as success causes excessive requests, stale UI, and unnecessary caching. We need deterministic fallback and cache rules without breaking balance refresh.

## What Changes
- Treat WalletAPI `NOTOK` (or status != "1") as a failure for txHistory and skip dependent token-history requests.
- Trigger fallback to alternative providers (e.g., Moralis) when txHistory is unavailable.
- Emit txHistory updates incrementally as each source resolves instead of waiting for all sources.
- Ensure cache policies respect `canCache` for all strategies to prevent caching logical failures.
- Keep balance/asset refresh independent of txHistory failures.

## Impact
- Affected specs: `sync-transactions`
- Affected code: provider effects (`bscwallet`, `ethwallet`), tx merge utilities, `httpFetchCached` cache policy
