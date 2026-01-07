# Toast Service

> 源码: [`src/services/toast/`](https://github.com/AInewsAPP/KeyApp/blob/main/src/services/toast/)

## 概述

Toast Service 提供轻量级消息提示功能，支持多种位置和自定义持续时间。

## 服务元信息

```typescript
// types.ts
import { z } from 'zod'
import { defineServiceMeta } from '@/lib/service-meta'

const ToastPositionSchema = z.enum(['top', 'center', 'bottom'])

const ToastOptionsSchema = z.union([
  z.string(),  // 简写：仅消息
  z.object({
    message: z.string(),
    duration: z.number().optional(),
    position: ToastPositionSchema.optional(),
  }),
])

export const toastServiceMeta = defineServiceMeta('toast', (s) =>
  s
    .description('Toast 提示服务')
    .api('show', {
      description: '显示 Toast 提示',
      input: ToastOptionsSchema,
      output: z.void(),
    })
)
```

## API

### show(options)

显示 Toast 提示：

```typescript
import { toastService } from '@/services/toast'

// 简写形式
await toastService.show('操作成功')

// 完整形式
await toastService.show({
  message: '地址已复制',
  duration: 3000,
  position: 'top',
})
```

## 参数说明

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `message` | string | - | 提示消息（必填） |
| `duration` | number | 2000 | 显示时长 (ms) |
| `position` | 'top' \| 'center' \| 'bottom' | 'bottom' | 显示位置 |

## 平台实现

### Web (web.ts)

使用 DOM 动态创建：

```typescript
export const toastService = toastServiceMeta.impl({
  async show(options) {
    const { message, duration = 2000, position = 'bottom' } =
      typeof options === 'string' ? { message: options } : options

    const toast = document.createElement('div')
    toast.textContent = message
    toast.className = 'bfm-toast'
    toast.style.cssText = `
      position: fixed;
      left: 50%;
      transform: translateX(-50%);
      padding: 12px 24px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      transition: opacity 0.3s;
      ${position === 'top' ? 'top: 60px;' : ''}
      ${position === 'center' ? 'top: 50%; transform: translate(-50%, -50%);' : ''}
      ${position === 'bottom' ? 'bottom: 100px;' : ''}
    `

    document.body.appendChild(toast)

    setTimeout(() => {
      toast.style.opacity = '0'
      setTimeout(() => toast.remove(), 300)
    }, duration)
  },
})
```

### DWeb (dweb.ts)

调用原生 Toast：

```typescript
export const toastService = toastServiceMeta.impl({
  async show(options) {
    const { message, duration, position } =
      typeof options === 'string' ? { message: options } : options
    await dwebToast.show(message, { duration, position })
  },
})
```

### Mock (mock.ts)

测试环境静默实现：

```typescript
export const toastService = toastServiceMeta.impl({
  async show(options) {
    const message = typeof options === 'string' ? options : options.message
    console.log('[Toast]', message)
  },
})
```

## 使用场景

### 操作反馈

```typescript
// 复制成功
await clipboardService.write({ text: address })
await toastService.show('地址已复制')

// 保存成功
await saveSettings()
await toastService.show({ message: '设置已保存', position: 'top' })
```

### 错误提示

```typescript
try {
  await sendTransaction()
} catch (error) {
  await toastService.show({
    message: error.message,
    duration: 4000,
    position: 'center',
  })
}
```

### 网络状态

```typescript
// 离线提示
window.addEventListener('offline', () => {
  toastService.show({ message: '网络已断开', position: 'top' })
})
```

## 样式说明

| 属性 | 值 |
|------|-----|
| 背景色 | `rgba(0, 0, 0, 0.8)` |
| 文字颜色 | `white` |
| 圆角 | `8px` |
| 内边距 | `12px 24px` |
| 字号 | `14px` |
| z-index | `10000` |
| 动画 | `opacity 0.3s` 淡出 |

## 位置定位

| 位置 | CSS |
|------|-----|
| `top` | `top: 60px` |
| `center` | `top: 50%; transform: translate(-50%, -50%)` |
| `bottom` | `bottom: 100px` |
