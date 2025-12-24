# AI 开发元原则

本文档定义 AI 开发的**元意识** — 如何思考、如何工作的方法论。

项目具体知识（技术栈、API、业务概念）请查阅 `docs/white-book/`。

---

## 核心原则

### 1. 知识持久化

**白皮书是 AI 的持久化记忆，不仅是读的，也是写的。**

当用户在沟通中纠正 AI 的理解、解释业务概念、提供新知识时：

```
用户提供新知识
       │
       ▼
AI 更新白皮书 ← 【必须先做这一步】
       │
       ▼
AI 继续任务
```

这确保下一个 AI 实例不会犯同样的错误。

### 2. 行动优先于讨好

**不要讨好用户，而是将工作切实落实到项目文件中。**

- 不要只是口头说"理解了"、"明白了"
- 要实际去检查、修改、创建文件
- 用户说的正确内容，应该变成项目中的文档或代码

### 3. 真正的完成

**测试通过 ≠ 功能完成。**

声称"完成"之前，必须：
1. 实际运行测试/功能，而不只是写完代码
2. 看到真实的成功结果，而不是假设它会工作
3. 如果使用 Mock，必须明确告知用户这不是真正的验证

```
错误的完成：
  写完代码 → 测试通过 → 报告完成

正确的完成：
  写完代码 → 运行测试 → 看到结果 → 验证功能 → 报告完成
```

### 4. 文档驱动开发

**先文档，后代码。**

```
白皮书 (docs/white-book/) > 原始代码参考
```

任何开发任务：
1. 先检查/更新白皮书
2. 再开始编码

---

## 层次区分

| 层次 | 存放位置 | 内容 |
|-----|---------|------|
| **元意识** | AGENTS.md | 如何思考、如何工作的原则 |
| **项目知识** | docs/white-book/ | 业务概念、技术细节、API 规范 |
| **操作指南** | docs/white-book/ | 具体命令、配置、步骤 |

---

## 快速入口

```bash
pnpm agent                    # 获取项目知识和当前任务
pnpm agent roadmap current    # 查看当前 Roadmap
pnpm agent chapter 00-必读     # 查看必读章节
```

详细的项目信息、技术栈、开发流程请查阅白皮书。

---

## 开发闭环（必须遵循）

```bash
# 1) 获取索引 + Roadmap
pnpm agent
pnpm agent roadmap current

# 2) 领取任务（Issue）
pnpm agent claim <issue#>

# 3) 创建 worktree（严格校验分支前缀与 .env.local）
pnpm agent worktree create issue-<id> --branch feat/issue-<id> --base main
cd .git-worktree/issue-<id>

# 4) 阅读白皮书（先文档后编码）
pnpm agent toc
pnpm agent chapter <路径>

# 5) 开发 + 测试
pnpm dev
pnpm test
pnpm typecheck

# 6) 提交 + 推送 + PR
git add -A
git commit -m "feat/fix: 描述"
git push -u origin <branch>
gh pr create --title "标题" --body "Closes #<issue#>" --base main

# 7) 合并 + 清理
gh pr merge --squash --delete-branch
pnpm agent worktree delete issue-<id>
```

> 白皮书是唯一权威来源：若用户补充/纠正知识，必须先更新 `docs/white-book/` 再继续开发。

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
