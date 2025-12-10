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
| 产品需求 | `PDR.md`                                               | 理解"做什么"和"为什么" - 用户故事、流程 |
| 技术设计 | `TDD.md`                                               | 理解"怎么做" - 技术栈、架构、代码示例   |
| 服务接口 | `SERVICE-SPEC.md`                                      | 链服务适配器接口规范                    |
| 原始代码 | `/Users/kzf/Dev/bioforestChain/legacy-apps/apps/mpay/` | 参考实现细节                            |

## 开发原则

### 1. 文档优先级

```
TDD.md > PDR.md > SERVICE-SPEC.md > mpay 原始代码
```

当文档与原始代码冲突时，以文档为准。

### 2. 原始代码参考原则

- **参考，而非复制**：理解业务逻辑，不要盲目复制 Angular 代码
- **质疑原始实现**：mpay 可能有 Bug、过时模式或未完成功能
- **现代化改进**：使用 TypeScript 类型安全、TanStack 生态、函数组件

### 3. 技术栈

- React 19 + Vite 7
- TanStack (Router + Query + Store + Form)
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

- [ ] TanStack Router 路由系统
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

1. **开始新功能前**
   - 阅读 `openspec/` 下的相关 spec
   - 检查 `openspec/changes/` 是否有进行中的变更
   - 创建 change proposal（如适用）

2. **开发时**
   - 先写 Storybook story
   - 再写 Vitest 测试
   - 最后实现组件

3. **完成后**
   - 确保所有测试通过
   - 更新 tasks.md 状态
   - 运行 `openspec validate --strict`

## mpay 关键文件速查

详见 `TDD.md` 附录 A，常用参考：

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
- 遵循 TDD.md 中的代码规范
