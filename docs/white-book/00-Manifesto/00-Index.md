# KeyApp 技术文档索引

> 这是一份 AI-First 的技术文档，旨在作为代码库的 **Digital Twin**。

---

## 序言：纠正 AI 直觉

AI 模型在开发移动端 Web 应用时，往往会基于通用 Web 开发经验做出直觉性的选择。但本项目使用了特定的技术栈和架构模式，这些"直觉"可能导致严重的问题。

### 🚫 常见错误直觉

最佳实践已独立维护在：

- `00-Manifesto/07-Best-Practices.md`
- `pnpm agent practice list`

### 📚 为什么会出错？

1. **Stackflow 是页面栈管理器**：它管理整个页面栈的动画和生命周期。使用 `position: fixed` 会绕过 Stackflow 的控制，导致动画冲突、页面"抖动"等问题。

2. **本项目是移动端优先**：需要原生 App 般的用户体验，包括滑动返回、栈式导航等。传统 Web 的弹窗模式不适用。

3. **组件已经封装好**：不要重新发明轮子，查看 `src/components/` 和 `src/stackflow/activities/sheets/` 下的现有实现。

---

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

## 核心章节速查

| 章节 | 路径 | 何时阅读 |
|------|------|---------|
| **导航系统** | `12-Shell-Guide/` | 实现页面跳转、Tab 切换时 |
| **Sheet 组件** | `03-UI-Ref/03-Composites/` | 实现底部弹出层时 |
| **Dialog 组件** | `03-UI-Ref/03-Composites/` | 实现居中对话框时 |
| **服务架构** | `06-Service-Ref/` | 调用后端 API 或链服务时 |
| **钱包存储** | `06-Service-Ref/02-Wallet/` | 操作钱包数据时 |
| **测试策略** | `90-DevOps/` | 编写测试用例时 |

---

## 外部文档链接

以下是本项目依赖的核心库的 LLM 友好文档：

| 库 | 文档链接 | 用途 |
|---|---------|------|
| **Stackflow** | https://stackflow.so/llms-full.txt | 页面栈导航、Activity、Sheet、Modal |
| **shadcn/ui** | https://ui.shadcn.com/docs | UI 组件库 |
| **TanStack Query** | https://tanstack.com/query/latest | 数据获取和缓存 |
| **TanStack Store** | https://tanstack.com/store/latest | 状态管理 |

---

## 开发检查清单

在开始编码前，请确认：

- [ ] 是否已阅读相关白皮书章节？
- [ ] 是否已查看 `src/` 下的类似实现？
- [ ] 弹出层是否使用了 Stackflow 的 `BottomSheet` 或 `Modal`？
- [ ] 是否遵循了现有的代码风格和模式？
- [ ] 是否添加了必要的国际化文案？
- [ ] 是否更新了相关测试？

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

## 快速参考

### Stackflow Activity 类型

```tsx
// 普通全屏页面
import { AppScreen } from "@stackflow/plugin-basic-ui";

// 底部弹出层（Sheet）
import { BottomSheet } from "@stackflow/plugin-basic-ui";

// 居中对话框（Modal）
import { Modal } from "@stackflow/plugin-basic-ui";
```

### 导航操作

```tsx
import { useFlow } from "@/stackflow";

const { push, pop, replace } = useFlow();

// 打开新页面
push("ActivityName", { param: "value" });

// 返回上一页
pop();

// 替换当前页面
replace("ActivityName", { param: "value" });
```

### Sheet Activity 模式

当需要创建新的 Sheet 时，参考 `src/stackflow/activities/sheets/` 下的实现：

1. 创建 Activity 组件，使用 `<BottomSheet>` 或 `<Modal>` 包裹
2. 在 `stackflow.ts` 中注册路由和组件
3. 在 `sheets/index.ts` 中导出

---

## 常见问题

### Q: 为什么我的弹窗导致页面"抖动"或消失？

A: 你可能使用了 Radix Dialog 或自定义 `position: fixed`。这会与 Stackflow 的动画系统冲突。请改用 Stackflow 的 `BottomSheet` 或 `Modal`。

### Q: 如何传递数据给 Sheet 并获取返回值？

A: 使用全局回调模式。参考 `WalletLockConfirmJob` 的实现：

```tsx
// 设置回调
setWalletLockConfirmCallback((patternKey) => {
  // 处理返回的图案密钥
});

// 打开 Sheet
push("WalletLockConfirmJob", {});
```

### Q: 什么时候用 BottomSheet，什么时候用 Modal？

- **BottomSheet**：选择列表、表单输入、确认操作（从底部滑入）
- **Modal**：警告、确认对话框（居中显示）

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
- [Best Practices](./07-Best-Practices.md)
- [Documentation Guide](../99-Documentation-Guide/README.md)
