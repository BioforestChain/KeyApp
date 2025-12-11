# Change: Add Staking Epic (T017)

## Why
Staking is core wallet functionality that mpay users expect. KeyApp needs feature parity with mpay's staking system to support token minting (stake) and burning (unstake) between external chains (ETH/TRX/BNB) and internal BioForest chains.

## What Changes
- Add staking module with Overview, Mint (stake), Burn (unstake) pages
- Implement multi-chain token conversion flows
- Add staking transaction history (record list)
- Create staking-specific components and hooks
- Integrate with existing wallet/transaction infrastructure

## Impact
- New routes: `/staking`, `/staking/mint`, `/staking/burn`, `/staking/records`
- New components: StakingOverview, MintForm, BurnForm, StakingRecordList
- New hooks: useStakingBalance, useRechargeConfig, useMintTransaction
- Protected by: E2E visual regression suite (28 baselines)
- Tests: Unit tests for all components + E2E flows

## mpay Feature Analysis

### Routes (from staking.routes.ts)
| mpay Route | KeyApp Route | Status |
|------------|--------------|--------|
| `/staking` | `/staking` | Planned |
| `/staking/record-list` | `/staking/records` | Planned |
| `/staking/mint-detail` | `/staking/mint/:id` | Planned |
| `/staking/burn-detail` | `/staking/burn/:id` | Planned |

### Pages (from pages/)
| mpay Page | Description | Priority |
|-----------|-------------|----------|
| overview | Staking summary, asset list | P1 |
| mint | Stake tokens (external→internal) | P1 |
| burn | Unstake tokens (internal→external) | P1 |
| mint-detail | Transaction details | P2 |
| burn-detail | Transaction details | P2 |
| record-list | Transaction history | P2 |

### Key Services Used
- `CotPaymentService` - Recharge/payment configuration
- `ChainV2Service` - Multi-chain support (ETH/TRX/BNB)
- `WalletDataStorageV2Service` - Wallet data access

## Technical Approach

### Phase 1: Core Infrastructure
1. Define staking types and schemas (Zod)
2. Create mock staking service for development
3. Set up staking routes with TanStack Router

### Phase 2: UI Components
1. StakingOverview - Asset list with stake amounts
2. MintForm - Token selection, amount input, chain selection
3. BurnForm - Similar to MintForm for unstaking
4. StakingRecordList - Transaction history with filters

### Phase 3: Integration
1. Connect to real staking APIs
2. Add transaction signing flow
3. Implement real-time balance updates

## Risks
- API dependency: Staking APIs may not be fully documented
- Multi-chain complexity: Different chains have different token standards
- Mitigation: Start with mock services, validate API contracts early
