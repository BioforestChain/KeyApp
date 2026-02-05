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

## SDK Behavior
- `initMiniapp()` creates a single message bridge, subscribes to updates, and triggers refresh if no cached context is available.
- `getContext()` resolves cached context; if missing, it waits for refresh with timeout + retry (configurable defaults).
- `onContextUpdate()` registers handler, replays latest cached context once per subscriber, returns unsubscribe.
- `requestContextRefresh()` sends a request and resolves with the next context update.
- If host does not support the channel (timeout), SDK resolves with default context values and logs a warning.

## Host Behavior
- Host maintains a context snapshot (safeAreaInsets, env info, version) and updates it on layout changes.
- On `miniapp:context-request`, respond with `keyapp:context-update` (including `requestId`).
- When context changes, broadcast `keyapp:context-update` to active miniapp frames.

## CSS Variable Hook
- Provide helper `applySafeAreaCssVars(context)` or emit event `contextupdate` for UI to set variables like `--f7-safe-area-top`.
