# Wallet Components 详解

> Source: [src/components/wallet/](https://github.com/BioforestChain/KeyApp/tree/main/src/components/wallet)

## 概览

钱包组件库包含 **14 个组件**，用于钱包展示、地址管理和链选择。

---

## 组件清单

| 组件 | 文件 | 描述 |
|------|------|------|
| WalletCard | `wallet-card.tsx` | 3D 卡片展示 (280行) |
| WalletMiniCard | `wallet-mini-card.tsx` | 迷你卡片 |
| WalletList | `wallet-list.tsx` | 钱包列表 |
| WalletSelector | `wallet-selector.tsx` | 钱包选择器 |
| WalletCardCarousel | `wallet-card-carousel.tsx` | 卡片轮播 |
| WalletConfig | `wallet-config.tsx` | 钱包配置 |
| AddressDisplay | `address-display.tsx` | 地址显示 |
| ChainAddressDisplay | `chain-address-display.tsx` | 链地址显示 |
| ChainAddressSelector | `chain-address-selector.tsx` | 链地址选择 |
| ChainIcon | `chain-icon.tsx` | 链图标 |
| TokenIcon | `token-icon.tsx` | 代币图标 |
| WalletAddressPortfolioView | `wallet-address-portfolio-view.tsx` | 地址组合视图 |
| WalletAddressPortfolioFromProvider | `wallet-address-portfolio-from-provider.tsx` | Provider 组合 |
| HologramCanvas | `refraction/hologram-canvas.tsx` | 全息效果 |

---

## WalletCard

3D 交互式钱包卡片，支持陀螺仪倾斜和全息效果。

### Props

```typescript
interface WalletCardProps {
  wallet: Wallet;
  chain: ChainType;
  chainName: string;
  address?: string;
  chainIconUrl?: string;
  themeHue?: number;               // 主题色相 (0-360)
  priority?: 'high' | 'low';       // 渲染优先级
  
  // 回调
  onCopyAddress?: () => void;
  onOpenChainSelector?: () => void;
  onOpenSettings?: () => void;
  
  // 性能优化 (Android)
  disableWatermarkRefraction?: boolean;
  disablePatternRefraction?: boolean;
  enableGyro?: boolean;
}
```

### 视觉效果

```
┌────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────┐ │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ │
│  │ ░░░░░░░░░░ 全息防伪层 (HologramCanvas) ░░░░░░░░░░░░ │ │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ │
│  │                                                      │ │
│  │  钱包名称                              ⚙️ 设置       │ │
│  │                                                      │ │
│  │  ┌────┐                                             │ │
│  │  │ 🔗 │  Ethereum  ▼                               │ │
│  │  └────┘                                             │ │
│  │                                                      │ │
│  │  0x1234...5678                           📋 复制    │ │
│  │                                                      │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
      ↑ 支持 3D 倾斜 (鼠标/陀螺仪)
```

### CSS 自定义属性

```typescript
// 注册可动画的 CSS 属性
const propsToRegister = [
  { name: '--tilt-x', syntax: '<number>', initialValue: '0' },
  { name: '--tilt-y', syntax: '<number>', initialValue: '0' },
  { name: '--tilt-nx', syntax: '<number>', initialValue: '0' },
  { name: '--tilt-ny', syntax: '<number>', initialValue: '0' },
  { name: '--tilt-intensity', syntax: '<number>', initialValue: '0' },
  { name: '--tilt-direction', syntax: '<number>', initialValue: '0' },
];
```

### 使用示例

```tsx
<WalletCard
  wallet={currentWallet}
  chain={selectedChain}
  chainName="Ethereum"
  address={chainAddress?.address}
  chainIconUrl={chainConfig?.icon}
  themeHue={currentWallet.themeHue}
  onCopyAddress={() => copyToClipboard(address)}
  onOpenChainSelector={() => push('ChainSelectorJob', {})}
  onOpenSettings={() => push('WalletConfigActivity', { walletId })}
/>
```

---

## AddressDisplay

格式化地址显示，支持复制和缩略。

### Props

```typescript
interface AddressDisplayProps {
  address: string;
  truncate?: boolean;           // 是否截断
  truncateLength?: number;      // 截断长度
  showCopy?: boolean;           // 显示复制按钮
  onCopy?: () => void;
  className?: string;
}
```

### 截断格式

```
完整:   0x1234567890abcdef1234567890abcdef12345678
截断:   0x1234...5678
中等:   0x123456...345678
```

---

## ChainIcon

链图标组件，支持多种尺寸和 fallback。

### Props

```typescript
interface ChainIconProps {
  chainId: string;
  iconUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}
```

### 尺寸映射

| Size | Pixels |
|------|--------|
| xs | 16px |
| sm | 20px |
| md | 24px |
| lg | 32px |
| xl | 40px |

---

## TokenIcon

代币图标，支持链徽章叠加。

### Props

```typescript
interface TokenIconProps {
  symbol: string;
  iconUrl?: string;
  chainId?: string;
  showChainBadge?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
```

### 视觉效果

```
┌──────────┐
│  ┌────┐  │
│  │ ETH│  │  ← 代币图标
│  └────┘  │
│       🔵 │  ← 链徽章 (可选)
└──────────┘
```

---

## WalletSelector

钱包下拉选择器。

```typescript
interface WalletSelectorProps {
  wallets: Wallet[];
  currentWalletId: string | null;
  onSelect: (walletId: string) => void;
  onAdd?: () => void;
}
```

---

## ChainAddressSelector

多链地址选择器。

```typescript
interface ChainAddressSelectorProps {
  chainAddresses: ChainAddress[];
  selectedChain: ChainType;
  onSelect: (chain: ChainType) => void;
}
```

---

## HologramCanvas (Refraction)

全息防伪效果渲染器。

```typescript
interface HologramCanvasProps {
  priority: 'high' | 'low';
  themeHue: number;
  watermarkUrl?: string;
  className?: string;
}
```

**渲染层级**:
1. 背景渐变层
2. 三角纹理层 (Pattern)
3. 水印层 (Watermark)
4. 光线反射层 (Refraction)

---

## 性能优化

### Android 适配

```typescript
// Android 浏览器上禁用某些效果避免闪动
const isAndroid = /Android/i.test(navigator.userAgent);

<WalletCard
  disableWatermarkRefraction={isAndroid}
  disablePatternRefraction={isAndroid}
  enableGyro={!isAndroid}
/>
```

### 优先级控制

```typescript
// 当前可见卡片使用高优先级
<WalletCard priority="high" />

// 滚动中或不可见的卡片使用低优先级
<WalletCard priority="low" />
```

---

## 相关文档

- [Wallet Store](../../05-State-Ref/02-Stores/01-Wallet-Store.md)
- [Balance Query](../../05-State-Ref/03-Queries/01-Balance-Query.md)
- [Asset Components](./01-Wallet-Asset.md)
