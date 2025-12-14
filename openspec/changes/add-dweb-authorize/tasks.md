# Tasks: Add DWEB Authorize Feature

**Status**: HOLD (Partial) - Mock implementation proceeds; real runtime integration blocked

> **HOLD Semantics Clarified (2025-12-13)**:
> - ✅ **CAN PROCEED**: UI components, mock adapter, Storybook, unit tests, E2E screenshots
> - ⏸️ **BLOCKED**: Real IPC integration, runtime detection, production deployment
>
> This allows development progress while awaiting DWEB/Plaoc runtime availability.

## Prerequisites

### Blocking (Real Runtime Only)
- [ ] P0. DWEB/Plaoc runtime becomes available for testing
- [ ] P1. Runtime detection API confirmed (`isPlaocAvailable()`)
- [ ] P2. IPC contract checklist confirmed with real runtime (events + payload schemas + semantics)
  - [ ] P2.1 Entry point + params schema (confirm which surface is real)
    - Candidate A: mpay-style `plaoc.initAppPlaocEventListener((eventId, url, event) => ...)`
    - Candidate B: `@plaoc/plugins` `dwebServiceWorker.addEventListener('fetch', (event) => ...)` (request/response IPC)
  - [ ] P2.2 App info contract: `getCallerAppInfo(eventId)` return shape + error semantics
  - [ ] P2.3 Address request payload schema (type/main|network|all + chainName + optional signMessage + getMain semantics/safety)
  - [ ] P2.4 Signature request payload schema (confirm single vs batch)
    - mpay accepts `signaturedata` as JSON stringified array (batch-capable); confirm runtime expectation for KeyApp
    - Evidence (legacy): mpay `externalFetch` sends `signaturedata` primarily via **POST body** (query-based `signaturedata` is commented out); KeyApp Phase B should implement **body first + query fallback** to maximize compatibility.
    - Confirm batch result semantics (index-aligned array; items may be `null` or `{ error: true, message: ... }`)
  - [ ] P2.5 Response schema: `respondWith(eventId, path, data)` meaning of `path` + success/error payloads (confirm wire envelope like JSON `{ data: ... }` + raw array compatibility with mpay)
  - [ ] P2.6 Cleanup semantics: `removeEventId(eventId)` idempotency + required call order
  - [ ] P2.7 Timeout/cancel semantics (deadline, user cancel, runtime disconnect, retry/replay guard)

### Non-Blocking (Mock-First)
- [x] P3. Mock adapter implementation (M1 complete)
- [x] P4. IPC contract types defined
- [x] P5. High-risk decisions documented (balance, timeout, replay)
  - Clarification (2025-12-13): 当前 mock-first 实现主要在 **UI 页面层**做 timeout/单次响应保护；adapter 层的“replay guard”与“insufficient_balance 强制阻断”仍待补齐。

---

## Phase A: Mock-First Implementation (CAN PROCEED)

### 1. Core Infrastructure (Partial Complete)

- [x] 1.1 Mock adapter with `getCallerAppInfo(eventId)` (M1)
- [x] 1.2 Mock adapter with `respondWith(eventId, path, data)` (M1)
- [x] 1.3 Mock adapter with `removeEventId(eventId)` (M1)
- [ ] 1.4 Add runtime detection in `isPlaocAvailable()` → Phase B
- [x] 1.5 Add unit tests for IPC adapter methods (M1: 5 tests)

## 2. Address Authorization Service

- [x] 2.1 Create `AddressAuthService` class in `src/services/authorize/address-auth.ts`
- [x] 2.2 Implement `handleMainAddresses()` - current wallet only
- [x] 2.3 Implement `handleNetworkAddresses()` - all addresses on chain
- [x] 2.4 Implement `handleAllAddresses()` - all wallets
- [x] 2.5 Add signature for `signMessage` if requested
- [x] 2.6 Add unit tests for address auth service

## 3. Signature Authorization Service

