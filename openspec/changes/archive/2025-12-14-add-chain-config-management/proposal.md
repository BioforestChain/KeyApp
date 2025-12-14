# Change: Add Multi-Chain Configuration Management

## Status

**READY** - Ready for implementation

## Why

Currently, BioForest chain configurations are hardcoded in `src/lib/crypto/bioforest.ts` as `BIOFOREST_CHAINS`. This approach has several limitations:

1. **No runtime flexibility**: Users cannot add new chains without app updates
2. **No subscription support**: Cannot automatically sync chain configs from remote sources
3. **No enable/disable control**: Users cannot selectively disable chains they don't use
4. **No manual additions**: Power users cannot add custom chain configurations
5. **No versioning**: No mechanism to handle config schema migrations

The CLAUDE.md acceptance criteria #4 explicitly requires:
- Default chain configs stored in a JSON file
- Subscription URL configuration (default to local JSON)
- Enable/disable functionality per chain
- Manual JSON input for custom chains
- Version number (x.y) + type support for schema evolution

## What Changes

### Core Components

1. **Default Chain Config File** (`public/configs/default-chains.json`)
   - Move hardcoded `BIOFOREST_CHAINS` to external JSON
   - Add version and type fields to each chain config
   - Include all 8 existing chains: BFMeta, CCChain, PMChain, BFChainV2, BTGMeta, BIWMeta, ETHMeta, Malibu

2. **Chain Config Service** (`src/services/chain-config/`)
   - `types.ts`: ChainConfig interface with version, type, enabled fields
   - `index.ts`: Service for loading, merging, and managing configs
   - `storage.ts`: Persistence layer for user preferences
   - `subscription.ts`: Remote config fetching and caching

3. **Chain Config Store** (`src/stores/chain-config.ts`)
   - TanStack Store for reactive chain config state
   - Derived stores for enabled chains, chain by type, etc.
   - Actions for enable/disable, add custom, refresh subscription

4. **Settings UI** (`src/pages/settings/chain-config.tsx`)
   - Subscription URL input with "default" option
   - Chain list with enable/disable toggles
   - Manual JSON input textarea with "Add" button
   - Version display and validation feedback

### Data Model

```typescript
interface ChainConfig {
  // Identity
  id: string;                    // e.g., "bfmeta"
  version: string;               // e.g., "1.0" - major.minor format
  type: string;                  // e.g., "bioforest" | "evm" | "custom"

  // Display
  name: string;                  // e.g., "BFMeta"
  symbol: string;                // e.g., "BFT"
  icon?: string;                 // Icon identifier or URL

  // Technical
  prefix: string;                // Address prefix, e.g., "c"
  decimals: number;              // Token decimals, e.g., 8

  // Extended (optional)
  rpcUrl?: string;               // RPC endpoint
  explorerUrl?: string;          // Block explorer base URL

  // User state (stored separately)
  enabled: boolean;              // User preference
  source: 'default' | 'subscription' | 'manual';
}

interface ChainConfigSubscription {
  url: string;                   // Subscription URL or "default"
  lastUpdated?: string;          // ISO timestamp
  etag?: string;                 // For conditional requests
}
```

### Version Schema

- **Major version (X)**: Breaking changes requiring service updates
  - New required fields
  - Removed fields
  - Changed semantics
- **Minor version (Y)**: Additive changes
  - New optional fields
  - New chain types
  - Bug fixes in config

## Hard Constraints (Merge + Compatibility)

1. **Source precedence** (when the same `id` exists in multiple layers):
   - `manual` > `subscription` > `default`

2. **Compatibility downgrade strategy** (to avoid runtime crashes and split-brain behavior):
   - **Unknown `type`**: treat as `custom` (basic display + storage; advanced behaviors gated by runtime)
   - **Incompatible major `version`**: hide from non-settings UI (wallet flows/selectors), preserve in storage, and surface a warning in settings

## Impact

- **Affected specs**: None (new capability)
- **Affected code**:
  - `src/lib/crypto/bioforest.ts` - Will import from chain-config service
  - `src/stores/wallet.ts` - Will use chain-config store for available chains
  - `src/pages/settings/` - New chain-config settings page
  - `src/routes/` - New route for chain config settings
  - `src/i18n/locales/*/settings.json` - New i18n keys

## Dependencies

- TanStack Store (exists)
- Storage service (exists: `src/services/storage/`)
- i18n system (exists)

## Success Criteria

1. Default chains load from `public/configs/default-chains.json`
2. Users can configure a subscription URL in settings
3. Users can enable/disable individual chains
4. Users can add custom chains via JSON input
5. Chain configs include version and type fields
6. App gracefully handles version mismatches
7. All existing wallet functionality continues to work

## References

- Gap analysis: CLAUDE.md verification criteria #4
- mpay chain service: `/legacy-apps/libs/wallet-base/services/wallet/chain/chain.service.ts`
- Current implementation: `src/lib/crypto/bioforest.ts`
