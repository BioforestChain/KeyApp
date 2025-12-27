# WalletCard 钱包卡片

> 3D 拟物化钱包卡片，支持触控倾斜、动态光影和个性化主题色

---

## 功能描述

展示钱包的基本信息，采用 3D 变换实现真实卡片质感：
- 触控/悬停时的倾斜响应
- 动态光泽和阴影效果
- 个性化主题色渐变背景
- 链图标防伪水印

---

## 属性规范

| 属性 | 类型 | 必需 | 默认值 | 说明 |
|-----|------|-----|-------|------|
| wallet | Wallet | Y | - | 钱包数据 |
| chain | ChainType | Y | - | 当前选中的链 |
| chainName | string | Y | - | 链名称显示 |
| address | string | N | - | 当前链地址 |
| chainIconUrl | string | N | - | 链图标 URL（防伪水印） |
| watermarkLogoSize | number | N | 40 | 水印平铺尺寸（含间距） |
| watermarkLogoActualSize | number | N | 24 | 水印实际尺寸 |
| themeHue | number | N | 323 | 主题色相（0-360） |
| onCopyAddress | () => void | N | - | 复制地址回调 |
| onOpenChainSelector | () => void | N | - | 打开链选择器 |
| onOpenSettings | () => void | N | - | 打开设置回调 |
| className | string | N | - | 自定义样式类 |

### Wallet 数据结构

```typescript
interface Wallet {
  id: string
  name: string
  address: string
  chain: ChainType
  chainAddresses: ChainAddress[]
  createdAt: number
  themeHue: number          // 个性化主题色相
  tokens: Token[]
}
```

### ChainAddress 数据结构

```typescript
interface ChainAddress {
  chain: ChainType
  address: string
  tokens: Token[]
}
```

---

## 布局规范

```
┌─────────────────────────────────────────┐
│  [链选择 ▼]                    [设置 ⚙] │  ← 顶部工具栏
│                                         │
│           钱包名称                      │  ← 居中标题
│                                         │
│  0x1234...5678                  [复制]  │  ← 底部地址栏
│                                         │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  ← 链图标水印层
└─────────────────────────────────────────┘
    ↑                              ↑
    └── 渐变背景 (themeHue) ───────┘
```

---

## 3D 效果规范

### 透视容器

```css
.wallet-card-container {
  perspective: 1000px;
}
```

### 倾斜变换

使用 CSS 自定义属性实现平滑动画：

```css
.wallet-card {
  --tilt-x: 0;      /* 垂直倾斜角度 */
  --tilt-y: 0;      /* 水平倾斜角度 */
  --tilt-intensity: 0;  /* 交互强度 0-1 */
  
  transform: rotateX(calc(var(--tilt-x) * 1deg)) 
             rotateY(calc(var(--tilt-y) * 1deg));
  transform-style: preserve-3d;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### 光泽层

```typescript
// 高光跟随触点移动
const glareStyle = {
  background: `radial-gradient(
    circle at ${pointerX}% ${pointerY}%,
    rgba(255,255,255,0.4) 0%,
    rgba(255,255,255,0.1) 30%,
    transparent 60%
  )`,
  opacity: tiltIntensity * 0.8,
};
```

### 阴影效果

```css
.wallet-card {
  box-shadow: 
    inset 0 1px 1px rgba(255,255,255,0.3),   /* 顶部高光 */
    inset 0 -1px 1px rgba(0,0,0,0.2),        /* 底部阴影 */
    0 20px 40px -15px rgba(0,0,0,0.4);       /* 投影 */
}
```

---

## 主题色系统

### 色相派生

钱包主题色从地址稳定派生，确保跨设备一致：

```typescript
function deriveThemeHue(address: string): number {
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = (hash << 5) - hash + address.charCodeAt(i);
    hash = hash & hash;
  }
  return ((hash % 360) + 360) % 360;
}
```

### 渐变背景

使用 OKLCH 色彩空间生成和谐渐变：

```typescript
const gradient = `linear-gradient(
  135deg,
  oklch(0.5 0.2 ${themeHue}) 0%,
  oklch(0.4 0.22 ${themeHue + 20}) 50%,
  oklch(0.3 0.18 ${themeHue + 40}) 100%
)`;
```

---

## 防伪水印

### 实现原理

1. 加载链图标并转换为单色遮罩
2. 使用 `mask-image` 平铺显示
3. 透明度低于主内容，作为背景装饰

```typescript
const watermarkStyle = {
  maskImage: monoMaskUrl,
  maskSize: `${logoSize}px ${logoSize}px`,
  maskRepeat: 'repeat',
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
};
```

### Hook: useChainIconUrls

```typescript
// 获取所有链的图标 URL 映射
const chainIconUrls = useChainIconUrls();
// { ethereum: '/icons/eth.svg', tron: '/icons/tron.svg', ... }
```

---

## 行为规范

### 必须 (MUST)

1. 显示钱包名称
2. 显示缩略地址（使用 AddressDisplay 组件）
3. 地址可复制
4. 应用 themeHue 主题色

### 建议 (SHOULD)

1. 支持触控倾斜交互
2. 显示动态光泽效果
3. 显示链图标水印
4. 提供链切换入口

### 可选 (MAY)

1. 自定义水印尺寸
2. 禁用 3D 效果（性能优化）

---

## 设计标注

### 尺寸规格

| 部分 | 规格 |
|-----|------|
| 卡片比例 | 1.6:1 (宽:高) |
| 卡片圆角 | 16px (rounded-2xl) |
| 卡片内边距 | 20px |
| 钱包名字号 | 24px / font-bold |
| 地址字号 | 14px / font-mono |
| 水印尺寸 | 24px (实际) / 40px (含间距) |

### 倾斜参数

| 参数 | 值 |
|-----|------|
| 最大倾斜角度 | ±15° |
| 透视距离 | 1000px |
| 过渡曲线 | cubic-bezier(0.34, 1.56, 0.64, 1) |
| 过渡时长 | 400ms |

---

## 相关组件

- [WalletConfig](./WalletConfig.md) - 钱包配置（编辑名称/主题色）
- [AddressDisplay](../02-通用组件/AddressDisplay.md) - 地址显示与复制
