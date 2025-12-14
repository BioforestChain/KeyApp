# Design: Multi-Chain Configuration Management

## Context

KeyApp needs to support dynamic chain configuration to meet the bioforestChain ecosystem requirements. The current hardcoded approach in `BIOFOREST_CHAINS` limits flexibility and user customization.

### Stakeholders

- **End Users**: Want to manage which chains are visible and add custom chains
- **Power Users**: Need manual JSON input for testing new chains
- **Developers**: Need versioned configs for schema evolution
- **Ops**: Need subscription URLs for fleet-wide config updates

### Constraints

- Must maintain backward compatibility with existing wallet data
- Must work offline (cached configs)
- Must handle network failures gracefully
- Must validate config schemas before applying

## Goals / Non-Goals

### Goals

1. Externalize chain configs to JSON files
2. Support subscription-based config updates
3. Allow per-chain enable/disable toggles
4. Allow manual JSON config additions
5. Implement version-based schema management
6. Provide reactive state via TanStack Store

### Non-Goals

1. Hot-reload of chain services (requires app restart)
2. Chain service implementation (out of scope)
3. Migration of existing user preferences (handled by migration service)
4. RPC endpoint health monitoring

## Decisions

### D1: Config Storage Strategy

**Decision**: Use layered storage with IndexedDB for persistence.

```
Layer 1: Default configs (public/configs/default-chains.json)
    |
    v
Layer 2: Subscription configs (cached in IndexedDB)
    |
    v
Layer 3: Manual configs (stored in IndexedDB)
    |
    v
Layer 4: User preferences (enabled/disabled in IndexedDB)
    |
    v
Final: Merged runtime config
```

**Rationale**: Separation allows:
- Clear config provenance (source field)
- Independent updates per layer
- Predictable merge behavior
- Offline support via IndexedDB caching

**Alternatives Considered**:
- Single merged storage: Loses provenance, harder to refresh subscription
- localStorage: Size limits, synchronous API

### D2: Version Schema Format

**Decision**: Use semantic-ish `major.minor` string format.

```typescript
version: "1.2"  // major.minor
```

**Rules**:
- Major bump: Breaking change, requires code update
- Minor bump: Additive change, backward compatible
- App stores `minSupportedVersion` per type
- Configs with major > supported are hidden with warning

**Rationale**: Simple, human-readable, sufficient for config evolution.

**Alternatives Considered**:
- Full semver (1.2.3): Overkill for config versioning
- Integer versions: Less expressive
- Date-based: Harder to compare

### D3: Chain Type System

**Decision**: Use string-based type enum with known types.

```typescript
type ChainType = 'bioforest' | 'evm' | 'bip39' | 'custom';
```

**Type Behavior**:
- `bioforest`: Uses Ed25519, SHA256->RIPEMD160->Base58 addressing
- `evm`: Uses secp256k1, Keccak256 addressing
- `bip39`: Standard BIP39/BIP44 derivation
- `custom`: User-defined, requires full config

**Rationale**: Type determines which crypto service handles the chain.

### D4: Subscription Update Strategy

**Decision**: Pull-based with configurable refresh and ETag caching.

```typescript
interface SubscriptionConfig {
  url: string;              // "default" | URL
  refreshInterval: number;  // minutes, default 1440 (daily)
  lastUpdated?: string;     // ISO timestamp
  etag?: string;           // For 304 Not Modified
}
```

**Refresh Triggers**:
1. App startup (if stale)
2. Manual refresh button
3. Background interval (when app active)

**Rationale**: Balances freshness with network efficiency.

### D5: Manual Config Validation

**Decision**: Strict Zod schema validation with helpful error messages.

```typescript
const ChainConfigSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  version: z.string().regex(/^\d+\.\d+$/),
  type: z.enum(['bioforest', 'evm', 'bip39', 'custom']),
  name: z.string().min(1).max(50),
  symbol: z.string().min(1).max(10),
  prefix: z.string().optional(),
  decimals: z.number().int().min(0).max(18),
  // ... more fields
});
```

**Validation Points**:
1. On JSON parse (syntax)
2. On schema validation (structure)
3. On conflict check (duplicate id)

**Rationale**: Early validation prevents runtime errors.

## Component Architecture

```
src/
├── services/
│   └── chain-config/
│       ├── index.ts           # Main service, merges layers
│       ├── types.ts           # ChainConfig, ChainConfigSubscription
│       ├── schema.ts          # Zod schemas for validation
│       ├── storage.ts         # IndexedDB operations
│       ├── subscription.ts    # Remote fetch with caching
│       └── __tests__/         # Unit tests
│
├── stores/
│   └── chain-config.ts        # TanStack Store
│       ├── chainConfigs       # All merged configs
│       ├── enabledChains      # Derived: only enabled
│       ├── chainById          # Derived: lookup map
│       └── actions            # enable, disable, add, refresh
│
├── pages/
│   └── settings/
│       └── chain-config.tsx   # Settings UI
│
└── public/
    └── configs/
        └── default-chains.json
```

## Data Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ default-chains  │────>│ ChainConfigSvc   │────>│ TanStack Store  │
│ .json           │     │   (merge layer)  │     │ (reactive)      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               ^                        │
                               │                        v
┌─────────────────┐            │                 ┌─────────────────┐
│ Subscription    │────────────┤                 │ Settings UI     │
│ URL             │            │                 │ Components      │
└─────────────────┘            │                 └─────────────────┘
                               │                        │
┌─────────────────┐            │                        v
│ Manual JSON     │────────────┤                 ┌─────────────────┐
│ Input           │            │                 │ Wallet/Crypto   │
└─────────────────┘            │                 │ Services        │
                               │                 └─────────────────┘
┌─────────────────┐            │
│ IndexedDB       │<───────────┘
│ (persistence)   │
└─────────────────┘
```

## Risks / Trade-offs

### R1: Config Desync with Code

**Risk**: Subscription adds a chain type that code doesn't support.

**Mitigation**:
- Version checking hides unsupported configs
- Graceful fallback to "custom" type
- Toast notification for skipped configs

### R2: Large Config Payloads

**Risk**: Subscription URL returns massive JSON.

**Mitigation**:
- Max payload size check (1MB)
- Gzip support via Accept-Encoding
- Pagination not needed (expecting <100 chains)

### R3: Stale Cache

**Risk**: Offline user has outdated configs.

**Mitigation**:
- Show "last updated" timestamp in UI
- Manual refresh button
- Clear warning if config age > 30 days

### R4: Duplicate Chain IDs

**Risk**: Manual config conflicts with default/subscription.

**Mitigation**:
- Manual configs use `manual:` prefix internally
- UI shows source badge
- Conflict warning on add

## Migration Plan

### From Hardcoded to JSON

1. Create `default-chains.json` matching current `BIOFOREST_CHAINS`
2. Update `src/lib/crypto/bioforest.ts` to import from service
3. Existing wallets continue to work (same chain IDs)
4. No user data migration needed

### Future Version Bumps

1. Bump minor: Add optional fields, no action needed
2. Bump major:
   - Update `minSupportedVersion` in code
   - Add migration logic if needed
   - Old configs hidden with upgrade prompt

## Open Questions

1. **Q**: Should subscription URL be per-wallet or global?
   **A**: Global (app-level setting) - simpler, covers 99% use case.

2. **Q**: Should we support multiple subscription URLs?
   **A**: No (YAGNI) - single URL with array response is sufficient.

3. **Q**: How to handle chain removal from subscription?
   **A**: Keep in cache with "removed" flag, let user decide to delete.
