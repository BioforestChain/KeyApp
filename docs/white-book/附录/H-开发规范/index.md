# 开发规范

> 代码提交、分支管理、工作流程的规范

---

## Git Worktree 工作流

**所有编码工作必须在 `.git-worktree/` 目录下进行。**

主目录始终保持在 main 分支，保持干净。

### 完整流程

```bash
# 1. 创建 worktree
pnpm agent worktree create <feature-name> --branch <branch-name> --base main

# 2. 进入 worktree 开发
cd .git-worktree/<feature-name>

# 3. 开发完成后提交
git add -A
git commit -m "feat/fix: 描述"

# 4. 推送并创建 PR
git push -u origin <branch-name>
gh pr create --title "标题" --body "Closes #issue编号" --base main

# 5. CI 通过后合并
gh pr merge --squash --delete-branch

# 6. 回主目录更新
cd ../..
git pull origin main

# 7. 清理 worktree
pnpm agent worktree delete <feature-name>
```

> 注意：`pnpm agent worktree create` 会在仓库根目录查找 `.env.local`，缺失则直接报错并停止。
> `pnpm agent worktree delete` 会通过 `gh` 校验 PR 合并状态，未合并需要显式 `--force`。
> 分支命名必须以 `feat/`、`fix/`、`docs/`、`test/`、`refactor/`、`chore/`、`ci/`、`openspec/` 或 `release/` 开头。

### 为什么用 Worktree

- 隔离开发环境，避免分支切换污染
- 可同时进行多个功能开发
- main 分支受保护，必须通过 PR 合并

---

## PR 规范

### 标题格式

```
<type>(<scope>): <description>
```

类型：
- `feat` - 新功能
- `fix` - 修复
- `docs` - 文档
- `refactor` - 重构
- `test` - 测试
- `chore` - 构建/工具

### 自动关联 Issue

在 PR body 中使用：
```
Closes #28
```

---

## 命令速查

```bash
pnpm agent                    # 项目知识 + 当前任务
pnpm agent claim 28           # 领取任务
pnpm agent chapter <路径>     # 查阅白皮书
pnpm agent stats              # 进度统计
pnpm agent worktree list      # 查看 worktree 状态

pnpm dev                      # 启动开发服务器
pnpm test                     # 运行单元测试
pnpm typecheck                # 类型检查
pnpm lint                     # 代码检查
```

---

## 技术栈

| 类别 | 技术 |
|-----|------|
| 框架 | React 19 + Vite 7 |
| 导航 | Stackflow |
| 状态 | TanStack Store |
| 数据 | TanStack Query |
| 表单 | TanStack Form + Zod 4 |
| UI | shadcn/ui + Tailwind CSS 4 |
| 测试 | Vitest + Playwright |
| 国际化 | i18next |
