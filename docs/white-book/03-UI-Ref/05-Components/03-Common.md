# Common 组件

> 源码: [`src/components/common/`](https://github.com/BioforestChain/KeyApp/blob/main/src/components/common/)

## 组件列表

| 组件 | 文件 | 说明 |
|------|------|------|
| `AmountDisplay` | `amount-display.tsx` | 金额显示 (动画) |
| `AmountWithFiat` | `amount-display.tsx` | 金额+法币 |
| `AnimatedNumber` | `animated-number.tsx` | 数字动画 |
| `EmptyState` | `empty-state.tsx` | 空状态 |
| `GradientButton` | `gradient-button.tsx` | 渐变按钮 |
| `Alert` | `alert.tsx` | 警告提示 |
| `ContactAvatar` | `contact-avatar.tsx` | 联系人头像 |
| `DevWatermark` | `DevWatermark.tsx` | 开发水印 |
| `ErrorBoundary` | `error-boundary.tsx` | 错误边界 |
| `FormField` | `form-field.tsx` | 表单字段 |
| `IconCircle` | `icon-circle.tsx` | 圆形图标 |

---

## AmountDisplay

金额显示组件，支持动画、隐私模式、紧凑显示。

### Props

```typescript
interface AmountDisplayProps {
  value: string | number
  symbol?: string             // 代币符号
  decimals?: number           // 小数位 (默认 8)
  sign?: 'auto' | 'always' | 'never'  // 正负号
  color?: 'auto' | 'default' | 'positive' | 'negative'
  compact?: boolean           // 紧凑模式 (1K, 1M)
  hidden?: boolean            // 隐私模式
  loading?: boolean           // 加载态
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  mono?: boolean              // 等宽字体 (默认 true)
  animated?: boolean          // 动画 (默认 true)
  fixedDecimals?: boolean     // 固定小数位
  className?: string
}
```

### 使用示例

```tsx
// 基础用法
<AmountDisplay value={1.5} symbol="ETH" />

// 带动画 + 涨跌配色
<AmountDisplay value={-2.3} sign="always" color="auto" />

// 紧凑模式
<AmountDisplay value={1500000} compact />  // 显示 1.5M

// 隐私模式
<AmountDisplay value={100} hidden />  // 显示 ••••••

// 加载态
<AmountDisplay value={0} loading />  // 带呼吸动画
```

### 动画实现

使用 `@number-flow/react` 实现数字滚动动画：

```tsx
<NumberFlow
  value={Math.abs(numValue)}
  format={{ minimumFractionDigits: 0, maximumFractionDigits: decimals }}
  locales="en-US"
/>
```

---

## AmountWithFiat

金额 + 法币价值复合显示。

```tsx
<AmountWithFiat
  value={1.5}
  symbol="ETH"
  fiatValue={3750}
  fiatSymbol="$"
  layout="vertical"  // 或 'horizontal'
/>

// 渲染:
// 1.5 ETH
// ≈ $3,750
```

---

## EmptyState

通用空状态组件。

### Props

```typescript
interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}
```

### 使用示例

```tsx
<EmptyState
  icon={<IconWallet className="size-12" />}
  title="暂无资产"
  description="添加代币以开始"
  action={<Button>添加代币</Button>}
/>
```

---

## GradientButton

渐变色按钮，支持多种配色。

### Props

```typescript
interface GradientButtonProps extends ButtonHTMLAttributes {
  variant?: 'blue' | 'purple' | 'red' | 'mint'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
  asChild?: boolean
}
```

### 渐变配色

| Variant | 渐变 |
|---------|------|
| `blue` | 蓝色渐变 |
| `purple` | 紫色渐变 (默认) |
| `red` | 红色渐变 |
| `mint` | 薄荷绿渐变 |

### 使用示例

```tsx
<GradientButton variant="purple" size="lg" fullWidth>
  创建钱包
</GradientButton>

<GradientButton loading>
  处理中...
</GradientButton>
```

---

## Alert

警告/提示组件。

```tsx
<Alert variant="warning">
  请备份您的助记词
</Alert>

<Alert variant="error">
  交易失败
</Alert>
```

---

## ContactAvatar

联系人头像，支持 emoji 或图片。

```tsx
<ContactAvatar avatar="👩" name="Alice" size="md" />
<ContactAvatar avatar="https://..." name="Bob" />
<ContactAvatar name="Charlie" />  // 显示首字母 C
```

---

## IconCircle

圆形图标容器。

```tsx
<IconCircle variant="success">
  <IconCheck />
</IconCircle>

<IconCircle variant="warning" size="lg">
  <IconAlertTriangle />
</IconCircle>
```

---

## ErrorBoundary

React 错误边界。

```tsx
<ErrorBoundary fallback={<ErrorFallback />}>
  <RiskyComponent />
</ErrorBoundary>
```
