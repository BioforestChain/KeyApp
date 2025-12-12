# Spec: Migration

## ADDED Requirements

### Requirement: mpay Data Detection
The system SHALL automatically detect existing mpay wallet data on first launch.

#### Scenario: mpay data exists
- **WHEN** KeyApp launches for the first time
- **AND** IndexedDB `walletv2-idb` contains wallet entries
- **THEN** the system SHALL display a migration prompt

#### Scenario: No mpay data
- **WHEN** KeyApp launches for the first time
- **AND** IndexedDB `walletv2-idb` does not exist or is empty
- **THEN** the system SHALL proceed to normal onboarding

#### Scenario: Migration previously completed
- **WHEN** KeyApp launches
- **AND** `migration_status` is `completed` or `skipped`
- **THEN** the system SHALL NOT display the migration prompt

### Requirement: Migration Password Verification
The system SHALL verify the user's mpay password before migration.

#### Scenario: Correct password
- **WHEN** user enters their mpay password
- **AND** the password successfully decrypts at least one wallet
- **THEN** the system SHALL proceed with migration

#### Scenario: Incorrect password
- **WHEN** user enters an incorrect password
- **AND** decryption fails
- **THEN** the system SHALL display an error and allow retry

#### Scenario: Password retry limit
- **WHEN** user fails password verification 3 times
- **THEN** the system SHALL offer to skip migration or retry later

### Requirement: Data Migration Execution
The system SHALL transform and import mpay data to KeyApp format.

#### Scenario: Successful migration
- **WHEN** password is verified
- **AND** all wallets and addresses are transformed
- **THEN** the system SHALL atomically import all data to KeyApp stores
- **AND** set `migration_status` to `completed`

#### Scenario: Migration failure
- **WHEN** any step of migration fails
- **THEN** the system SHALL rollback all changes
- **AND** display an error with retry option

#### Scenario: Interrupted migration
- **WHEN** app closes during migration
- **AND** `migration_status` is `in_progress`
- **THEN** on next launch, the system SHALL offer to resume or restart

### Requirement: Migration Progress Feedback
The system SHALL display progress during migration.

#### Scenario: Progress indication
- **WHEN** migration is in progress
- **THEN** the system SHALL display current step and percentage
- **AND** show which wallet is being processed

#### Scenario: Completion feedback
- **WHEN** migration completes successfully
- **THEN** the system SHALL display success message with wallet count
- **AND** offer to proceed to home screen

### Requirement: Skip Migration Option
The system SHALL allow users to skip migration.

#### Scenario: User skips migration
- **WHEN** user chooses to skip migration
- **THEN** the system SHALL set `migration_status` to `skipped`
- **AND** proceed to normal onboarding
- **AND** offer manual import as alternative
