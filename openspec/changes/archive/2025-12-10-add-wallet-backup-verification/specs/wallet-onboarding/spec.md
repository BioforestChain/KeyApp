# Wallet Onboarding Spec Delta: Backup Verification

## ADDED Requirements

### Requirement: Backup Verification Flow

Wallet creation flow SHALL include backup verification step after mnemonic display. The system MUST verify user has recorded mnemonic before marking wallet as backed up.

#### Scenario: User completes backup verification

**Given** user has created wallet and viewed mnemonic
**When** user selects correct 4 random words in correct positions
**Then** wallet is marked with skipBackup=false
**And** user proceeds to wallet home

#### Scenario: User makes incorrect selection

**Given** user is on backup verification step
**When** user selects wrong word
**Then** system shows error indicator
**And** user can retry selection

### Requirement: Fisher-Yates Shuffle Verification

The system SHALL use Fisher-Yates shuffle algorithm to randomize word positions for verification. MUST select exactly 4 random positions from the mnemonic.

#### Scenario: Generate verification challenge

**Given** valid mnemonic of N words
**When** system generates verification challenge
**Then** selects 4 random unique positions
**And** shuffles all N words as candidates
**And** user must select correct word for each position

### Requirement: Skip Backup Option

Users MAY skip backup verification with explicit warning. System MUST set skipBackup=true for wallets that skip verification.

#### Scenario: User chooses to skip backup

**Given** user is on backup tips screen
**When** user selects "Skip for now"
**Then** system shows warning about risks
**And** on confirmation, sets skipBackup=true
**And** wallet is created without backup verification
