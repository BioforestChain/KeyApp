<coding_guidelines>

## ⚠️ 开始开发前 (AI-Native Workflow)

**Schema-first & Issue-Driven Development**

### 1. 需求分析 (Investigate)
在正式开工前，先分析需求并查阅相关白皮书：

```bash
# 生成 RFC 草稿和白皮书推荐
pnpm agent investigate analyze --type <ui|service|page|hybrid> --topic "需求描述"
```

### 2. 任务启动 (Task Start)
**严禁**手动创建 Issue/Branch/Worktree，必须使用自动化工作流：

```bash
# 自动创建 Issue -> Branch -> Worktree -> Draft PR
pnpm agent task start --type <type> --title "Task Title"
```

### 3. 开发循环 (Develop Loop)
进入生成的 Worktree 目录后：

```bash
# 同步进度到 Issue
pnpm agent task sync "- [x] Step 1 done"

# 质量检查 (Pre-commit)
pnpm agent review verify
```

### 4. 完工提交 (Submit)

```bash
# 推送代码并标记 PR 为 Ready
pnpm agent task submit
```

完整指南见 [AGENTS.md](./AGENTS.md)

---

## ⚠️ 类型检查命令 (IMPORTANT)

**必须使用以下命令进行类型检查：**

```bash
# 正确：检查主应用 src/ 目录
pnpm tsc -p tsconfig.app.json --noEmit

# 正确：通过 turbo 检查所有 packages
pnpm typecheck
```

**禁止使用：**
```bash
# 错误！根 tsconfig.json 的 files: [] 为空，不会检查任何文件
pnpm tsc --noEmit
```

---

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

---

## 核心文档

| 文档 | 路径 | 用途 |
|-----|------|------|
| **白皮书** | `docs/white-book/` | 唯一权威技术文档 (Schema-first) |
| **Workflow** | `scripts/agent-flow/` | 自动化工作流源码 |

## 技术栈

- React 19 + Vite 7
- Stackflow (导航) + TanStack (Query + Store + Form)
- shadcn/ui + Tailwind CSS 4.x
- Zod 4.x (Schema-first) + i18next
- Storybook 10.x + Vitest 4.x

## 开发原则

1. **Schema-first**: 先定义 `types.ts` 和 Zod Schema，再写实现。
2. **Issue-Driven**: 没有 Issue 就没有代码。
3. **Worktree-Only**: 所有开发必须在 `.git-worktree/` 下进行。
4. **Test-Driven**: 业务逻辑必须有测试，UI 必须有 Storybook。

</coding_guidelines>
