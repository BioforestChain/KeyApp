# Change: Add send flow

## Why

- PDR Epic 3 requires transfer functionality
- User journey: View Assets → **Send** → Confirm → Success
- Send flow is core wallet functionality

## What Changes

- Add `AddressInput` component: Address validation with QR scan button
- Add `AmountInput` component: Amount input with max button and fiat preview
- Add `SendConfirmSheet` component: Transaction confirmation UI
- Add `SendResultPage` component: Success/failure states
- Add `useSend` hook: Send flow state management
- Add `/send` route: Full send flow wizard
- Mock transaction submission (real API deferred)

## Impact

- **New spec**: `transfer` (send flow requirements)
- **Reuse**: ChainAddressSelector, TokenIcon, FeeDisplay from T001
- **Dependencies**: Existing wallet/asset state

## Scope Notes

MVP scope - defer to later changes:
- Real transaction submission (needs chain service integration)
- Fee estimation API
- Receive flow (T007)
