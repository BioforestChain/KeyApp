## 1. Schema & Protocol
- [ ] Define Zod schema for `MiniappContext` and message envelope.
- [ ] Add typed message channel constants and payload types.

## 2. Host Integration
- [ ] Add context provider in miniapp runtime (safeAreaInsets, env, host version).
- [ ] Handle `miniapp:context-request` and emit `keyapp:context-update`.
- [ ] Broadcast updates on safe area/layout changes.

## 3. SDK Implementation
- [ ] Add `initMiniapp`, `getContext`, `onContextUpdate`, `requestContextRefresh` APIs.
- [ ] Implement retry/timeout + default fallback when unsupported.
- [ ] Cache context and avoid duplicate event bindings.

## 4. UI/CSS Bridge
- [ ] Provide helper or event guidance for applying safe area CSS variables.

## 5. Documentation & Tests
- [ ] Update white-book/SDK docs with usage examples.
- [ ] Add unit tests for SDK message flow and fallback.
