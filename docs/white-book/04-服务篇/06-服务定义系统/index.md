# 服务定义系统

> Schema-first 的服务定义与实现规范

---

## 1. 概述

服务定义系统采用 **Schema-first** 设计模式，通过统一的元信息定义来约束所有平台实现，并通过中间件模式处理横切关注点（日志、拦截、Mock 等）。

### 1.1 核心理念

```
Schema Definition → Type-safe Implementation → Middleware Composition
     (types.ts)         (web/dweb/mock.ts)        (可组合的中间件)
```

### 1.2 设计目标

| 目标 | 说明 |
|------|------|
| 单一数据源 | 服务定义只写一次，类型自动推导 |
| 类型安全 | TypeScript 验证实现是否符合定义 |
| 关注点分离 | 日志/拦截/Mock 通过中间件实现，不侵入业务代码 |
| 平台一致性 | web/dweb/mock 三个平台被同一 Schema 约束 |

---

## 2. 成员类型

服务由多种类型的成员组成，每种类型有其特定的语义和使用场景。

### 2.1 类型概览

| 类型 | 语义 | 签名模式 | 典型场景 |
|------|------|----------|----------|
| `api` | 请求-响应 | `(input) => Promise<output>` | 外部请求、RPC 调用 |
| `get` | 只读属性 | `() => T` | 获取状态 |
| `set` | 只写属性 | `(value: T) => void` | 设置状态 |
| `getset` | 读写属性 | `get/set` 组合 | 可读写状态 |
| `stream` | 事件流 | `() => AsyncIterable<T>` | 订阅、推送 |
| `method` | 通用方法 | 任意签名 | 复杂场景 |

### 2.2 选择指南

```
大部分情况 → api / get / set / getset / stream
复杂情况   → method (多参数、重载、特殊签名)
```

**api vs method:**
- `api`: 简单纯粹，单输入单输出，适合定义"对外部的请求"
- `method`: 万能但复杂，支持多参数、可选参数、重载等

---

## 3. API 设计

### 3.1 定义服务元信息

```typescript
// services/clipboard/types.ts
import { z } from 'zod'
import { defineServiceMeta } from '@/lib/service-meta'

// 简写形式 (推荐)
export const clipboardServiceMeta = defineServiceMeta('clipboard', (s) =>
  s.description('剪贴板服务')
    .api('write', z.object({ text: z.string() }), z.void())
    .api('read', z.void(), z.string())
)

// 或使用 options 对象形式 (需要 description 时)
export const clipboardServiceMeta = defineServiceMeta('clipboard', (s) =>
  s.description('剪贴板服务')
    .api('write', {
      description: '写入剪贴板',
      input: z.object({ text: z.string() }),
      output: z.void(),
    })
    .api('read', {
      description: '读取剪贴板',
      input: z.void(),
      output: z.string(),
    })
)

// 导出类型 (自动推导)
export type IClipboardService = typeof clipboardServiceMeta.Type
```

### 3.2 实现服务

```typescript
// services/clipboard/web.ts
import { clipboardServiceMeta } from './types'

export const clipboardService = clipboardServiceMeta.impl({
  async write({ text }) {
    await navigator.clipboard.writeText(text)
  },
  async read() {
    return navigator.clipboard.readText()
  },
})
```

### 3.3 中间件

```typescript
// 全局日志中间件 (MockDevTools)
clipboardServiceMeta.use(async (ctx, next) => {
  const start = Date.now()
  try {
    const result = await next()
    addLog({
      service: ctx.service,
      member: ctx.member,
      type: ctx.type, // 'api' | 'get' | 'set' | 'stream' | 'method'
      input: ctx.input,
      output: result,
      duration: Date.now() - start,
    })
    return result
  } catch (error) {
    addLog({ ...ctx, error, duration: Date.now() - start })
    throw error
  }
})
```

---

## 4. 成员详细定义

### 4.1 api

最常用的类型，用于定义请求-响应式的异步操作。

```typescript
s.api('methodName', {
  description: '方法描述',      // 可选
  input: z.object({ ... }),    // 输入 Schema
  output: z.object({ ... }),   // 输出 Schema
})
```

