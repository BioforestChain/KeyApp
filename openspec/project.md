# Project Context

## Purpose

BFM Pay (KeyApp) 是一个现代化的多链钱包移动应用，是 mpay 的技术重构版本。目标是保留原有功能的同时，在交互、视觉、代码质量和项目管理上进行专业提升。

## Tech Stack

| 类别 | 技术 | 版本 |
|-----|------|------|
| 框架 | React | 19.x |
| 构建 | Vite | 6.x |
| 路由 | TanStack Router | 1.x |
| 状态 | TanStack Store | 0.x |
| 数据 | TanStack Query | 5.x |
| 表单 | TanStack Form | 1.x |
| UI | shadcn/ui | latest |
| 样式 | Tailwind CSS | 4.x |
| 验证 | Zod | 4.x |
| 组件文档 | Storybook | 9.x |
| 单元测试 | Vitest | 4.x |
| E2E测试 | Playwright | 1.x |
| 国际化 | i18next | 23.x |

## Project Conventions

### Code Style
- TypeScript 严格模式 (`strict: true`)
- ESLint + Prettier 格式化
- 函数组件 + Hooks，禁止 Class 组件
- 命名规范：
  - 组件: PascalCase (`WalletCard.tsx`)
  - Hooks: camelCase with `use` prefix (`useWallet.ts`)
  - 工具: camelCase (`formatAmount.ts`)
  - 类型: PascalCase (`WalletState`)
  - 常量: SCREAMING_SNAKE_CASE (`MAX_RETRY_COUNT`)

### Architecture Patterns
- 功能模块化 (`features/wallet/`, `features/transfer/`)
- 文件路由 (TanStack Router file-based routing)
- 服务层使用 Adapter 模式 (见 SERVICE-SPEC.md)
- 状态管理：
  - 服务端状态: TanStack Query
  - 客户端状态: TanStack Store
  - 表单状态: TanStack Form

### Testing Strategy
- **组件测试**: Vitest + Testing Library
- **Storybook**: 所有 UI 组件必须有 story
- **覆盖率目标**: 
  - 业务逻辑: 80%+
  - UI 组件: 60%+
- **E2E**: Playwright 覆盖关键用户流程

### Git Workflow
- 主分支: `main`
- 功能分支: `feat/[change-id]`
- 修复分支: `fix/[issue-id]`
- Commit 格式: `type(scope): description`
  - `feat`: 新功能
  - `fix`: Bug 修复
  - `docs`: 文档
  - `test`: 测试
  - `refactor`: 重构

## Domain Context

### 核心概念
- **MainWallet**: 主钱包，由助记词派生，包含多个链地址
- **ChainAddress**: 特定链上的地址，包含公私钥
- **Asset**: 资产，包括原生币和代币
- **Transaction**: 交易，包括转账、合约调用等

### 支持的区块链
- BioforestChain 系列: BFMeta, BTGMeta, ETHMeta, BFChainV2, CCChain, PMChain
- 公链: Ethereum, Tron, Binance Smart Chain, Bitcoin

### DWEB/Plaoc
- 分布式应用运行环境
- 跨应用通讯协议
- 钱包作为服务提供者

## Important Constraints

1. **安全性**
   - 私钥永不离开设备
   - 敏感数据加密存储
   - 无后端服务器存储用户数据

2. **兼容性**
   - 移动端优先设计
   - 支持 PWA
   - DWEB 环境兼容

3. **性能**
   - 首屏加载 < 3s
   - 交互响应 < 100ms
   - Bundle size < 500KB (gzipped)

## External Dependencies

### 区块链库
- `viem`: EVM 链交互
- `tronweb`: Tron 链交互
- `bitcoinjs-lib`: Bitcoin 交互
- `@bnqkl/wallet-base`: BioforestChain 系列

### DWEB
- `@plaoc/is-dweb`: 环境检测
- `@plaoc/plugins`: Plaoc 插件

## 参考文档

| 文档 | 用途 |
|-----|------|
| `PDR.md` | 产品需求（用户故事） |
| `TDD.md` | 技术设计（架构、代码示例） |
| `SERVICE-SPEC.md` | 服务接口规范 |
| mpay 源码 | 原始实现参考（非权威）|
