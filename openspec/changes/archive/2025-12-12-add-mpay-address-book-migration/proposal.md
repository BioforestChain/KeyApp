# Change: Add mpay Address Book Migration

## Why
Existing mpay users have address book contacts stored in IndexedDB (`chainAddressBook-idb`). During the mpay to KeyApp upgrade, these contacts must be migrated to preserve user data and avoid re-entry friction.

## What Changes
- Extend mpay-reader.ts to detect and read `chainAddressBook-idb` IndexedDB store
- Add address book transformer to convert mpay `$ADDRESS_BOOK_V2` format to KeyApp `Contact` format
- Integrate address book migration into the existing migration flow
- Add batch import capability to address-book store for efficient migration
- Add unit tests for address book data extraction and transformation
- Add E2E test verifying contacts are preserved after upgrade

## Impact
- Affected specs: `migration` capability (MODIFIED)
- Affected code:
  - `src/services/migration/mpay-reader.ts` - add chainAddressBook-idb reader
  - `src/services/migration/mpay-transformer.ts` - add address book transformer
  - `src/services/migration/migration-service.ts` - integrate address book step
  - `src/services/migration/types.ts` - add address book types
  - `src/stores/address-book.ts` - add batch import action
- User experience: Migration wizard now includes address book contacts in migration summary

## Data Mapping

| mpay ($ADDRESS_BOOK_V2) | KeyApp (Contact) | Notes |
|-------------------------|------------------|-------|
| addressBookId | id | Direct mapping |
| name | name | Direct mapping |
| address | address | Direct mapping |
| chainList | chain | Omit - set to undefined |
| remarks | memo | Direct mapping |
| iconName | - | Drop (not used) |
| symbol | - | Drop (not used) |
| - | createdAt | Set to Date.now() |
| - | updatedAt | Set to Date.now() |
