# Ecosystem Store

> 源码: [`src/stores/ecosystem.ts`](https://github.com/AInewsAPP/KeyApp/blob/main/src/stores/ecosystem.ts)

## 概述

Ecosystem Store 管理小程序生态系统状态：权限授权、订阅源、页面导航。

## 数据结构

```typescript
interface PermissionRecord {
  appId: string
  granted: string[]    // 已授权权限列表
  grantedAt: number    // 授权时间
}

interface SourceRecord {
  url: string          // 订阅源 URL
  name: string         // 订阅源名称
  lastUpdated: string  // 最后更新时间
  enabled: boolean     // 是否启用
}

type EcosystemSubPage = 'discover' | 'mine' | 'stack'

interface EcosystemState {
  permissions: PermissionRecord[]
  sources: SourceRecord[]
  availableSubPages: EcosystemSubPage[]
  activeSubPage: EcosystemSubPage
  swiperProgress: number    // 0-2 滑动进度
  syncSource: 'swiper' | 'indicator' | null
}
```

## Actions

### 权限管理

```typescript
import { ecosystemActions } from '@/stores/ecosystem'

// 授予权限（合并已有权限）
ecosystemActions.grantPermissions('com.example.app', ['camera', 'location'])

// 撤销权限
ecosystemActions.revokePermissions('com.example.app', ['camera'])

// 撤销所有权限
ecosystemActions.revokePermissions('com.example.app')
```

### 订阅源管理

```typescript
// 添加订阅源
ecosystemActions.addSource('https://example.com/apps.json', 'Example Store')

// 移除订阅源
ecosystemActions.removeSource('https://example.com/apps.json')

// 切换启用状态
ecosystemActions.toggleSource('https://example.com/apps.json')

// 更新时间戳
ecosystemActions.updateSourceTimestamp('https://example.com/apps.json')
```

### 页面导航

```typescript
// 设置当前子页面
ecosystemActions.setActiveSubPage('mine')

// 设置可用子页面（由桌面配置驱动）
ecosystemActions.setAvailableSubPages(['discover', 'mine', 'stack'])

// 更新 Swiper 进度
ecosystemActions.setSwiperProgress(1.5)

// 设置同步源（用于双向绑定）
ecosystemActions.setSyncSource('swiper')
```

## Selectors

```typescript
import { ecosystemSelectors, ecosystemStore } from '@/stores/ecosystem'
import { useStore } from '@tanstack/react-store'

function useEcosystem() {
  const state = useStore(ecosystemStore)
  
  // 获取应用已授权权限
  const granted = ecosystemSelectors.getGrantedPermissions(state, 'com.example.app')
  // ['camera', 'location']
  
  // 检查是否有特定权限
  const hasCamera = ecosystemSelectors.hasPermission(state, 'com.example.app', 'camera')
  // true
  
  // 获取启用的订阅源
  const sources = ecosystemSelectors.getEnabledSources(state)
}
```

## 子页面索引

```typescript
const ECOSYSTEM_SUBPAGE_INDEX: Record<EcosystemSubPage, number> = {
  discover: 0,
  mine: 1,
  stack: 2,
}

const ECOSYSTEM_INDEX_SUBPAGE: EcosystemSubPage[] = ['discover', 'mine', 'stack']
```

## Swiper 双向绑定

```
Swiper 滑动
    │
    └── setSwiperProgress(1.5)
            │
            └── syncSource = 'swiper'

Indicator 点击
    │
    └── setActiveSubPage('mine')
            │
            └── syncSource = 'indicator'
```

## 默认订阅源

```typescript
// App 启动时默认添加官方源
{
  url: `${import.meta.env.BASE_URL}miniapps/ecosystem.json`,
  name: 'Bio 官方生态',
  lastUpdated: new Date().toISOString(),
  enabled: true,
}
```

## 持久化

| Key | 存储位置 |
|-----|---------|
| `ecosystem_store` | localStorage |

```typescript
// 存储格式
{
  "permissions": [...],
  "sources": [...],
  "availableSubPages": ["discover", "mine"],
  "activeSubPage": "discover"
}
```

自动订阅：Store 变化时自动保存到 localStorage。
