## 1. Core Components

- [x] 1.1 `AddressInput`: Address text input with validation and QR scan button (exists from T001)
- [x] 1.2 `AmountInput`: Amount input with max button, balance display, fiat preview (exists from T001)
- [x] 1.3 `SendConfirmSheet`: Transaction confirmation with recipient, amount, fee (TransferConfirmSheet from T001)
- [x] 1.4 `SendResultPage`: Success/failure states with transaction details (20 tests, 6 stories)

## 2. Hooks and State

- [x] 2.1 `useSend` hook: Send flow state (address, amount, validation, submission) (20 tests)
- [x] 2.2 Address validation logic (format check per chain type)
- [x] 2.3 Mock transaction submission (returns success/failure)

## 3. Integration

- [x] 3.1 Send page (`/send`): Full wizard flow
- [x] 3.2 Route wiring with TanStack Router (already configured)
- [ ] 3.3 Navigation from home/asset pages to send

## 4. Validation

- [x] 4.1 Vitest tests for AddressInput, AmountInput, SendConfirmSheet (T001)
- [x] 4.2 Vitest tests for useSend hook (20 tests)
- [x] 4.3 Storybook stories for send components (SendResult: 6 stories)
- [x] 4.4 `openspec validate add-send-flow --strict` (PASS)
