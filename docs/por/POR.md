<!-- Generated on 2025-12-10T10:02:26+00:00 by por_manager; template=present -->

# POR - Strategic Board

- North Star: Deliver mpay feature parity with modern React/TanStack stack, high test coverage, component-first architecture
- Guardrails: TypeScript strict mode; all components have Storybook stories + Vitest tests; openspec for changes

## Deliverables (top-level)
- Phase 1.5 Core Interaction Components - src/components/{token,transaction,wallet,transfer,security}/ - PeerA ✅
- Phase 2 Wallet Onboarding - TanStack Router flows - PeerA (upcoming)

## Bets & Assumptions
- Bet 1: Component-first approach enables faster iteration | Probe: `pnpm test --run` | Evidence: 620 tests passing | Window: ongoing
- Bet 2: TanStack ecosystem provides type-safe routing and state | Probe: integration tests | Evidence: pending | Window: Phase 2

## Roadmap (Now/Next/Later)
- Now (<= 2 weeks): Wallet onboarding flows - create/recover/backup with TanStack Router; 3-change split in progress
- Next (<= 6 weeks): Asset display, transfer functionality, transaction history
- Later (> 6 weeks): Staking, DWEB/Plaoc integration, multi-language support

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

## Operating Principles (short)
- Falsify before expand; one decidable next step; stop with pride when wrong; Done = evidence.

## Maintenance & Change Log (append-only, one line each)
- 2025-12-10 19:15 | PeerA | Initial POR update after T001 completion | 453 tests, 8 components archived
- 2025-12-10 19:33 | PeerA | T002 complete | 504 tests, 51 new for onboarding create flow
- 2025-12-10 20:04 | PeerB | T002 committed (5cdad62), archived; T003 change scaffolded | spec validated
- 2025-12-10 20:34 | PeerB | T003 committed (07cbf06), archived | 569 tests, 65 new for recover flow
- 2025-12-10 20:37 | PeerB | T004 change scaffolded (add-wallet-backup-verification) | biometrics deferred to Phase 3
- 2025-12-10 20:55 | PeerB | T004 committed (77564e2), archived | 620 tests, 51 new | Phase 2 Onboarding COMPLETE

<!-- Generated on 2025-12-10T10:02:26+00:00 by por_manager.ensure_por 0.1.1 ; template_sha1=7342dc47bce1342e40656c7ab0c32577632e15a2 -->

## Aux Delegations - Meta-Review/Revise (strategic)
Strategic only: list meta-review/revise items offloaded to Aux.
Keep each item compact: what (one line), why (one line), optional acceptance.
Tactical Aux subtasks now live in each task.yaml under 'Aux (tactical)'; do not list them here.
After integrating Aux results, either remove the item or mark it done.
- [ ] None active
