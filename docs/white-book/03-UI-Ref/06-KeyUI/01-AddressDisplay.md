# AddressDisplay 组件

> 源码: [`packages/key-ui/src/address-display/`](https://github.com/BioforestChain/KeyApp/tree/main/packages/key-ui/src/address-display)

## 概述

智能地址显示组件，支持响应式截断和一键复制。

## 显示模式

| 模式 | 格式 | 适用场景 |
|------|------|---------|
| `full` | 完整地址 | 转账确认、签名授权 |
| `auto` | 响应式截断 | 钱包卡片、地址选择器 |
| `compact` | `6...4` | 列表项、小空间 |
| `standard` | `8...6` | 联系人选择 |
| `detailed` | `10...8` | 链选择器 |

## 使用

### 基础用法

```tsx
import { AddressDisplay } from '@biochain/key-ui/address-display'

// 自动截断
<AddressDisplay address="0x742d35Cc6634C0532925a3b844Bc454e4438f44e" />

// 固定模式
<AddressDisplay address={address} mode="compact" />

// 完整显示
<AddressDisplay address={address} mode="full" />
```

### 自定义样式

```tsx
// 使用状态函数
<AddressDisplay
  address={address}
  className={(state) => state.copied ? 'text-green-500' : 'text-gray-500'}
/>

// 使用 render prop
<AddressDisplay
  address={address}
  render={(props, state) => (
    <div {...props} className="custom-class">
      {state.truncated && <span>...</span>}
    </div>
  )}
/>
```

### 使用 Hook

```tsx
import { useAddressDisplay } from '@biochain/key-ui/address-display'

function CustomAddress({ address }) {
  const { displayText, copy, copied, containerRef, truncated } = useAddressDisplay({
    address,
    mode: 'auto',
  })

  return (
    <span ref={containerRef} onClick={copy}>
      {displayText}
      {copied && ' ✓'}
    </span>
  )
}
```

## Props

```typescript
interface AddressDisplayProps {
  address: string
  mode?: 'full' | 'auto' | 'compact' | 'standard' | 'detailed'
  startChars?: number      // 固定截断：开头字符数
  endChars?: number        // 固定截断：结尾字符数
  placeholder?: string     // 空地址占位符 (默认 '---')
  copyable?: boolean       // 可复制 (默认 true)
  onCopy?: () => void      // 复制回调
  testId?: string          // data-testid
  className?: string | ((state: State) => string)
  style?: CSSProperties | ((state: State) => CSSProperties)
  render?: ComponentRenderFn | ReactElement
}

interface AddressDisplayState {
  copied: boolean
  truncated: boolean
  mode: TruncationMode
}
```

## 截断预设

```typescript
const TRUNCATION_PRESETS = {
  compact: { start: 6, end: 4 },   // 总长 13 字符
  standard: { start: 8, end: 6 },  // 总长 17 字符
  detailed: { start: 10, end: 8 }, // 总长 21 字符
}
```

## 场景对照表

| 场景 | 推荐模式 |
|------|---------|
| 转账确认页 | `full` + `break-all` |
| 钱包卡片 | `auto` |
| 交易列表 | `compact` |
| 联系人选择 | `standard` |
| 链选择器 | `detailed` |
| 小程序授权 | `full` |

## 无障碍

- 复制按钮有 `aria-label` 说明完整地址
- 复制成功后更新 `aria-label` 为 "已复制"
- 使用 `role="status"` 区域播报复制状态
