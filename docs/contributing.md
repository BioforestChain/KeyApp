# 贡献指南

本文档为开发者和贡献者提供项目开发、部署和贡献的详细指南。

## 快速开始

### 环境要求

- Node.js 20+
- pnpm 9+
- Git

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/BioforestChain/KeyApp.git
cd KeyApp

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 启动 Storybook
pnpm storybook

# 启动文档站点
pnpm docs:dev
```

### 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 (端口 5173) |
| `pnpm dev:mock` | 使用 Mock 服务启动 (端口 5174) |
| `pnpm build` | 构建生产版本 |
| `pnpm test` | 运行单元测试 |
| `pnpm test:storybook` | 运行 Storybook 测试 |
| `pnpm storybook` | 启动 Storybook (端口 6006) |
| `pnpm typecheck` | TypeScript 类型检查 |
| `pnpm lint` | 代码检查 |
| `pnpm docs:dev` | 启动文档站点 (端口 5200) |

## 项目结构

```
KeyApp/
├── src/                    # 应用源码
│   ├── components/         # React 组件
│   ├── pages/              # 页面组件
│   ├── stores/             # 状态管理 (TanStack Store)
│   ├── services/           # 平台服务抽象
│   ├── routes/             # 路由配置 (TanStack Router)
│   ├── i18n/               # 国际化
│   ├── styles/             # 全局样式
│   ├── test/               # 测试工具
│   └── types/              # TypeScript 类型定义
├── docs/                   # VitePress 文档站点
│   ├── .vitepress/         # VitePress 配置
│   └── public/             # 静态资源
├── .storybook/             # Storybook 配置
├── e2e/                    # E2E 测试 (Playwright)
└── scripts/                # 构建脚本
```

## Fork 与自定义部署

### GitHub Pages 部署

Fork 本项目后，可以通过 **仓库变量** 自定义部署配置，无需修改任何代码。

#### 配置步骤

1. Fork 本仓库
2. 进入仓库 Settings → Secrets and variables → Actions → Variables
3. 添加以下变量（按需）：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `VITEPRESS_BASE` | 站点 base path | `/` 或 `/my-app/` |

#### 默认行为

如果不设置 `VITEPRESS_BASE` 变量，默认使用 `/{repo_name}/`（如 `/KeyApp/`）。

#### 自定义域名

使用自定义域名时，设置 `VITEPRESS_BASE=/`：

1. 添加仓库变量 `VITEPRESS_BASE` 值为 `/`
2. 在 DNS 提供商配置 CNAME 记录指向 `{username}.github.io`
3. 在仓库 Settings → Pages 中配置自定义域名

### 构建产物

CI/CD 会自动构建以下产物：

| 路径 | 说明 |
|------|------|
| `/` | VitePress 文档站点 |
| `/webapp/` | Web 应用（稳定版） |
| `/webapp-dev/` | Web 应用（测试版） |
| `/storybook/` | Storybook 组件文档 |

## 开发规范

### 组件开发流程

1. **创建 Story** - 先在 Storybook 中定义组件的各种状态
2. **编写测试** - 使用 Vitest 编写单元测试
3. **实现组件** - 开发 React 组件
4. **类型检查** - 运行 `pnpm typecheck` 确保类型安全

### 文件命名规范

```
component-name.tsx          # 组件实现
component-name.stories.tsx  # Storybook stories
component-name.test.tsx     # 单元测试
```

### TypeScript 严格模式

项目启用了 TypeScript 严格模式，包括：

- `strict: true`
- `noUncheckedIndexedAccess: true`
- `exactOptionalPropertyTypes: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`

### 代码风格

- 使用 Prettier 格式化代码
- 使用 oxlint 进行代码检查
- 组件使用函数式写法
- 优先使用 TypeScript 类型推断

## 服务实现

项目支持多平台服务实现，通过环境变量 `SERVICE_IMPL` 切换：

| 值 | 说明 |
|----|------|
| `web` | 浏览器环境（默认） |
| `dweb` | DWEB/Plaoc 平台 |
| `mock` | 测试/开发环境 |

```bash
# 使用 Mock 服务开发
SERVICE_IMPL=mock pnpm dev

# 构建 DWEB 版本
SERVICE_IMPL=dweb pnpm build
```

## 测试

### 单元测试

```bash
# 运行所有单元测试
pnpm test

# 运行特定文件
pnpm test src/components/common/button.test.tsx

# 生成覆盖率报告
pnpm test:coverage
```

### Storybook 测试

```bash
# 运行 Storybook 组件测试
pnpm test:storybook
```

### E2E 测试

```bash
# 运行 E2E 测试
pnpm e2e

# 带 UI 的 E2E 测试
pnpm e2e:ui
```

## 提交规范

### Commit Message 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型**：
- `feat` - 新功能
- `fix` - Bug 修复
- `docs` - 文档更新
- `style` - 代码格式（不影响功能）
- `refactor` - 重构
- `test` - 测试相关
- `chore` - 构建/工具相关

### Pull Request

1. Fork 仓库并创建功能分支
2. 确保所有测试通过：`pnpm test && pnpm typecheck`
3. 提交 PR 到 `main` 分支
4. 等待 CI 检查通过和代码审查

## 发布流程

### Beta 发布

每次推送到 `main` 分支会自动触发 Beta 发布：
- 构建并部署到 GitHub Pages
- 创建/更新 `beta` release

### 稳定版发布

创建版本标签触发稳定版发布：

```bash
git tag v1.0.0
git push origin v1.0.0
```

## 常见问题

### TypeScript 类型错误

如果遇到 `exactOptionalPropertyTypes` 相关错误，确保可选属性不要显式传递 `undefined`：

```tsx
// ❌ 错误
<Component prop={undefined} />

// ✅ 正确 - 省略属性
<Component />

// ✅ 或者类型定义允许 undefined
interface Props {
  prop?: string | undefined
}
```

### 本地开发 base path

本地开发默认使用 `/`，无需配置。生产构建时通过环境变量设置：

```bash
VITE_BASE_URL=/my-path/ pnpm build
```

## 获取帮助

- [GitHub Issues](https://github.com/BioforestChain/KeyApp/issues) - 报告 Bug 或功能请求
- [GitHub Discussions](https://github.com/BioforestChain/KeyApp/discussions) - 讨论和问答
