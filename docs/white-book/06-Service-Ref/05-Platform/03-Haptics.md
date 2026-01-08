# Haptics Service

> 源码: [`src/services/haptics/`](https://github.com/AInewsAPP/KeyApp/blob/main/src/services/haptics/)

## 概述

Haptics Service 提供触觉反馈功能，支持多种反馈类型和自定义振动模式。

## 服务元信息

```typescript
// types.ts
import { z } from 'zod'
import { defineServiceMeta } from '@/lib/service-meta'

const HapticTypeSchema = z.enum([
  'light',    // 轻触
  'medium',   // 中等
  'heavy',    // 重击
  'success',  // 成功
  'warning',  // 警告
  'error'     // 错误
]).optional()

export const hapticsServiceMeta = defineServiceMeta('haptics', (s) =>
  s
    .description('触觉反馈服务')
    .api('impact', {
      description: '触发触觉反馈',
      input: HapticTypeSchema,
      output: z.void(),
    })
    .api('vibrate', {
      description: '振动指定时长',
      input: z.number().optional(),
      output: z.void(),
    })
)
```

## API

### impact(type?)

触发预定义的触觉反馈：

```typescript
import { hapticsService } from '@/services/haptics'

// 轻触反馈（按钮点击）
await hapticsService.impact('light')

// 成功反馈（交易完成）
await hapticsService.impact('success')

// 错误反馈（操作失败）
await hapticsService.impact('error')

// 默认中等强度
await hapticsService.impact()
```

### vibrate(duration?)

自定义振动时长：

```typescript
// 振动 100ms（默认）
await hapticsService.vibrate()

// 振动 200ms
await hapticsService.vibrate(200)
```

## 振动模式

| 类型 | 模式 | 说明 |
|------|------|------|
| `light` | 10ms | 轻触反馈 |
| `medium` | 20ms | 中等反馈 |
| `heavy` | 30ms | 重击反馈 |
| `success` | [10, 50, 10] | 双击成功 |
| `warning` | [20, 30, 20] | 警告提醒 |
| `error` | [30, 50, 30, 50, 30] | 错误震动 |

## 平台实现

### Web (web.ts)

使用 Vibration API：

```typescript
export const hapticsService = hapticsServiceMeta.impl({
  async impact(type) {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 30,
        success: [10, 50, 10],
        warning: [20, 30, 20],
        error: [30, 50, 30, 50, 30],
      }
      navigator.vibrate(patterns[type ?? 'medium'])
    }
  },

  async vibrate(duration) {
    if ('vibrate' in navigator) {
      navigator.vibrate(duration ?? 100)
    }
  },
})
```

### DWeb (dweb.ts)

调用原生 Haptic Engine：

```typescript
export const hapticsService = hapticsServiceMeta.impl({
  async impact(type) {
    // 调用 plaoc 原生 API
    await dwebHaptics.impact(type)
  },
  // ...
})
```

### Mock (mock.ts)

测试环境静默实现：

```typescript
export const hapticsService = hapticsServiceMeta.impl({
  async impact() { /* no-op */ },
  async vibrate() { /* no-op */ },
})
```

## 使用场景

```typescript
// 按钮点击
<Button onClick={() => {
  hapticsService.impact('light')
  handleClick()
}}>

// 滑动操作完成
onSwipeComplete={() => {
  hapticsService.impact('success')
}}>

// 错误提示
catch (error) {
  hapticsService.impact('error')
  showError(error)
}
```

## 浏览器兼容性

| 浏览器 | 支持 |
|--------|------|
| Chrome Android | ✅ |
| Safari iOS | ❌ (需原生) |
| Firefox Android | ✅ |
| Desktop | ❌ |

注意：iOS Safari 不支持 Vibration API，需通过 DWeb 原生实现。
