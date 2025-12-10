# Change: Wallet onboarding parity with mpay

## Why
- PDR Epic 1 covers wallet creation/import/backup but current specs only address UI components; onboarding flows are undefined.
- mpay already implements password rules, mnemonic options, biometric opt-in, and duplicate-guarded recovery that we need to port to KeyApp.

## What Changes
- Add a new `wallet-onboarding` capability spec describing creation, recovery, backup verification, and biometric opt-in behaviors.
- Capture duplicate-detection rules from mpay (BFMeta address check + private-key overlap prompt).
- Add tasks for React/TanStack implementation with tests and Storybook flows.

## Impact
- Affected specs: `wallet-onboarding` (new capability).
- Affected code: onboarding routes, wallet storage defaults, biometric gate, backup confirmation flow.
