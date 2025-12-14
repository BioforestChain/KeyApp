# Change: Add DWEB Authorize Feature

## Status

**HOLD** - Pending DWEB/Plaoc runtime availability.

This proposal documents the complete DWEB authorization system for external app wallet access and transaction signing. Implementation will begin once the DWEB runtime is available for integration testing.

## Why

External DWEB applications need secure access to KeyApp wallet functionality:
1. **Address sharing**: Apps need wallet addresses for displaying balances, receiving payments
2. **Transaction signing**: Apps need user-approved signatures for transfers, messages, and contracts
3. **User consent**: Every operation must be explicitly approved by the user with clear information about what they're authorizing

The mpay implementation contains ~2000 lines across 6 files handling these flows. KeyApp currently has only a 156-line stub (`src/services/authorize/plaoc-adapter.ts`) defining the interface.

## What Changes

### HIGH Priority (This Proposal Scope)

- **Address Authorization Flow**: Complete flow for sharing wallet addresses with external apps
  - Main wallet addresses only (`type: main`)
  - All addresses on a specific chain (`type: network`)
  - All addresses from all wallets (`type: all`)

- **Signature Authorization Flow**: Complete flow for user-approved signing operations
  - Message signing (`type: message`)
  - Transfer signing (`type: transfer`)
  - Destroy/burn operations (`type: destory`)

- **UI Components**: Authorization pages and sheets
  - Address authorization page with app info display
  - Signature authorization page with transaction details
  - Password confirmation sheet for all signing operations

- **IPC Integration**: DWEB communication methods
  - `getCallerAppInfo(eventId)` - Retrieve requesting app manifest
  - `respondWith(eventId, path, data)` - Send authorization result
  - `removeEventId(eventId)` - Cleanup IPC state

- **Router Integration**: New routes for authorization flows
  - `/authorize/address/:id` - Address authorization
  - `/authorize/signature/:id` - Signature authorization

- **Balance Validation**: Pre-signing balance check to prevent failed transactions
  - Verify sufficient balance for transfer amount
  - Verify sufficient balance for transaction fees
  - Display clear error when balance insufficient

### MEDIUM Priority (Deferred)

- Fee calculation with chain-specific logic
- Certificate transfer (`type: bioforestChainCertificateTransfer`)
- JSON object signing (`type: json`)
- Asset balance queries (`type: assetTypeBalance`)

### LOWER Priority (Deferred)

- ENTITY/NFT operations (`type: ENTITY`)
- Smart contract calls (`type: contract`)
- All-chain implementations (beyond main supported chains)
- Secondary password for high-value operations
- Fee randomization for privacy

## Security Boundaries

### Address Authorization

| Exposed | Protected |
|---------|-----------|
| Wallet addresses | Private keys |
| Public keys | Mnemonic phrases |
| Chain names | Password |
| Wallet display names | Transaction history |

**User consent required**: User must explicitly tap "Approve" to share addresses.

### Signature Authorization

| Exposed | Protected |
|---------|-----------|
| Transaction details (amount, recipient) | Private keys |
| Estimated fees | Mnemonic phrases |
| Operation type | Raw signing material |

**User consent required**:
- User must review all transaction details
- Master password required for EVERY signing operation
- No auto-approval mechanism

### App Information Display

Before any authorization, user sees:
- Requesting app name
- Requesting app logo
- Requesting app home URL
- Specific permissions being requested

## IPC Contract Details

### Runtime Surface (TBD)

The concrete runtime entrypoint is still unconfirmed. We must lock it down with real runtime samples before implementing Phase B:

- Candidate A: mpay-style `plaoc.initAppPlaocEventListener((eventId, url, event) => ...)`
- Candidate B: `@plaoc/plugins` `dwebServiceWorker.addEventListener('fetch', (event) => ...)` (request/response IPC)

#### Observed mpay PlaocService (evidence only)

The legacy mpay implementation strongly suggests Candidate B is real in practice:

- Wallet listens via `dwebServiceWorker.addEventListener('fetch', ...)` and generates an internal `eventId` like `eventId:${Date.now()}` to correlate UI with the captured fetch event.
- `getCallerAppInfo(eventId)` reads `event.getRemoteManifest()`.
- **Request handoff to UI**: wallet-side listener owns the only reliable copy of request details (URL/query/body). KeyApp Phase B must define how those request details reach the UI route:
  - Address params can be passed via router `search` (small and debuggable)
  - Signature payload (`signaturedata`) SHOULD NOT be put in URL by KeyApp; it should be parsed from the incoming request (query first, body fallback) and cached by `eventId` for the signature page to load

**Request Handoff Decision (2025-12-14 PeerA)**:
- **Hybrid approach chosen**:
  - **Address authorization**: params (`type`, `chainName`, `signMessage`, `getMain`) passed via router search params. Small, debuggable, URL-safe.
  - **Signature authorization**: payload cached in adapter by `eventId`. UI retrieves via `adapter.getSignatureRequest(eventId)`. Large JSON payloads not suitable for URL.
