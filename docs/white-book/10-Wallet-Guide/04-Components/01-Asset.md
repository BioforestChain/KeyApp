# Asset Components

## Overview

The `Asset` components are responsible for displaying crypto assets (native tokens, ERC20, etc.) in various contexts (lists, details, selectors).

## Components

### AssetItem

Displays a single asset row with:
- Icon (logo or placeholder)
- Symbol & Name
- Balance (crypto)
- Fiat Value (if available)

### AssetList

A virtualized or standard list of `AssetItem`s.
- Handles empty states (`IconCoins`).
- Handles loading skeletons.
- Groups assets by chain (optional).

## Usage

```tsx
<AssetList 
  assets={wallet.assets} 
  onAssetClick={(asset) => navigateToDetail(asset)} 
/>
```
