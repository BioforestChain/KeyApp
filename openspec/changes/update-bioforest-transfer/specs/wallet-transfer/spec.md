## ADDED Requirements

### Requirement: Bioforest Native Transfer
The system SHALL allow users to submit a native Bioforest transfer using BioforestTransactionService.

#### Scenario: Submit transfer successfully
- **WHEN** a user enters a valid recipient address and amount for a Bioforest chain
- **AND** confirms with the correct password
- **THEN** the system signs and broadcasts the transfer and returns a transaction hash

### Requirement: Transfer Balance & Fee Validation
The system SHALL fetch the current native balance and network fee and block submission when funds are insufficient.

#### Scenario: Insufficient balance
- **WHEN** the requested amount plus estimated fee exceeds the available balance
- **THEN** the system prevents submission and displays an insufficient balance error

### Requirement: Secure Password Confirmation
The system SHALL require password confirmation to decrypt the wallet secret before signing a transfer.

#### Scenario: Incorrect password
- **WHEN** the user provides an incorrect password
- **THEN** the system shows a password error and does not sign the transaction
