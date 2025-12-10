# Proposal: Add Notification System

## Summary

Implement an in-app notification system to provide real-time feedback on transaction status and other important events. This enhances user trust by keeping them informed about their wallet activities.

## Motivation

Per PDR Epic 9 (Personalization) and user expectations:
- Users need immediate feedback when transactions are sent/received
- Transaction status changes (pending → confirmed → complete) should be visible
- Important wallet events (backup reminders, security alerts) need a delivery mechanism

## Scope

### In Scope
- NotificationStore for state management and persistence
- Permission flow for push notifications (future native integration)
- In-app notification center UI
- Transaction status notifications/toasts

### Out of Scope
- Native push notification integration (Capacitor/Plaoc - Later phase)
- Email notifications
- SMS notifications

## Design

### Components

1. **NotificationStore** (`src/stores/notification.ts`)
   - Notification type with id, type, title, message, timestamp, read status
   - Actions: add, markRead, markAllRead, clear
   - localStorage persistence

2. **NotificationPermissionSheet** (`src/components/notification/permission-sheet.tsx`)
   - Request permission flow
   - Explain benefits
   - Handle denied state gracefully

3. **NotificationCenter** (`src/pages/notifications/index.tsx`)
   - List all notifications
   - Mark as read on view
   - Clear all option
   - Route: /notifications

4. **TransactionNotification** (`src/components/notification/transaction-toast.tsx`)
   - Toast component for transaction updates
   - States: pending, confirmed, failed
   - Dismissible with auto-hide

### Routes
- `/notifications` - Notification center

## Task Breakdown

| Task | Description | Tests |
|------|-------------|-------|
| T011.1 | NotificationStore | ~6 |
| T011.2 | NotificationPermissionSheet | ~6 |
| T011.3 | NotificationCenter | ~8 |
| T011.4 | TransactionNotification | ~6 |
| **Total** | | **~26** |

## Dependencies

- TanStack Store (exists)
- BottomSheet (exists)
- PageHeader (exists)

## Risks

- **Low**: Push permission may be denied - graceful fallback to in-app only
- **Low**: Notification overload - implement rate limiting for transaction notifications
