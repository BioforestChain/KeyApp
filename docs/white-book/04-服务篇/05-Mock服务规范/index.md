# Mock 服务规范

> 定义 Mock 服务的使用规范和调试工具

---

## 1. 概述

Mock 服务用于开发和测试环境，提供模拟数据和行为。正确使用 Mock 服务可以：
- 加速开发迭代（不依赖真实后端）
- 支持离线开发
- 便于测试边界条件
- 提供可控的调试环境

---

## 2. 核心原则

### 2.1 编译时替换

Mock 实现 **MUST** 通过 Vite alias 在编译时选择，**MUST NOT** 在业务代码中直接导入：

```typescript
// ❌ 错误：直接导入 mock 实现
import { mockStakingService } from '@/services/staking.mock'

// ✅ 正确：通过 alias 导入（编译时替换）
import { stakingService } from '@/services/staking'
```

### 2.2 环境变量控制

通过 `SERVICE_IMPL` 环境变量选择实现：

| 值 | 说明 | 命令 |
|---|------|------|
| `web` | Web 平台实现（默认） | `pnpm dev` |
| `dweb` | DWEB 平台实现 | `SERVICE_IMPL=dweb pnpm dev` |
| `mock` | Mock 实现 | `pnpm dev:mock` |

### 2.3 接口一致性

Mock 实现 **MUST** 实现与真实服务相同的接口：

```typescript
// types.ts - 定义接口
export interface IStakingService {
  getOverview(): Promise<StakingOverviewItem[]>
  submitMint(request: MintRequest): Promise<StakingTransaction>
  // ...
}

// mock.ts - Mock 实现
export class StakingService implements IStakingService {
  async getOverview(): Promise<StakingOverviewItem[]> {
    // Mock 实现
  }
}

// web.ts - Web 实现
export class StakingService implements IStakingService {
  async getOverview(): Promise<StakingOverviewItem[]> {
    // 真实实现
  }
}
```

---

## 3. 服务目录结构

每个服务 **MUST** 遵循以下目录结构：

```
services/
  └── staking/
      ├── types.ts      # 接口定义
      ├── web.ts        # Web 平台实现
      ├── dweb.ts       # DWEB 平台实现
      ├── mock.ts       # Mock 实现
      ├── index.ts      # 统一导出（编译时替换）
      └── __tests__/    # 测试
          ├── mock.test.ts
          └── web.test.ts
```

### index.ts 模板

```typescript
/**
 * Staking 服务
 * 
 * 通过 Vite alias 在编译时选择实现：
 * - web: Web 平台
 * - dweb: DWEB 平台  
 * - mock: Mock 实现（自动包装并注册到 MockDevTools）
 */

export type { IStakingService, StakingOverviewItem } from './types'

// 编译时通过 Vite alias 替换
// #staking-impl -> ./web.ts | ./dweb.ts | ./mock.ts
// 注意：直接导出单例，mock.ts 导出的是已包装的服务
export { stakingService } from '#staking-impl'
```

### web.ts / dweb.ts 模板

```typescript
export class StakingService implements IStakingService {
  // 实现接口...
}

// 导出单例
export const stakingService = new StakingService()
```

### mock.ts 模板

```typescript
import { defineMockMeta, wrapMockService } from '@/services/mock-devtools'

class StakingService implements IStakingService {
  // 实现接口...
}

// 定义 Mock 元信息（用于 MockDevTools）
export const stakingMockMeta = defineMockMeta((b) =>
  b.name('staking')
   .description('质押服务')
   .methods((m) => m
     .method('getOverview', (mm) => mm.description('获取概览').input(z.undefined()).output(OverviewSchema))
   )
)

// 内部实例
const _instance = new StakingService()

// 导出包装后的单例（自动注册到 MockDevTools）
export const stakingService = wrapMockService(stakingMockMeta, _instance)
```

---

## 4. Mock 数据管理

### 4.1 数据存储

Mock 数据 **SHOULD** 存储在模块级变量中，**MAY** 支持持久化到 localStorage：

```typescript
// mock.ts
let mockData: StakingOverviewItem[] = [...initialMockData]

export class StakingService implements IStakingService {
  async getOverview(): Promise<StakingOverviewItem[]> {
    return mockData
  }
  
  // Mock 专用：重置数据
  _resetData(): void {
    mockData = [...initialMockData]
  }
}
```

### 4.2 Mock 控制器

Mock 实现 **MAY** 暴露控制方法（以下划线开头），用于调试：

```typescript
export class StakingService implements IStakingService {
  // 公开接口
  async getOverview(): Promise<StakingOverviewItem[]> { ... }
  
  // Mock 控制方法
  _setMockData(data: StakingOverviewItem[]): void { ... }
  _resetData(): void { ... }
  _simulateError(error: Error): void { ... }
  _setDelay(ms: number): void { ... }
}
```

---

## 5. MockDevTools

### 5.1 概述

