# 主题配色系统

> 源码: [`src/styles/`](https://github.com/BioforestChain/KeyApp/blob/main/src/styles/), [`tailwind.config.ts`](https://github.com/BioforestChain/KeyApp/blob/main/tailwind.config.ts)

---

## 核心概念：配色对

shadcn/ui 使用**配色对**设计，每个颜色变量都有对应的 `xxx-foreground`：

| 变量 | 用途 |
|------|------|
| `--xxx` | **背景色** |
| `--xxx-foreground` | **在该背景上的前景色/文字色** |

**关键规则**: 它们 **MUST** 配套使用。

---

## 配色对使用指南

```
┌─────────────────────────────────────────────────────────────┐
│  primary          ──────────────────────►  主要操作         │
│  ┌─────────────────────────────────────┐                   │
│  │ bg-primary text-primary-foreground  │ 主要按钮          │
│  └─────────────────────────────────────┘                   │
│  ┌─────────────────────────────────────┐                   │
│  │ text-primary                        │ 强调文字/链接      │
│  └─────────────────────────────────────┘                   │
│                                                             │
│  secondary        ──────────────────────►  次要操作         │
│  ┌─────────────────────────────────────┐                   │
│  │ bg-secondary text-secondary-foreground │ 次要按钮       │
│  └─────────────────────────────────────┘                   │
│                                                             │
│  muted            ──────────────────────►  低调/辅助        │
│  ┌─────────────────────────────────────┐                   │
│  │ bg-muted text-muted-foreground      │ 低调背景区域      │
│  └─────────────────────────────────────┘                   │
│  ┌─────────────────────────────────────┐                   │
│  │ text-muted-foreground               │ 次要/辅助文字     │
│  └─────────────────────────────────────┘                   │
│                                                             │
│  destructive      ──────────────────────►  危险/删除        │
│  ┌─────────────────────────────────────┐                   │
│  │ bg-destructive text-destructive-foreground │ 危险按钮   │
│  └─────────────────────────────────────┘                   │
│  ┌─────────────────────────────────────┐                   │
│  │ text-destructive                    │ 错误文字          │
│  └─────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 行为约束

### MUST (必须)

```tsx
// ✅ 配套使用
<Button className="bg-primary text-primary-foreground">确认</Button>

// ❌ 禁止单独使用 foreground
<div className="text-primary-foreground">看不清</div>
```

### MUST NOT (禁止)

```tsx
// ❌ 禁止：text-secondary 当文字色（它是背景色！）
<p className="text-secondary">看不见</p>

// ❌ 禁止：secondary 表示成功状态
<Check className="text-secondary" />
```

### SHOULD (建议)

```tsx
// ✅ 次要文字用 muted-foreground
<p className="text-muted-foreground">辅助说明文字</p>

// ✅ 成功状态用 green
<Check className="text-green-500" />
```

---

## 语义色对照表

| 语义 | 正确用法 | 使用场景 |
|------|----------|----------|
| 主要操作 | `bg-primary text-primary-foreground` | 主要按钮 |
| 主要强调 | `text-primary` | 链接、强调文字 |
| 次要操作 | `bg-secondary text-secondary-foreground` | 次要按钮 |
| 次要文字 | `text-muted-foreground` | 辅助说明、时间戳 |
| 危险操作 | `bg-destructive text-destructive-foreground` | 删除按钮 |
| 错误提示 | `text-destructive` | 错误信息 |
| 成功状态 | `text-green-500` | 完成、确认 |
| 警告状态 | `text-yellow-500` | 警告、注意 |
| 信息提示 | `text-blue-500` | 一般提示 |

---

## 主题变量值

### 亮色主题

```css
:root {
  --primary: oklch(0.59 0.26 323);           /* 品牌紫色 */
  --primary-foreground: oklch(1 0 0);        /* 白色 */
  
  --secondary: oklch(0.967 0.001 286.375);   /* 极浅灰 */
  --secondary-foreground: oklch(0.21 0.006 285.885);
  
  --muted: oklch(0.967 0.001 286.375);       /* 极浅灰 */
  --muted-foreground: oklch(0.552 0.016 285.938);
  
  --destructive: oklch(0.577 0.245 27.325);  /* 红色 */
  --destructive-foreground: oklch(1 0 0);
}
```

### 暗色主题

```css
.dark {
  --primary: oklch(0.67 0.26 322);           /* 亮品牌紫 */
  --primary-foreground: oklch(0.141 0.005 285.823);
  
  --secondary: oklch(0.274 0.006 286.033);   /* 深灰 */
  --secondary-foreground: oklch(0.985 0 0);
  
  --muted: oklch(0.274 0.006 286.033);
  --muted-foreground: oklch(0.705 0.015 286.067);
  
  --destructive: oklch(0.704 0.191 22.216);  /* 亮红 */
  --destructive-foreground: oklch(1 0 0);
}
```

---

## 钱包个性化主题色

### 概述

每个钱包拥有独立的主题色（色相值 0-360），用于：
- 钱包卡片渐变背景
- 确认按钮动态颜色
- 视觉区分多钱包

### CSS 自定义属性

```css
@property --primary-hue {
  syntax: "<number>";
  inherits: true;
  initial-value: 323;
}
```

### 色相派生算法

从钱包地址稳定派生初始色相：

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

### 预设色相

```typescript
const WALLET_THEME_COLORS = [
  { hue: 0, name: '红色' },
  { hue: 30, name: '橙色' },
  { hue: 60, name: '黄色' },
  { hue: 120, name: '绿色' },
  { hue: 180, name: '青色' },
  { hue: 240, name: '蓝色' },
  { hue: 270, name: '紫色' },
  { hue: 300, name: '品红' },
  { hue: 330, name: '玫红' },
];
```

---

## 深色模式

### 行为约束

| 约束 | 说明 |
|------|------|
| MUST | 跟随系统设置 |
| MUST | 颜色自动切换 |
| SHOULD | 提供手动切换入口 |
| MUST NOT | 使用硬编码颜色 |

### 检测方式

```typescript
// CSS 媒体查询
@media (prefers-color-scheme: dark) {
  :root { /* dark values */ }
}

// JavaScript 检测
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
```

---

## 对比度要求

| 元素 | 最小对比度 | WCAG 级别 |
|------|-----------|-----------|
| 正文文本 | 4.5:1 | AA |
| 大文本（≥18px） | 3:1 | AA |
| 图标 | 3:1 | AA |
| 禁用状态 | 无要求 | - |

---

## 相关文档

- [设计原则](./02-Design-Principles.md)
- [交互规范](./04-Interaction-Specs.md)
- [WalletCard 组件](../05-Components/04-Wallet.md)
