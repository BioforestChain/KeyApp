# Migration Service

> **Code Source**: [`src/services/migration/migration-service.ts`](../../../src/services/migration/migration-service.ts)

## Overview

The `MigrationService` handles the critical task of importing data from the legacy "mpay" application. It orchestrates a multi-step process ensuring data integrity and security.

## Migration Flow

The process is defined as a state machine:

1.  **`idle`**
2.  **`detect`**: Scans `localStorage` for legacy mpay data structures.
3.  **`verify`**: Validates the user's password against the legacy wallet encryption.
4.  **`transform`**: Converts legacy data formats to the new KeyApp schema (`WalletInfo`, `ChainAddressInfo`).
5.  **`import`**: Writes the transformed data to `WalletStorageService` (IndexedDB).
6.  **`complete`**

## Key Features

- **Progress Tracking**: Reports granular progress updates to the UI.
- **Resumability**: Stores migration status in `localStorage` (`keyapp_migration_status`).
- **Security**: Decrypts legacy data in memory and immediately re-encrypts it using the new wallet lock system.

## Data Mapping

| Legacy (mpay) | New (KeyApp) |
| :--- | :--- |
| `Wallet` (localStorage) | `WalletInfo` (IndexedDB) |
| `AddressBook` | `Contact` (Store) |
| `importPhrase` | `encryptedMnemonic` |
