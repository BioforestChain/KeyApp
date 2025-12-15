## ADDED Requirements

### Requirement: Password Lock Toggle

The system SHALL allow the user to enable or disable “Password Lock”.

#### Scenario: Enable password lock requires verifying current wallet password

- **GIVEN** the user is on Settings → Security → “应用锁”
- **WHEN** the user enables the password lock toggle
- **THEN** the system requires verifying the current wallet password before saving the setting

#### Scenario: Enable password lock fails when there is no decryptable wallet secret

- **GIVEN** the user is on Settings → Security → “应用锁”
- **AND** there is no wallet with a decryptable encrypted secret
- **WHEN** the user enables the password lock toggle
- **THEN** the system SHALL NOT enable password lock
- **AND** shows a user-visible error explaining why

#### Scenario: Disable password lock stops future lock enforcement

- **GIVEN** password lock is enabled
- **WHEN** the user disables password lock
- **THEN** the system SHALL NOT require unlock on the next app open

### Requirement: Lock On Next App Open

When password lock is enabled, the system SHALL require unlocking before accessing protected routes on the next app open.

#### Scenario: Cold start redirects to lock when a wallet exists

- **GIVEN** password lock is enabled
- **AND** the app has at least one wallet with an encrypted secret
- **WHEN** the user opens the app (cold start)
- **THEN** the system redirects to the lock route before showing protected content

#### Scenario: Redirect to lock route when locked

- **GIVEN** password lock is enabled
- **AND** the app is not currently unlocked
- **WHEN** the user navigates to a protected route
- **THEN** the system redirects to the lock route
- **AND** preserves the originally requested route for post-unlock redirect

#### Scenario: No wallet does not trigger lock

- **GIVEN** password lock is enabled
- **AND** there is no wallet in the app
- **WHEN** the user opens the app
- **THEN** the system SHALL NOT redirect to the lock route

#### Scenario: Unlock redirects back to intended destination

- **GIVEN** the user is on the lock route with an intended destination recorded
- **WHEN** the user successfully unlocks
- **THEN** the system marks the session as unlocked
- **AND** navigates to the intended destination

### Requirement: Allowlist For Onboarding

The system SHALL NOT block onboarding routes when no wallet exists or when the user is in onboarding flow.

#### Scenario: Onboarding remains accessible

- **GIVEN** the user is in an onboarding route
- **WHEN** password lock is enabled
- **THEN** the system SHALL NOT redirect to the lock route

### Requirement: Password Verification Without Raw Password Storage

The system SHALL verify a password by decrypting at least one existing encrypted wallet secret and SHALL NOT store the raw password.

#### Scenario: Correct password unlocks

- **GIVEN** the wallet has an encrypted secret
- **WHEN** the user enters the correct password on the lock route
- **THEN** the system successfully decrypts the secret
- **AND** unlock succeeds

#### Scenario: Correct password for any wallet unlocks

- **GIVEN** the app has multiple wallets
- **AND** at least one wallet has an encrypted secret
- **WHEN** the user enters a password that decrypts any wallet’s encrypted secret
- **THEN** unlock succeeds

#### Scenario: Wrong password does not unlock

- **GIVEN** the wallet has an encrypted secret
- **WHEN** the user enters an incorrect password on the lock route
- **THEN** the system fails to decrypt the secret
- **AND** unlock fails with a user-visible error

### Requirement: Cold Start Lock Decision Uses Persisted Wallet State

The system SHALL load persisted wallet state before deciding to enforce or skip App Lock on cold start.

#### Scenario: Avoid cold-start bypass when wallets exist

- **GIVEN** password lock is enabled
- **AND** persisted storage contains at least one wallet with an encrypted secret
- **WHEN** the app cold-starts into a protected route
- **THEN** the system redirects to the lock route before rendering protected content

#### Scenario: Determine “no wallet” only after loading persistence

- **GIVEN** password lock is enabled
- **WHEN** the app cold-starts
- **THEN** the system loads persisted wallet data before deciding there is “no wallet”
- **AND** if no wallet exists after loading, the system SHALL NOT redirect to the lock route
