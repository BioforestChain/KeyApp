# Tasks: Wallet Management

## T010: Wallet Management

### Status: in_progress (T010.1-3 done, T010.4 pending)

### Tasks

#### T010.1: WalletListPage
- [x] Create `src/pages/wallet/list.tsx`
- [x] Display all wallets with balance preview
- [x] Implement wallet switching
- [x] Add route `/wallet/list`
- [x] Write tests (~8 tests)
- [x] Write Storybook story

**Acceptance**: Can view and switch between wallets ✅

---

#### T010.2: WalletEditSheet
- [x] Create `src/components/wallet/wallet-edit-sheet.tsx`
- [x] Implement rename functionality
- [x] Implement delete with password confirmation
- [x] Write tests (~8 tests)
- [x] Write Storybook story

**Acceptance**: Can rename and delete wallets ✅

---

#### T010.3: AddressBookStore
- [x] Create `src/stores/address-book.ts`
- [x] Define Contact type
- [x] Implement CRUD operations
- [x] Persist to localStorage
- [x] Write tests (~6 tests)

**Acceptance**: Address book data persists correctly ✅

---

#### T010.4: AddressBookPage
- [x] Create `src/pages/address-book/index.tsx`
- [x] List contacts with search
- [x] Add/edit/delete contacts via sheet
- [x] Add route `/address-book`
- [x] Write tests (~8 tests)
- [x] Write Storybook story

**Acceptance**: Can manage address book ✅

---

## Dependencies

- walletStore (exists)
- PasswordConfirmSheet (exists)

## Estimated Test Count

| Task | Tests |
|------|-------|
| T010.1 WalletListPage | ~8 |
| T010.2 WalletEditSheet | ~8 |
| T010.3 AddressBookStore | ~6 |
| T010.4 AddressBookPage | ~8 |
| **Total** | **~30** |
