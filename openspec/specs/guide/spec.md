# guide Specification

## Purpose
TBD - created by archiving change add-guide-onboarding. Update Purpose after archive.
## Requirements
### Requirement: Welcome Screen
The system SHALL display a welcome screen to first-time users introducing the app's core features and value proposition.

#### Scenario: First visit shows welcome
- **WHEN** user opens app for the first time (no wallet, no welcome dismissed flag)
- **THEN** display WelcomeScreen with app introduction
- **AND** show "Get Started" and "I have a wallet" options

#### Scenario: Welcome can be dismissed
- **WHEN** user clicks "Get Started" or "I have a wallet"
- **THEN** dismiss welcome screen
- **AND** persist dismissal to localStorage
- **AND** never show welcome screen again

### Requirement: Wallet Creation Guide
The system SHALL provide step-by-step guidance during wallet creation to help users understand each step and the importance of backup.

#### Scenario: Guide overlay during creation
- **WHEN** user starts wallet creation with guide enabled
- **THEN** show tooltip overlay explaining current step
- **AND** allow user to proceed or skip guide

#### Scenario: Mnemonic backup emphasis
- **WHEN** user reaches backup mnemonic step
- **THEN** display prominent warning about backup importance
- **AND** require explicit acknowledgment before proceeding

#### Scenario: Skip guide option
- **WHEN** user clicks "Skip guide" at any point
- **THEN** disable guide for this session
- **AND** persist preference to localStorage

### Requirement: Feature Discovery
The system SHALL highlight key features through spotlights and tooltips to help users discover functionality.

#### Scenario: Spotlight on first home visit
- **WHEN** user visits home page after wallet creation for the first time
- **THEN** show spotlight on send/receive/scanner buttons sequentially
- **AND** mark each feature as discovered when spotlight dismissed

#### Scenario: First action celebration
- **WHEN** user completes their first send or receive action
- **THEN** display celebration animation (confetti/pulse)
- **AND** show encouraging message

### Requirement: Guide Progress Tracking
The system SHALL track which guides and features the user has seen or completed.

#### Scenario: Persist guide state
- **WHEN** user dismisses a guide or spotlight
- **THEN** persist completion state to localStorage
- **AND** do not show that guide/spotlight again

#### Scenario: Reset guide progress
- **WHEN** user clears app data or explicitly resets guides in settings
- **THEN** clear all guide progress
- **AND** show guides again on next relevant interaction

