# AI 开发元原则 (AI-Native Workflow 3.0)

1. **Schema-first**: 一切服务与数据结构设计，始于 Schema (Zod) 定义。
2. **Issue-Driven**: 每一个改动都对应一个 Issue，每一个执行都对应一个 PR。
3. **Full-Lifecycle**: 从 `investigate` 到 `document`，全流程自动化。

项目具体知识（技术栈、API、业务概念）请查阅 `docs/white-book/`。

---

## pnpm agent 工具体系

我们不再手动执行 git 命令，而是通过 `pnpm agent` 驱动全生命周期。

### 核心工作流

| 阶段 | 命令 | 作用 |
|------|------|------|
| **1. 调查** | `pnpm agent investigate analyze --type <type> --topic "..."` | 分析需求，阅读白皮书，生成 RFC |
| **2. 启动** | `pnpm agent task start --type <type> --title "..."` | 创建 Issue/Branch/Worktree/Draft PR |
| **3. 同步** | `pnpm agent task sync "..."` | 将本地进度同步到 GitHub Issue |
| **4. 检查** | `pnpm agent review verify` | 运行 Lint/Typecheck/Test |
| **5. 提交** | `pnpm agent task submit` | 推送代码，标记 PR 为 Ready |
| **6. 文档** | `pnpm agent document sync` | 检查变更，推荐白皮书更新 |

### 辅助工具

```bash
pnpm agent readme              # 白皮书导览
pnpm agent search "keyword"    # 搜索白皮书
pnpm agent chapter <path>      # 阅读章节
pnpm agent roadmap current     # 查看当前任务
```

---

## 角色化工作流程

### 1) 需求澄清 (Investigate)

**场景**: 收到模糊需求，或需要进行架构设计。

```bash
# 1. 分析需求 & 查阅白皮书
pnpm agent investigate analyze --type service --topic "New Auth Service"

# 2. (可选) 搜索更多资料
pnpm agent search "authentication"
```

### 2) 任务开发 (Task Loop)

**场景**: 开始编码实现。

```bash
# 1. 启动任务 (自动环境准备)
pnpm agent task start --type service --title "Implement Auth Service"
# -> 输出: cd .git-worktree/issue-123

# 2. 进入开发环境
cd .git-worktree/issue-123

# 3. 开发循环
# ... coding ...
pnpm agent task sync "- [x] Schema defined" 
# ... coding ...
pnpm agent review verify
```

### 3) 完工交付 (Submit)

**场景**: 代码完成，准备 Review。

```bash
# 1. 最后一次检查
pnpm agent review checklist --type service
pnpm agent review verify

# 2. 提交 & 触发 CI
pnpm agent task submit
```

### 4) 维护者 (Reviewer/Integrator)

**场景**: Review 代码或合并 PR。

```bash
# 1. 检查文档一致性
pnpm agent document sync

# 2. 合并 PR (使用 gh cli)
gh pr merge <pr#> --squash --delete-branch
```

---

## 任务类型 (Type)

- `ui`: 组件库、UI 交互 (自动关联 Storybook 检查)
- `service`: 业务逻辑、API (自动关联 Unit Test 检查)
- `page`: 页面路由、导航 (自动关联 Router 配置)
- `hybrid`: 混合开发 (通用模板)

---

## 重要提醒

- **白皮书是唯一权威**: 开发前必读相关章节 (`investigate` 会自动推荐)。
- **严禁主目录开发**: 必须使用 `task start` 创建的 Worktree。
- **Schema-first**: 服务开发必须先定义 `types.ts`。

<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->
