# Change: Add miniapp context SDK and host channel

## Why
Miniapps need safe area and host context without directly using postMessage. A normalized SDK plus host-side channel prevents fragile integrations and provides backward-compatible defaults.

## What Changes
- Define a schema-first miniapp context payload (safeAreaInsets, env info, host version).
- Add a host-side context channel that responds to `miniapp:context-request` with `keyapp:context-update`.
- Provide a miniapp SDK wrapper that handles init, refresh, subscription, retry, timeout, and caching.
- Ensure iframe mode automatically replays context on subscription and on-demand refresh.
- Document the new SDK usage and context structure.

## Impact
- Affected specs: miniapp-runtime (new)
- Affected code: miniapp runtime messaging, keyapp-sdk, docs/white-book
