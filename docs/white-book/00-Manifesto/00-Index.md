# KeyApp 技术文档索引

> 这是一份 AI-First 的技术文档，旨在作为代码库的 **Digital Twin**。

## 设计哲学

本文档的第一读者是 **AI Agent**，目标是让 AI 能够：
1. 完整理解系统架构和设计意图
2. 准确定位任何功能的实现位置
3. 独立完成开发、调试和重构任务
4. 在必要时从文档重建整个代码库

---

## 文档结构

### 📘 参考手册 (Reference)

| 编号 | 书名 | 目录 | 内容 |
|------|------|------|------|
| 01 | [Kernel Reference](../01-Kernel-Ref/README.md) | `01-Kernel-Ref/` | 小程序运行时内核 |
| 02 | [Driver Reference](../02-Driver-Ref/README.md) | `02-Driver-Ref/` | 链适配器/Provider |
| 03 | [UI Reference](../03-UI-Ref/README.md) | `03-UI-Ref/` | 组件库 (114个组件) |
| 04 | [Platform Reference](../04-Platform-Ref/README.md) | `04-Platform-Ref/` | 平台服务 |
| 05 | [State Reference](../05-State-Ref/00-Index.md) | `05-State-Ref/` | 状态管理 |
| 06 | [Service Reference](../06-Service-Ref/00-Index.md) | `06-Service-Ref/` | 服务层 (35个服务) |

### 📗 开发指南 (Guide)

| 编号 | 书名 | 目录 | 内容 |
|------|------|------|------|
| 10 | [Wallet Guide](../10-Wallet-Guide/README.md) | `10-Wallet-Guide/` | 钱包功能开发 |
| 11 | [DApp Guide](../11-DApp-Guide/README.md) | `11-DApp-Guide/` | DApp 集成 |
| 12 | [Shell Guide](../12-Shell-Guide/00-Navigation-Map.md) | `12-Shell-Guide/` | 页面导航 (61个页面) |

### 📕 运维手册 (Operations)

| 编号 | 书名 | 目录 | 内容 |
|------|------|------|------|
| 90 | [DevOps](../90-DevOps/README.md) | `90-DevOps/` | 构建/测试/部署 |
| 99 | [Documentation Guide](../99-Documentation-Guide/README.md) | `99-Documentation-Guide/` | 文档规范 |

---

## 代码库统计

| 类别 | 数量 | 覆盖率 |
|------|------|--------|
| 组件 (TSX) | 114 | 100% |
| 服务 (TS) | 160 | 100% |
| 页面 (Activities) | 31 | 100% |
| 弹窗 (Sheets) | 27 | 100% |
| Stores | 10 | 100% |
| Queries | 10 | 100% |

---

## 源码映射

```
src/
├── components/           → 03-UI-Ref/
│   ├── ui/              → 03-UI-Ref/02-Primitives/
│   ├── common/          → 03-UI-Ref/03-Composites/
│   ├── layout/          → 03-UI-Ref/03-Composites/
│   ├── wallet/          → 03-UI-Ref/04-Domain/01-Wallet-Asset.md
│   ├── asset/           → 03-UI-Ref/04-Domain/01-Wallet-Asset.md
│   ├── token/           → 03-UI-Ref/04-Domain/01-Wallet-Asset.md
│   ├── transaction/     → 03-UI-Ref/04-Domain/02-Transaction-Transfer.md
│   ├── transfer/        → 03-UI-Ref/04-Domain/02-Transaction-Transfer.md
│   ├── onboarding/      → 03-UI-Ref/04-Domain/03-Onboarding-Security.md
│   ├── security/        → 03-UI-Ref/04-Domain/03-Onboarding-Security.md
│   ├── authorize/       → 03-UI-Ref/04-Domain/03-Onboarding-Security.md
│   ├── migration/       → 03-UI-Ref/04-Domain/03-Onboarding-Security.md
│   ├── ecosystem/       → 03-UI-Ref/04-Domain/04-Ecosystem.md
│   ├── settings/        → 03-UI-Ref/04-Domain/05-Settings-Notification.md
│   ├── notification/    → 03-UI-Ref/04-Domain/05-Settings-Notification.md
│   └── contact/         → 03-UI-Ref/04-Domain/05-Settings-Notification.md
│
├── services/             → 06-Service-Ref/
│   ├── wallet-storage/  → 06-Service-Ref/02-Wallet/01-Storage.md
│   ├── chain-adapter/   → 06-Service-Ref/03-Chain/
│   ├── miniapp-runtime/ → 06-Service-Ref/04-MiniApp/01-Runtime.md
│   ├── ecosystem/       → 06-Service-Ref/04-MiniApp/02-Ecosystem.md
│   ├── biometric/       → 06-Service-Ref/05-Platform/01-Biometric.md
│   └── ...              → 06-Service-Ref/
│
├── stores/               → 05-State-Ref/02-Stores/
├── queries/              → 05-State-Ref/03-Queries/
│
└── stackflow/            → 12-Shell-Guide/
    ├── activities/      → 12-Shell-Guide/01-Activities/
    ├── activities/sheets/ → 12-Shell-Guide/02-Sheets/
    └── activities/tabs/ → 12-Shell-Guide/03-Tabs/
```

---

## 快速导航

### 按功能

- **钱包创建/导入**: [Onboarding Components](../03-UI-Ref/04-Domain/03-Onboarding-Security.md) → [Wallet Storage](../06-Service-Ref/02-Wallet/01-Storage.md)
- **转账**: [Transfer Components](../03-UI-Ref/04-Domain/02-Transaction-Transfer.md) → [Chain Adapter](../06-Service-Ref/03-Chain/01-Adapter.md)
- **余额查询**: [Balance Query](../05-State-Ref/03-Queries/01-Balance-Query.md) → [API Providers](../06-Service-Ref/03-Chain/06-Providers.md)
- **小程序**: [Ecosystem Components](../03-UI-Ref/04-Domain/04-Ecosystem.md) → [MiniApp Runtime](../06-Service-Ref/04-MiniApp/01-Runtime.md)

### 按技术栈

- **React 组件**: [UI Reference](../03-UI-Ref/README.md)
- **状态管理**: [State Reference](../05-State-Ref/00-Index.md)
- **页面路由**: [Navigation Map](../12-Shell-Guide/00-Navigation-Map.md)
- **区块链接口**: [Chain Adapter](../06-Service-Ref/03-Chain/01-Adapter.md)

---

## 相关文档

- [Architecture Overview](./03-Architecture.md)
- [Coding Guidelines](./06-Guidelines.md)
- [Documentation Guide](../99-Documentation-Guide/README.md)