**实现签名:**
```typescript
async methodName(input: Input): Promise<Output>
```

**示例:**
```typescript
// 定义
s.api('getBalance', {
  description: '获取余额',
  input: z.object({ address: z.string() }),
  output: z.object({ balance: z.string(), symbol: z.string() }),
})

// 实现
async getBalance({ address }) {
  const balance = await rpc.getBalance(address)
  return { balance: balance.toString(), symbol: 'ETH' }
}
```

### 4.2 get

只读属性，用于获取状态。

```typescript
s.get('propertyName', {
  description: '属性描述',
  type: z.string(),  // 属性类型 Schema
})
```

**实现签名:**
```typescript
get propertyName(): T
// 或
propertyName(): T
```

**示例:**
```typescript
// 定义
s.get('isAvailable', {
  description: '生物识别是否可用',
  type: z.boolean(),
})

// 实现
get isAvailable() {
  return 'credentials' in navigator
}
```

### 4.3 set

只写属性，用于设置状态。

```typescript
s.set('propertyName', {
  description: '属性描述',
  type: z.string(),
})
```

**实现签名:**
```typescript
set propertyName(value: T)
// 或
setPropertyName(value: T): void
```

### 4.4 getset

读写属性，组合 get 和 set。

```typescript
s.getset('propertyName', {
  description: '属性描述',
  type: z.enum(['light', 'dark']),
})
```

**实现签名:**
```typescript
{
  get propertyName(): T
  set propertyName(value: T)
}
```

### 4.5 stream

事件流，用于订阅持续的数据更新。

```typescript
s.stream('streamName', {
  description: '流描述',
  yield: z.object({ ... }),   // 每次 yield 的数据类型
  return: z.void(),           // 可选，流结束时的返回值
})
```

**实现签名:**
```typescript
streamName(): AsyncIterable<YieldType>
// 或
async *streamName(): AsyncGenerator<YieldType, ReturnType>
```

**示例:**
```typescript
// 定义
s.stream('onBalanceChange', {
  description: '余额变化事件流',
  yield: z.object({
    address: z.string(),
    balance: z.string(),
    timestamp: z.number(),
  }),
})

// 实现
async *onBalanceChange() {
  const ws = new WebSocket('wss://...')
  for await (const event of ws) {
    yield JSON.parse(event.data)
  }
}
```

### 4.6 method

通用方法，用于复杂场景。

```typescript
s.method('methodName', {
  description: '方法描述',
  args: z.tuple([ArgSchema1, ArgSchema2]),  // 参数元组
  output: OutputSchema,
  async: true,  // 是否异步，默认 true
})
```

**实现签名:**
```typescript
methodName(arg1: Arg1, arg2: Arg2): Promise<Output>
// 或 (async: false)
methodName(arg1: Arg1, arg2: Arg2): Output
```

**示例:**
```typescript
// 定义 - 复杂签名
s.method('signTransaction', {
  description: '签名交易',
  args: z.tuple([
    TransactionSchema,
    z.object({ gasLimit: z.bigint().optional() }),
  ]),
  output: SignedTransactionSchema,
})

// 实现
async signTransaction(tx, options) {
  const gasLimit = options?.gasLimit ?? await estimateGas(tx)
  return sign(tx, gasLimit)
}
```

---

## 5. 中间件系统

### 5.1 中间件签名

```typescript
type Middleware = (ctx: MiddlewareContext, next: () => Promise<unknown>) => Promise<unknown>

interface MiddlewareContext {
  service: string        // 服务名
  member: string         // 成员名
  type: MemberType       // 'api' | 'get' | 'set' | 'stream' | 'method'
  input: unknown         // 输入参数
  meta: MemberMeta       // 成员元信息
}
```

### 5.2 注册中间件

```typescript
// 服务级中间件
clipboardServiceMeta.use(loggingMiddleware)

// 全局中间件 (所有服务)
ServiceMeta.useGlobal(loggingMiddleware)
```

### 5.3 中间件执行顺序

