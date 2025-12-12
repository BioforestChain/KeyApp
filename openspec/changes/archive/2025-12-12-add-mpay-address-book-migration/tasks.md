# Tasks: Add mpay Address Book Migration

## 1. Data Layer
- [x] 1.1 Add `MpayAddressBookEntry` type to `types.ts` matching mpay `$ADDRESS_BOOK_V2` schema
- [x] 1.2 Add `MPAY_ADDRESS_BOOK_IDB` constant and `readMpayAddressBook()` function to `mpay-reader.ts`
- [x] 1.3 Update `detectMpayData()` to include address book count in `MpayDetectionResult`
- [x] 1.4 Write unit tests for address book IndexedDB reading

## 2. Transformation
- [x] 2.1 Add `transformAddressBookEntry()` function to `mpay-transformer.ts`
- [x] 2.2 Implement data mapping: addressBookId->id, name->name, address->address, remarks->memo, timestamps->Date.now()
- [x] 2.3 Write unit tests for address book transformation

## 3. Store Integration
- [x] 3.1 Add `importContacts(contacts: Contact[])` batch action to `address-book.ts` store
- [x] 3.2 Ensure batch import deduplicates by address (skip existing)
- [x] 3.3 Write unit tests for batch import action

## 4. Migration Service
- [x] 4.1 Update `MigrationProgress` type to include `'importing_contacts'` step
- [x] 4.2 Integrate address book migration into `migrate()` function in `migration-service.ts`
- [x] 4.3 Update progress percentage calculation to account for contacts step
- [x] 4.4 Write integration tests for full migration flow with address book

## 5. UI Updates
- [x] 5.1 Update migration detection display to show contact count
- [x] 5.2 Update migration progress to show contacts being imported
- [x] 5.3 Update migration success message to include contact count

## 6. E2E Testing
- [x] 6.1 Add mock `chainAddressBook-idb` data to E2E test fixtures
- [x] 6.2 Write E2E test: migration preserves address book contacts
- [x] 6.3 Verify migrated contacts appear in KeyApp address book page
