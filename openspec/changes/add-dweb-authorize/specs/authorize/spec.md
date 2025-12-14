## ADDED Requirements

### Requirement: Address Authorization

The system SHALL allow external DWEB applications to request wallet addresses from the user with explicit consent.

#### Scenario: Main wallet address request

- **WHEN** an external app requests addresses with `type: main`
- **THEN** the system SHALL display the requesting app's info (name, logo, URL)
- **AND** the system SHALL show which permissions are being requested
- **AND** the user MUST explicitly tap "Approve" to share addresses
- **AND** only addresses from the currently selected wallet are returned

#### Scenario: Network-specific address request

- **WHEN** an external app requests addresses with `type: network` and a `chainName`
- **THEN** the system SHALL display all wallets with addresses on that chain
- **AND** the user MUST select which wallet addresses to share
- **AND** only addresses matching the requested chain are returned

#### Scenario: All addresses request

- **WHEN** an external app requests addresses with `type: all`
- **THEN** the system SHALL display a warning about sharing all addresses
- **AND** the user MUST explicitly confirm the broader access
- **AND** addresses from all wallets across all chains are returned

#### Scenario: Address request with message signing

- **WHEN** the address request includes a `signMessage` field
- **THEN** the system SHALL display the message to be signed
- **AND** master password verification is required
- **AND** each returned address includes a signature of the message

#### Scenario: Address request rejection

- **WHEN** the user taps "Reject" on an address authorization
- **THEN** the system SHALL return an empty response to the requesting app
- **AND** no addresses or keys are exposed
- **AND** the IPC event is cleaned up

---

### Requirement: Signature Authorization

The system SHALL allow external DWEB applications to request transaction signing from the user with explicit consent and password verification.

#### Scenario: Message signing request

- **WHEN** an external app requests a signature with `type: message`
- **THEN** the system SHALL display the message content
- **AND** the system SHALL display the requesting app's info
- **AND** master password verification is required
- **AND** the signed message is returned to the app

#### Scenario: Transfer signing request

- **WHEN** an external app requests a signature with `type: transfer`
- **THEN** the system SHALL display transfer details (from, to, amount, fee)
- **AND** the system SHALL validate sufficient balance
- **AND** the system SHALL warn if balance is insufficient
- **AND** master password verification is required
- **AND** the signed transaction is returned to the app

#### Scenario: Destroy signing request

- **WHEN** an external app requests a signature with `type: destory` (asset destruction)
- **THEN** the system SHALL display a prominent warning about irreversibility
- **AND** the system SHALL display the asset and amount being destroyed
- **AND** master password verification is required
- **AND** the signed destruction transaction is returned to the app

#### Scenario: Signature request with insufficient balance

- **WHEN** a transfer request amount exceeds available balance
- **THEN** the system SHALL display an error message
- **AND** the "Confirm" button SHALL be disabled
- **AND** the user cannot proceed without resolving the balance issue

#### Scenario: Signature request rejection

- **WHEN** the user taps "Reject" on a signature authorization
- **THEN** the system SHALL return an error response to the requesting app
- **AND** no signature is generated
- **AND** the IPC event is cleaned up

#### Scenario: Password verification failure

- **WHEN** the user enters an incorrect master password
- **THEN** the system SHALL display an error message
- **AND** the user MAY retry password entry
- **AND** no signature is generated until correct password is provided

---

### Requirement: Security Boundaries

The system SHALL enforce strict security boundaries during authorization flows to protect user assets.

#### Scenario: Private key protection

- **WHEN** any authorization request is processed
- **THEN** private keys SHALL never be exposed to the requesting app
- **AND** mnemonic phrases SHALL never be exposed
- **AND** only public keys and addresses are shareable

#### Scenario: User consent enforcement

- **WHEN** any authorization request is received
- **THEN** the user MUST see the requesting app's identity
- **AND** the user MUST explicitly approve the request
- **AND** no auto-approval mechanism SHALL exist

#### Scenario: Password requirement for signing

- **WHEN** any signing operation is requested
- **THEN** master password verification is ALWAYS required
- **AND** password is verified locally, never sent to the app
- **AND** failed password attempts are logged for security review

---

### Requirement: App Information Display

The system SHALL display clear information about the requesting application before any authorization.

#### Scenario: Standard app info display

- **WHEN** an authorization page is shown
- **THEN** the requesting app's name SHALL be prominently displayed
- **AND** the requesting app's logo SHALL be shown if available
- **AND** the requesting app's home URL SHALL be visible
- **AND** the specific permissions being requested SHALL be listed

#### Scenario: Unknown app handling

- **WHEN** app information cannot be retrieved
- **THEN** the system SHALL display "Unknown Application"
- **AND** the system SHALL show a warning about unverified apps
- **AND** the user can still choose to proceed at their own risk

---

### Requirement: IPC Communication

The system SHALL handle DWEB IPC communication reliably for authorization flows.

#### Scenario: Successful IPC response

- **WHEN** the user completes an authorization (approve or reject)
- **THEN** the system SHALL call `respondWith(eventId, path, data)`
- **AND** the system SHALL call `removeEventId(eventId)` for cleanup
- **AND** the response SHALL reach the requesting app

#### Scenario: IPC timeout handling

- **WHEN** an authorization request times out (e.g., user abandons flow)
- **THEN** the system SHALL send a timeout error response
- **AND** the IPC event SHALL be cleaned up
- **AND** the authorization page SHALL be dismissed

#### Scenario: Runtime unavailability

- **WHEN** DWEB runtime is not available
- **THEN** `isPlaocAvailable()` SHALL return false
- **AND** authorization routes SHALL redirect to an error page
- **AND** no IPC operations SHALL be attempted

---

### Requirement: Router Integration

The system SHALL provide dedicated routes for authorization flows accessible from external DWEB apps.

#### Scenario: Address authorization route

- **WHEN** navigating to `/authorize/address/:id`
- **THEN** the system SHALL load the address authorization page
- **AND** the `:id` parameter SHALL be the IPC event ID
- **AND** the request details SHALL be retrieved via IPC

#### Scenario: Signature authorization route

- **WHEN** navigating to `/authorize/signature/:id`
- **THEN** the system SHALL load the signature authorization page
- **AND** the `:id` parameter SHALL be the IPC event ID
- **AND** the request details SHALL be retrieved via IPC

#### Scenario: Invalid event ID

- **WHEN** the event ID in the route is invalid or expired
- **THEN** the system SHALL display an error message
- **AND** the user SHALL be able to return to the home screen
