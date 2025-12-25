<coding_guidelines>

## ⚠️ 开始开发前

```bash
# 1. 获取索引（最佳实践 + 知识地图）
pnpm agent readme

# 2. 查看当前任务
pnpm agent roadmap current

# 3. 查阅白皮书必读章节
pnpm agent chapter 00-必读
```

完整工作流和命令速查见 [AGENTS.md](./AGENTS.md)

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
| **白皮书** | `docs/white-book/` | 完整技术文档 |
| **mpay 原始代码** | `/Users/kzf/Dev/bioforestChain/legacy-apps/apps/mpay/` | 参考实现 |

**优先级**: 白皮书 > mpay 原始代码

## 技术栈

- React 19 + Vite 7
- Stackflow (导航) + TanStack (Query + Store + Form)
- shadcn/ui + Tailwind CSS 4.x
- Zod 4.x + i18next
- Storybook 10.x + Vitest 4.x

## 开发原则

- **参考而非复制** mpay 代码
- **质疑原始实现**（可能有 Bug 或过时模式）
- **现代化改进**（TypeScript 类型安全、函数组件）

## Git Worktree 工作流

所有编码工作必须在 `.git-worktree/` 目录下进行：

```bash
pnpm agent worktree create issue-28 --branch feat/issue-28
cd .git-worktree/issue-28
# 开发...
gh pr create --body "Closes #28"
```

## 注意事项

- 所有组件必须有 Storybook story
- 所有业务逻辑必须有单元测试
- 使用 TypeScript 严格模式
- PR 描述使用 `Closes #issue编号` 自动关联任务
- 合并前必须告知当前 worktree 路径并征求用户确认

</coding_guidelines>
