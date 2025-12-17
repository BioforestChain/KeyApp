# TokenIcon 代币图标

> 显示代币或链的图标

---

## 功能描述

显示代币/链的品牌图标，支持 fallback 和多种尺寸。

---

## 属性规范

| 属性 | 类型 | 必需 | 默认值 | 说明 |
|-----|------|-----|-------|------|
| symbol | string | Y | - | 代币符号 |
| iconUrl | string | N | - | 图标 URL |
| size | enum | N | 'md' | 尺寸 |
| showBadge | boolean | N | false | 显示链徽标 |
| chainIcon | string | N | - | 链图标 URL |

### size 尺寸

| 值 | 尺寸 | 使用场景 |
|---|------|---------|
| xs | 16px | 行内文字 |
| sm | 24px | 列表辅助 |
| md | 32px | 列表主图标 |
| lg | 48px | 卡片展示 |
| xl | 64px | 详情页 |

---

## 显示规则

### 图标优先级

```
1. iconUrl 存在且加载成功 → 显示图标
2. iconUrl 加载失败 → 显示 fallback
3. iconUrl 不存在 → 显示 fallback
```

### Fallback 生成规则

```
1. 取 symbol 首字母（大写）
2. 背景色基于 symbol 字符串哈希生成
3. 文字颜色自动对比（浅背景深字，深背景浅字）
```

### 哈希颜色算法

```
hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
hue = hash % 360
saturation = 60%
lightness = 50%
backgroundColor = hsl(hue, saturation, lightness)
```

---

## 行为规范

### 必须 (MUST)

1. 无图标时显示 fallback
2. 图标加载失败时显示 fallback
3. 圆形裁剪

### 建议 (SHOULD)

1. 加载中显示骨架屏
2. 缓存已加载的图标

### 可选 (MAY)

1. 支持动画过渡（加载完成时）

---

## 布局规范

### 单图标

```
  ┌───────┐
  │  BTC  │  ← 图片或 fallback
  └───────┘
```

### 带链徽标

```
  ┌───────┐
  │  USDT │
  │     ⬡ │  ← 右下角链图标（1/3 尺寸）
  └───────┘
```

---

## 设计标注

| 部分 | 规格 |
|-----|------|
| 圆角 | 50% (圆形) |
| fallback 字号 | 尺寸的 40% |
| 链徽标尺寸 | 主图标的 33% |
| 链徽标位置 | 右下角，10% 偏移 |
| 链徽标边框 | 2px 白色 |

---

## 已知代币图标

常用代币建议内置图标：

| 符号 | 说明 |
|-----|------|
| BFM | BioForest Meta |
| BTC | Bitcoin |
| ETH | Ethereum |
| USDT | Tether |
| USDC | USD Coin |
| BNB | Binance Coin |

其他代币从链上元数据或第三方服务获取。
