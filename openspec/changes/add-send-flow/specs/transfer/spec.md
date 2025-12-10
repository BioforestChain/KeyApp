# Transfer Spec: Send Flow

## ADDED Requirements

### Requirement: Address Input and Validation

The send form SHALL accept recipient address with real-time validation. System MUST validate address format per selected chain type.

#### Scenario: Valid address entered

**Given** user is on send page with ETH selected
**When** user enters valid Ethereum address (0x...)
**Then** address shows validation success indicator
**And** "Next" button becomes enabled

#### Scenario: Invalid address format

**Given** user is on send page
**When** user enters malformed address
**Then** system shows format error
**And** "Next" button remains disabled

### Requirement: Amount Input with Balance Check

The send form SHALL show current balance and validate amount against available balance. MUST include max button to auto-fill maximum amount.

#### Scenario: User enters valid amount

**Given** user has 100 USDT balance
**When** user enters 50 as amount
**Then** shows remaining balance preview
**And** allows proceeding to confirmation

#### Scenario: Amount exceeds balance

**Given** user has 100 USDT balance
**When** user enters 150 as amount
**Then** shows "Insufficient balance" error
**And** "Next" button remains disabled

### Requirement: Send Confirmation Flow

Before submission, system SHALL show confirmation sheet with recipient, amount, and fee. User MUST confirm before transaction proceeds.

#### Scenario: User confirms send

**Given** user has entered valid address and amount
**When** user taps "Send" on confirmation sheet
**Then** transaction is submitted
**And** user sees success/failure result page
