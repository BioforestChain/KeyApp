# TokenIcon 组件

> 源码: [`packages/key-ui/src/token-icon/`](https://github.com/BioforestChain/KeyApp/tree/main/packages/key-ui/src/token-icon)

## 概述

Token 图标组件，采用 Compound Component 模式，支持图片加载和 fallback。

## 使用

### Compound Component 用法

```tsx
import { TokenIcon } from '@biochain/key-ui/token-icon'

<TokenIcon.Root size="md">
  <TokenIcon.Image src={tokenIconUrl} />
  <TokenIcon.Fallback>ETH</TokenIcon.Fallback>
</TokenIcon.Root>
```

### 尺寸

```tsx
// 可用尺寸: xs, sm, md, lg, xl
<TokenIcon.Root size="xs" />  // 16px
<TokenIcon.Root size="sm" />  // 24px
<TokenIcon.Root size="md" />  // 32px (默认)
<TokenIcon.Root size="lg" />  // 40px
<TokenIcon.Root size="xl" />  // 48px
```

### Fallback 延迟

```tsx
// 延迟显示 fallback，避免闪烁
<TokenIcon.Root size="md">
  <TokenIcon.Image src={maybeSlowUrl} />
  <TokenIcon.Fallback delayMs={500}>ETH</TokenIcon.Fallback>
</TokenIcon.Root>
```

## 组件 API

### TokenIcon.Root

容器组件，提供 Context。

```typescript
interface TokenIconRootProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  children?: React.ReactNode
  className?: string | ((state: State) => string)
  style?: CSSProperties | ((state: State) => CSSProperties)
}

interface TokenIconRootState {
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  imageLoaded: boolean
}
```

### TokenIcon.Image

图片组件，自动处理加载状态。

```typescript
interface TokenIconImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  onLoadingStatusChange?: (status: 'loading' | 'loaded' | 'error') => void
}
```

### TokenIcon.Fallback

图片加载失败时显示的 fallback 内容。

```typescript
interface TokenIconFallbackProps extends HTMLAttributes<HTMLSpanElement> {
  delayMs?: number  // 延迟显示 (毫秒)
}
```

## 行为

1. **初始状态**: 显示 Fallback
2. **图片加载中**: 仍显示 Fallback (可配置 delayMs)
3. **图片加载成功**: 隐藏 Fallback，显示 Image
4. **图片加载失败**: 显示 Fallback

## 样式

默认样式：
- 圆形容器 (`rounded-full`)
- 灰色背景 (`bg-muted`)
- 居中 flex 布局

可通过 `className` prop 覆盖：

```tsx
<TokenIcon.Root
  size="md"
  className={(state) => state.imageLoaded ? 'ring-2 ring-green-500' : ''}
>
  ...
</TokenIcon.Root>
```
