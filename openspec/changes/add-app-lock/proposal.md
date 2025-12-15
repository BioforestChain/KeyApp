# Change: Add App Lock (Password-Only MVP)

## Status

**DRAFT** - Pending scope approval (PDR Story 6.1).

## Why

PDR Story 6.1 requires an “App Lock” so that users must verify identity (password) on the next app open. KeyApp currently has only per-action password confirmation (e.g. dangerous actions), and Settings “应用锁” is still TODO.

Without an explicit scope decision and spec, “mpay parity” wording becomes misleading and implementation risks rework.

## What Changes

### In Scope (MVP)

- **Password Lock toggle** in Settings → Security → “应用锁”
  - Enabling requires verifying current wallet password.
  - Disabling stops enforcing lock on next app open.
- **Lock screen route** (e.g. `/lock`)
  - Password input + unlock action.
  - After unlock, redirect back to the originally requested route.
- **Router guard** (TanStack Router)
  - If password lock enabled and not unlocked, redirect to `/lock` for non-allowlisted routes.
  - Allowlist onboarding routes and the lock route itself.
- **Cold start enforcement**
  - When password lock is enabled and a wallet with an encrypted secret exists, the first navigation after a reload (cold start) is blocked by the lock route (no protected content flash).
- **Password verification** without storing raw passwords
  - Verify by attempting to decrypt at least one existing wallet secret (try current wallet first, then fall back to other wallets) so users don’t get locked out when the “current wallet” changes.
  - Do not enforce App Lock when there is no wallet (or no decryptable encrypted secret exists).

### Out of Scope (Deferred)

- Fingerprint unlock / fingerprint payment branches (PDR Story 6.1 side flows)
- Retry backoff UX parity
- Password tips / reset UX
- Background “timeout lock” (resume vs cold start semantics). (mpay triggers sign-in on `resume` after a timeout; this MVP intentionally does not.)

## Impact

- **Affected specs**: new capability `app-lock` (added in this change)
- **Affected code (planned)**:
  - Settings entry: `src/pages/settings/index.tsx` (wire “应用锁” to page/route)
  - Routing/guards: `src/routes/**`, `src/components/layout/app-layout.tsx` (hide TabBar on lock route)
  - Store + persistence: `src/stores/**`, `src/services/storage/**`
  - Security UI reuse: `src/components/security/password-confirm-sheet.tsx` (optional reuse)

## Implementation Notes (non-normative)

- **Guard vs store init timing**: wallet store initialization currently happens in `AppLayout` via `useEffect`, while route `beforeLoad` guards run before React effects. Implementation MUST ensure persisted wallet state is available before deciding to enforce/skip lock on cold start (to avoid a bypass window).
- **TanStack Router guard API**: implement guard via `beforeLoad` and `throw redirect(...)` (avoid deprecated lifecycle `navigate`).

## References

- PDR: Story 6.1 “设置应用锁” (`PDR.md#L353`)
- Current TODO entry: Settings “应用锁” (`src/pages/settings/index.tsx#L85`)
- mpay reference:
  - `../legacy-apps/apps/mpay/src/app/app.component.ts` (resume-timeout lock trigger)
  - `../legacy-apps/apps/mpay/src/guards/wallet-sign-in.guard.ts` (route guard gates)
  - `../legacy-apps/apps/mpay/src/pages/wallet-sign-in/wallet-sign-in.component.ts`
  - `../legacy-apps/apps/mpay/src/pages/mime/pages/application-lock/application-lock.component.ts`
