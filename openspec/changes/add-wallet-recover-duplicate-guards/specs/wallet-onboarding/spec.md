# Wallet Onboarding Spec Delta: Recovery Flow

## ADDED Requirements

### Requirement: Mnemonic Input and Validation
The recover wallet form SHALL accept BIP39 mnemonic phrases with real-time validation. The form MUST support 12/15/18/21/24/36 word mnemonics.

#### Scenario: User enters valid 12-word mnemonic
**Given** user is on recover wallet page
**When** user enters 12 valid BIP39 words
**Then** form shows validation success indicator
**And** "Next" button becomes enabled

#### Scenario: User enters invalid mnemonic
**Given** user is on recover wallet page
**When** user enters non-BIP39 words
**Then** form shows "Invalid mnemonic" error
**And** "Next" button remains disabled

### Requirement: Three-Level Duplicate Detection
Wallet recovery MUST implement three-level duplicate detection to prevent address collisions. The system SHALL check in order: direct address match, multi-chain generation, and private key collision.

#### Scenario: Level 1 - Direct address match
**Given** user has existing wallet with BFM address "abc123"
**When** user attempts to recover mnemonic that generates same address
**Then** system shows "This address already exists" error
**And** recovery is blocked

#### Scenario: Level 2 - Multi-chain address match
**Given** user has existing wallet
**When** user attempts to recover mnemonic that generates matching address on any chain
**Then** system detects collision across Bitcoin (44/49/84/86 purposes), Ethereum, Tron
**And** shows appropriate error

#### Scenario: Level 3 - Private key collision
**Given** user has wallet imported via private key
**When** user recovers mnemonic that derives same private key
**Then** system shows CollisionConfirmDialog
**And** offers to replace old wallet with mnemonic-based wallet

### Requirement: Multi-Chain Address Generation
Recovery SHALL generate addresses for all supported chains using appropriate derivation paths. Bitcoin MUST use purposes 44, 49, 84, 86.

#### Scenario: Bitcoin address generation
**Given** valid mnemonic
**When** system generates Bitcoin addresses
**Then** generates addresses for purposes 44, 49, 84, 86
**And** each purpose yields valid address format

#### Scenario: Other chain address generation
**Given** valid mnemonic
**When** system generates Ethereum/Tron/BioForest addresses
**Then** uses purpose 44 only
**And** each chain yields valid address format

### Requirement: Recovery Flow Completion
Successful recovery MUST create wallet with skipBackup=true. The system SHALL auto-generate wallet names following "Wallet N" pattern.

#### Scenario: Complete recovery flow
**Given** user has entered valid mnemonic that passes duplicate checks
**When** user sets password and confirms
**Then** wallet is created with skipBackup=true
**And** user is redirected to success page
**And** wallet name is auto-generated ("Wallet N")
