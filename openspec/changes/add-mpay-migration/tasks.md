# Tasks: mpay Migration

## 1. Migration Detection
- [x] 1.1 Create `useMpayDetection` hook to check `walletv2-idb` IndexedDB
- [x] 1.2 Create `MigrationContext` for migration state management
- [x] 1.3 Add detection trigger in onboarding flow

## 2. Migration Service
- [x] 2.1 Create `MpayDataReader` service to read mpay IndexedDB stores
- [x] 2.2 Create `MpayDataTransformer` to convert mpay types to KeyApp types
- [x] 2.3 Create `MigrationService` orchestrator with progress callbacks
- [x] 2.4 Add password verification (decrypt mpay data with user password)

## 3. Migration UI
- [x] 3.1 Create `MigrationDetectedSheet` component (prompt user)
- [x] 3.2 Create `MigrationPasswordStep` component (verify password)
- [x] 3.3 Create `MigrationProgressStep` component (show progress)
- [x] 3.4 Create `MigrationCompleteStep` component (success/error states)
- [x] 3.5 Integrate migration flow into onboarding router

## 4. Testing
- [x] 4.1 Unit tests for `MpayDataReader` with mocked IndexedDB
- [x] 4.2 Unit tests for `MpayDataTransformer` type conversions
- [x] 4.3 Unit tests for `MigrationService` orchestration
- [ ] 4.4 E2E tests for full migration flow with Storybook mocks
- [ ] 4.5 E2E screenshot baselines for migration UI

## 5. i18n
- [ ] 5.1 Create migration.json for en/zh-CN/zh-TW/ja locales

## 6. Documentation
- [ ] 6.1 Update onboarding flow diagram in TDD.md
- [ ] 6.2 Document migration data format in SERVICE-SPEC.md
