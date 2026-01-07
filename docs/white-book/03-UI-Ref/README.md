# 📘 Book T3: The UI Reference (组件技术参考)

> **Design System & Components**
>
> 本书是 UI 开发者的字典，收录了所有基础组件、业务组件和设计规范。

## 📖 目录

*   [00-Overview.md](./00-Overview.md) - 设计系统概览

### 01-Foundation (设计基础)

*   [01-Colors.md](./01-Foundation/01-Colors.md) - 色彩系统

### 02-Primitives (基础组件)

*   [01-Base-UI.md](./02-Primitives/01-Base-UI.md) - 基础 UI 组件 (Button, Card, Badge, Avatar, Separator)
*   [02-Forms.md](./02-Primitives/02-Forms.md) - 表单组件 (Input, Select, Checkbox, Switch, Slider)
*   [03-Feedback.md](./02-Primitives/03-Feedback.md) - 反馈组件 (Dialog, Sheet, Toast, Skeleton, Progress)

### 03-Composites (复合组件)

*   [01-Common.md](./03-Composites/01-Common.md) - 通用复合组件 (CopyButton, ChainLogo, NetworkBadge)
*   [02-Layout.md](./03-Composites/02-Layout.md) - 布局组件 (AppBar, BottomNav, PageContainer)

### 04-Domain (领域组件)

*   [01-Wallet-Asset.md](./04-Domain/01-Wallet-Asset.md) - 钱包与资产组件 (WalletCard, AssetList, TokenIcon)
*   [02-Transaction-Transfer.md](./04-Domain/02-Transaction-Transfer.md) - 交易与转账组件 (TransactionList, TransferForm, GasFeeSelector)
*   [03-Onboarding-Security.md](./04-Domain/03-Onboarding-Security.md) - 引导与安全组件 (ChainSelector, PatternLock, MnemonicInput)
*   [04-Ecosystem.md](./04-Domain/04-Ecosystem.md) - 生态系统组件 (MiniappWindow, DiscoverPage, EcosystemDesktop)
*   [05-Settings-Notification.md](./04-Domain/05-Settings-Notification.md) - 设置与通知组件 (AppearanceSheet, TransactionToast, ContactCard)

---

## Source Mapping

| Documentation | Source Directory |
|---------------|------------------|
| 01-Foundation | `src/lib/`, `tailwind.config.ts` |
| 02-Primitives | `src/components/ui/` |
| 03-Composites | `src/components/common/`, `src/components/layout/` |
| 04-Domain | `src/components/{wallet,asset,token,transaction,transfer,onboarding,security,authorize,migration,ecosystem,settings,notification,contact}/` |
