# Transfer Spec: Receive Flow

## ADDED Requirements

### Requirement: Address Display with QR

The receive page SHALL display wallet address as QR code and text. User MUST be able to copy address to clipboard.

#### Scenario: User views receive address

**Given** user navigates to receive page
**When** page loads
**Then** displays QR code for selected chain address
**And** shows address text below QR
**And** provides copy button

### Requirement: Share Functionality

User SHALL be able to share address via native share sheet.

#### Scenario: User shares address

**Given** user is on receive page
**When** user taps share button
**Then** native share sheet opens with address
