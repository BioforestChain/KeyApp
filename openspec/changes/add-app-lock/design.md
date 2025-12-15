## Context

KeyApp currently uses per-action password confirmation, but PDR Story 6.1 requires an “App Lock” that blocks access on the next app open. This change defines a password-only MVP App Lock with a router guard and a dedicated lock route.

## Goals / Non-Goals

### Goals

- Enforce a password lock on cold start when enabled.
- Verify passwords by decrypting existing encrypted wallet secrets (no raw password storage).
- Avoid lockout scenarios when the current wallet changes.
- Keep the first implementation small, testable, and reversible.

### Non-Goals (MVP)

- Biometric flows (fingerprint unlock/payment).
- Resume-timeout semantics parity with mpay (e.g. “lock after background for N minutes”).
- Password reset/tips UX.

## Decisions

### Decision: Route guard runs in `beforeLoad` and redirects using `throw redirect(...)`

- Implement enforcement as a TanStack Router `beforeLoad` guard.
- On “locked” navigation, `throw redirect({ to: '/lock', search: { to: location.href } })`.
- The lock route itself and onboarding routes are allowlisted.

Rationale:

- `beforeLoad` runs before route rendering, so it can prevent protected content flashing.
- Router APIs mark `navigate` as deprecated inside lifecycle contexts; `throw redirect(...)` is the supported approach.

### Decision: Guard MUST not rely on `AppLayout` effects for wallet initialization

Problem:

- Current wallet initialization runs in `AppLayout` via `useEffect`, but route `beforeLoad` can run before React effects.
- If the guard reads store state too early (e.g. `wallets: []`), it may incorrectly skip lock enforcement on cold start.

Chosen approach:

- Ensure the guard has access to persisted wallet state before deciding to enforce/skip the lock.
- Prefer one of:
  - Add an idempotent “initialize-once” path and `await` it from the guard when needed, or
  - Read the persisted wallet payload synchronously from `localStorage` for the guard decision.

Acceptance:

- With `passwordLockEnabled=true` and a decryptable encrypted secret present, cold start SHALL redirect to `/lock` before any protected content is shown.
- With no wallet (or no wallet has an encrypted secret), cold start SHALL NOT redirect to `/lock`.

### Decision: Password verification strategy

- Enable/disable toggle verification uses the **current wallet** encrypted secret.
- Unlock accepts a password that can decrypt **any wallet** encrypted secret.
- Implementation MAY prefer `verifyPassword(encrypted, password)` when plaintext is not needed.

### Decision: Treat `/authorize/**` as protected when locked

The system SHALL treat `/authorize/**` (DWEB/Plaoc) routes as protected when password lock is enabled and the session is not unlocked.

Rationale:

- These routes typically surface signature/authorization actions and should not be reachable without first verifying the user.
- Compatibility is preserved by redirecting to `/lock?to=<authorize-url>` and returning to the original `/authorize/**` route after unlock.

## Risks / Trade-offs

- Multi-wallet passwords: enabling is scoped to current wallet; unlocking can accept any wallet password.
- Storage format evolution: wallet storage is currently localStorage-backed; future storage migrations should keep App Lock guard decisions stable.

## Open Questions

None (for MVP).
