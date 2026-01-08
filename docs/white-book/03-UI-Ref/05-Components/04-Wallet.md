# Wallet 组件

> 源码: [`src/components/wallet/`](https://github.com/BioforestChain/KeyApp/blob/main/src/components/wallet/)

## 组件列表

| 组件 | 文件 | 说明 |
|------|------|------|
| `WalletCard` | `wallet-card.tsx` | 3D 钱包卡片 |
| `WalletCardCarousel` | `wallet-card-carousel.tsx` | 卡片轮播 |
| `AddressDisplay` | `address-display.tsx` | 地址显示 |
| `ChainIcon` | `chain-icon.tsx` | 链图标 |
| `ChainBadge` | `chain-icon.tsx` | 链标签 |
| `ChainAddressSelector` | `chain-address-selector.tsx` | 链地址选择器 |
| `ChainAddressDisplay` | `chain-address-display.tsx` | 链地址显示 |
| `TokenIcon` | `token-icon.tsx` | 代币图标 |
| `WalletAddressPortfolio` | `wallet-address-portfolio.tsx` | 钱包资产组合 |

---

## WalletCard

3D 全息钱包卡片，支持陀螺仪/触摸交互。

### 行为约束

| 约束级别 | 要求 |
|----------|------|
| **MUST** | 显示钱包名称 |
| **MUST** | 显示缩略地址（使用 AddressDisplay） |
| **MUST** | 地址可复制 |
| **MUST** | 应用 themeHue 主题色 |
| **SHOULD** | 支持触控倾斜交互 |
| **SHOULD** | 显示动态光泽效果 |
| **SHOULD** | 显示链图标水印 |
| **SHOULD** | 提供链切换入口 |
| **MAY** | 自定义水印尺寸 |
| **MAY** | 禁用 3D 效果（性能优化） |

### Props

```typescript
interface WalletCardProps {
  wallet: Wallet
  chain: ChainType
  chainName: string
  priority?: 'high' | 'low'     // 渲染优先级
  address?: string
  chainIconUrl?: string         // 水印图标
  watermarkLogoSize?: number    // 水印尺寸 (默认 60)
  themeHue?: number             // 主题色相 (默认 323)
  onCopyAddress?: () => void
  onOpenChainSelector?: () => void
  onOpenSettings?: () => void
  disableWatermarkRefraction?: boolean
  disablePatternRefraction?: boolean
  enableGyro?: boolean
  className?: string
}
```

### 特性

- **3D 倾斜**: 基于触摸/陀螺仪的 3D 旋转
- **全息效果**: Canvas 渲染的彩虹光影
- **水印层**: 链图标单色遮罩平铺
- **GPU 加速**: CSS 变量驱动动画

### 交互系统

```typescript
// CSS 变量驱动所有动画
const cssVars = {
  '--tilt-x': tiltX,           // 倾斜角度 X
  '--tilt-y': tiltY,           // 倾斜角度 Y
  '--tilt-nx': normalizedTiltX, // 归一化 X (-1~1)
  '--tilt-ny': normalizedTiltY, // 归一化 Y (-1~1)
  '--tilt-intensity': tiltIntensity,  // 强度 (0~1)
  '--tilt-direction': tiltDirection,  // 方向角
}
```

### 渲染结构

```
┌─────────────────────────────────────────────┐
│ [🔷 Ethereum ▾]                    [⚙️]    │  ← 顶部工具栏
│                                             │
│              My Wallet                      │  ← 居中标题
│                                             │
│ 0x742d...6634                      [📋]    │  ← 底部地址栏
│                                             │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  ← 链图标水印层
└─────────────────────────────────────────────┘
     ↑ 3D 倾斜 + 全息光影 + 渐变背景(themeHue)
```

### 设计规格

| 部分 | 规格 |
|------|------|
| 卡片比例 | 1.6:1 (宽:高) |
| 卡片圆角 | 16px (rounded-2xl) |
| 卡片内边距 | 20px |
| 钱包名字号 | 24px / font-bold |
| 地址字号 | 14px / font-mono |
| 水印尺寸 | 24px (实际) / 40px (含间距) |

### 3D 效果参数

| 参数 | 值 |
|------|------|
| 最大倾斜角度 | ±15° |
| 透视距离 | 1000px |
| 过渡曲线 | cubic-bezier(0.34, 1.56, 0.64, 1) |
| 过渡时长 | 400ms |

### 主题色渐变

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

## AddressDisplay

智能截断的地址显示，支持复制。

### 行为约束

| 约束级别 | 要求 |
|----------|------|
| **MUST** | 显示完整地址的前后部分 |
| **MUST** | 支持复制到剪贴板 |
| **MUST** | 复制后显示反馈 (Toast/振动) |
| **SHOULD** | 根据容器宽度自动调整截断 |
| **SHOULD** | 使用等宽字体 |
| **MAY** | 自定义前后字符数 |

### Props

```typescript
interface AddressDisplayProps {
  address: string
  startChars?: number          // 开头字符数
  endChars?: number            // 结尾字符数
  placeholder?: string
  copyable?: boolean           // 可复制 (默认 true)
  onCopy?: () => void
  className?: string
}
```

### 智能截断算法

```typescript
// 1. 使用 Canvas 测量文字宽度
// 2. 根据容器宽度计算可显示字符数
// 3. 按 55:45 比例分配前后字符
// 4. 响应容器尺寸变化自动调整
```

### 使用示例

```tsx
// 自动截断
<AddressDisplay address="0x742d35Cc6634C0532925a3b844Bc9e7595f..." />
// 显示: 0x742d35Cc...7595f

// 固定截断
<AddressDisplay address={address} startChars={8} endChars={6} />
// 显示: 0x742d35...e7595f
```

---

## ChainIcon

链图标组件，支持图片和首字母回退。

### Props

```typescript
interface ChainIconProps {
  chainId?: string
  iconUrl?: string             // 优先使用
  symbol?: string              // 回退显示
  size?: 'sm' | 'md' | 'lg'
  className?: string
}
```

### 优先级

1. `iconUrl` prop
2. `ChainIconProvider` context
3. 首字母 + 背景色

### 使用示例

```tsx
// 从 context 自动获取图标
<ChainIconProvider getIconUrl={(id) => configs[id]?.icon}>
  <ChainIcon chainId="ethereum" />
</ChainIconProvider>

// 手动指定
<ChainIcon chainId="ethereum" iconUrl="/icons/eth.svg" />
```

### 预设背景色

| Chain | 颜色 |
|-------|------|
| ethereum | 蓝紫 |
| bitcoin | 橙色 |
| tron | 红色 |
| binance | 黄色 |
| bfmeta | 自定义 |

---

## ChainBadge

链标签，图标 + 文字。

```tsx
<ChainBadge chainId="ethereum" />
// 渲染: [🔷 ETH]
```

---

## TokenIcon

代币图标，支持 URL 和符号回退。

```tsx
<TokenIcon symbol="ETH" imageUrl="/icons/eth.png" size="lg" />
<TokenIcon symbol="UNKNOWN" />  // 显示首字母 U
```

---

## ChainAddressSelector

链地址选择下拉框。

```tsx
<ChainAddressSelector
  addresses={wallet.chainAddresses}
  value={selectedChain}
  onChange={setSelectedChain}
/>
```

---

## WalletCardCarousel

钱包卡片轮播，支持左右滑动切换。

```tsx
<WalletCardCarousel
  wallets={wallets}
  activeIndex={currentIndex}
  onIndexChange={setCurrentIndex}
/>
```
