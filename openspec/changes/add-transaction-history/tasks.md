# Tasks: Transaction History

## T009: Transaction History

### Status: in_progress

### Tasks

#### T009.1: useTransactionHistory Hook
- [ ] Create `src/hooks/use-transaction-history.ts`
- [ ] Define Transaction type with full details
- [ ] Implement mock data generator
- [ ] Add filter logic (chain, time period)
- [ ] Write tests (~8 tests)

**Acceptance**: Hook returns filtered mock transactions

---

#### T009.2: TransactionHistoryPage
- [ ] Create `src/pages/history/index.tsx`
- [ ] Integrate useTransactionHistory hook
- [ ] Add filter bar (chain selector, time period)
- [ ] Use existing TransactionList component
- [ ] Add pull-to-refresh
- [ ] Handle empty state
- [ ] Add route `/history`
- [ ] Write tests (~10 tests)
- [ ] Write Storybook story

**Acceptance**: Page displays filtered transaction list with all interactions

---

#### T009.3: TransactionDetailPage
- [ ] Create `src/pages/history/[txId].tsx`
- [ ] Display full transaction details
- [ ] Show status timeline
- [ ] Copy transaction hash button
- [ ] View on explorer link (mock)
- [ ] Add route `/transaction/:txId`
- [ ] Write tests (~8 tests)
- [ ] Write Storybook story

**Acceptance**: Detail page shows complete transaction information

---

## Dependencies

- TransactionItem (exists)
- TransactionList (exists)
- TransactionStatus (exists)
- FeeDisplay (exists)

## Estimated Test Count

| Task | Tests |
|------|-------|
| T009.1 useTransactionHistory | ~8 |
| T009.2 TransactionHistoryPage | ~10 |
| T009.3 TransactionDetailPage | ~8 |
| **Total** | **~26** |
