# AmountDisplay 金额显示

> 格式化显示加密货币金额，支持平滑数字动画

---

## 功能描述

将原始金额值格式化为人类可读的形式，支持多种显示配置。使用 `@number-flow/react` 实现专业的数字动画效果。

### 核心特性

- **数字动画**: 数值变化时逐位平滑过渡动画
- **加载状态**: 显示 "0" 配合呼吸动画，数据到达后平滑过渡到真实值
- **完整可访问性**: 屏幕阅读器正确读取数值
- **等宽字体**: 使用 `font-mono` 确保数字宽度一致

---

## 属性规范

| 属性 | 类型 | 必需 | 默认值 | 说明 |
|-----|------|-----|-------|------|
| value | number \| bigint \| string | Y | - | 金额值 |
| symbol | string | N | - | 货币符号 |
| decimals | number | N | 8 | 小数位数 |
| sign | enum | N | 'never' | 符号显示模式 |
| color | enum | N | 'default' | 颜色模式 |
| size | enum | N | 'md' | 尺寸 |
| weight | enum | N | 'normal' | 字重 |
| loading | boolean | N | false | 是否加载中 |
| animated | boolean | N | true | 是否启用动画 |
| hidden | boolean | N | false | 隐私模式（显示 ••••••） |
| compact | boolean | N | false | 紧凑模式（1K, 1M） |
| mono | boolean | N | true | 是否等宽字体 |

### sign 符号模式

| 值 | 说明 | 示例 |
|---|------|------|
| always | 始终显示 +/- | +100, -50 |
| negative | 仅负数显示 - | 100, -50 |
| never | 不显示符号 | 100, 50 |

### color 颜色模式

| 值 | 说明 |
|---|------|
| default | 默认颜色 |
| auto | 正数绿色，负数红色 |
| positive | 强制绿色 |
| negative | 强制红色 |

### weight 字重

| 值 | 说明 |
|---|------|
| normal | 正常字重 |
| medium | 中等 |
| semibold | 半粗 |
| bold | 粗体 |

---

## 格式化规则

### 小数位处理

```
输入: 1000000000 (decimals: 8)
输出: 10.00000000

输入: 123456789 (decimals: 8)
输出: 1.23456789

输入: 1234567890123456789n (decimals: 18)
输出: 1.234567890123456789
```

### displayDecimals 显示精度

```
value: 1.23456789
displayDecimals: 4
输出: 1.2346 (四舍五入)

displayDecimals: auto
小数 < 0.0001 → 显示全部有效数字
其他 → 最多显示 8 位
```

### 千分位分隔

```
1234567.89 → 1,234,567.89
```

### 极端值处理

```
value: 0
输出: 0 SYMBOL

value: 0.000000001 (极小值)
输出: < 0.00000001 SYMBOL

value: 999999999999 (极大值)
输出: 999.99B SYMBOL (使用 K/M/B 后缀)
```

---

## 行为规范

### 必须 (MUST)

1. 使用千分位分隔符
2. 金额使用等宽数字字体（`font-mono`）
3. 正确处理 bigint 类型
4. **可访问性**: 必须提供 `aria-label` 供屏幕阅读器读取
5. **加载状态**: 显示 "0" 配合呼吸动画（`animate-pulse`），不使用色块骨架屏

### 建议 (SHOULD)

1. 金额右对齐
2. 符号跟随金额，不换行
3. 使用 `@number-flow/react` 实现数字动画
4. 数值变化时平滑过渡，而非直接跳变

### 可选 (MAY)

1. 支持点击复制原始值
2. 支持显示法币估值

---

## 动画规范

### 数字动画

使用 `@number-flow/react` 库实现专业的数字动画：

```tsx
import NumberFlow from '@number-flow/react'

<NumberFlow
  value={10015.12345678}
  format={{
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  }}
  locales="en-US"
/>
```

### 加载状态动画

加载时显示 "0" 配合呼吸动画，数据到达后 NumberFlow 会自动从 0 平滑过渡到真实值：

```tsx
// 加载中
<span className="animate-pulse">
  <NumberFlow value={0} aria-hidden="true" />
</span>

// 数据到达后
<NumberFlow value={10015.12345678} aria-hidden="true" />
// NumberFlow 会自动动画过渡 0 → 10015.12345678
```

---

## 可访问性规范

### 屏幕阅读器支持

由于 NumberFlow 使用 SVG 渲染数字，需要正确处理可访问性：

```tsx
// ✅ 正确：外层提供 aria-label，内层 aria-hidden
<span role="text" aria-label="10,015.12345678 BFM">
  <NumberFlow value={10015.12345678} aria-hidden="true" />
  <span aria-hidden="true">BFM</span>
</span>

// ❌ 错误：屏幕阅读器会读成 "image: 10015.12345678"
<NumberFlow value={10015.12345678} />
```

### 加载状态可访问性

```tsx
<span role="status" aria-label="Loading...">
  <NumberFlow value={0} aria-hidden="true" />
</span>
```

---

## 布局规范

### 标准布局

```
1,234.5678 BFM
```

### 带符号

```
+1,234.5678 BFM  (绿色)
-1,234.5678 BFM  (红色)
```

### 带估值

```
1,234.5678 BFM
≈ ¥ 1,234.56
```

---

## 设计标注

| 尺寸 | 金额字号 | 符号字号 |
|-----|---------|---------|
| sm | 14px | 12px |
| md | 16px | 14px |
| lg | 24px | 18px |
| xl | 32px | 24px |

### 颜色

| 状态 | 颜色 |
|-----|------|
| 默认 | --color-foreground |
| 正数 | --color-success (#22c55e) |
| 负数 | --color-destructive (#ef4444) |
