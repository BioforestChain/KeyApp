# Activities (页面) 完整列表

> 源码: [`src/stackflow/activities/`](https://github.com/BioforestChain/KeyApp/blob/main/src/stackflow/activities/)

## Activity 列表 (29个)

### 主页面

| Activity | 文件 | 说明 |
|----------|------|------|
| `MainTabsActivity` | `MainTabsActivity.tsx` | 主 Tab 页 (首页/资产/生态/设置) |
| `WelcomeActivity` | `WelcomeActivity.tsx` | 欢迎页 |

### 钱包管理

| Activity | 文件 | 说明 |
|----------|------|------|
| `WalletCreateActivity` | `WalletCreateActivity.tsx` | 创建钱包 |
| `WalletListActivity` | `WalletListActivity.tsx` | 钱包列表 |
| `WalletConfigActivity` | `WalletConfigActivity.tsx` | 钱包配置 |
| `OnboardingRecoverActivity` | `OnboardingRecoverActivity.tsx` | 恢复钱包 |

### 资产相关

| Activity | 文件 | 说明 |
|----------|------|------|
| `TokenDetailActivity` | `TokenDetailActivity.tsx` | 代币详情 |
| `AddressBalanceActivity` | `AddressBalanceActivity.tsx` | 地址余额 |
| `StakingActivity` | `StakingActivity.tsx` | 质押 |

### 交易相关

| Activity | 文件 | 说明 |
|----------|------|------|
| `SendActivity` | `SendActivity.tsx` | 发送 |
| `ReceiveActivity` | `ReceiveActivity.tsx` | 接收 |
| `HistoryActivity` | `HistoryActivity.tsx` | 交易历史 |
| `TransactionDetailActivity` | `TransactionDetailActivity.tsx` | 交易详情 |
| `AddressTransactionsActivity` | `AddressTransactionsActivity.tsx` | 地址交易 |

### 联系人

| Activity | 文件 | 说明 |
|----------|------|------|
| `AddressBookActivity` | `AddressBookActivity.tsx` | 地址簿 |

### DApp/MiniApp

| Activity | 文件 | 说明 |
|----------|------|------|
| `MiniappDetailActivity` | `MiniappDetailActivity.tsx` | MiniApp 详情 |
| `AuthorizeAddressActivity` | `AuthorizeAddressActivity.tsx` | 地址授权 |
| `AuthorizeSignatureActivity` | `AuthorizeSignatureActivity.tsx` | 签名授权 |

### 设置相关

| Activity | 文件 | 说明 |
|----------|------|------|
| `SettingsActivity` | `SettingsActivity.tsx` | 设置主页 |
| `SettingsLanguageActivity` | `SettingsLanguageActivity.tsx` | 语言设置 |
| `SettingsCurrencyActivity` | `SettingsCurrencyActivity.tsx` | 货币设置 |
| `SettingsChainsActivity` | `SettingsChainsActivity.tsx` | 链管理 |
| `SettingsWalletChainsActivity` | `SettingsWalletChainsActivity.tsx` | 钱包链管理 |
| `SettingsWalletLockActivity` | `SettingsWalletLockActivity.tsx` | 钱包锁设置 |
| `SettingsMnemonicActivity` | `SettingsMnemonicActivity.tsx` | 助记词管理 |
| `SettingsSourcesActivity` | `SettingsSourcesActivity.tsx` | 订阅源管理 |
| `SettingsStorageActivity` | `SettingsStorageActivity.tsx` | 存储管理 |

### 工具

| Activity | 文件 | 说明 |
|----------|------|------|
| `ScannerActivity` | `ScannerActivity.tsx` | 扫描器 (全屏) |
| `NotificationsActivity` | `NotificationsActivity.tsx` | 通知中心 |

---

## 详细文档

### MainTabsActivity

主 Tab 页面，包含 4 个 Tab。

```typescript
// 路由配置
{
  path: '/',
  component: MainTabsActivity,
}

// Tab 结构
const tabs = [
  { key: 'home', label: '首页', component: HomeTab },
  { key: 'assets', label: '资产', component: AssetsTab },
  { key: 'ecosystem', label: '生态', component: EcosystemTab },
  { key: 'settings', label: '设置', component: SettingsTab },
]
```

### WalletCreateActivity

创建钱包流程。

```typescript
interface WalletCreateActivityParams {
  // 无参数
}

// 流程步骤
// 1. 输入钱包名称
// 2. 选择链
// 3. 生成助记词
// 4. 备份助记词
// 5. 确认助记词
// 6. 创建完成
```

### SendActivity

发送转账页面。

```typescript
interface SendActivityParams {
  walletId?: string
  chain?: ChainType
  token?: string           // 预选代币
  to?: string              // 预填地址
  amount?: string          // 预填金额
}

// 打开方式
actions.push('SendActivity', {
  walletId: wallet.id,
  chain: 'evm',
  token: 'ETH',
})
```

### ReceiveActivity

接收页面，显示二维码。

```typescript
interface ReceiveActivityParams {
  walletId?: string
  chain?: ChainType
  token?: string
}
```

### TokenDetailActivity

代币详情页面。

```typescript
interface TokenDetailActivityParams {
  walletId: string
  chain: ChainType
  token: string            // 代币符号
  contract?: string        // 合约地址 (可选)
}
```

### TransactionDetailActivity

交易详情页面。

```typescript
interface TransactionDetailActivityParams {
  txId: string
  chain: ChainType
}
```

### SettingsActivity

设置主页面。

```typescript
// 设置项列表
const settingsItems = [
  { key: 'language', label: '语言', route: 'SettingsLanguageActivity' },
  { key: 'currency', label: '货币', route: 'SettingsCurrencyActivity' },
  { key: 'chains', label: '链管理', route: 'SettingsChainsActivity' },
  { key: 'sources', label: '订阅源', route: 'SettingsSourcesActivity' },
  { key: 'storage', label: '存储', route: 'SettingsStorageActivity' },
  { key: 'about', label: '关于', route: 'AboutActivity' },
]
```

---

## 页面导航

```typescript
import { useActions } from '@/stackflow'

function Navigation() {
  const actions = useActions()
  
  // 推入页面
  actions.push('SendActivity', { walletId, chain: 'evm' })
  
  // 替换页面
  actions.replace('MainTabsActivity', {})
  
  // 返回
  actions.pop()
  
  // 返回到根
  actions.pop({ count: Infinity })
}
```

---

## 路由配置

```typescript
// src/stackflow/index.tsx
const activities = {
  MainTabsActivity: () => import('./activities/MainTabsActivity'),
  WelcomeActivity: () => import('./activities/WelcomeActivity'),
  WalletCreateActivity: () => import('./activities/WalletCreateActivity'),
  SendActivity: () => import('./activities/SendActivity'),
  // ...
}

const { Stack, useActions, useActivity } = stackflow({
  activities,
  transitionDuration: 300,
  initialActivity: 'MainTabsActivity',
})
```
