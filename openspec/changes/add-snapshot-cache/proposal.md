# Change: Add snapshot cache for chain-effect React

## Why
Current `httpFetchCached` returns a single value per call, so UI cannot immediately display cached data while a network request is in-flight. We need a front-end-only snapshot layer to show cached data as soon as it becomes available without changing existing cache strategy semantics.

## What Changes
- Add a **snapshot cache** at the React hook layer (`useState`) to hydrate UI from the last successful data.
- Introduce a `useSnapshot` option (default `true`) to enable/disable snapshot hydration per hook call.
- Persist snapshots in a **front-end-owned storage** (IndexedDB with memory fallback) keyed by data source + input key.
- Preserve existing cache strategies (`ttl`, `network-first`, `cache-first`) and network behavior; snapshot only affects initial UI state.

## Impact
- Affected specs: `production-quality` (performance / perceived latency)
- Affected code: `packages/chain-effect` React adapter + hook options
- Behavior change: UI can show cached data immediately before network refresh completes (no change to request policy)
