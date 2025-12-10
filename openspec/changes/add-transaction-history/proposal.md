# Proposal: Transaction History (T009)

## Summary

Implement transaction history page that displays past transactions for each wallet, with filtering by chain and time period.

## Motivation

Users need to view their transaction history after completing transfers. This completes the transfer→history loop started in Phase 3.

## Scope

### In Scope

- Transaction history page (`/history`)
- Transaction detail page (`/transaction/:txId`)
- Filter by chain (all chains or specific chain)
- Filter by time period (7d, 30d, 90d, all)
- Pull-to-refresh functionality
- Integration with existing TransactionItem/TransactionList components

### Out of Scope

- Real blockchain API integration (mock data for now)
- Transaction search by hash/address
- Export to CSV/PDF

## Design

### Pages

1. **TransactionHistoryPage** (`src/pages/history/index.tsx`)
   - Uses existing `TransactionList` component
   - Filter bar for chain and time period
   - Pull-to-refresh
   - Empty state when no transactions

2. **TransactionDetailPage** (`src/pages/history/[txId].tsx`)
   - Full transaction details
   - Status timeline
   - Copy transaction hash
   - View on explorer link

### Data Flow

```
TransactionHistoryPage
  └── useTransactionHistory(walletId, filters)
        └── Mock data / future: blockchain API
              └── TransactionList
                    └── TransactionItem (existing)
```

### Routes

- `/history` - Transaction history list
- `/transaction/:txId` - Transaction details

## Acceptance Criteria

- [ ] Transaction history page renders with mock data
- [ ] Filter by chain works correctly
- [ ] Filter by time period works correctly
- [ ] Transaction detail page shows all info
- [ ] Pull-to-refresh updates list
- [ ] Empty state displays when no transactions
- [ ] All tests pass (~20 new tests expected)
- [ ] Storybook stories for all new components

## Dependencies

- Existing: TransactionItem, TransactionList, TransactionStatus components
- New: useTransactionHistory hook with mock data