- **Rationale**: Matches mpay patterns; separation of concerns (small params in URL, large payloads in adapter cache); debuggable for Address flow.
- **Implementation requirement**: Adapter must expose `getSignatureRequest(eventId): SignatureRequestItem[]` for UI to retrieve cached payload.
- Code-level hint (`@plaoc/plugins`): `getRemoteManifest()` derives the caller mmid from `event.request.headers.get("X-External-Dweb-Host")` and queries `dns.std.dweb /query?mmid=...` to return the caller manifest. This implies authorize requests must carry `X-External-Dweb-Host` (or equivalent) for app-info display to work.
- `respondWith(eventId, pathname, payload)` serializes JSON `{ "data": payload }` with `application/json` and **consumes** the cached fetch event (deletes `eventId` from the internal map before responding), making subsequent cleanup safe.
- `removeEventId(eventId)` responds with JSON `{ "data": null }` only when the event is still present (so calling `removeEventId` after a successful `respondWith` becomes a no-op in practice).
- For signature requests, mpay wallet-side receiver reads `signaturedata` from query first, then falls back to `event.request.text()` (POST body). Meanwhile, mpay `externalFetch` uses `dwebServiceWorker.fetch(url.href, { method: "POST", body: signaturedata })` where `signaturedata = JSON.stringify(search)` (query-based `signaturedata` is commented out in that code path). This implies KeyApp should support **query first + body fallback** for maximum compatibility.

### Event ID Format

- **Source**: Wallet-side listener generates an internal eventId (used to correlate UI flow with the underlying IPC event)
- **Format**: Opaque string (mpay uses `eventId:${Date.now()}`); if Candidate B is used, an underlying numeric `reqId` may exist but does not need to be exposed
- **Lifetime**: Valid for 5 minutes from creation
- **Single-use**: Each eventId can only be responded to once

### IPlaocAdapter Interface

```typescript
interface IPlaocAdapter {
  getCallerAppInfo(eventId: string): Promise<CallerAppInfo>
  respondWith(eventId: string, path: string, data: unknown): Promise<void>
  removeEventId(eventId: string): Promise<void>
  isAvailable(): boolean
}

interface CallerAppInfo {
  appId: string      // DWEB app identifier
  appName: string    // Display name
  appIcon: string    // Icon URL
  origin: string     // App home URL
}
```

### Response Paths & Schemas

| Path | Success Data | Error Data |
|------|--------------|------------|
| `/wallet/authorize/address` | `AddressInfo[]` (raw array) | `null` |
| `/wallet/authorize/signature` | `ResultArray` (index-aligned) | `null` |

**Normalization Decision (2025-12-14 PeerA)**:
- **Option A chosen**: Service layer aligns directly to mpay payload shapes.
- Service returns raw `AddressInfo[]` / `ResultArray` (not wrapped in `{ addresses }` or `{ signature }`).
- Adapter handles **only** the wire envelope: wraps to `{ "data": <payload> }` on send.
- Error responses use `null` (adapter sends `{ "data": null }`), matching mpay `removeEventId` semantics.
- **Rationale**: Keeps adapter as pure transport layer; contract tests assert service output matches mpay wire expectations directly.

**Wire format (mpay-compatible)**:
- Success: JSON `{ "data": <payload> }` with `Content-Type: application/json`
- Reject/Timeout/Cancel: JSON `{ "data": null }` (same as `removeEventId` response)

### Error Codes

| Code | Meaning | User Action |
|------|---------|-------------|
| `rejected` | User clicked Reject | None needed |
| `timeout` | 5-minute timeout elapsed | Retry request |
| `insufficient_balance` | Balance < amount + fee | Add funds |
| `unsupported_chain` | Chain not supported | Use different chain |
| `invalid_event` | EventId not found or expired | Retry request |

## High-Risk Decisions

### 1. Unknown Chain/Network Handling

**Decision**: Return `unsupported_chain` error immediately.

- System SHALL check if requested `chainName` is in supported chains list
- If unsupported: display error page with i18n key `authorize.error.unknownChain`
- User can dismiss and return home; no partial authorization

**Rationale**: Better to fail fast than attempt unsupported operations.

### 2. Request Expiration Strategy

**Decision**: 5-minute timeout with cleanup.

- Authorization requests expire 5 minutes after `getCallerAppInfo` is called
- On timeout: system auto-responds with `{ error: 'timeout' }`
- UI dismisses automatically with toast notification
- `removeEventId` called for cleanup

**Rationale**: Prevents stale requests, balances UX with security.

### 3. Replay Prevention

**Decision**: Single-use eventId with mandatory cleanup.

- Each `eventId` can only receive ONE `respondWith` call
- After `respondWith`, `removeEventId` MUST be called
- Duplicate `respondWith` calls are no-ops (idempotent)
- Mock adapter tracks used eventIds in Set for testing

**Rationale**: Prevents replay attacks, ensures deterministic behavior.