```
Request → Global Middleware 1 → Global Middleware 2 → Service Middleware → Implementation
                                                                                   ↓
Response ← Global Middleware 1 ← Global Middleware 2 ← Service Middleware ← Result
```

### 5.4 内置中间件

| 中间件 | 功能 |
|--------|------|
| `loggingMiddleware` | 记录请求日志 |
| `validationMiddleware` | 校验输入输出 Schema |
| `timingMiddleware` | 记录执行耗时 |
| `retryMiddleware` | 失败重试 |
| `cacheMiddleware` | 结果缓存 |

---

## 6. 目录结构

```
services/
  clipboard/
    types.ts       # 服务元信息定义 (defineServiceMeta)
    web.ts         # Web 平台实现
    dweb.ts        # DWEB 平台实现 (或复用 web.ts)
    mock.ts        # Mock 实现
    index.ts       # 统一导出
  lib/
    service-meta/
      index.ts              # 主入口
      builder.ts            # ServiceMetaBuilder
      types.ts              # 类型定义
      logging-middleware.ts # 日志中间件
```

---

## 6.1 DWEB 与 Web 的关系

**DWEB 是 Web 的超集**。大部分服务直接复用 Web 实现：

```typescript
// services/staking/dweb.ts
// DWEB 是 Web 的超集，直接复用 Web 实现
export { stakingService } from './web'
```

**只有使用 plaoc 插件的服务才需要独立实现：**

| 服务 | DWEB 实现 | 原因 |
|------|-----------|------|
| clipboard | 独立 | 使用 clipboardPlugin |
| biometric | 独立 | 使用 biometricsPlugin |
| storage | 独立 | 使用 keychainPlugin |
| toast | 独立 | 使用 toastPlugin |
| haptics | 独立 | 使用 hapticsPlugin |
| authorize | 独立 | 使用 dwebServiceWorker |
| staking | 复用 web | 纯 HTTP API |
| transaction | 复用 web | 纯 HTTP API |
| camera | 复用 web | 无 plaoc 插件 |
| currency-exchange | 复用 web | 纯 HTTP API |

---

## 7. 完整示例

### 7.1 定义 (types.ts)

```typescript
import { z } from 'zod'
import { defineServiceMeta } from '@/lib/service-meta'

// Schema 定义
const BiometricTypeSchema = z.enum(['fingerprint', 'face', 'none'])
const BiometricAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
  biometricType: BiometricTypeSchema,
  error: z.string().optional(),
})
const BiometricResultSchema = z.object({
  success: z.boolean(),
  errorMessage: z.string().optional(),
})

// 服务元信息
export const biometricServiceMeta = defineServiceMeta('biometric', (s) =>
  s
    .description('生物识别服务')
    .api('isAvailable', {
      description: '检查生物识别是否可用',
      input: z.void(),
      output: BiometricAvailabilitySchema,
    })
    .api('verify', {
      description: '执行生物识别验证',
      input: z.object({
        reason: z.string().optional(),
        fallbackEnabled: z.boolean().optional(),
      }),
      output: BiometricResultSchema,
    })
)

// 导出类型
export type IBiometricService = typeof biometricServiceMeta.Type
export type BiometricType = z.infer<typeof BiometricTypeSchema>
export type BiometricAvailability = z.infer<typeof BiometricAvailabilitySchema>
export type BiometricResult = z.infer<typeof BiometricResultSchema>
```

### 7.2 Web 实现 (web.ts)

```typescript
import { biometricServiceMeta } from './types'

export const biometricService = biometricServiceMeta.impl({
  async isAvailable() {
    if (!window.PublicKeyCredential) {
      return { isAvailable: false, biometricType: 'none' }
    }
    try {
      const available = await PublicKeyCredential
        .isUserVerifyingPlatformAuthenticatorAvailable()
      return {
        isAvailable: available,
        biometricType: available ? 'fingerprint' : 'none',
      }
    } catch {
      return { isAvailable: false, biometricType: 'none' }
    }
  },

  async verify({ reason, fallbackEnabled }) {
    // WebAuthn 实现...
    return { success: false, errorMessage: 'Not implemented in web' }
  },
})
```

