# Change: Add asset display

## Why

- PDR Epic 2 requires asset viewing after wallet onboarding
- User journey: Create/Recover Wallet → **View Assets** → Transfer
- mpay implements token list with string amounts for precision

## What Changes

- Add `AssetList` component: Token list for active wallet
- Add `AssetItem` component: Row with icon, name, balance
- Add `useAssets` hook: TanStack Store for asset state
- Add `/home` route: Dashboard with wallet selector + asset list
- Mock data adapter (real API integration deferred)

## Impact

- **New spec**: `asset-display` (token list, balance display, home page)
- **Reuse from T001**: TokenIcon, BalanceDisplay, ChainIcon, WalletSelector
- **Dependencies**: TanStack Store (already in stack)

## Scope Notes

MVP scope - defer to later changes:
- Price feed integration
- Fiat conversion
- Portfolio total calculation
