# 状态管理完整索引

> Source: [src/stores/](https://github.com/BioforestChain/KeyApp/tree/main/src/stores) | [src/queries/](https://github.com/BioforestChain/KeyApp/tree/main/src/queries)

## 概览

应用使用 **TanStack Store** 管理客户端状态，**TanStack Query** 管理服务端状态。

---

## 技术栈

| 库 | 版本 | 用途 |
|----|------|------|
| @tanstack/react-store | 0.7.x | 客户端状态 (同步) |
| @tanstack/react-query | 5.x | 服务端状态 (异步) |

---

## Stores (客户端状态)

| Store | 文件 | 行数 | 职责 |
|-------|------|------|------|
| [walletStore](./02-Stores/01-Wallet-Store.md) | `wallet.ts` | 788 | 钱包管理、地址、代币 |
| [chainConfigStore](./02-Stores/02-ChainConfig-Store.md) | `chain-config.ts` | 182 | 链配置 |
| [preferencesStore](./02-Stores/03-Preferences-Store.md) | `preferences.ts` | ~100 | 用户偏好 |
| [addressBookStore](./02-Stores/04-AddressBook-Store.md) | `address-book.ts` | ~150 | 地址簿 |
| [notificationStore](./02-Stores/05-Notification-Store.md) | `notification.ts` | ~80 | 通知 |
| [ecosystemStore](./02-Stores/06-Ecosystem-Store.md) | `ecosystem.ts` | ~100 | 小程序生态 |
| [securityPasswordStore](./02-Stores/07-Security-Store.md) | `security-password.ts` | ~60 | 安全密码 |

---

## Queries (服务端状态)

| Query | 文件 | 职责 |
|-------|------|------|
| [useBalanceQuery](./03-Queries/01-Balance-Query.md) | `use-balance-query.ts` | 余额查询 |
| [usePriceQuery](./03-Queries/02-Price-Query.md) | `use-price-query.ts` | 价格查询 |
| [useExchangeRateQuery](./03-Queries/03-ExchangeRate-Query.md) | `use-exchange-rate-query.ts` | 汇率查询 |
| [useTransactionHistoryQuery](./03-Queries/04-TransactionHistory-Query.md) | `use-transaction-history-query.ts` | 交易历史 |
| [useAddressTransactionsQuery](./03-Queries/05-AddressTransactions-Query.md) | `use-address-transactions-query.ts` | 地址交易 |
| [useAddressBalanceQuery](./03-Queries/06-AddressBalance-Query.md) | `use-address-balance-query.ts` | 地址余额 |
| [useChainConfigQuery](./03-Queries/07-ChainConfig-Query.md) | `use-chain-config-query.ts` | 链配置 |
| [useStakingQuery](./03-Queries/08-Staking-Query.md) | `use-staking-query.ts` | 质押信息 |
| [useSecurityPasswordQuery](./03-Queries/09-SecurityPassword-Query.md) | `use-security-password-query.ts` | 安全密码 |

---

## 架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          React Components                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │   Pages     │  │    Sheets   │  │    Tabs     │  │   Components  │  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └───────┬───────┘  │
└─────────┼───────────────┼───────────────┼───────────────────┼──────────┘
          │               │               │                   │
          ▼               ▼               ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              Hooks Layer                                │
│  ┌─────────────────────────────────┐ ┌────────────────────────────────┐│
│  │         useStore()              │ │         useQuery()             ││
│  │   (TanStack Store Hooks)        │ │     (TanStack Query Hooks)     ││
│  └────────────────┬────────────────┘ └───────────────┬────────────────┘│
└───────────────────┼──────────────────────────────────┼─────────────────┘
                    │                                  │
                    ▼                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           State Layer                                   │
│  ┌─────────────────────────────────┐ ┌────────────────────────────────┐│
│  │           Stores                │ │           Queries              ││
│  │  ┌─────────┐ ┌─────────────┐   │ │  ┌─────────┐ ┌─────────────┐   ││
│  │  │ wallet  │ │ chainConfig │   │ │  │ balance │ │   price     │   ││
│  │  └─────────┘ └─────────────┘   │ │  └─────────┘ └─────────────┘   ││
│  │  ┌─────────┐ ┌─────────────┐   │ │  ┌─────────┐ ┌─────────────┐   ││
│  │  │  prefs  │ │ addressBook │   │ │  │ history │ │  staking    │   ││
│  │  └─────────┘ └─────────────┘   │ │  └─────────┘ └─────────────┘   ││
│  └────────────────┬────────────────┘ └───────────────┬────────────────┘│
└───────────────────┼──────────────────────────────────┼─────────────────┘
                    │                                  │
                    ▼                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          Service Layer                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐│
│  │wallet-storage│ │chain-config │ │chain-adapter│ │  currency-exchange ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Store vs Query 选择指南

| 场景 | 选择 | 原因 |
|------|------|------|
| 当前选中的钱包 | Store | 纯客户端状态，需要同步更新 |
| 链配置列表 | Store | 本地持久化，偶尔远程刷新 |
| 用户偏好设置 | Store | 本地存储 |
| 代币余额 | Query | 需要定时刷新，有缓存策略 |
| 交易历史 | Query | 分页加载，需要失效策略 |
| 法币汇率 | Query | 外部 API，有缓存 |

---

## 文件结构

```
src/
├── stores/
│   ├── index.ts              # 统一导出
│   ├── hooks.ts              # 共享 hooks
│   ├── wallet.ts             # 钱包 store (788 行)
│   ├── chain-config.ts       # 链配置 store
│   ├── preferences.ts        # 偏好 store
│   ├── address-book.ts       # 地址簿 store
│   ├── notification.ts       # 通知 store
│   ├── ecosystem.ts          # 生态 store
│   ├── security-password.ts  # 安全密码 store
│   └── currencies.ts         # 货币 store
│
└── queries/
    ├── index.ts                      # 统一导出
    ├── use-balance-query.ts          # 余额
    ├── use-price-query.ts            # 价格
    ├── use-exchange-rate-query.ts    # 汇率
    ├── use-transaction-history-query.ts  # 交易历史
    ├── use-address-transactions-query.ts # 地址交易
    ├── use-address-balance-query.ts  # 地址余额
    ├── use-chain-config-query.ts     # 链配置
    ├── use-staking-query.ts          # 质押
    └── use-security-password-query.ts # 安全密码
```

---

## 使用示例

### Store 使用

```typescript
import { useStore } from '@tanstack/react-store';
import { walletStore, walletActions } from '@/stores';

function WalletPage() {
  // 订阅整个 store
  const state = useStore(walletStore);
  
  // 订阅部分状态 (优化渲染)
  const currentWalletId = useStore(walletStore, s => s.currentWalletId);
  const wallets = useStore(walletStore, s => s.wallets);
  
  // 触发 action
  const handleSwitch = (walletId: string) => {
    walletActions.setCurrentWallet(walletId);
  };
}
```

### Query 使用

```typescript
import { useBalanceQuery, useRefreshBalance } from '@/queries';

function BalanceDisplay({ walletId, chain }: Props) {
  const { data: tokens, isLoading, error } = useBalanceQuery(walletId, chain);
  const { refresh } = useRefreshBalance();
  
  // 下拉刷新
  const handleRefresh = () => refresh(walletId, chain);
  
  if (isLoading) return <Skeleton />;
  if (error) return <Error message={error.message} />;
  
  return <TokenList tokens={tokens} onRefresh={handleRefresh} />;
}
```

---

## 相关文档

- [Wallet Store 详解](./02-Stores/01-Wallet-Store.md)
- [Balance Query 详解](./03-Queries/01-Balance-Query.md)
- [Wallet Storage Service](../06-Service-Ref/02-Wallet/01-Storage.md)
