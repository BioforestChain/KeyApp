# Wallet & Asset Components

> Source: [src/components/wallet/](https://github.com/aspect-build/aspect-workflows/tree/main/src/components/wallet) | [src/components/asset/](https://github.com/aspect-build/aspect-workflows/tree/main/src/components/asset) | [src/components/token/](https://github.com/aspect-build/aspect-workflows/tree/main/src/components/token)

## Overview

Domain components for wallet management, asset display, and token operations.

---

## Wallet Components

### WalletCard
**Source**: `src/components/wallet/wallet-card.tsx`

Displays a single wallet with balance summary and quick actions.

```tsx
interface WalletCardProps {
  wallet: WalletInfo;
  onSelect?: () => void;
  onManage?: () => void;
  className?: string;
}
```

### WalletList
**Source**: `src/components/wallet/wallet-list.tsx`

Scrollable list of wallets with selection state.

### WalletSelector
**Source**: `src/components/wallet/wallet-selector.tsx`

Dropdown selector for switching between wallets.

### WalletHeader
**Source**: `src/components/wallet/wallet-header.tsx`

Page header showing active wallet info with balance.

### WalletBalance
**Source**: `src/components/wallet/wallet-balance.tsx`

Total balance display with currency conversion.

### WalletActions
**Source**: `src/components/wallet/wallet-actions.tsx`

Quick action buttons (Send, Receive, Swap, Buy).

### AccountHeader
**Source**: `src/components/wallet/account-header.tsx`

Account information header with address copy functionality.

### AddressDisplay
**Source**: `src/components/wallet/address-display.tsx`

Formatted blockchain address with copy-to-clipboard.

### QRCodeDisplay
**Source**: `src/components/wallet/qr-code-display.tsx`

QR code generator for receiving addresses.

---

## Asset Components

### AssetCard
**Source**: `src/components/asset/asset-card.tsx`

Individual asset display with balance and price.

```tsx
interface AssetCardProps {
  asset: AssetInfo;
  onClick?: () => void;
  showPrice?: boolean;
  showChange?: boolean;
}
```

### AssetList
**Source**: `src/components/asset/asset-list.tsx`

Token portfolio list with sorting/filtering.

### AssetDetail
**Source**: `src/components/asset/asset-detail.tsx`

Full asset details page content.

### AssetChart
**Source**: `src/components/asset/asset-chart.tsx`

Price history chart visualization.

### AssetActions
**Source**: `src/components/asset/asset-actions.tsx`

Asset-specific action buttons.

---

## Token Components

### TokenIcon
**Source**: `src/components/token/token-icon.tsx`

Token logo with fallback handling.

```tsx
interface TokenIconProps {
  symbol: string;
  iconUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}
```

### TokenAmount
**Source**: `src/components/token/token-amount.tsx`

Formatted token amount with symbol.

### TokenPrice
**Source**: `src/components/token/token-price.tsx`

Fiat price display with change indicator.

### TokenSelector
**Source**: `src/components/token/token-selector.tsx`

Searchable token selection dropdown.

### TokenSearch
**Source**: `src/components/token/token-search.tsx`

Token search input with suggestions.

### TokenListItem
**Source**: `src/components/token/token-list-item.tsx`

Single token row for lists.

### ChainBadge
**Source**: `src/components/token/chain-badge.tsx`

Chain identifier badge on token icons.

---

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    WalletHeader                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │WalletBalance│  │WalletSelector│  │  WalletActions │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                     AssetList                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │ AssetCard (TokenIcon + TokenAmount + TokenPrice) │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ AssetCard                                        │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ AssetCard                                        │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Integration Points

| Component | Store | Query |
|-----------|-------|-------|
| WalletCard | `walletStore` | `useWalletQuery` |
| AssetList | `walletStore` | `useBalancesQuery` |
| TokenPrice | - | `usePriceQuery` |
| WalletBalance | `walletStore` | `useTotalBalanceQuery` |

---

## Related Documentation

- [Wallet Store](../../05-State-Ref/02-Stores/01-Wallet-Store.md)
- [Balance Query](../../05-State-Ref/03-Queries/01-Balance-Query.md)
- [Account System](../../10-Wallet-Guide/01-Account-System/01-Key-Derivation.md)
