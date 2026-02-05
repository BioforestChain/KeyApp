# Design: Miniapp context SDK

## Context Payload
```ts
export type MiniappContext = {
  version: number;
  env: {
    safeAreaInsets: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    platform?: "ios" | "android" | "web" | "dweb";
    locale?: string;
  };
  host: {
    name: "KeyApp";
    version: string;
    build?: string;
  };
  updatedAt: string;
};
```

## Message Contract
- Request: `{ type: "miniapp:context-request", requestId, sdkVersion }`
- Response: `{ type: "keyapp:context-update", requestId, payload }`
- Errors use `{ type: "keyapp:context-error", requestId, code, message }`

## SDK API (Atomic)
```ts
export async function getMiniappContext(options?: {
  forceRefresh?: boolean;
  timeoutMs?: number;
  retries?: number;
}): Promise<MiniappContext>;

export function onMiniappContextUpdate(
  handler: (context: MiniappContext) => void,
  options?: { emitCached?: boolean },
): () => void;
```

## SDK Behavior
- `getMiniappContext()` returns cached context when available; if missing (or `forceRefresh`), it sends `miniapp:context-request` and waits for `keyapp:context-update`.
- `onMiniappContextUpdate()` registers a handler, replays cached context once (default), and ensures a refresh if nothing is cached.
- SDK uses a singleton message bridge to avoid duplicate event bindings.
- If host does not support the channel (timeout), SDK resolves with default context values and logs a warning.

## Host Behavior
- Host maintains a context snapshot (safeAreaInsets, env info, version) and updates it on layout changes.
- On `miniapp:context-request`, respond with `keyapp:context-update` (including `requestId`).
- When context changes, broadcast `keyapp:context-update` to active miniapp frames.

## CSS Variable Hook
- Provide helper `applySafeAreaCssVars(context)` or emit event `contextupdate` for UI to set variables like `--f7-safe-area-top`.
