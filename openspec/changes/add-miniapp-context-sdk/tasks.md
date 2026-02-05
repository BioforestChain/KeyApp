## 1. Schema & Protocol
- [x] Define Zod schema for `MiniappContext` and message envelope.
- [x] Add typed message channel constants and payload types.

## 2. Host Integration
- [x] Add context provider in miniapp runtime (safeAreaInsets, env, host version).
- [x] Handle `miniapp:context-request` and emit `keyapp:context-update`.
- [x] Broadcast updates on safe area/layout changes.

## 3. SDK Implementation
- [x] Add `getMiniappContext` + `onMiniappContextUpdate` APIs with optional `forceRefresh`.
- [x] Implement retry/timeout + default fallback when unsupported.
- [x] Cache context and avoid duplicate event bindings.

## 4. UI/CSS Bridge
- [x] Provide `applyMiniappSafeAreaCssVars` helper and usage guidance for safe area CSS variables.

## 5. Documentation & Tests
- [x] Update white-book/SDK docs with usage examples.
- [x] Add unit tests for SDK message flow and fallback.
