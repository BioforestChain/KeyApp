# 页面导航完整地图

> Source: [src/stackflow/](https://github.com/BioforestChain/KeyApp/tree/main/src/stackflow)

## 概览

应用使用 Stackflow 作为导航框架，共有 **31 个 Activity** + **27 个 Sheet/Job** + **3 个 Tab**。

---

## 路由表

### 主页面 (Activities)

| Activity | 路由 | 描述 |
|----------|------|------|
| MainTabsActivity | `/` | 主页 (含 3 个 Tab) |
| WelcomeActivity | `/welcome` | 欢迎页 (首次启动) |
| WalletListActivity | `/wallet/list` | 钱包列表 |
| WalletConfigActivity | `/wallet/:walletId` | 钱包设置 |
| WalletCreateActivity | `/wallet/create` | 创建钱包 |
| OnboardingRecoverActivity | `/onboarding/recover` | 恢复钱包 |
| SendActivity | `/send` | 发送 |
| ReceiveActivity | `/receive` | 接收 |
| TokenDetailActivity | `/token/:tokenId` | 代币详情 |
| TransactionDetailActivity | `/transaction/:txId` | 交易详情 |
| HistoryActivity | `/history` | 交易历史 |
| AddressBalanceActivity | `/address-balance` | 地址余额 |
| AddressTransactionsActivity | `/address-transactions` | 地址交易 |
| AddressBookActivity | `/address-book` | 地址簿 |
| ScannerActivity | `/scanner` | 扫码 |
| StakingActivity | `/staking` | 质押 |
| NotificationsActivity | `/notifications` | 通知 |
| SettingsActivity | `/settings` | 设置 |
| SettingsLanguageActivity | `/settings/language` | 语言设置 |
| SettingsCurrencyActivity | `/settings/currency` | 货币设置 |
| SettingsChainsActivity | `/settings/chains` | 链设置 |
| SettingsMnemonicActivity | `/settings/mnemonic` | 助记词 |
| SettingsWalletLockActivity | `/settings/wallet-lock` | 钱包锁定 |
| SettingsWalletChainsActivity | `/settings/wallet-chains` | 钱包链 |
| SettingsStorageActivity | `/settings/storage` | 存储管理 |
| SettingsSourcesActivity | `/settings/sources` | 应用源 |
| MiniappDetailActivity | `/miniapp/:appId/detail` | 小程序详情 |
| AuthorizeAddressActivity | `/authorize/address/:id` | 授权地址 |
| AuthorizeSignatureActivity | `/authorize/signature/:id` | 授权签名 |

### Sheet/Job (底部弹窗)

| Job | 路由 | 描述 |
|-----|------|------|
| ChainSelectorJob | `/job/chain-selector` | 选择链 |
| ChainSwitchConfirmJob | `/job/chain-switch-confirm` | 确认切换链 |
| WalletAddJob | `/job/wallet-add` | 添加钱包 |
| WalletListJob | `/job/wallet-list` | 钱包列表弹窗 |
| WalletPickerJob | `/job/wallet-picker` | 选择钱包 |
| WalletRenameJob | `/job/wallet-rename/:walletId` | 重命名钱包 |
| WalletDeleteJob | `/job/wallet-delete/:walletId` | 删除钱包 |
| WalletLockConfirmJob | `/job/wallet-lock-confirm` | 确认锁定 |
| TransferConfirmJob | `/job/transfer-confirm` | 确认转账 |
| TransferWalletLockJob | `/job/transfer-wallet-lock` | 转账钱包锁 |
| SigningConfirmJob | `/job/signing-confirm` | 确认签名 |
| FeeEditJob | `/job/fee-edit` | 编辑手续费 |
| ScannerJob | `/job/scanner` | 扫码弹窗 |
| ContactEditJob | `/job/contact-edit` | 编辑联系人 |
| ContactPickerJob | `/job/contact-picker` | 选择联系人 |
| ContactAddConfirmJob | `/job/contact-add-confirm` | 确认添加联系人 |
| ContactShareJob | `/job/contact-share` | 分享联系人 |
| MnemonicOptionsJob | `/job/mnemonic-options` | 助记词选项 |
| SecurityWarningJob | `/job/security-warning` | 安全警告 |
| SetTwoStepSecretJob | `/job/set-two-step-secret` | 设置二步密码 |
| TwoStepSecretConfirmJob | `/job/two-step-secret-confirm` | 确认二步密码 |
| ClearDataConfirmJob | `/job/clear-data-confirm` | 确认清除数据 |
| PermissionRequestJob | `/job/permission-request` | 权限请求 |
| MiniappTransferConfirmJob | `/job/miniapp-transfer-confirm` | 小程序转账确认 |
| MiniappSignTransactionJob | `/job/miniapp-sign-transaction` | 小程序签名交易 |

### Tabs (主页标签)

| Tab | 文件 | 描述 |
|-----|------|------|
| WalletTab | `tabs/WalletTab.tsx` | 钱包首页 |
| EcosystemTab | `tabs/EcosystemTab.tsx` | 生态系统/小程序 |
| SettingsTab | `tabs/SettingsTab.tsx` | 设置 |

---

## 导航关系图

```
┌────────────────────────────────────────────────────────────────────────┐
│                           WelcomeActivity                              │
│                    (首次启动 / 无钱包时)                                 │
└───────────────────────────────┬────────────────────────────────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────────────┐
│WalletCreateActivity│   │OnboardingRecoverActivity│  │   (Import from other app)  │
│  (创建新钱包)     │   │    (恢复钱包)      │   │                         │
└────────┬────────┘   └────────┬────────┘   └────────────┬────────────┘
         │                     │                         │
         └─────────────────────┼─────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         MainTabsActivity                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────┐ │
│  │  WalletTab   │  │ EcosystemTab │  │        SettingsTab           │ │
│  │  (钱包首页)  │  │ (小程序商店) │  │         (设置)               │ │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┬───────────────┘ │
└─────────┼─────────────────┼─────────────────────────┼──────────────────┘
          │                 │                         │
          ▼                 ▼                         ▼
    ┌─────────────────────────────────────────────────────────────────┐
    │                       钱包操作                                  │
    │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
    │  │SendActivity │ │ReceiveActivity│ │TokenDetailActivity│ │HistoryActivity│ │
    │  └──────┬──────┘ └─────────────┘ └──────┬──────┘ └─────┬─────┘ │
    │         │                               │              │       │
    │         ▼                               ▼              ▼       │
    │  ┌────────────────┐              ┌──────────────────────────┐  │
    │  │TransferConfirmJob│              │TransactionDetailActivity  │  │
    │  └────────────────┘              └──────────────────────────┘  │
    └─────────────────────────────────────────────────────────────────┘
```

---

## 钱包管理流程

```
MainTabsActivity (WalletTab)
         │
         ├──▶ WalletListActivity ──▶ WalletConfigActivity
         │         │                        │
         │         ├──▶ WalletAddJob        ├──▶ WalletRenameJob
         │         │                        ├──▶ WalletDeleteJob
         │         └──▶ WalletPickerJob     └──▶ SettingsWalletChainsActivity
         │
         ├──▶ SendActivity
         │         │
         │         ├──▶ ScannerJob (扫描地址)
         │         ├──▶ ContactPickerJob (选择联系人)
         │         ├──▶ FeeEditJob (编辑手续费)
         │         └──▶ TransferConfirmJob
         │                   │
         │                   └──▶ TransferWalletLockJob (验证密码/生物识别)
         │
         ├──▶ ReceiveActivity
         │
         ├──▶ TokenDetailActivity
         │         │
         │         └──▶ TransactionDetailActivity
         │
         └──▶ HistoryActivity
                   │
                   └──▶ TransactionDetailActivity
```

---

## 设置页面流程

```
MainTabsActivity (SettingsTab)
         │
         ├──▶ SettingsLanguageActivity
         ├──▶ SettingsCurrencyActivity
         ├──▶ SettingsChainsActivity
         │         │
         │         └──▶ ChainSelectorJob
         │
         ├──▶ SettingsMnemonicActivity
         │         │
         │         └──▶ MnemonicOptionsJob
         │                   │
         │                   └──▶ SecurityWarningJob
         │
         ├──▶ SettingsWalletLockActivity
         │         │
         │         ├──▶ SetTwoStepSecretJob
         │         └──▶ TwoStepSecretConfirmJob
         │
         ├──▶ SettingsStorageActivity
         │         │
         │         └──▶ ClearDataConfirmJob
         │
         └──▶ SettingsSourcesActivity
```

---

## 小程序/DApp 流程

```
MainTabsActivity (EcosystemTab)
         │
         ├──▶ MiniappDetailActivity
         │
         └──▶ [MiniappWindow] (非 Stackflow, 由 miniapp-runtime 管理)
                   │
                   ├──▶ PermissionRequestJob (权限请求)
                   ├──▶ MiniappTransferConfirmJob (转账确认)
                   ├──▶ MiniappSignTransactionJob (签名确认)
                   ├──▶ ChainSwitchConfirmJob (切换链)
                   │
                   └──▶ AuthorizeAddressActivity
                              │
                              └──▶ AuthorizeSignatureActivity
```

---

## Stackflow 配置

```typescript
// src/stackflow/stackflow.ts

export const { Stack, useFlow, useStepFlow, activities } = stackflow({
  transitionDuration: 350,
  plugins: [
    basicRendererPlugin(),
    basicUIPlugin({
      theme: 'cupertino',  // iOS 风格
    }),
    historySyncPlugin({
      routes: { /* 路由表 */ },
      fallbackActivity: () => 'MainTabsActivity',
      useHash: true,
      urlPatternOptions: {
        segmentValueCharset: 'a-zA-Z0-9-._~ %',  // 支持 appId 中的点号
      },
    }),
  ],
  activities: { /* Activity 组件 */ },
});
```

---

## 导航 Hooks

```typescript
import { useFlow } from '@/stackflow';

function MyComponent() {
  const { push, pop, replace } = useFlow();
  
  // 跳转到新页面
  push('SendActivity', { chainId: 'ethereum' });
  
  // 返回上一页
  pop();
  
  // 替换当前页面
  replace('MainTabsActivity', {});
}
```

---

## 相关文档

- [Activities 详细文档](./01-Activities/00-Index.md)
- [Sheets/Jobs 详细文档](./02-Sheets/00-Index.md)
- [Tabs 详细文档](./03-Tabs/00-Index.md)
