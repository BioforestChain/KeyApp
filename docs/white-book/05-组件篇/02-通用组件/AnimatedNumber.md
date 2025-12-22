# AnimatedNumber 数字动画

> 平滑的数字动画显示组件

---

## 功能描述

使用 `@number-flow/react` 实现专业的数字动画效果。当数值变化时，每一位数字都会平滑过渡，而非直接跳变。

### 核心特性

- **逐位动画**: 数字变化时每一位独立动画
- **加载状态**: 显示 "0" 配合呼吸动画
- **完整可访问性**: 正确支持屏幕阅读器
- **等宽字体**: 使用 `font-mono` 确保数字宽度一致

---

## 组件变体

### AnimatedNumber

基础数字动画组件，接收 `number` 类型值。

```tsx
import { AnimatedNumber } from '@/components/common'

<AnimatedNumber value={10015.12345678} decimals={8} />
```

### AnimatedAmount

包装组件，接收 `string | number` 类型值，自动解析字符串。

```tsx
import { AnimatedAmount } from '@/components/common'

<AnimatedAmount value="10015.12345678" decimals={8} />
<AnimatedAmount value={10015.12345678} decimals={8} />
```

---

## 属性规范

| 属性 | 类型 | 必需 | 默认值 | 说明 |
|-----|------|-----|-------|------|
| value | number | Y | - | 数值 |
| loading | boolean | N | false | 是否加载中 |
| decimals | number | N | 8 | 小数位数 |
| locale | string | N | 'en-US' | 格式化语言 |
| className | string | N | - | 额外样式类 |

---

## 使用场景

### 余额显示

```tsx
const [balance, setBalance] = useState(0)
const [loading, setLoading] = useState(true)

// API 返回后
setLoading(false)
setBalance(10015.12345678)

<AnimatedNumber
  value={balance}
  loading={loading}
  decimals={8}
/>
```

用户将看到：
1. 加载中：显示 "0" 配合呼吸动画
2. 数据到达：0 平滑过渡到 10015.12345678

### 实时价格更新

```tsx
const [price, setPrice] = useState(1234.56)

// WebSocket 推送新价格
setPrice(1245.78)

<AnimatedNumber value={price} decimals={2} />
```

价格变化时，每一位数字独立动画过渡。

---

## 可访问性规范

### 必须遵守

由于 NumberFlow 使用 SVG 渲染，直接使用会导致屏幕阅读器读出 "image: xxx"。组件内部已正确处理：

```tsx
// 组件内部实现
<span role="text" aria-label={formattedValue}>
  <NumberFlow value={value} aria-hidden="true" />
</span>
```

### 加载状态

```tsx
<span role="status" aria-label="Loading...">
  <NumberFlow value={0} aria-hidden="true" />
</span>
```

---

## 技术实现

### 依赖

```bash
pnpm add @number-flow/react
```

### 测试环境

NumberFlow 不支持 JSDOM，需要在测试中 mock：

```ts
// src/test/setup.ts
vi.mock('@number-flow/react', () => ({
  default: ({ value, format }: { value: number; format?: Intl.NumberFormatOptions }) => {
    const formatted = value.toLocaleString('en-US', format)
    return formatted
  },
}))
```

---

## 与 AmountDisplay 的关系

| 组件 | 用途 | 特性 |
|-----|------|------|
| AnimatedNumber | 纯数字动画 | 简单、轻量 |
| AmountDisplay | 完整金额显示 | 符号、颜色、尺寸、法币估值 |

AmountDisplay 内部使用 NumberFlow 实现动画，同时提供更丰富的配置选项。

---

## 设计标注

### 字体

- 使用 `font-mono` 等宽字体
- 确保数字宽度一致，避免动画时布局跳动

### 动画

- 动画由 `@number-flow/react` 控制
- 默认使用库内置的缓动曲线
- 加载状态使用 Tailwind 的 `animate-pulse`
