# Transaction List Composite

## Overview

The `TransactionList` component displays a grouped list of transactions, organized by date (Today, Yesterday, Date). It handles loading states, empty states, and click interactions.

## Usage

```tsx
import { TransactionList } from '@/components/transaction/transaction-list';

export function HistoryView({ transactions, isLoading }) {
  return (
    <TransactionList
      transactions={transactions}
      loading={isLoading}
      onTransactionClick={(tx) => console.log('Clicked:', tx.id)}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `transactions` | `TransactionInfo[]` | Required | Array of transaction objects. |
| `loading` | `boolean` | `false` | Shows skeleton loader if true. |
| `onTransactionClick` | `(tx) => void` | - | Callback when an item is clicked. |
| `emptyTitle` | `string` | "暂无交易记录" | Title for empty state. |
| `emptyDescription` | `string` | "..." | Description for empty state. |
| `showChainIcon` | `boolean` | `false` | Shows chain badge on transaction icon. |

## Features

### Date Grouping

Transactions are automatically grouped by day:
- **Today**: `今天`
- **Yesterday**: `昨天`
- **Other**: Full date string (e.g., `M月D日`).

### States

1. **Loading**: Renders `<SkeletonList count={5} />`.
2. **Empty**: Renders `<EmptyState />` with custom icon and text.
3. **Content**: Renders list of `<TransactionItem />`.

### Localization

Currently hardcoded to Chinese ('今天', '昨天'). 
> **Note**: Should be refactored to use `i18n` for multi-language support.

## Related Components

- `TransactionItem`: Renders individual rows.
- `EmptyState`: Renders the zero-data state.
- `SkeletonList`: Renders the loading placeholder.