### 4. Balance Validation Timing

**Decision**: Pre-signing validation, not at submission.

- Balance check happens BEFORE password prompt
- If insufficient: "Confirm" button disabled, error shown
- User cannot bypass by entering password
- Rechecks on retry (user may have received funds)

**Rationale**: Better UX than failing after password entry.

## Phase B First-Batch Change Points

**Status**: TBD - pending runtime samples

These change points are confirmed for Phase B implementation but await runtime validation before coding begins.

### 1. `getMain` Behavior (Address UI)

When `getMain=true` in request params, UI should return only the main/default address.

- **Context**: Address authorization can request either all addresses or just the primary one
- **Behavior**: If `getMain=true`, UI displays single-address selection mode and returns only the main wallet address
- **Reference**: mpay `tabs.component.ts` address handling logic

### 2. `signaturedata` Dual-Source Read (Signature)

Pattern: body-first + query fallback.

- **Context**: Signature payloads can arrive via POST body or query parameter
- **Behavior**: Adapter must check `event.request.text()` first (body), then fallback to query param `signaturedata`
- **Rationale**: Maximum compatibility with different caller implementations
- **Reference**: mpay `tabs.component.ts` signature handling (receiver reads query first, body fallback)

### 3. Normalization Boundary Confirmed

Service layer returns raw `array | null`, adapter wraps in `{ data: <payload> }` for wire format.

- **Service output**: Raw `AddressInfo[]` or `ResultArray` (no wrapper object)
- **Adapter responsibility**: Wraps service output to `{ "data": <payload> }` for IPC response
- **Error case**: Service returns `null`, adapter sends `{ "data": null }`
- **Status**: LOCKED for Phase B - this boundary will not change

## Impact

- **Affected specs**: `authorize` (new)
- **Affected code**:
  - `src/services/authorize/plaoc-adapter.ts` (expand existing stub)
  - `src/services/authorize/address-auth.ts` (new)
  - `src/services/authorize/signature-auth.ts` (new)
  - `src/pages/authorize/address.tsx` (new)
  - `src/pages/authorize/signature.tsx` (new)
  - `src/components/authorize/AppInfoCard.tsx` (new)
  - `src/components/authorize/PermissionList.tsx` (new)
  - `src/components/authorize/TransactionDetails.tsx` (new)
  - `src/routes/authorize/` (new route group)
  - `src/locales/*/authorize.json` (new i18n namespace)

## E2E Acceptance Criteria

Screenshot acceptance for authorization flows:

| Test Case | Screenshot | Validation |
|-----------|------------|------------|
| Address auth page | `authorize-address-page.png` | Shows app info, wallet selector, permission list |
| Wallet selector (main) | `authorize-wallet-selector-main.png` | Single wallet selection UI |
| Chain selector (network) | `authorize-chain-selector-network.png` | Multi-chain selection UI |
| Signature auth page | `authorize-signature-transfer.png` | Shows transfer details, fee, recipient |
| Password confirmation | `authorize-password-confirm.png` | Password input with secure keyboard |
| Error: insufficient balance | `authorize-error-balance.png` | Clear error message, blocked action |
| Error: unknown chain | `authorize-error-chain.png` | Graceful degradation message |

## i18n Keys Required

```yaml
authorize:
  # Page titles
  title:
    address: "Address Authorization"
    signature: "Transaction Authorization"

  # App info
  app:
    requesting: "{{appName}} is requesting access"
    from: "From: {{appHome}}"

  # Address auth
  address:
    shareWith: "Share addresses with this app?"
    scope:
      main: "Current wallet only"
      network: "All {{chainName}} addresses"
      all: "All wallets"
    permissions:
      viewAddress: "View your wallet addresses"
      viewPublicKey: "View your public keys"
      signMessage: "Sign a verification message"

  # Signature auth
  signature:
    reviewTransaction: "Review this transaction"
    type:
      message: "Message Signing"
      transfer: "Token Transfer"
      destroy: "Asset Destruction"
    details:
      from: "From"
      to: "To"
      amount: "Amount"
      fee: "Network Fee"
      total: "Total"

  # Buttons
  button:
    approve: "Approve"
    reject: "Reject"
    confirm: "Confirm with Password"

  # Errors
  error:
    insufficientBalance: "Insufficient balance for this transaction"
    unknownChain: "Unsupported blockchain"
    authFailed: "Authorization failed"
    passwordIncorrect: "Incorrect password"
    timeout: "Request timed out"
```

## Dependencies

- DWEB/Plaoc runtime (BLOCKING)
- Password confirmation sheet (exists: `PasswordConfirmSheet`)
- Wallet selector component (exists: `WalletSelector`)
- Chain address selector (exists: `ChainAddressSelector`)

## References

- Gap analysis: PeerB 2025-12-13
- mpay authorize source: `/legacy-apps/apps/mpay/src/pages/authorize/`
- Current stub: `src/services/authorize/plaoc-adapter.ts`