### 7.3 Mock 实现 (mock.ts)

```typescript
import { biometricServiceMeta } from './types'

// Mock 数据
let mockAvailable = true
let mockBiometricType: 'fingerprint' | 'face' | 'none' = 'fingerprint'

export const biometricService = biometricServiceMeta.impl({
  async isAvailable() {
    return {
      isAvailable: mockAvailable,
      biometricType: mockBiometricType,
    }
  },

  async verify() {
    if (!mockAvailable) {
      return { success: false, errorMessage: 'Biometric not available' }
    }
    return { success: true }
  },
})

// Mock 控制器 (可选)
export const biometricMockController = {
  setAvailable(available: boolean) { mockAvailable = available },
  setBiometricType(type: typeof mockBiometricType) { mockBiometricType = type },
}
```

### 7.4 导出 (index.ts)

```typescript
export type {
  IBiometricService,
  BiometricType,
  BiometricAvailability,
  BiometricResult,
} from './types'

export { biometricServiceMeta } from './types'
export { biometricService } from '#biometric-impl'
```

---

## 8. MockDevTools 集成

### 8.1 全局日志中间件注册

```typescript
// frontend-main.tsx
// Mock 模式下注册全局日志中间件
if (__MOCK_MODE__) {
  import('./lib/service-meta').then(({ ServiceMeta, loggingMiddleware }) => {
    ServiceMeta.useGlobal(loggingMiddleware)
  })
}
```

### 8.2 内置日志中间件

```typescript
// lib/service-meta/logging-middleware.ts
export const loggingMiddleware: Middleware = async (ctx, next) => {
  const startTime = Date.now()
  const log = addLog({
    timestamp: new Date(),
    service: ctx.service,
    member: ctx.member,
    type: ctx.type,
    input: ctx.input,
    status: 'pending',
  })

  try {
    const result = await next()
    updateLog(log.id, {
      output: result,
      duration: Date.now() - startTime,
      status: 'success',
    })
    return result
  } catch (error) {
    updateLog(log.id, {
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
      status: 'error',
    })
    throw error
  }
}
```

### 8.3 自定义拦截中间件

```typescript
// 用于测试特定场景
biometricServiceMeta.use(async (ctx, next) => {
  // 模拟网络延迟
  if (ctx.member === 'verify') {
    await new Promise(r => setTimeout(r, 500))
  }
  
  // 模拟错误
  if (shouldSimulateError(ctx)) {
    throw new Error('Simulated error')
  }
  
  return next()
})
```

---

## 9. 全局设置系统

MockDevTools 提供全局设置来控制所有 Mock 服务的行为。

### 9.1 设置 API

```typescript
import {
  getGlobalDelay,
  setGlobalDelay,
  getGlobalError,
  setGlobalError,
  resetSettings,
  subscribeSettings,
} from '@/lib/service-meta'

// 设置全局延迟 (所有请求都会延迟)
setGlobalDelay(500) // 500ms

// 设置全局错误 (所有请求都会抛出错误)
setGlobalError(new Error('Network Error'))

// 清除全局错误
setGlobalError(null)

// 重置所有设置
resetSettings()

// 订阅设置变更
const unsubscribe = subscribeSettings((settings) => {
  console.log('Settings changed:', settings)
})
```

### 9.2 设置中间件

设置通过 `settingsMiddleware` 应用到所有请求：

```typescript
// frontend-main.tsx
if (__MOCK_MODE__) {
  import('./lib/service-meta').then(({ 
    ServiceMeta, 
    loggingMiddleware, 
    settingsMiddleware,
    breakpointMiddleware 
  }) => {
    // 执行顺序: logging → settings → breakpoint → 实现
    ServiceMeta.useGlobal(loggingMiddleware)
    ServiceMeta.useGlobal(settingsMiddleware)
    ServiceMeta.useGlobal(breakpointMiddleware)
  })
}
```

---

## 10. 断点调试系统

断点系统允许在请求的输入/输出阶段暂停执行，用于调试。

### 10.1 断点配置

