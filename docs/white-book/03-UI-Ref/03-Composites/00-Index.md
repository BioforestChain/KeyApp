# Composites 完整索引

> Source: [src/components/common/](https://github.com/BioforestChain/KeyApp/tree/main/src/components/common) | [src/components/layout/](https://github.com/BioforestChain/KeyApp/tree/main/src/components/layout)

## 概览

复合组件是由基础组件组合而成的业务通用组件，分为 **Common** 和 **Layout** 两类。

---

## Common 组件 (20个)

| 组件 | 文件 | 描述 |
|------|------|------|
| StepIndicator | `step-indicator.tsx` | 步骤指示器 |
| AnimatedNumber | `animated-number.tsx` | 数字动画 |
| QRCode | `qr-code.tsx` | 二维码生成 |
| ErrorBoundary | `error-boundary.tsx` | 错误边界 |
| FormField | `form-field.tsx` | 表单字段 |
| IconCircle | `icon-circle.tsx` | 圆形图标容器 |
| ContactAvatar | `contact-avatar.tsx` | 联系人头像 |
| DevWatermark | `DevWatermark.tsx` | 开发水印 |
| EmptyState | `empty-state.tsx` | 空状态 |
| ProviderFallbackWarning | `provider-fallback-warning.tsx` | Provider 降级警告 |
| TimeDisplay | `time-display.tsx` | 时间显示 |
| GradientButton | `gradient-button.tsx` | 渐变按钮 |
| SwiperSyncContext | `swiper-sync-context.tsx` | Swiper 同步上下文 |
| Alert | `alert.tsx` | 警告提示 |
| LoadingSpinner | `loading-spinner.tsx` | 加载动画 |
| MigrationRequiredView | `migration-required-view.tsx` | 迁移提示视图 |
| SafeMarkdown | `safe-markdown.tsx` | 安全 Markdown |
| AmountDisplay | `amount-display.tsx` | 金额显示 |
| Skeleton | `skeleton.tsx` | 骨架屏 |

---

## Layout 组件 (5个)

| 组件 | 文件 | 描述 |
|------|------|------|
| SwipeableTabs | `swipeable-tabs.tsx` | 可滑动标签页 |
| BottomSheet | `bottom-sheet.tsx` | 底部弹窗 |
| TabBar | `tab-bar.tsx` | 底部导航栏 |
| PageHeader | `page-header.tsx` | 页面头部 |
| Modal | `modal.tsx` | 模态框 |

---

## 详细文档

### StepIndicator

步骤进度指示器。

```typescript
interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

<StepIndicator currentStep={2} totalSteps={4} />
```

### AnimatedNumber

数字变化动画。

```typescript
interface AnimatedNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

<AnimatedNumber value={1234.56} prefix="$" decimals={2} />
```

### QRCode

二维码生成。

```typescript
interface QRCodeProps {
  value: string;
  size?: number;
  logo?: string;
  className?: string;
}

<QRCode value="0x1234..." size={200} />
```

### AmountDisplay

格式化金额显示。

```typescript
interface AmountDisplayProps {
  amount: Amount | string;
  symbol?: string;
  showSign?: boolean;
  showFiat?: boolean;
  fiatValue?: number;
}

<AmountDisplay amount="1.5" symbol="ETH" showFiat fiatValue={3000} />
// 显示: 1.5 ETH ($3,000.00)
```

### TimeDisplay

相对/绝对时间显示。

```typescript
interface TimeDisplayProps {
  timestamp: number;
  format?: 'relative' | 'absolute' | 'auto';
}

<TimeDisplay timestamp={Date.now() - 60000} format="relative" />
// 显示: 1 分钟前
```

### EmptyState

空状态占位。

```typescript
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

<EmptyState
  icon={<WalletIcon />}
  title="暂无钱包"
  description="创建或导入钱包开始使用"
  action={<Button>创建钱包</Button>}
/>
```

### LoadingSpinner

加载动画。

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

<LoadingSpinner size="lg" />
```

### Skeleton

骨架屏加载占位。

```typescript
<Skeleton className="h-4 w-[200px]" />
<Skeleton className="h-12 w-full rounded-lg" />
```

### PageHeader

页面头部导航。

```typescript
interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

<PageHeader
  title="发送"
  onBack={() => pop()}
  rightAction={<Button variant="ghost">扫码</Button>}
/>
```

### TabBar

底部导航栏。

```typescript
interface TabBarProps {
  items: TabBarItem[];
  activeIndex: number;
  onChange: (index: number) => void;
}

interface TabBarItem {
  icon: React.ReactNode;
  label: string;
  badge?: number;
}
```

### SwipeableTabs

可滑动切换的标签页。

```typescript
interface SwipeableTabsProps {
  tabs: Tab[];
  activeIndex: number;
  onChange: (index: number) => void;
  children: React.ReactNode[];
}

<SwipeableTabs
  tabs={[
    { label: '资产' },
    { label: '交易' },
  ]}
  activeIndex={activeTab}
  onChange={setActiveTab}
>
  <AssetList />
  <TransactionList />
</SwipeableTabs>
```

### Alert

警告/提示条。

```typescript
interface AlertProps {
  variant?: 'default' | 'destructive' | 'warning';
  children: React.ReactNode;
}

<Alert variant="warning">
  <AlertTriangle className="h-4 w-4" />
  <AlertTitle>注意</AlertTitle>
  <AlertDescription>请确保您已备份助记词</AlertDescription>
</Alert>
```

### GradientButton

渐变背景按钮。

```typescript
interface GradientButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  gradient?: string;
}

<GradientButton gradient="from-blue-500 to-purple-500">
  立即购买
</GradientButton>
```

### ErrorBoundary

错误边界组件。

```typescript
<ErrorBoundary fallback={<ErrorView />}>
  <MyComponent />
</ErrorBoundary>
```

### SafeMarkdown

安全渲染 Markdown (XSS 防护)。

```typescript
<SafeMarkdown content="**粗体** 和 [链接](https://example.com)" />
```

---

## 相关文档

- [Primitives](../02-Primitives/00-Index.md)
- [Domain Components](../04-Domain/01-Wallet-Asset.md)
- [Layout](./Layout.md) - 布局组件
