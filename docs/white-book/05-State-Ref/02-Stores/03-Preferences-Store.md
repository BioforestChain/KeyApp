# Preferences Store

> 源码: [`src/stores/preferences.ts`](https://github.com/AInewsAPP/KeyApp/blob/main/src/stores/preferences.ts)

## 概述

Preferences Store 管理用户偏好设置：语言、货币、主题、最近联系人。数据持久化到 localStorage。

## 状态结构

```typescript
interface PreferencesState {
  language: LanguageCode      // 'zh-CN' | 'en' | 'ar' | ...
  currency: CurrencyCode      // 'USD' | 'CNY' | 'EUR' | 'JPY' | 'KRW'
  theme: ThemePreference      // 'light' | 'dark' | 'system'
  recentContactIds: string[]  // 最近联系人 ID（最多 10 个）
}

type CurrencyCode = 'USD' | 'CNY' | 'EUR' | 'JPY' | 'KRW'

const currencies: Record<CurrencyCode, { symbol: string; name: string }> = {
  USD: { symbol: '$', name: 'US Dollar' },
  CNY: { symbol: '¥', name: 'Chinese Yuan' },
  EUR: { symbol: '€', name: 'Euro' },
  JPY: { symbol: '¥', name: 'Japanese Yen' },
  KRW: { symbol: '₩', name: 'Korean Won' },
}
```

## Actions

```typescript
import { preferencesActions } from '@/stores/preferences'

// 设置语言（同步更新 i18n + RTL 方向）
preferencesActions.setLanguage('zh-CN')

// 设置货币
preferencesActions.setCurrency('CNY')

// 设置主题（自动同步 document.documentElement.classList）
preferencesActions.setTheme('dark')

// 记录最近联系人（自动去重、最多 10 个）
preferencesActions.trackRecentContact('contact-uuid')

// 初始化（App 启动时调用）
preferencesActions.initialize()
```

## Hooks

```typescript
import { 
  usePreferences, 
  useLanguage, 
  useCurrency, 
  useTheme,
  useRecentContactIds 
} from '@/stores/preferences'

function Settings() {
  const prefs = usePreferences()        // 完整状态
  const lang = useLanguage()            // 仅语言
  const currency = useCurrency()        // 仅货币
  const theme = useTheme()              // 仅主题
  const recentIds = useRecentContactIds() // 最近联系人
}
```

## 主题同步机制

```
setTheme('system')
    │
    ├── 解析系统主题: matchMedia('(prefers-color-scheme: dark)')
    │
    ├── 应用到 document: classList.toggle('dark', isDark)
    │
    └── 监听系统变化: mediaQuery.addEventListener('change', ...)
            │
            └── 实时同步 document.classList
```

## 语言与 RTL 支持

```typescript
// 设置语言时自动处理
preferencesActions.setLanguage('ar')
// 1. i18n.changeLanguage('ar')
// 2. document.documentElement.dir = 'rtl'

// 支持的语言
const languages = {
  'zh-CN': { name: '简体中文', dir: 'ltr' },
  'en': { name: 'English', dir: 'ltr' },
  'ar': { name: 'العربية', dir: 'rtl' },
  // ...
}
```

## 持久化

| Key | 存储位置 |
|-----|---------|
| `bfmpay_preferences` | localStorage |

```typescript
// 存储格式
{
  "language": "zh-CN",
  "currency": "USD",
  "theme": "system",
  "recentContactIds": ["uuid1", "uuid2"]
}
```

## 初始化流程

```
App 启动
    │
    ├── loadFromStorage() → 读取 localStorage
    │
    ├── preferencesActions.initialize()
    │       │
    │       ├── 同步 i18n 语言
    │       ├── 设置 document.dir (RTL)
    │       └── 同步主题到 document.classList
    │
    └── Store 就绪
```
