# Tasks: Notification System

## T011: Notification System

### Status: pending

### Tasks

#### T011.1: NotificationStore
- [ ] Create `src/stores/notification.ts`
- [ ] Define Notification type (id, type, title, message, timestamp, read, data?)
- [ ] NotificationType enum (transaction, security, system)
- [ ] Actions: add, markRead, markAllRead, clearAll
- [ ] localStorage persistence
- [ ] Write tests (~6 tests)

**Acceptance**: Notifications persist across page reloads

---

#### T011.2: NotificationPermissionSheet
- [ ] Create `src/components/notification/permission-sheet.tsx`
- [ ] Explain push notification benefits
- [ ] Request permission button
- [ ] Handle denied state with "Settings" link
- [ ] Skip option for later
- [ ] Write tests (~6 tests)
- [ ] Write Storybook story

**Acceptance**: Permission flow handles all states (granted, denied, default)

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
