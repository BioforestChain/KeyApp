## 1. Core Components

- [x] 1.1 `AssetItem`: Row component with TokenIcon, name, balance (reuse BalanceDisplay)
- [x] 1.2 `AssetList`: Scrollable list of AssetItem components
- [x] 1.3 `useAssets` hook: TanStack Store for asset state management
- [x] 1.4 `AssetInfo` type: Interface with assetType, amount (string), decimals, logoUrl

## 2. Integration

- [x] 2.1 Home page (`/home`): WalletSelector + AssetList (existing home page already has TokenList)
- [x] 2.2 Mock data adapter: Fake assets for development/testing
- [x] 2.3 Route wiring: Add `/home` to TanStack Router (already exists)

## 3. Validation

- [x] 3.1 Vitest tests for AssetItem and AssetList components
- [x] 3.2 Vitest tests for useAssets hook
- [x] 3.3 Storybook stories for asset components
- [x] 3.4 `openspec validate add-asset-display --strict`
