## ADDED Requirements

### Requirement: Bioforest address encoding (mpay-compatible)

The system SHALL derive Bioforest-chain addresses using `bnid-prefix-char + Base58Check(hash160(publicKey))` so that derived addresses are accepted by mpay `walletapi.bfmeta.info`.

#### Scenario: Derive Bioforest address from a public key

- **GIVEN** a Bioforest public key (Ed25519, 32 bytes)
- **WHEN** the system derives the Bioforest address
- **THEN** it uses `hash160 = ripemd160(sha256(publicKey))`
- **AND** encodes as `prefix + Base58Check(hash160)` (checksum over the 20-byte hash160, excluding the prefix)
- **AND** the resulting address validates Base58Check on `address.slice(1)`

#### Scenario: Validate a known mpay walletapi Bioforest address

- **GIVEN** an address string that starts with `b`
- **WHEN** the system validates the address
- **THEN** Base58Check validates `address.slice(1)`
- **AND** Base58 decode of `address.slice(1)` yields 24 bytes
- **AND** the checksum is valid for the 20-byte payload

### Requirement: bnid/prefix is an environment choice

The system SHALL treat the 1-char `prefix` (KeyApp chain-config) / `bnid` (mpay) as an environment/network choice, not a per-chain algorithm detail.

#### Scenario: Production defaults use bnid b

- **GIVEN** the app targets mpay `walletapi.bfmeta.info` (production)
- **WHEN** the app ships built-in Bioforest chain configs
- **THEN** those defaults use `prefix="b"`

#### Scenario: Test/dev networks are configured via subscription/manual

- **GIVEN** a user wants to connect to a test/dev Bioforest network
- **WHEN** they add/subscribe chain configs
- **THEN** they MAY use `prefix="c"` for those environments
- **AND** this SHOULD NOT be hardcoded into `public/configs/default-chains.json`

### Requirement: Default Bioforest chain config prefix

The system SHALL ship default Bioforest chain configurations using prefix `b` as production walletapi defaults.

#### Scenario: Default chains use prefix b

- **GIVEN** the app loads default chain configs from `public/configs/default-chains.json`
- **WHEN** a Bioforest chain config is present (e.g. `bfmeta`)
- **THEN** its `prefix` is `b`

### Requirement: Default Bioforest symbols align with mpay assetType

The system SHALL align default Bioforest chain `symbol` with mpay `assetType` to minimize mapping drift for walletapi-backed operations.

#### Scenario: Defaults expose walletapi assetType symbols

- **GIVEN** the app loads default chain configs from `public/configs/default-chains.json`
- **WHEN** a Bioforest chain config is present (e.g. `bfmeta`, `ccchain`, `pmchain`)
- **THEN** its `symbol` matches the corresponding mpay `assetType` (e.g. `BFM`, `CCC`, `PMC`)

### Requirement: Legacy address format handling

The system SHOULD recognize legacy Bioforest addresses that lack a Base58Check checksum for display/import, but MUST treat them as incompatible with mpay walletapi-backed operations.

#### Scenario: Legacy addresses remain parseable

- **GIVEN** an address string that does not validate Base58Check on `address.slice(1)`
- **WHEN** the system detects it matches the legacy scheme (`prefix + base58(hash160)`, no checksum)
- **THEN** it MAY accept the legacy format for display/import
- **AND** it MUST NOT claim walletapi compatibility for that address
