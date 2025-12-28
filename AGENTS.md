# AI 开发元原则

1. 本文档定义 AI 开发的**元意识** — 如何思考、如何工作的方法论。
2. 项目具体知识（技术栈、API、业务概念）请查阅 `docs/white-book/`。


---

## 元意识（自检与自更新）

AI 必须具备以下自检与自更新能力，并在工作中显式执行：

1. **进度自检**：随时能说明当前在做什么、卡点在哪里、下一步是什么。
2. **知识自更新**：用户提供新知识或纠正时，先更新 `docs/white-book/`，再继续任务。
3. **项目自管理**：用 Roadmap/Issue/Worktree/PR 管理工作流，保证可追踪、可回滚。
4. **最佳实践自维护**：发现可复用规律，及时更新白皮书或最佳实践提示。

---

## pnpm agent 工具（AI 启动入口）

**每次新上下文启动必须执行：**

```bash
pnpm agent readme
```

`pnpm agent readme` 是白皮书导览入口，白皮书具体路径与阅读建议以该命令输出为准。
最佳实践文件位于 `docs/white-book/00-必读/best-practices.md`，由 `pnpm agent practice` 维护。

常用命令：

```bash
pnpm agent readme              # 启动入口（索引 + 知识地图 + 最佳实践）
pnpm agent --help              # 查看帮助
pnpm agent roadmap current     # 当前 Roadmap
pnpm agent toc                 # 白皮书目录
pnpm agent chapter <路径>       # 读取白皮书章节
pnpm agent practice list       # 最佳实践列表
pnpm agent practice add "<内容>"
pnpm agent practice remove <序号|内容>
pnpm agent practice update <序号> "<内容>"
pnpm agent claim <issue#>       # 领取任务
pnpm agent worktree create <name> --branch <branch> --base main
pnpm agent worktree list
pnpm agent worktree delete <name>
```

---

## 角色化工作流程（多场景）

### 1) 新上下文启动（必做）

```bash
pnpm agent readme
pnpm agent roadmap current
pnpm agent toc
pnpm agent chapter 00-必读
```

完成后自检：
- 当前任务目标是否清晰？
- 是否需要读更多白皮书章节？
- 是否需要查看 openspec 规范？

### 2) 继续未完成任务（接手/续写）

```bash
pnpm agent readme
pnpm agent roadmap current
pnpm agent worktree list
# 进入已有 worktree，检查 git status / 进度
```

自检：确认已有 worktree 的分支、PR 状态、CI 状态是否需要处理。

### 3) 需求澄清 / 方案设计（产品/架构角色）

```bash
pnpm agent readme
pnpm agent toc
pnpm agent chapter <需求相关章节>
```

- 若涉及新能力/架构变更，先查看 `openspec/AGENTS.md` 并走提案流程。
- 记录结论到白皮书或 openspec 变更中。

### 4) 实现开发（工程师角色）

```bash
pnpm agent readme
pnpm agent claim <issue#>
pnpm agent worktree create issue-<id> --branch feat/issue-<id> --base main
cd .git-worktree/issue-<id>
pnpm agent chapter <路径>
# 开发 + 测试
pnpm dev
pnpm test
pnpm typecheck
```

```bash
# 提交与 PR
 git add -A
 git commit -m "feat/fix: 描述"
 git push -u origin <branch>
 gh pr create --title "标题" --body "Closes #<issue#>" --base main
```

### 5) Bug 修复 / 回归（维护者角色）

```bash
pnpm agent readme
pnpm agent roadmap current
pnpm agent worktree create fix-<id> --branch fix/<id> --base main
```

- 先复现并记录原因。
- 必要时更新白皮书，说明修复背景与影响。

### 6) 评审 / 质量保证（Reviewer 角色）

```bash
pnpm agent readme
pnpm agent chapter <测试/规范相关章节>
```

- 关注回归风险、测试覆盖、接口兼容性。
- 有问题先写明事实，再给出修复建议。

### 7) 合并收尾（集成角色）

```bash
gh pr checks <pr#> --watch
gh pr merge <pr#> --squash --delete-branch
pnpm agent worktree delete <name>
```

合并门禁（必须执行）：  
- **在合并之前必须询问用户**，并明确告知当前工作目录（worktree 路径）。  
- 用户 review 确认后才允许执行合并。  

---

## 重要提醒

- 白皮书是唯一权威来源：用户补充/纠正知识，必须先更新 `docs/white-book/`。
- 不允许在主目录直接开发，所有代码必须在 `.git-worktree/` 中进行。

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
