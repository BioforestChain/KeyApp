# 组件完整索引

> 源码: [`src/components/`](https://github.com/BioforestChain/KeyApp/blob/main/src/components/)

## 组件统计

| 目录 | 组件数 | 文档 |
|------|--------|------|
| `asset/` | 2 | [01-Asset.md](./01-Asset.md) |
| `authorize/` | 4 | [02-Authorize.md](./02-Authorize.md) |
| `common/` | 11+ | [03-Common.md](./03-Common.md) |
| `wallet/` | 12+ | [04-Wallet.md](./04-Wallet.md) |
| `transaction/` | 5 | [05-Transaction.md](./05-Transaction.md) |
| `transfer/` | 3 | [06-Transfer.md](./06-Transfer.md) |
| `security/` | 6 | [07-Security.md](./07-Security.md) |
| `onboarding/` | 8 | [08-Onboarding.md](./08-Onboarding.md) |
| `ecosystem/` | 15+ | [09-Ecosystem.md](./09-Ecosystem.md) |
| `layout/` | 5 | [10-Layout.md](./10-Layout.md) |
| `token/` | 4 | [11-Token.md](./11-Token.md) |
| `notification/` | 2 | [12-Notification.md](./12-Notification.md) |
| `migration/` | 3 | [13-Migration.md](./13-Migration.md) |
| `ui/` | 18 | [14-UI-Primitives.md](./14-UI-Primitives.md) |
| `contact/` | 1 | [15-Contact.md](./15-Contact.md) |

**总计**: 238 个 TSX 文件

---

## 按功能分类

### 数据展示
| 组件 | 目录 | 说明 |
|------|------|------|
| `AssetItem` | asset/ | 资产行 |
| `AssetList` | asset/ | 资产列表 |
| `TokenItem` | token/ | 代币行 |
| `TokenList` | token/ | 代币列表 |
| `TokenIcon` | token/ | 代币图标 |
| `BalanceDisplay` | token/ | 余额显示 |
| `AmountDisplay` | common/ | 金额显示 |
| `AddressDisplay` | wallet/ | 地址显示 |
| `TransactionItem` | transaction/ | 交易行 |
| `TransactionList` | transaction/ | 交易列表 |
| `TransactionStatus` | transaction/ | 交易状态 |

### 表单输入
| 组件 | 目录 | 说明 |
|------|------|------|
| `AddressInput` | transfer/ | 地址输入 |
| `AmountInput` | transfer/ | 金额输入 |
| `MnemonicInput` | security/ | 助记词输入 |
| `PasswordInput` | security/ | 密码输入 |
| `PatternLock` | security/ | 图案锁 |

### 钱包卡片
| 组件 | 目录 | 说明 |
|------|------|------|
| `WalletCard` | wallet/ | 3D钱包卡片 |
| `WalletCardCarousel` | wallet/ | 卡片轮播 |
| `ChainIcon` | wallet/ | 链图标 |
| `ChainBadge` | wallet/ | 链标签 |

### 布局容器
| 组件 | 目录 | 说明 |
|------|------|------|
| `PageHeader` | layout/ | 页面头部 |
| `TabBar` | layout/ | Tab栏 |
| `SwipeableTabs` | layout/ | 滑动Tab |
| `BottomSheet` | layout/ | 底部弹窗 |
| `Modal` | layout/ | 模态框 |

### MiniApp 生态
| 组件 | 目录 | 说明 |
|------|------|------|
| `EcosystemDesktop` | ecosystem/ | 生态桌面 |
| `MiniappIcon` | ecosystem/ | 应用图标 |
| `MiniappWindow` | ecosystem/ | 应用窗口 |
| `MiniappSplashScreen` | ecosystem/ | 启动屏 |

### DApp 授权
| 组件 | 目录 | 说明 |
|------|------|------|
| `AppInfoCard` | authorize/ | 应用信息 |
| `PermissionList` | authorize/ | 权限列表 |
| `TransactionDetails` | authorize/ | 交易详情 |
| `BalanceWarning` | authorize/ | 余额警告 |

### 导入导出
| 组件 | 目录 | 说明 |
|------|------|------|
| `MnemonicDisplay` | security/ | 助记词显示 |
| `MnemonicConfirm` | security/ | 助记词确认 |
| `ChainAddressPreview` | onboarding/ | 地址预览 |
| `CreateWalletSuccess` | onboarding/ | 创建成功 |

---

## 组件设计原则

### 1. Props 规范
```typescript
interface ComponentProps {
  // 必填数据
  data: DataType
  
  // 可选回调
  onClick?: () => void
  
  // 可选样式
  className?: string
  
  // 可选状态
  loading?: boolean
  disabled?: boolean
}
```

### 2. 命名规范
- 组件: PascalCase (`WalletCard`)
- 文件: kebab-case (`wallet-card.tsx`)
- Story: `component.stories.tsx`
- Test: `component.test.tsx`

### 3. 目录结构
```
components/
├── wallet/
│   ├── wallet-card.tsx
│   ├── wallet-card.stories.tsx
│   ├── wallet-card.test.tsx
│   └── index.ts
```

### 4. 样式方案
- Tailwind CSS 4.x
- `cn()` 工具合并类名
- CSS 变量主题
- 响应式: `@container` queries

### 5. 测试要求
- 每个组件必须有 Storybook story
- 交互组件必须有单元测试
- 使用 `data-testid` 标记