- [x] 3.1 Create `SignatureAuthService` class in `src/services/authorize/signature-auth.ts`
- [x] 3.2 Implement `handleMessageSign()` - message signing flow
- [x] 3.3 Implement `handleTransferSign()` - transfer signing flow
- [x] 3.4 Implement `handleDestroySign()` - asset destruction flow
- [x] 3.5 Add password verification gate before any signing
- [x] 3.6 Add unit tests for signature auth service

## 4. Router Integration

- [x] 4.1 Add `/authorize/address/:id` route
- [x] 4.2 Add `/authorize/signature/:id` route
- [x] 4.3 Register DWEB IPC event listeners on app mount
- [x] 4.4 Handle deep linking from external DWEB apps

## 5. Address Authorization UI

- [x] 5.1 Create `AppInfoCard` component (name, logo, URL)
- [x] 5.2 Create `PermissionList` component (checkmarks for permissions)
- [x] 5.3 Create `AddressAuthPage` with wallet/chain selectors
- [x] 5.4 Add approve/reject button handlers
- [x] 5.5 Add loading and error states
- [x] 5.6 Write Storybook stories for address auth components
- [x] 5.7 Write unit tests for address auth page

## 6. Signature Authorization UI

- [x] 6.1 Create `TransactionDetails` component (from, to, amount, fee)
- [x] 6.2 Create `SignatureAuthPage` with type-specific layouts
- [x] 6.3 Integrate `PasswordConfirmSheet` for signing confirmation
- [x] 6.4 Add balance validation warning
  - NOTE: 已在 UI 层禁用确认按钮，并在拒绝时返回 `insufficient_balance`；balance 计算逻辑仍在页面层（后续可下沉到 service）。
- [x] 6.5 Add loading and error states
- [x] 6.6 Write Storybook stories for signature auth components
- [x] 6.7 Write unit tests for signature auth page

## 7. i18n

- [x] 7.1 Create `src/i18n/locales/en/authorize.json`
- [x] 7.2 Create `src/i18n/locales/zh-CN/authorize.json` (+ zh-TW, ar)
- [x] 7.3 Register namespace in i18n configuration
- [x] 7.4 Verify all UI strings use translation keys

## 8. E2E Tests

- [x] 8.1 Screenshot test: Address authorization page
- [x] 8.2 Screenshot test: Wallet selector (main type)
- [x] 8.3 Screenshot test: Chain selector (network type)
- [x] 8.4 Screenshot test: Signature authorization page
- [x] 8.5 Screenshot test: Password confirmation
- [x] 8.6 Screenshot test: Error states

## 9. Integration Testing

- [x] 9.1 Mock DWEB runtime for development (M1: mock-adapter.ts)
- [x] 9.2 Test address auth flow end-to-end
- [x] 9.3 Test signature auth flow end-to-end
- [x] 9.4 Test error handling (timeout, rejection, invalid requests)
- [ ] 9.5 Test with real DWEB runtime → Phase B

---

## Phase B: Runtime Integration (BLOCKED until DWEB available)

These tasks require real DWEB/Plaoc runtime and cannot proceed until P0-P2 are resolved:

- [ ] B1. Real `isPlaocAvailable()` implementation (from 1.4)
- [ ] B2. Real IPC adapter replacing mock (dweb.ts)
- [ ] B3. Test with real DWEB runtime (from 9.5)
- [ ] B4. Deep linking from external DWEB apps (from 4.4)
- [ ] B5. Production deployment validation

---

## Deferred Tasks (MEDIUM/LOWER priority)

These tasks are out of scope for the initial implementation:

- [ ] D1. Fee calculation with chain-specific logic
- [ ] D2. Certificate transfer support
- [ ] D3. JSON object signing support
- [ ] D4. Asset balance queries
- [ ] D5. ENTITY/NFT operations
- [ ] D6. Smart contract calls
- [ ] D7. Secondary password for high-value operations
- [ ] D8. Fee randomization for privacy
