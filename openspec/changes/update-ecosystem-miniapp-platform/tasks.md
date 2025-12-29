## 1. White-book Alignment
- [ ] 1.1 Update white-book: subscription v2 + scoring + search
- [ ] 1.2 Update white-book: tx pipeline (create/sign)
- [ ] 1.3 Update white-book: appId reverse-domain rule
- [ ] 1.4 Update white-book: navigation-sync plugin ownership

## 2. Subscription v2 (SSR-style)
- [ ] 2.1 Define source schema: `EcosystemSource` + optional `search`
- [ ] 2.2 Implement local cache (IndexedDB) keyed by source URL
- [ ] 2.3 Implement refresh with ETag/304 + force refresh
- [ ] 2.4 Unify store/registry: settings becomes single source of truth
- [ ] 2.5 Add ranking: official/community + date-based featured weighting (+15 mod 100)
- [ ] 2.6 Update Ecosystem UI to partial listing by ranking

## 3. Search (Beyond Subscription Lists)
- [ ] 3.1 Implement local search over cached apps
- [ ] 3.2 Support optional remote search `urlTemplate` per source (GET, %s placeholder)
- [ ] 3.3 Parse remote response `{version,data}` and validate version
- [ ] 3.4 Merge/dedupe results and expose API for UI

## 4. Transaction Pipeline (Required)
- [ ] 4.1 SDK: add `bio_createTransaction` + `bio_signTransaction` types and docs
- [ ] 4.2 Host: add handlers for create/sign transaction (permission-gated)
- [ ] 4.3 UI: confirmation + wallet-lock flow for signTransaction
- [ ] 4.4 Update demo miniapps to use create/sign flow where applicable

## 5. AppId Naming Rule
- [ ] 5.1 Enforce reverse-domain appId format for built-ins and registry parsing
- [ ] 5.2 Provide compatibility/migration mapping for legacy short ids (if needed)

## 6. Navigation Sync Plugin (Self-maintained)
- [ ] 6.1 Create `packages/plugin-navigation-sync` from Stackflow history-sync baseline
- [ ] 6.2 Replace `url-pattern` with `urlpattern-polyfill` (URLPattern)
- [ ] 6.3 Remove `react18-use` dependency if possible
- [ ] 6.4 Switch KeyApp to use the new plugin and add tests

## 7. Validation
- [ ] 7.1 Add/adjust unit tests (vitest) for parsing/scoring/tx pipeline
- [ ] 7.2 Ensure existing e2e screenshot tests remain stable or update snapshots
