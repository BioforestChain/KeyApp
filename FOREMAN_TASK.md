# CCCC Pair Foreman Tasks

**Check Interval**: 15 minutes

## Current Phase Goal

**迁移 mpay 核心功能** → 通过分层+测试+多AI监督实现全自动开发

## Periodic Check: mpay Feature Gap Analysis

每个检查周期执行以下闭环：

### Step 1: Identify Gap

对比 `../legacy-apps/apps/mpay/` 与当前实现，识别功能差距：

```bash
# 检查 mpay 的核心功能模块
ls ../legacy-apps/apps/mpay/src/pages/      # mpay 页面列表
ls ../legacy-apps/apps/mpay/src/components/ # mpay 组件列表
ls ../legacy-apps/apps/mpay/src/services/   # mpay 服务列表
```

**输出**: 未迁移的功能列表

### Step 2: Create OpenSpec Change

如果发现功能差距，创建 OpenSpec proposal：

```bash
# 使用 OpenSpec 命令创建变更提案
/openspec:proposal
```

**输出**: `openspec/changes/<change-name>/proposal.md`

### Step 3: Layer Verification

在开发过程中，验证分层原则是否被遵守：

| Layer | Verification | Command |
|-------|-------------|---------|
| **Components** | 每个组件有 Storybook story | `ls src/components/**/*.stories.tsx` |
| **Services** | 每个服务有单元测试 | `pnpm test --run` |
| **Pages** | 每个页面有 E2E 测试 | `pnpm e2e` |

**核心原则**:
- Page 开发者**必须使用**已有 Components，不能重新发明
- 发现 BUG 时，先定位到具体 Layer，在该 Layer 修复并补充测试

### Step 4: Quality Gate

```bash
pnpm typecheck && pnpm lint && pnpm test --run
```

**Pass**: 0 errors，可以继续
**Fail**: 停止功能开发，先修复

## Anti-Patterns to Watch

Peer 互相监督以下 AI 幻觉问题：

| Anti-Pattern | Symptom | Correction |
|--------------|---------|------------|
| **重新发明组件** | Page 中内联定义本应复用的 UI | 检查 `src/components/` 是否已有，没有则先创建组件 |
| **钻牛角尖** | 花大量时间修复边缘 case，忘了主线功能 | 回顾 OpenSpec proposal，聚焦核心需求 |
| **绕过指标** | 修改测试让它通过，而不是修复代码 | 检查测试变更是否合理，而非删除/跳过测试 |
| **信息丢失** | 压缩上下文后忘了之前的决策 | 检查 OpenSpec tasks.md 是否同步更新 |

## Handoff Protocol

切换 Peer 时：

```markdown
## Handoff: [PeerA] → [PeerB]

**mpay Feature Being Migrated**: [具体功能名]
**OpenSpec Change**: [change name]
**Layer Progress**:
- [ ] Components: [完成/进行中/未开始]
- [ ] Services: [完成/进行中/未开始]
- [ ] Pages: [完成/进行中/未开始]

**Blockers**: [如有]
**Next Action**: [下一步具体操作]
```

## Reference

- **mpay 原始代码**: `../legacy-apps/apps/mpay/`
- **技术设计**: `TDD.md`
- **服务规范**: `SERVICE-SPEC.md`
- **变更管理**: `openspec/AGENTS.md`