```typescript
import {
  setBreakpoint,
  removeBreakpoint,
  getBreakpoints,
  clearBreakpoints,
} from '@/lib/service-meta'

// 设置断点
setBreakpoint({
  service: 'clipboard',
  method: 'write',
  delayMs: 500,           // 可选：延迟执行
  input: {
    pause: true,          // 在输入阶段暂停
    pauseCondition: '$input.text.length > 10',  // 条件表达式
    inject: '$input.text = "modified"',         // 注入代码
  },
  output: {
    pause: true,          // 在输出阶段暂停
  },
})

// 移除断点
removeBreakpoint('clipboard', 'write')

// 清除所有断点
clearBreakpoints()
```

### 10.2 暂停请求管理

```typescript
import {
  getPausedRequests,
  resumePausedRequest,
  abortPausedRequest,
  subscribeBreakpoints,
} from '@/lib/service-meta'

// 获取所有暂停的请求
const paused = getPausedRequests()

// 继续执行 (可修改输入/输出)
resumePausedRequest(request.id, {
  $input: { text: 'modified input' },
})

// 中止请求
abortPausedRequest(request.id, new Error('Aborted'))

// 订阅断点变更
subscribeBreakpoints(() => {
  console.log('Breakpoints or paused requests changed')
})
```

### 10.3 Console 面板

Console 面板提供表达式执行环境，可直接操作暂停的请求：

| 变量 | 说明 |
|------|------|
| `$paused` | 所有暂停请求的数组 |
| `$0`, `$1`, ... | 按索引访问暂停请求 |
| `$_` | 最新的暂停请求 |
| `$p{id}` | 按 ID 访问，如 `$p1`, `$p2` |

**可用方法：**
```javascript
$p1.$input          // 查看输入
$p1.$output         // 查看输出 (仅 output 阶段)
$p1.resume()        // 继续执行
$p1.resume({ $input: { text: 'new' } })  // 修改后继续
$p1.abort()         // 中止请求
```

**内置命令：**
| 命令 | 说明 |
|------|------|
| `/help` | 显示帮助 |
| `/clear` | 清空 Console |
| `/vars` | 显示可用变量 |
| `/copy <expr>` | 复制表达式结果到剪贴板 |

### 10.4 IndexedDB 持久化

断点配置自动保存到 IndexedDB，刷新页面后恢复。

---

## 11. 迁移指南

### 11.1 从旧架构迁移

**旧架构:**
```typescript
// types.ts
export interface IClipboardService {
  write(text: string): Promise<void>
  read(): Promise<string>
}

// web.ts
export class ClipboardService implements IClipboardService {
  async write(text: string) { ... }
  async read() { ... }
}
export const clipboardService = new ClipboardService()
```

**新架构:**
```typescript
// types.ts
export const clipboardServiceMeta = defineServiceMeta('clipboard', (s) =>
  s
    .api('write', { input: z.object({ text: z.string() }), output: z.void() })
    .api('read', { input: z.void(), output: z.string() })
    .build()
)
export type IClipboardService = typeof clipboardServiceMeta.Type

// web.ts
export const clipboardService = clipboardServiceMeta.impl({
  async write({ text }) { ... },
  async read() { ... },
})
```

### 11.2 迁移步骤

1. 创建 `defineServiceMeta` 定义
2. 更新 web.ts 使用 `.impl()`
3. 更新 dweb.ts 使用 `.impl()`
4. 更新 mock.ts 使用 `.impl()`
5. 删除旧的 `wrapMockService` 调用
6. 注册全局日志中间件

---

## 12. 检查清单

- [ ] 服务使用 `defineServiceMeta` 定义元信息
- [ ] 所有平台使用 `.impl()` 实现
- [ ] input/output 使用 Zod Schema 定义
- [ ] 复杂方法才使用 `method`，简单场景使用 `api`
- [ ] 属性使用 `get`/`set`/`getset`
- [ ] 事件流使用 `stream`
- [ ] Mock 模式下全局日志中间件已注册

---

## 下一章

继续阅读 [事件系统](../04-事件系统/)。
