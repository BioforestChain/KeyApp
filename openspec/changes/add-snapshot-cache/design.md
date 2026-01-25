# Design: Snapshot Cache for React useState

## Goals
- Show cached data immediately on page load (perceived speed) without altering network/cache strategies.
- Keep the change local to the **React hook layer** (front-end concern).
- Ensure snapshot persistence across reloads via IndexedDB, with memory fallback for non-browser environments.

## Approach
- Add snapshot support to `useState(input, options)` in the chain-effect React adapter.
- New options (non-breaking):
  - `useSnapshot?: boolean` (default `true`)
  - `snapshotMaxAgeMs?: number` (optional; default `Infinity`)
- Snapshot storage:
  - Key format: `chain-effect:snapshot:<sourceName>:<inputKey>`
  - Value: `superjson.stringify({ data, timestamp })`
  - Storage: **IndexedDB** when available, otherwise in-memory Map

## Behavior
1. **Hook initialization**
   - If `useSnapshot` is true, attempt to read snapshot.
   - Use in-memory snapshot immediately if present (same-session fast path).
   - Otherwise read IndexedDB asynchronously; if snapshot exists and not expired, set it as initial `data`.
   - Continue normal subscription flow; network requests remain unchanged.

2. **Update flow**
   - On every successful update emitted by the data source, persist a snapshot.

3. **Error handling**
   - Snapshot read failures are ignored (fallback to normal behavior).
   - Snapshot write failures are ignored (no impact to data flow).

## Non-goals
- No changes to `httpFetchCached` or cache strategy semantics.
- No server-side snapshot support.

## Risks / Mitigations
- **Stale data**: optional `snapshotMaxAgeMs` and default to immediate refresh via existing data sources.
- **Storage size**: snapshots are per key and only store latest value; no history.
- **Serialization**: use `superjson` to handle BigInt/Amount types safely.
