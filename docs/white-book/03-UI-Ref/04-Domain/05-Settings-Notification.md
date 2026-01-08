# Settings, Notification & Contact Components

> Source: [src/components/settings/](https://github.com/aspect-build/aspect-workflows/tree/main/src/components/settings) | [src/components/notification/](https://github.com/aspect-build/aspect-workflows/tree/main/src/components/notification) | [src/components/contact/](https://github.com/aspect-build/aspect-workflows/tree/main/src/components/contact)

## Overview

Domain components for application settings, notification handling, and contact management.

---

## Settings Components

### AppearanceSheet
**Source**: `src/components/settings/appearance-sheet.tsx`

Theme and appearance customization bottom sheet.

```tsx
interface AppearanceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

**Features**:
- Light/Dark/System theme selection
- Color accent picker (planned)
- Font size adjustment (planned)

---

## Notification Components

### NotificationPermissionSheet
**Source**: `src/components/notification/notification-permission-sheet.tsx`

Permission request sheet for push notifications.

```tsx
interface NotificationPermissionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAllow: () => void;
  onDeny: () => void;
}
```

**Features**:
- Explains notification benefits
- Request permission flow
- Skip option

### TransactionToast
**Source**: `src/components/notification/transaction-toast.tsx`

Real-time transaction status notification.

```tsx
interface TransactionToastProps {
  transaction: {
    hash: string;
    type: 'send' | 'receive' | 'swap';
    status: 'pending' | 'confirmed' | 'failed';
    amount: string;
    symbol: string;
  };
  onDismiss?: () => void;
  onViewDetails?: () => void;
}
```

**Visual States**:
- Pending: spinning indicator
- Confirmed: success checkmark with confetti
- Failed: error icon with retry option

---

## Contact Components

### ContactCard
**Source**: `src/components/contact/contact-card.tsx`

Contact display with address and actions.

```tsx
interface ContactCardProps {
  contact: {
    name: string;
    address: string;
    chainId: string;
    avatar?: string;
    label?: string;
  };
  onEdit?: () => void;
  onDelete?: () => void;
  onSend?: () => void;
}
```

**Features**:
- Avatar with initials fallback
- Address truncation with copy
- Chain indicator
- Quick actions menu

---

## Component Usage

### Settings Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Settings Page                        │
│  ┌────────────────────────────────────────────────────┐│
│  │ Appearance                            [Light ▼]    ││
│  │─────────────────────────────────────────────────────││
│  │ Notifications                         [Enabled]    ││
│  │─────────────────────────────────────────────────────││
│  │ Security                              [Pattern]    ││
│  │─────────────────────────────────────────────────────││
│  │ Language                              [English]    ││
│  │─────────────────────────────────────────────────────││
│  │ Currency                              [USD]        ││
│  └────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
                         │
                         │ (tap Appearance)
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  AppearanceSheet                        │
│  ┌────────────────────────────────────────────────────┐│
│  │  ○ Light                                           ││
│  │  ● Dark                                            ││
│  │  ○ System                                          ││
│  └────────────────────────────────────────────────────┘│
│                     [Done]                              │
└─────────────────────────────────────────────────────────┘
```

### Notification Flow

```
┌─────────────────────────────────────────────────────────┐
│            NotificationPermissionSheet                  │
│  ┌────────────────────────────────────────────────────┐│
│  │              🔔                                     ││
│  │    Stay updated on your transactions               ││
│  │                                                    ││
│  │  • Receive alerts for incoming transfers           ││
│  │  • Get notified when transactions confirm          ││
│  │  • Security alerts for account activity            ││
│  └────────────────────────────────────────────────────┘│
│         [Not Now]           [Enable Notifications]      │
└─────────────────────────────────────────────────────────┘

                    Transaction Activity
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  TransactionToast                       │
│  ┌────────────────────────────────────────────────────┐│
│  │  ⟳ Sending 0.5 ETH...                      [View]  ││
│  └────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  TransactionToast                       │
│  ┌────────────────────────────────────────────────────┐│
│  │  ✓ Sent 0.5 ETH successfully              [View]   ││
│  └────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### Contact Management

```
┌─────────────────────────────────────────────────────────┐
│                   Contact List                          │
│  ┌────────────────────────────────────────────────────┐│
│  │ ContactCard                                        ││
│  │  [JD]  John Doe                                    ││
│  │        0x1234...5678 (ETH)                         ││
│  │        [Send] [Edit] [Delete]                      ││
│  ├────────────────────────────────────────────────────┤│
│  │ ContactCard                                        ││
│  │  [AS]  Alice Smith                                 ││
│  │        TQn9...xYz (TRX)                            ││
│  │        [Send] [Edit] [Delete]                      ││
│  └────────────────────────────────────────────────────┘│
│                  [+ Add Contact]                        │
└─────────────────────────────────────────────────────────┘
```

---

## Integration Points

| Component | Service | Store |
|-----------|---------|-------|
| AppearanceSheet | - | `settingsStore` |
| NotificationPermissionSheet | `notification-service` | - |
| TransactionToast | `transaction-watcher` | `transactionStore` |
| ContactCard | - | `contactStore` |

---

## Accessibility

| Component | A11y Features |
|-----------|---------------|
| AppearanceSheet | Radio group with keyboard nav |
| NotificationPermissionSheet | Focus trap, escape to close |
| TransactionToast | aria-live region, auto-dismiss |
| ContactCard | Action buttons with labels |

---

## Related Documentation

- [Wallet Guide - Contacts](../../10-Wallet-Guide/04-Components/02-Contact.md)
- [Platform - Haptics](../../04-Platform-Ref/04-Haptics.md)
- [Transaction Flow](../../10-Wallet-Guide/03-Transaction-Flow/01-Lifecycle.md)
