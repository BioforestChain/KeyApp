# Activities 完整索引

> Source: [src/stackflow/activities/](https://github.com/BioforestChain/KeyApp/tree/main/src/stackflow/activities)

## 概览

Activities 是应用的全屏页面，共 **31 个**。

---

## 按功能分类

### 🏠 入口与主页

| Activity | 文件 | 路由 | 描述 |
|----------|------|------|------|
| WelcomeActivity | `WelcomeActivity.tsx` | `/welcome` | 欢迎/引导页 |
| MainTabsActivity | `MainTabsActivity.tsx` | `/` | 主页框架 (含 TabBar) |

### 💰 钱包管理

| Activity | 文件 | 路由 | 参数 |
|----------|------|------|------|
| WalletListActivity | `WalletListActivity.tsx` | `/wallet/list` | - |
| WalletConfigActivity | `WalletConfigActivity.tsx` | `/wallet/:walletId` | `walletId: string` |
| WalletCreateActivity | `WalletCreateActivity.tsx` | `/wallet/create` | - |
| OnboardingRecoverActivity | `OnboardingRecoverActivity.tsx` | `/onboarding/recover` | - |

### 💸 转账与交易

| Activity | 文件 | 路由 | 参数 |
|----------|------|------|------|
| SendActivity | `SendActivity.tsx` | `/send` | `chainId?, tokenAddress?, to?, amount?` |
| ReceiveActivity | `ReceiveActivity.tsx` | `/receive` | `chainId?` |
| TokenDetailActivity | `TokenDetailActivity.tsx` | `/token/:tokenId` | `tokenId: string` |
| TransactionDetailActivity | `TransactionDetailActivity.tsx` | `/transaction/:txId` | `txId: string` |
| HistoryActivity | `HistoryActivity.tsx` | `/history` | `chainId?, address?` |
| AddressBalanceActivity | `AddressBalanceActivity.tsx` | `/address-balance` | `address, chainId` |
| AddressTransactionsActivity | `AddressTransactionsActivity.tsx` | `/address-transactions` | `address, chainId` |

### 📒 地址簿

| Activity | 文件 | 路由 | 参数 |
|----------|------|------|------|
| AddressBookActivity | `AddressBookActivity.tsx` | `/address-book` | - |

### 📷 扫码

| Activity | 文件 | 路由 | 描述 |
|----------|------|------|------|
| ScannerActivity | `ScannerActivity.tsx` | `/scanner` | 全屏扫码页 |

### 🔐 质押

| Activity | 文件 | 路由 | 描述 |
|----------|------|------|------|
| StakingActivity | `StakingActivity.tsx` | `/staking` | 质押管理 |

### 🔔 通知

| Activity | 文件 | 路由 | 描述 |
|----------|------|------|------|
| NotificationsActivity | `NotificationsActivity.tsx` | `/notifications` | 通知列表 |

### ⚙️ 设置

| Activity | 文件 | 路由 | 描述 |
|----------|------|------|------|
| SettingsActivity | `SettingsActivity.tsx` | `/settings` | 设置主页 |
| SettingsLanguageActivity | `SettingsLanguageActivity.tsx` | `/settings/language` | 语言 |
| SettingsCurrencyActivity | `SettingsCurrencyActivity.tsx` | `/settings/currency` | 货币 |
| SettingsChainsActivity | `SettingsChainsActivity.tsx` | `/settings/chains` | 链管理 |
| SettingsMnemonicActivity | `SettingsMnemonicActivity.tsx` | `/settings/mnemonic` | 助记词 |
| SettingsWalletLockActivity | `SettingsWalletLockActivity.tsx` | `/settings/wallet-lock` | 钱包锁 |
| SettingsWalletChainsActivity | `SettingsWalletChainsActivity.tsx` | `/settings/wallet-chains` | 钱包链 |
| SettingsStorageActivity | `SettingsStorageActivity.tsx` | `/settings/storage` | 存储 |
| SettingsSourcesActivity | `SettingsSourcesActivity.tsx` | `/settings/sources` | 应用源 |

### 📱 小程序

| Activity | 文件 | 路由 | 参数 |
|----------|------|------|------|
| MiniappDetailActivity | `MiniappDetailActivity.tsx` | `/miniapp/:appId/detail` | `appId: string` |

### 🔑 授权

| Activity | 文件 | 路由 | 参数 |
|----------|------|------|------|
| AuthorizeAddressActivity | `AuthorizeAddressActivity.tsx` | `/authorize/address/:id` | `id: string` |
| AuthorizeSignatureActivity | `AuthorizeSignatureActivity.tsx` | `/authorize/signature/:id` | `id: string` |

---

## 核心页面详解

### MainTabsActivity

**文件**: `MainTabsActivity.tsx` (13114 行)

主页面容器，包含底部 TabBar 和三个 Tab 页面。

```tsx
// 内部结构
<TabBarLayout>
  <TabContent index={0}>
    <WalletTab />
  </TabContent>
  <TabContent index={1}>
    <EcosystemTab />
  </TabContent>
  <TabContent index={2}>
    <SettingsTab />
  </TabContent>
  <TabBar>
    <TabBarItem icon={WalletIcon} label="钱包" />
    <TabBarItem icon={AppsIcon} label="生态" />
    <TabBarItem icon={SettingsIcon} label="设置" />
  </TabBar>
</TabBarLayout>
```

### MiniappDetailActivity

**文件**: `MiniappDetailActivity.tsx` (13088 行)

小程序详情页，包含应用信息、权限、评分等。

```tsx
interface Props {
  appId: string;
}

// 功能
// - 显示应用信息 (名称、图标、描述)
// - 权限列表
// - 安装/卸载按钮
// - 打开按钮
// - 用户评分
```

### SettingsSourcesActivity

**文件**: `SettingsSourcesActivity.tsx` (8274 行)

应用源管理，可添加/删除第三方应用源。

---

## Activity 通用结构

```tsx
// 典型 Activity 结构
import { ActivityComponentType } from '@stackflow/react';
import { PageHeader } from '@/components/layout/page-header';

interface Props {
  // 路由参数
}

const MyActivity: ActivityComponentType<Props> = ({ params }) => {
  const { pop } = useFlow();
  
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="页面标题" onBack={() => pop()} />
      <div className="flex-1 overflow-auto">
        {/* 页面内容 */}
      </div>
    </div>
  );
};

export { MyActivity };
```

---

## 相关文档

- [Navigation Map](../00-Navigation-Map.md)
- [Sheets/Jobs](../02-Sheets/00-Index.md)
- [Tabs](../03-Tabs/00-Index.md)
