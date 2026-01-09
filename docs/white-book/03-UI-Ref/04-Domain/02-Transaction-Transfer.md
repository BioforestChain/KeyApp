# Transaction & Transfer Components

> Source: [src/components/transaction/](https://github.com/aspect-build/aspect-workflows/tree/main/src/components/transaction) | [src/components/transfer/](https://github.com/aspect-build/aspect-workflows/tree/main/src/components/transfer)

## Overview

Domain components for transaction history display and transfer operations.

---

## Transaction Components

### TransactionList
**Source**: `src/components/transaction/transaction-list.tsx`

Paginated transaction history with infinite scroll.

```tsx
interface TransactionListProps {
  walletId: string;
  chainId?: string;
  filter?: TransactionFilter;
  onSelect?: (tx: Transaction) => void;
}
```

### TransactionCard
**Source**: `src/components/transaction/transaction-card.tsx`

Single transaction row with status and amount.

```tsx
interface TransactionCardProps {
  transaction: Transaction;
  onClick?: () => void;
  showChain?: boolean;
}
```

### TransactionDetail
**Source**: `src/components/transaction/transaction-detail.tsx`

Full transaction details page content.

### TransactionStatus
**Source**: `src/components/transaction/transaction-status.tsx`

Visual status indicator (pending, confirmed, failed).

```tsx
type TransactionStatusType = 'pending' | 'confirming' | 'confirmed' | 'failed';

interface TransactionStatusProps {
  status: TransactionStatusType;
  confirmations?: number;
  requiredConfirmations?: number;
}
```

### TransactionIcon
**Source**: `src/components/transaction/transaction-icon.tsx`

Transaction type icon (send, receive, swap, contract).

### TransactionAmount
**Source**: `src/components/transaction/transaction-amount.tsx`

Formatted amount with direction indicator (+/-).

### TransactionTimestamp
**Source**: `src/components/transaction/transaction-timestamp.tsx`

Relative or absolute time display.

### TransactionHash
**Source**: `src/components/transaction/transaction-hash.tsx`

Truncated hash with copy and explorer link.

### TransactionFilter
**Source**: `src/components/transaction/transaction-filter.tsx`

Filter controls for transaction list.

---

## Transfer Components

### TransferForm
**Source**: `src/components/transfer/transfer-form.tsx`

Complete send transaction form.

```tsx
interface TransferFormProps {
  chainId: string;
  tokenAddress?: string;
  initialRecipient?: string;
  initialAmount?: string;
  onSubmit: (params: TransferParams) => void;
}
```

### RecipientInput
**Source**: `src/components/transfer/recipient-input.tsx`

Address input with validation and QR scan.

### AmountInput
**Source**: `src/components/transfer/amount-input.tsx`

Token amount input with max button and fiat conversion.

### GasFeeSelector
**Source**: `src/components/transfer/gas-fee-selector.tsx`

Gas price/limit selection (slow/normal/fast).

```tsx
interface GasFeeSelectorProps {
  chainId: string;
  gasEstimate: GasEstimate;
  selectedSpeed: 'slow' | 'normal' | 'fast';
  onSpeedChange: (speed: 'slow' | 'normal' | 'fast') => void;
  customGas?: CustomGasParams;
  onCustomGasChange?: (params: CustomGasParams) => void;
}
```

### TransferPreview
**Source**: `src/components/transfer/transfer-preview.tsx`

Transaction preview before signing.

### TransferConfirm
**Source**: `src/components/transfer/transfer-confirm.tsx`

Final confirmation with biometric/password.

### TransferSuccess
**Source**: `src/components/transfer/transfer-success.tsx`

Success state with transaction hash.

### TransferError
**Source**: `src/components/transfer/transfer-error.tsx`

Error state with retry option.

---

## Transaction Flow

```
┌────────────────────────────────────────────────────────────┐
│                     TransferForm                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐│
│  │RecipientInput│ │ AmountInput │  │  TokenSelector      ││
│  └─────────────┘  └─────────────┘  └─────────────────────┘│
│  ┌────────────────────────────────────────────────────────┐│
│  │               GasFeeSelector                           ││
│  └────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────┐
│                   TransferPreview                          │
│  From: 0x1234...5678                                       │
│  To:   0xabcd...efgh                                       │
│  Amount: 1.5 ETH ($3,000)                                  │
│  Gas:    0.002 ETH ($4)                                    │
│  Total:  1.502 ETH ($3,004)                                │
└────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────┐
│                   TransferConfirm                          │
│             [Biometric/Password Verification]              │
└────────────────────────────────────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
┌─────────────────────┐   ┌─────────────────────┐
│   TransferSuccess   │   │    TransferError    │
│   TX: 0x789...      │   │   [Retry Button]    │
└─────────────────────┘   └─────────────────────┘
```

---

## State Machine

```
idle → validating → previewing → confirming → broadcasting → success
                                     │                          │
                                     └──────── failed ──────────┘
```

---

## Integration Points

| Component | Service | Store |
|-----------|---------|-------|
| TransferForm | `chain-adapter` | `walletStore` |
| GasFeeSelector | `gas-estimator` | - |
| TransactionList | `transaction-history` | `transactionStore` |
| TransferConfirm | `biometric` | - |

---

## Related Documentation

- [Transaction Lifecycle](../../10-Wallet-Guide/03-Transaction-Flow/01-Lifecycle.md)
- [Chain Adapter](../../02-Driver-Ref/00-Overview.md)
- [Biometric Service](../../04-Platform-Ref/02-Biometric.md)
