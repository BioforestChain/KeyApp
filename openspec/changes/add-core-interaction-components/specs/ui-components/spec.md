## ADDED Requirements

### Requirement: Wallet Selector Component
The system SHALL provide a WalletSelector component that displays a list of available wallets and allows users to switch between them.

#### Scenario: Display wallet list
- **WHEN** the WalletSelector is opened
- **THEN** it displays all available wallets with name, total balance, and abbreviated address

#### Scenario: Select wallet
- **WHEN** user taps on a wallet item
- **THEN** onSelect callback is triggered with the selected wallet
- **AND** the selector closes

### Requirement: Chain Address Selector Component
The system SHALL provide a ChainAddressSelector component with a two-column layout for selecting blockchain and address.

#### Scenario: Display chain list
- **WHEN** the selector is opened
- **THEN** left column shows all supported chains with icons

#### Scenario: Chain selection updates addresses
- **WHEN** user selects a chain from the left column
- **THEN** right column updates to show addresses for that chain

#### Scenario: Address selection
- **WHEN** user selects an address from the right column
- **THEN** onSelect callback is triggered with chain and address info

### Requirement: Transfer Confirm Sheet Component
The system SHALL provide a TransferConfirmSheet component that displays transfer details for user confirmation before executing.

#### Scenario: Display transfer details
- **WHEN** the sheet is opened
- **THEN** it displays amount, recipient address, and fee

#### Scenario: Confirm transfer
- **WHEN** user taps confirm button
- **THEN** onConfirm callback is triggered

#### Scenario: Cancel transfer
- **WHEN** user taps cancel or backdrop
- **THEN** sheet closes without triggering onConfirm

### Requirement: Password Confirm Sheet Component
The system SHALL provide a PasswordConfirmSheet component for secure password verification before sensitive operations.

#### Scenario: Password verification
- **WHEN** user enters password and submits
- **THEN** onVerify callback is triggered with the password

#### Scenario: Biometric option
- **WHEN** biometric is enabled and available
- **THEN** biometric button is displayed as alternative

#### Scenario: Error display
- **WHEN** password verification fails
- **THEN** error message is displayed to user

### Requirement: Mnemonic Confirm Component
The system SHALL provide a MnemonicConfirm component that verifies user has correctly backed up their mnemonic phrase.

#### Scenario: Display shuffled words
- **WHEN** component is rendered
- **THEN** mnemonic words are displayed in random order

#### Scenario: Word selection
- **WHEN** user taps a word
- **THEN** word is added to selection in order
- **AND** word becomes disabled in the pool

#### Scenario: Correct completion
- **WHEN** all words are selected in correct order
- **THEN** onComplete callback is triggered with success

#### Scenario: Incorrect selection
- **WHEN** selected order does not match original
- **THEN** error is shown and selection can be reset

### Requirement: Transaction Status Component
The system SHALL provide a TransactionStatus component that displays transaction state with appropriate visual styling.

#### Scenario: Success status
- **WHEN** status is "success"
- **THEN** green checkmark icon and success text are displayed

#### Scenario: Failed status
- **WHEN** status is "failed"
- **THEN** red X icon and failure text are displayed

#### Scenario: Pending status
- **WHEN** status is "pending"
- **THEN** yellow clock icon and pending text are displayed

### Requirement: Fee Display Component
The system SHALL provide a FeeDisplay component that shows transaction fees in both native token and fiat equivalent.

#### Scenario: Display fee
- **WHEN** fee data is provided
- **THEN** native amount with symbol is displayed

#### Scenario: Loading state
- **WHEN** fee is being calculated
- **THEN** loading skeleton is displayed

#### Scenario: High fee warning
- **WHEN** fee exceeds threshold
- **THEN** warning indicator is shown

### Requirement: Token Icon Component
The system SHALL provide a TokenIcon component that displays token logos with graceful fallback.

#### Scenario: Display token image
- **WHEN** valid image URL is provided
- **THEN** token logo is displayed

#### Scenario: Image load failure
- **WHEN** image fails to load
- **THEN** fallback showing first letter of symbol is displayed

#### Scenario: Size variants
- **WHEN** size prop is specified
- **THEN** icon renders at the specified size
