<!-- Generated on 2025-12-10T10:02:26+00:00 by por_manager; template=present -->

# POR - Strategic Board

- North Star: Deliver mpay feature parity with modern React/TanStack stack, high test coverage, component-first architecture
- Guardrails: TypeScript strict mode; all components have Storybook stories + Vitest tests; openspec for changes

## Deliverables (top-level)
- Phase 1.5 Core Interaction Components - src/components/{token,transaction,wallet,transfer,security}/ - PeerA ✅
- Phase 2 Wallet Onboarding - TanStack Router flows - PeerA ✅
- Phase 3 Transfer Functionality - asset display, send, receive - PeerA ✅
- Phase 4 Settings & Preferences - src/pages/settings/ - PeerA ✅
- Phase 5 Transaction History - src/pages/history/ - PeerA ✅

## Bets & Assumptions
- Bet 1: Component-first approach enables faster iteration | Probe: `pnpm test --run` | Evidence: 835 tests passing | Window: ongoing
- Bet 2: TanStack ecosystem provides type-safe routing and state | Probe: integration tests | Evidence: pending | Window: Phase 2

## Roadmap (Now/Next/Later)
- Now (<= 2 weeks): Wallet management, address book
- Next (<= 6 weeks): Advanced features, notifications
- Later (> 6 weeks): Staking, DWEB/Plaoc integration, biometric auth

## Decision & Pivot Log (recent 5)
- 2025-12-10 | T001 complete | 8 core components delivered with 90 new tests | 453 total tests passing | archived

## Risk Radar & Mitigations (up/down/flat)
- R1: Pre-existing dirty workspace files (.gitignore, old deletions) - low, left untouched (flat)

## Active Work
> Real-time task status: press T in TUI or run `/task` in IM
> Task definitions: docs/por/T###-slug/task.yaml

- T001 Core Interaction Components: **complete** (archived)
- T002 Wallet Create Flow: **complete** (committed 5cdad62, archived)
- T003 Wallet Recover Flow: **complete** (committed 07cbf06, archived)
- T004 Wallet Backup Verification: **complete** (committed 77564e2, archived)
- Phase 2 Wallet Onboarding: **COMPLETE** ✅ (create + recover + backup)
- T005 Asset Display: **complete** (committed 64fa10f, archived)
- T006 Send Flow: **complete** (committed 234135d, archived)
- T007 Receive Flow Tests: **complete** (committed 8fb44b8, archived)
- Phase 3 Transfer: **COMPLETE** ✅ (asset + send + receive)
- T008 Settings Foundation: **complete** (committed 018bd05, archived)
- Phase 4 Settings: **COMPLETE** ✅ (layout + language + mnemonic + password + currency)
- T009 Transaction History: **complete** (committed 9606b7a, archived)
- Phase 5 Transaction History: **COMPLETE** ✅ (hook + list + detail)
- T010 Wallet Management: **in_progress** (S1-S2 committed fa8aad1, S3-S4 pending)

## Operating Principles (short)
- Falsify before expand; one decidable next step; stop with pride when wrong; Done = evidence.

## Maintenance & Change Log (append-only, one line each)
- 2025-12-10 19:15 | PeerA | Initial POR update after T001 completion | 453 tests, 8 components archived
- 2025-12-10 19:33 | PeerA | T002 complete | 504 tests, 51 new for onboarding create flow
- 2025-12-10 20:04 | PeerB | T002 committed (5cdad62), archived; T003 change scaffolded | spec validated
- 2025-12-10 20:34 | PeerB | T003 committed (07cbf06), archived | 569 tests, 65 new for recover flow
- 2025-12-10 20:37 | PeerB | T004 change scaffolded (add-wallet-backup-verification) | biometrics deferred to Phase 3
- 2025-12-10 20:55 | PeerB | T004 committed (77564e2), archived | 620 tests, 51 new | Phase 2 Onboarding COMPLETE
- 2025-12-10 21:19 | PeerB | T005 committed (64fa10f), archived | 650 tests, 30 new | Asset display complete
- 2025-12-11 00:56 | PeerB | T006 committed (234135d), archived | 690 tests, 40 new | Send flow complete
- 2025-12-11 01:06 | PeerB | T007 committed (8fb44b8), archived | 702 tests, 12 new | Phase 3 Transfer COMPLETE
- 2025-12-11 01:25 | PeerB | T008 change scaffolded (add-settings-page) | Phase 4 Settings & Preferences start
- 2025-12-11 01:35 | PeerB | T008.1 committed (7d43836) | 721 tests, 19 new | SettingsPage layout complete
- 2025-12-11 01:42 | PeerB | T008.2 committed (37f3760) | 738 tests, 17 new | LanguageSelector + preferencesStore
- 2025-12-11 05:38 | PeerB | T008.3 committed (3ffa68b) | 751 tests, 13 new | ViewMnemonicFlow with 30s auto-hide
- 2025-12-11 05:50 | PeerB | T008.4-T008.5 committed (018bd05) | 775 tests, 24 new | Phase 4 Settings COMPLETE
- 2025-12-11 06:04 | PeerB | T009.1 committed (57a50a0) | 788 tests, 13 new | useTransactionHistory hook
- 2025-12-11 06:16 | PeerB | T009.2-3 committed (9606b7a) | 810 tests, 22 new | Phase 5 Transaction History COMPLETE
- 2025-12-11 06:55 | PeerB | T010.1-2 committed (fa8aad1) | 828 tests, 17 new | WalletListPage + WalletEditSheet done

<!-- Generated on 2025-12-10T10:02:26+00:00 by por_manager.ensure_por 0.1.1 ; template_sha1=7342dc47bce1342e40656c7ab0c32577632e15a2 -->

## Aux Delegations - Meta-Review/Revise (strategic)
Strategic only: list meta-review/revise items offloaded to Aux.
Keep each item compact: what (one line), why (one line), optional acceptance.
Tactical Aux subtasks now live in each task.yaml under 'Aux (tactical)'; do not list them here.
After integrating Aux results, either remove the item or mark it done.
- [ ] None active
