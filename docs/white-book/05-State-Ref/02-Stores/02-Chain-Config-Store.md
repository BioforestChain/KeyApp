# Chain Config Store

## Overview

The Chain Config Store manages the dynamic list of supported blockchains, including remote subscriptions and user-defined custom chains.

## State Structure

```typescript
interface ChainConfigState {
  snapshot: ChainConfigSnapshot; // The full config tree
  isLoading: boolean;
  error: string | null;
}
```

## Key Actions

- **`initialize`**: Loads the initial config snapshot from storage.
- **`setSubscriptionUrl`**: Updates the remote config source URL.
- **`refreshSubscription`**: Fetches the latest config from the subscription URL.
- **`setChainEnabled`**: Toggles visibility of specific chains.

## Source of Truth

The store is a projection of the underlying `ChainConfigService`, which handles the complex logic of merging default configs, subscription overrides, and local user settings.