MockDevTools 是一个可视化调试工具，**ONLY** 在 `SERVICE_IMPL=mock` 时可用：

```
┌─────────────────────────────────────────────────┐
│  MockDevTools                              [×]  │
├─────────────────────────────────────────────────┤
│  Services                                       │
│  ├── 📦 staking (active)                       │
│  │   ├── getOverview: 3 calls                  │
│  │   └── submitMint: 1 call                    │
│  ├── 📦 transaction (active)                   │
│  └── 📦 wallet (active)                        │
├─────────────────────────────────────────────────┤
│  Quick Actions                                  │
│  [Reset All Data] [Simulate Error] [Add Delay] │
├─────────────────────────────────────────────────┤
│  Request Log                                    │
│  10:30:15 staking.getOverview → 200 (45ms)    │
│  10:30:18 staking.submitMint → 200 (120ms)    │
└─────────────────────────────────────────────────┘
```

### 5.2 功能

| 功能 | 说明 |
|-----|------|
| 服务状态 | 显示所有 Mock 服务及其调用统计 |
| 数据编辑 | 编辑/重置 Mock 数据 |
| 错误模拟 | 模拟网络错误、超时 |
| 延迟控制 | 添加人工延迟测试加载状态 |
| 请求日志 | 记录所有服务调用 |

### 5.3 集成方式

```tsx
// App.tsx
import { MockDevTools } from '@/services/mock-devtools'

export function App() {
  return (
    <>
      <Router />
      {import.meta.env.DEV && <MockDevTools />}
    </>
  )
}
```

---

## 6. 组件使用规范

### 6.1 必须通过服务层调用

组件 **MUST** 通过服务层调用平台能力，**MUST NOT** 直接调用浏览器 API：

```typescript
// ❌ 错误：直接调用浏览器 API
const handleCopy = async () => {
  await navigator.clipboard.writeText(address)
}

// ✅ 正确：通过服务层调用
import { clipboardService } from '@/services/clipboard'

const handleCopy = async () => {
  await clipboardService.write(address)
}
```

### 6.2 使用 Hook 封装

推荐使用 Hook 获取服务，便于测试和 Mock：

```typescript
// hooks.ts
export function useClipboard() {
  return clipboardService
}

// Component.tsx
function AddressDisplay({ address }: Props) {
  const clipboard = useClipboard()
  
  const handleCopy = async () => {
    await clipboard.write(address)
  }
}
```

### 6.3 禁止直接调用的 API 列表

| 浏览器 API | 应使用的服务 |
|-----------|-------------|
| `navigator.clipboard` | `clipboardService` |
| `navigator.vibrate` | `hapticsService` |
| `localStorage` / `sessionStorage` | `storageService` |
| `navigator.mediaDevices` | `cameraService` |
| `WebAuthn` | `biometricService` |

---

## 7. 常见错误

### 7.1 直接导入 Mock

```typescript
// ❌ 错误
import { mockStakingService } from '@/services/staking.mock'
const data = await mockStakingService.getOverview()

// ✅ 正确
import { stakingService } from '@/services/staking'
const data = await stakingService.getOverview()
```

### 7.2 Hook 中生成 Mock 数据

```typescript
// ❌ 错误：Hook 中直接生成假数据
function useTransactionHistory() {
  const [data] = useState(() => generateMockTransactions())
  return { data }
}

// ✅ 正确：通过 Service 获取数据
function useTransactionHistory() {
  const [data, setData] = useState<Transaction[]>([])
  useEffect(() => {
    transactionService.getHistory().then(setData)
  }, [])
  return { data }
}
```

### 7.3 组件中硬编码假数据

```typescript
// ❌ 错误：组件中硬编码
const MOCK_BALANCES = { ETH: { BFM: '1000.00' } }

// ✅ 正确：通过 Service 获取
const balances = await assetService.getBalances(address)
```

---

## 8. 迁移指南

对于现有代码中的假数据问题，按以下步骤修复：

1. **识别问题代码**：搜索 `mock` 关键字
2. **创建/完善 Service**：确保服务遵循标准结构
3. **更新 Vite 配置**：添加 alias
4. **更新组件**：使用标准导入
5. **测试**：在 mock 和 web 模式下都能正常工作

---

## 9. 检查清单

在 PR 合并前，请确认：

- [ ] 没有直接导入 `*.mock.ts` 文件
- [ ] 没有在组件/Hook 中硬编码假数据
- [ ] 没有直接调用浏览器 API（如 `navigator.clipboard`）
- [ ] 新服务遵循标准目录结构（index.ts 导出单例）
- [ ] Mock 实现使用 `wrapMockService` 包装
- [ ] Mock 实现与接口一致
- [ ] 在 `pnpm dev` 和 `pnpm dev:mock` 下都能正常工作
- [ ] MockDevTools 能显示服务调用日志

---

## 下一章

继续阅读 [事件系统](../04-事件系统/)。
