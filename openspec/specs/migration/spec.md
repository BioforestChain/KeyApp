# migration Specification

## Purpose
TBD - created by archiving change add-mpay-address-book-migration. Update Purpose after archive.
## Requirements
### Requirement: mpay Data Detection
The system SHALL automatically detect existing mpay wallet data and address book contacts on first launch.

#### Scenario: mpay data exists with address book
- **WHEN** KeyApp launches for the first time
- **AND** IndexedDB `walletv2-idb` contains wallet entries
- **AND** IndexedDB `chainAddressBook-idb` contains contact entries
- **THEN** the system SHALL display a migration prompt showing wallet and contact counts

#### Scenario: mpay data exists without address book
- **WHEN** KeyApp launches for the first time
- **AND** IndexedDB `walletv2-idb` contains wallet entries
- **AND** IndexedDB `chainAddressBook-idb` does not exist or is empty
- **THEN** the system SHALL display a migration prompt showing wallet count only

#### Scenario: No mpay data
- **WHEN** KeyApp launches for the first time
- **AND** IndexedDB `walletv2-idb` does not exist or is empty
- **THEN** the system SHALL proceed to normal onboarding

#### Scenario: Migration previously completed
- **WHEN** KeyApp launches
- **AND** `migration_status` is `completed` or `skipped`
- **THEN** the system SHALL NOT display the migration prompt

### Requirement: Address Book Migration
The system SHALL migrate mpay address book contacts to KeyApp format.

#### Scenario: Successful address book migration
- **WHEN** migration is executed
- **AND** `chainAddressBook-idb` contains contact entries
- **THEN** the system SHALL transform each entry to KeyApp Contact format
- **AND** import contacts to address book store
- **AND** preserve name, address, and remarks (as memo)

#### Scenario: Empty address book
- **WHEN** migration is executed
- **AND** `chainAddressBook-idb` is empty or does not exist
- **THEN** the system SHALL skip address book migration step
- **AND** continue with remaining migration steps

#### Scenario: Duplicate contact handling
- **WHEN** a migrated contact has the same address as an existing KeyApp contact
- **THEN** the system SHALL skip the duplicate
- **AND** keep the existing KeyApp contact unchanged

### Requirement: Address Book Migration Progress
The system SHALL display progress during address book migration.

#### Scenario: Contact import progress
- **WHEN** address book migration is in progress
- **THEN** the system SHALL display current step as "Importing contacts"
- **AND** show the number of contacts being processed

#### Scenario: Address book completion feedback
- **WHEN** migration completes successfully
- **AND** contacts were migrated
- **THEN** the system SHALL display success message including contact count

