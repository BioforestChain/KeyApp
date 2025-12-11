# Tasks: Notification System

## T011: Notification System

### Status: in progress (T011.1, T011.2 complete; starting T011.3)

### Tasks

#### T011.1: NotificationStore ✅
- [x] Create `src/stores/notification.ts`
- [x] Define Notification type (id, type, title, message, timestamp, read, data?)
- [x] NotificationType enum (transaction, security, system)
- [x] Actions: add, markRead, markAllRead, clearAll
- [x] localStorage persistence
- [x] Write tests (~6 tests) → 8 tests

**Acceptance**: ✅ Notifications persist across page reloads

---

#### T011.2: NotificationPermissionSheet ✅
- [x] Create `src/components/notification/notification-permission-sheet.tsx`
- [x] Explain push notification benefits
- [x] Request permission button
- [ ] Handle denied state with "Settings" link (deferred: actual API integration)
- [x] Skip option for later
- [x] Write tests (~6 tests) → 8 tests
- [x] Write Storybook story

**Acceptance**: ✅ Permission flow UI handles enable/skip (API integration deferred)

---

#### T011.3: NotificationCenter
- [ ] Create `src/pages/notifications/index.tsx`
- [ ] List notifications with grouping by date
- [ ] Empty state when no notifications
- [ ] Mark as read on tap
- [ ] Clear all button in header
- [ ] Add route `/notifications`
- [ ] Write tests (~8 tests)
- [ ] Write Storybook story

**Acceptance**: Can view and manage all notifications

---

#### T011.4: TransactionNotification
- [ ] Create `src/components/notification/transaction-toast.tsx`
- [ ] Toast states: pending, confirmed, failed
- [ ] Icon and color per state
- [ ] Auto-dismiss after 5s (configurable)
- [ ] Tap to view transaction detail
- [ ] Write tests (~6 tests)
- [ ] Write Storybook story

**Acceptance**: Transaction status visible as toast during send flow

---

## Dependencies

- TanStack Store (exists)
- BottomSheet (exists)
- PageHeader (exists)
- useToast hook (may need to create)

## Estimated Test Count

| Task | Tests |
|------|-------|
| T011.1 NotificationStore | ~6 |
| T011.2 NotificationPermissionSheet | ~6 |
| T011.3 NotificationCenter | ~8 |
| T011.4 TransactionNotification | ~6 |
| **Total** | **~26** |
