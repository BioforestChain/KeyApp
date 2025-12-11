## Phase 1: Core Infrastructure
- [x] 1.1 Define staking types and Zod schemas (17 tests)
- [x] 1.2 Create mock staking service with test data (8 tests)
- [x] 1.3 Set up `/staking` routes with TanStack Router (7 tests)
- [x] 1.4 Add staking i18n namespace (4 locales × 28 keys)

## Phase 2: Overview Page
- [x] 2.1 Create StakingOverview component (StakingPoolCard + StakingOverviewPanel)
- [x] 2.2 Implement asset list with stake amounts (pool stats display)
- [x] 2.3 Add navigation to Mint/Burn pages (onMint callback)
- [ ] 2.4 Write Storybook stories + unit tests

## Phase 3: Mint (Stake) Flow
- [x] 3.1 Create MintForm component with chain/token selection
- [x] 3.2 Implement amount input with balance validation
- [ ] 3.3 Add transaction confirmation sheet
- [ ] 3.4 Create MintDetail page for transaction status
- [ ] 3.5 Write Storybook stories + unit tests

## Phase 4: Burn (Unstake) Flow
- [x] 4.1 Create BurnForm component (similar to Mint)
- [ ] 4.2 Implement unstake amount validation
- [ ] 4.3 Add transaction confirmation sheet
- [ ] 4.4 Create BurnDetail page for transaction status
- [ ] 4.5 Write Storybook stories + unit tests

## Phase 5: History & Polish
- [ ] 5.1 Create StakingRecordList component
- [ ] 5.2 Implement transaction filtering
- [ ] 5.3 Add E2E tests for staking flows
- [ ] 5.4 Update E2E baselines

## Reference
- mpay source: `legacy-apps/apps/mpay/src/pages/staking/`
- mpay services: `CotPaymentService`, `ChainV2Service`
- KeyApp patterns: See existing wallet/transaction components
