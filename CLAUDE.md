<coding_guidelines>

## ⚠️ 必读：开始开发前

**在进行任何 UI 开发前，请先阅读白皮书必读章节：**

```bash
cat docs/white-book/00-必读/index.md
```

这个文件包含了避免常见错误的关键指引，特别是关于：
- Stackflow 导航系统的正确使用
- 弹出层（Sheet/Modal）的正确实现方式
- 为什么不能使用 Radix Dialog 或 `position: fixed`

---

**短期核心目标：参考mpay代码，实现bioforestChain生态的基础功能：**
这是验收标准：

1. 可以输入任意的密钥来创建bioforestChain生态的钱包：bioforestChain密钥的特殊之处在于它可以是任意字符串，而不是非得是助记词，因此需要一个textarea或者类似textarea的组件可以进行自由输入
2. 可以进行bioforestChain生态的转账
3. 可以进行bioforestChain生态的交易查询
4. bioforestChain生态有多条链，可以通过设置自由配置
   - 需要内置一些现有的几条链的配置，参考mpay，默认配置存储在一个json文件中
   - 设置页面可以配置订阅url，默认是"默认"，也就是本地这个json文件
   - json文件可以下载到多条链，所以我们还需要在这个设置页面提供一个"启用禁用"的功能
   - 还能绕过订阅，手动进行补充：最简单的方式就是手动输入json格式的配置，然后点击"添加"按钮，如果json配置是一个数组，那么就是多条数据、如果是一个obj，那么就是单条数据
   - 单条数据要考虑"版本号（x.y）"+"type"，版本号是为了支持架构更新（通过不同的X-service），type是为了在一个版本中支持多种变体，如果代码更新补充了某种变体，那么小版本y就+1
5. 在设置页面，切换语言的功能要能正常
6. 钱包管理的一整个用户故事要完整闭环，所有涉及到bioforestChain的功能，都要正确移植到我们的service生态
7. 我们的国际国家货币的service的封装也要完成
   - 默认的provider：Frankfurter（推荐，无需密钥）
     1. 实时/最新汇率：https://api.frankfurter.app/latest
     2. 查询特定货币（例如获取欧元兑美元、英镑的汇率）：https://api.frankfurter.app/latest?from=EUR&to=USD,GBP
     3. 默认使用美元，不论用户界面使用什么语言
8. 确保底部的tabs正常吗？会遮挡界面吗？视觉颜色正常吗？文字是否可见，暗色模式呢？
9. 确保与dweb相关的功能也完全迁移了，可以做到完全兼容mpay
10. 正确的可访问性：
    1. 背景和文字颜色没有导致低可读性。
    2. 可以正确切换多国语言
    3. 统一的色彩语言表达

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

# BFM Pay (KeyApp) - AI 开发指南

## 项目概述

BFM Pay 是一个现代化的多链钱包移动应用，是 mpay 的技术重构版本。保留原有功能的同时，在交互、视觉、代码质量和项目管理上进行专业提升。

## 核心文档（按优先级）

| 文档     | 路径                                                   | 用途                                    |
| -------- | ------------------------------------------------------ | --------------------------------------- |
| **白皮书** | `docs/white-book/`                                   | 完整技术文档，涵盖产品、设计、架构、服务、组件、安全、测试、部署 |
| 原始代码 | `/Users/kzf/Dev/bioforestChain/legacy-apps/apps/mpay/` | 参考实现细节                            |

### 白皮书章节速查

| 需求类型 | 参考章节 |
|---------|---------|
| 产品需求、用户故事 | `docs/white-book/01-产品篇/` |
| 交互设计、视觉规范 | `docs/white-book/02-设计篇/` |
| 技术架构、状态管理 | `docs/white-book/03-架构篇/` |
| 服务接口规范 | `docs/white-book/04-服务篇/` |
| 组件规范 | `docs/white-book/05-组件篇/` |
| 安全规范 | `docs/white-book/06-安全篇/` |
| 国际化 | `docs/white-book/07-国际化篇/` |
| 测试策略 | `docs/white-book/08-测试篇/` |
| 部署发布 | `docs/white-book/09-部署篇/` |
| mpay迁移指南 | `docs/white-book/附录/C-mpay迁移指南/` |

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

## 开发阶段

### Phase 1: 基础设施 ✅ 已完成

- [x] 项目初始化 (Vite + React 19)
- [x] Storybook 10.x 组件开发环境
- [x] Vitest 4.x 测试环境
- [x] shadcn/ui 组件库集成
- [x] 基础 UI 组件开发与测试 (363 tests passing)

### Phase 1.5: 核心交互组件（当前）

**活跃 Change**: `add-core-interaction-components`

- [ ] WalletSelector 钱包选择器
- [ ] ChainAddressSelector 链地址选择器
- [ ] TransferConfirmSheet 转账确认弹窗
- [ ] PasswordConfirmSheet 密码确认弹窗
- [ ] MnemonicConfirm 助记词确认
- [ ] TransactionStatus, FeeDisplay, TokenIcon

### Phase 2: 核心功能

- [ ] Stackflow 导航系统
- [ ] TanStack Store 状态管理
- [ ] 钱包创建/导入功能
- [ ] 资产展示功能

### Phase 3: 交易功能

- [ ] 转账功能
- [ ] 收款功能
- [ ] 交易历史

### Phase 4: 高级功能

- [ ] 质押功能
- [ ] DWEB/Plaoc 集成
- [ ] 多语言支持

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

## mpay 关键文件速查

详见 `docs/white-book/附录/C-mpay迁移指南/`，常用参考：

| 功能      | mpay 路径                                         |
| --------- | ------------------------------------------------- |
| 首页      | `pages/home/home.component.ts`                    |
| 转账      | `pages/mnemonic/pages/home-transfer/`             |
| DWEB 授权 | `pages/authorize/pages/signature/`                |
| 钱包存储  | `services/expansion-tools/wallet-data-stroage.ts` |

## 注意事项

- 所有组件必须有 Storybook story
- 所有业务逻辑必须有单元测试
- 使用 TypeScript 严格模式
- 遵循白皮书中的代码规范
</coding_guidelines>
