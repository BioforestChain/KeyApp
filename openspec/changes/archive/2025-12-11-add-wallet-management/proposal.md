# Proposal: Wallet Management (T010)

## Summary

Enhance wallet management capabilities including multi-wallet support, wallet switching, renaming, deletion, and address book functionality.

## Motivation

Users need to manage multiple wallets and maintain an address book for frequent recipients. This completes the core wallet management features per PDR Epic 10.2.

## Scope

### In Scope

- Wallet list page with all wallets
- Wallet switching (set active wallet)
- Wallet rename functionality
- Wallet delete with confirmation
- Address book CRUD operations
- Contact selection in send flow

### Out of Scope

- Wallet backup to cloud
- Wallet import from other apps
- Multi-signature wallets

## Design

### Pages/Components

1. **WalletListPage** (`src/pages/wallet/list.tsx`)
   - List all wallets with balance preview
   - Set active wallet
   - Navigate to wallet detail

2. **WalletEditSheet** (`src/components/wallet/wallet-edit-sheet.tsx`)
   - Rename wallet
   - Delete wallet (with password confirmation)

3. **AddressBookPage** (`src/pages/address-book/index.tsx`)
   - List saved contacts
   - Add/edit/delete contacts

4. **ContactEditSheet** (`src/components/address-book/contact-edit-sheet.tsx`)
   - Add new contact
   - Edit contact name/address

### Data Flow

```
WalletListPage
  └── walletStore (existing)
        └── setCurrentWallet
        └── deleteWallet
        └── updateWalletName

AddressBookPage
  └── addressBookStore (new)
        └── contacts[]
        └── addContact
        └── updateContact
        └── deleteContact
```

### Routes

- `/wallet/list` - All wallets
- `/address-book` - Address book

## Acceptance Criteria

- [ ] Can view all wallets in a list
- [ ] Can switch active wallet
- [ ] Can rename wallet
- [ ] Can delete wallet (with confirmation)
- [ ] Can add/edit/delete contacts
- [ ] Can select contact in send flow
- [ ] All tests pass (~25 new tests expected)
- [ ] Storybook stories for all new components

## Dependencies

- Existing: walletStore, PasswordConfirmSheet
- New: addressBookStore
