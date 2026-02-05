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
- Request: `{ type: "miniapp:context-request", requestId, sdkVersion, payload?: { appId } }`
- Response: `{ type: "keyapp:context-update", requestId, payload }`
- Errors use `{ type: "keyapp:context-error", requestId, code, message }`

## SDK API (Atomic)
```ts
export async function getMiniappContext(options?: {
  forceRefresh?: boolean;
  timeoutMs?: number;
  retries?: number;
  appId?: string;
}): Promise<MiniappContext>;

export function onMiniappContextUpdate(
  handler: (context: MiniappContext) => void,
  options?: { emitCached?: boolean; appId?: string },
): () => void;
```

## Distribution
- Exposed from `@biochain/bio-sdk` as named exports to keep a single public package.
- APIs are side-effect-free; existing provider auto-init behavior remains unchanged.

## SDK Behavior
- `getMiniappContext()` returns cached context when available; if missing (or `forceRefresh`), it sends `miniapp:context-request` and waits for `keyapp:context-update`.
- `onMiniappContextUpdate()` registers a handler, replays cached context once (default), and ensures a refresh if nothing is cached.
- SDK uses a singleton message bridge to avoid duplicate event bindings.
- If host does not support the channel (timeout), SDK resolves with fallback context derived from standard Web APIs (safe-area env vars, prefers-color-scheme, document language) and logs a warning.

## Host Behavior
- Host maintains a context snapshot (safeAreaInsets, env info, version) and updates it on layout changes.
- On `miniapp:context-request`, respond with `keyapp:context-update` (including `requestId`).
- When context changes, broadcast `keyapp:context-update` to active miniapp frames.

## CSS Variable Hook
Provide a small helper in the SDK so UI can apply safe-area CSS variables without manual mapping.

```ts
export function applyMiniappSafeAreaCssVars(
  context: MiniappContext,
  options?: {
    target?: HTMLElement | Document;
  },
): void;
```

Behavior:
- Default target: `document.documentElement`.
- Always sets:
  - `--keyapp-safe-area-top`
  - `--keyapp-safe-area-right`
  - `--keyapp-safe-area-bottom`
  - `--keyapp-safe-area-left`
- Values are `${number}px`, derived from `context.env.safeAreaInsets`.
