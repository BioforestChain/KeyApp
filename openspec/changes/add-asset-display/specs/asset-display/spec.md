# Asset Display Spec

## ADDED Requirements

### Requirement: Asset List Display

The home page SHALL display a list of assets for the active wallet. Each asset item MUST show token icon, name, and balance.

#### Scenario: User views asset list

**Given** user has an active wallet with tokens
**When** user navigates to home page
**Then** system displays list of assets with icon, name, and balance
**And** list is scrollable for many tokens

#### Scenario: Empty wallet

**Given** user has wallet with no tokens
**When** user navigates to home page
**Then** system shows empty state message
**And** suggests how to receive tokens

### Requirement: Asset Amount Precision

Asset amounts SHALL be stored and displayed as strings to preserve decimal precision. The system MUST use decimals field for proper formatting.

#### Scenario: Display token with decimals

**Given** asset with amount "1000000" and decimals 6
**When** system formats for display
**Then** shows "1.000000" or formatted equivalent

### Requirement: Home Page Structure

The home page SHALL include wallet selector and asset list. System MUST show active wallet address and total balance summary.

#### Scenario: Home page layout

**Given** user has wallets
**When** user opens home page
**Then** displays WalletSelector at top
**And** displays AssetList below
**And** can switch between wallets
