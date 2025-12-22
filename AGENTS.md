# KeyApp AI 开发入口

## AI 开发工作流

```
┌─────────────────────────────────────────────────────────────────────┐
│                         开发闭环                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. 获取全部     pnpm agent                                          │
│       ↓         (规则 + 知识地图 + 当前任务列表)                       │
│  2. 领取任务     pnpm agent --claim 28                               │
│       ↓         (自动分配 + 显示 worktree 命令)                       │
│  3. 创建分支     git worktree add .git-worktree/issue-28 ...         │
│       ↓                                                              │
│  4. 开发代码     (参考白皮书: pnpm agent --chapter <路径>)             │
│       ↓                                                              │
│  5. 提交 PR      gh pr create --body "Closes #28"                    │
│       ↓         (PR 自动关联 Issue)                                   │
│  6. 合并后       Issue 自动关闭，Project 状态更新                      │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│  发现新问题?     pnpm agent --create "问题描述" --category bug        │
│                 (自动设置 roadmap 版本)                               │
└─────────────────────────────────────────────────────────────────────┘
```

## 命令速查

```bash
pnpm agent                              # 规则 + 知识地图 + 当前任务
pnpm agent --claim 28                   # 领取任务
pnpm agent --create "标题" --roadmap v1  # 创建任务（自动设置版本）
pnpm agent --chapter 03-架构篇/03-导航系统  # 查阅白皮书
pnpm agent --stats                      # 查看进度统计
```

## Roadmap

GitHub Project：https://github.com/orgs/BioforestChain/projects/5

| 版本 | 说明 |
|-----|------|
| **V1** | 当前核心目标（bioforestChain 生态基础功能） |
| V2/V3 | 后续版本 |
| DRAFT | 草案/探索/待定 |

别名：`CURRENT` -> V1, `NEXT` -> V2

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

# BFM Pay (KeyApp) - AI 开发指南

## 项目概述

BFM Pay 是一个现代化的多链钱包移动应用，是 mpay 的技术重构版本。保留原有功能的同时，在交互、视觉、代码质量和项目管理上进行专业提升。

## 核心文档（按优先级）

| 文档     | 路径                                                   | 用途                                    |
| -------- | ------------------------------------------------------ | --------------------------------------- |
| **白皮书** | `docs/white-book/`                                   | 完整技术文档，涵盖产品、设计、架构、服务、组件、安全、测试、部署 |
| 原始代码 | `/Users/kzf/Dev/bioforestChain/legacy-apps/apps/mpay/` | 参考实现细节                            |

## 开发原则

### 1. 文档优先级

```
白皮书 (docs/white-book/) > mpay 原始代码
```

当文档与原始代码冲突时，以白皮书为准。

### 2. 开发工作流（重要）

**任何开发任务开始前，必须按以下顺序执行：**

1. **更新白皮书** - 如果需要新增功能或修改现有设计，先更新对应的白皮书章节
2. **创建 openspec change** - 基于白皮书内容，创建具体的变更提案
3. **开始编码** - 根据 openspec 的 tasks.md 执行开发

### 3. 原始代码参考原则

- **参考，而非复制**：理解业务逻辑，不要盲目复制 Angular 代码
- **质疑原始实现**：mpay 可能有 Bug、过时模式或未完成功能
- **现代化改进**：使用 TypeScript 类型安全、TanStack 生态、函数组件

### 4. 技术栈

- React 19 + Vite 7
- Stackflow (导航) + TanStack (Query + Store + Form)
- shadcn/ui + Tailwind CSS 4.x
- Zod 4.x + i18next
- Storybook 10.x + Vitest 4.x

## 工作流程

### 0. Git Worktree 工作环境（重要）

**所有编码工作必须在 `.git-worktree/` 目录下的独立 worktree 中进行。** 主目录始终保持在 main 分支上，保持干净。

**完整工作流程示例：**

```bash
# 1. 在主目录创建 worktree（以功能名命名分支）
cd /path/to/KeyApp
git worktree add .git-worktree/<feature-name> -b <branch-name>

# 2. 进入 worktree 目录进行开发
cd .git-worktree/<feature-name>
pnpm install  # 首次需要安装依赖

# 3. 开发完成后，在 worktree 中提交代码
git add -A
git commit -m "feat/fix: 描述"

# 4. 推送分支并创建 PR（使用 gh 命令）
git push -u origin <branch-name>
gh pr create --title "PR 标题" --body "PR 描述" --base main

# 5. 合并 PR 到 main（CI 检查通过后）
gh pr merge --squash --delete-branch

# 6. 回到主目录，更新 main 分支
cd ../..  # 回到项目根目录
git pull origin main

# 7. 清理 worktree
git worktree remove .git-worktree/<feature-name>
```

**Worktree 优势**：
- 隔离开发环境，避免相互干扰
- 可同时进行多个功能开发
- 主目录保持干净，便于代码审查
- main 分支受保护，必须通过 PR 合并

**注意事项**：
- 主目录（项目根目录）始终保持在 main 分支，不要在主目录直接修改代码
- 所有开发工作都在 `.git-worktree/` 子目录中进行
- 使用 `gh` CLI 工具来创建和合并 PR
- PR 合并后记得清理对应的 worktree

### 1. 开始新功能前
   - 先更新 `docs/white-book/` 相关章节（如需要）
   - 阅读 `openspec/` 下的相关 spec
   - 检查 `openspec/changes/` 是否有进行中的变更
   - 创建 change proposal（如适用）
   - **在 `.git-worktree/` 下创建新的 worktree**

### 2. 开发时
   - 先写 Storybook story
   - 再写 Vitest 测试
   - 最后实现组件
   - 确定所有测试都通过了,必要时需要更新e2e截图(必须查看截图内容确保符合预期)

### 3. 完成后
   - 确保所有测试通过（`pnpm test`）
   - 确保类型检查通过（`pnpm typecheck`）
   - 更新 tasks.md 状态
   - 在 worktree 中提交代码
   - 推送分支：`git push -u origin <branch-name>`
   - 创建 PR：`gh pr create --title "标题" --body "描述" --base main`
   - 等待 CI 检查通过
   - 合并 PR：`gh pr merge --squash --delete-branch`
   - 回到主目录更新 main：`cd ../.. && git pull origin main`
   - 清理 worktree：`git worktree remove .git-worktree/<feature-name>`

## 注意事项

- 所有组件必须有 Storybook story
- 所有业务逻辑必须有单元测试
- 使用 TypeScript 严格模式
- 遵循白皮书中的代码规范
- POR/TUI 本地工具解析 `docs/por/T*/task.yaml` 需要 `python -m pip install --user pyyaml`
