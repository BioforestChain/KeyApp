# CCCC Pair Foreman Tasks

**Check Interval**: 15 minutes

## Current Phase Goal

**迁移 mpay 核心功能** → 通过分层+测试+多AI监督实现全自动开发

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

## 开发工作流（重要）

**任何开发任务开始前，必须按以下顺序执行：**

1. **更新白皮书** - 如果需要新增功能或修改现有设计，先更新 `docs/white-book/` 对应章节
2. **创建 openspec change** - 基于白皮书内容，创建具体的变更提案
3. **创建 Git Worktree** - 在 `.git-worktree/` 下创建独立工作目录
4. **开始编码** - 在 worktree 中根据 openspec 的 tasks.md 执行开发

### Git Worktree 工作环境

**所有编码工作必须在 `.git-worktree/` 目录下的独立 worktree 中进行：**

```bash
# 创建新的 worktree（以功能名命名）
git worktree add .git-worktree/<feature-name> -b <branch-name>

# 进入 worktree 目录进行开发
cd .git-worktree/<feature-name>
pnpm install  # 安装依赖

# 开发完成后，回到主目录合并
cd ../..  # 回到项目根目录
git checkout main
git merge --no-ff <branch-name>

# 清理 worktree
git worktree remove .git-worktree/<feature-name>
```

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

### Step 2: Update White Book (新增)

如果发现功能差距，首先更新白皮书：

```bash
# 更新对应的白皮书章节
# 例如：新增服务接口 → 更新 docs/white-book/04-服务篇/
# 例如：新增组件 → 更新 docs/white-book/05-组件篇/
```

**输出**: 更新后的白皮书章节

### Step 3: Create OpenSpec Change

基于白皮书内容，创建 OpenSpec proposal：

```bash
# 使用 OpenSpec 命令创建变更提案
/openspec:proposal
```

**输出**: `openspec/changes/<change-name>/proposal.md`

### Step 4: Layer Verification

在开发过程中，验证分层原则是否被遵守：

| Layer          | Verification                                  | Command                              |
| -------------- | --------------------------------------------- | ------------------------------------ |
| **Components** | 每个组件有 Storybook story                    | `ls src/components/**/*.stories.tsx` |
| **Services**   | 每个服务有单元测试                            | `pnpm test --run`                    |
| **Pages**      | 每个页面有 E2E 测试，并且有移动设备尺寸的截图 | `pnpm e2e`                           |

**核心原则**:

- Page 开发者**必须使用**已有 Components，不能重新发明
- 发现 BUG 时，先定位到具体 Layer，在该 Layer 修复并补充测试

### Step 5: Quality Gate

```bash
pnpm typecheck && pnpm lint && pnpm test --run
```

**Pass**: 0 errors，可以继续
**Fail**: 停止功能开发，先修复

## Anti-Patterns to Watch

Peer 互相监督以下 AI 幻觉问题：

| Anti-Pattern     | Symptom                               | Correction                                        |
| ---------------- | ------------------------------------- | ------------------------------------------------- |
| **重新发明组件** | Page 中内联定义本应复用的 UI          | 检查 `src/components/` 是否已有，没有则先创建组件 |
| **钻牛角尖**     | 花大量时间修复边缘 case，忘了主线功能 | 回顾 OpenSpec proposal，聚焦核心需求              |
| **绕过指标**     | 修改测试让它通过，而不是修复代码      | 检查测试变更是否合理，而非删除/跳过测试           |
| **信息丢失**     | 压缩上下文后忘了之前的决策            | 检查 OpenSpec tasks.md 是否同步更新               |
| **跳过白皮书**   | 直接编码而不先更新文档                | 确保先更新白皮书，再创建 openspec                 |

## Handoff Protocol

切换 Peer 时：

```markdown
## Handoff: [PeerA] → [PeerB]

**mpay Feature Being Migrated**: [具体功能名]
**White Book Updated**: [是/否，更新了哪些章节]
**OpenSpec Change**: [change name]
**Layer Progress**:

- [ ] Components: [完成/进行中/未开始]
- [ ] Services: [完成/进行中/未开始]
- [ ] Pages: [完成/进行中/未开始]

**Blockers**: [如有]
**Next Action**: [下一步具体操作]
```

## Reference

- **白皮书**: `docs/white-book/`
- **mpay 原始代码**: `../legacy-apps/apps/mpay/`
- **mpay迁移指南**: `docs/white-book/附录/C-mpay迁移指南/`
- **变更管理**: `openspec/AGENTS.md`
