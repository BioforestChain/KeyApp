# Clipboard Service

> 源码: [`src/services/clipboard/`](https://github.com/AInewsAPP/KeyApp/blob/main/src/services/clipboard/)

## 概述

Clipboard Service 提供系统剪贴板的读写功能，支持文本复制和粘贴。

## 服务元信息

```typescript
// types.ts
import { z } from 'zod'
import { defineServiceMeta } from '@/lib/service-meta'

export const clipboardServiceMeta = defineServiceMeta('clipboard', (s) =>
  s
    .description('剪贴板服务 - 读写系统剪贴板')
    .api('write', {
      description: '写入文本到剪贴板',
      input: z.object({ text: z.string() }),
      output: z.void(),
    })
    .api('read', {
      description: '从剪贴板读取文本',
      input: z.void(),
      output: z.string(),
    })
)
```

## API

### write({ text })

复制文本到剪贴板：

```typescript
import { clipboardService } from '@/services/clipboard'

// 复制地址
await clipboardService.write({ text: '0x742d35Cc6634C0532925a3b844Bc9e7595f...' })

// 复制交易哈希
await clipboardService.write({ text: txHash })
```

### read()

从剪贴板读取文本：

```typescript
// 粘贴地址
const address = await clipboardService.read()
if (isValidAddress(address)) {
  setRecipient(address)
}
```

## 平台实现

### Web (web.ts)

使用 Clipboard API + 降级方案：

```typescript
export const clipboardService = clipboardServiceMeta.impl({
  async write({ text }) {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
  },

  async read() {
    if (navigator.clipboard) {
      return navigator.clipboard.readText()
    }
    return ''
  },
})
```

### DWeb (dweb.ts)

调用原生剪贴板 API：

```typescript
export const clipboardService = clipboardServiceMeta.impl({
  async write({ text }) {
    await dwebClipboard.write(text)
  },
  async read() {
    return dwebClipboard.read()
  },
})
```

### Mock (mock.ts)

测试环境内存实现：

```typescript
let mockClipboard = ''

export const clipboardService = clipboardServiceMeta.impl({
  async write({ text }) {
    mockClipboard = text
  },
  async read() {
    return mockClipboard
  },
})
```

## 使用场景

### 复制地址

```typescript
function CopyAddressButton({ address }: { address: string }) {
  const handleCopy = async () => {
    await clipboardService.write({ text: address })
    toast.show('地址已复制')
  }
  
  return <Button onClick={handleCopy}>复制</Button>
}
```

### 粘贴地址

```typescript
function AddressInput() {
  const handlePaste = async () => {
    const text = await clipboardService.read()
    if (isValidAddress(text)) {
      setAddress(text)
    } else {
      toast.show('无效地址')
    }
  }
  
  return (
    <Input 
      placeholder="输入或粘贴地址"
      suffix={<Button onClick={handlePaste}>粘贴</Button>}
    />
  )
}
```

## 权限说明

| 操作 | Web | DWeb |
|------|-----|------|
| write | 无需权限 | 无需权限 |
| read | 需用户交互触发 | 可能需要权限申请 |

注意：Clipboard API 的 `readText()` 在 Web 平台需要用户交互（如点击按钮）触发，否则会被浏览器拒绝。
