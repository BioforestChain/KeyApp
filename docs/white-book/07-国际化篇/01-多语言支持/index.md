# 第二十一章：多语言支持

> i18next 配置、语言检测、RTL 布局

---

## 21.1 i18next 配置

```typescript
// src/i18n/index.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

export const supportedLanguages = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'ar'] as const
export type SupportedLanguage = (typeof supportedLanguages)[number]
export const rtlLanguages: SupportedLanguage[] = ['ar']

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,  // 内联资源
    ns: ['common', 'wallet', 'transfer', 'settings'],
    defaultNS: 'common',
    fallbackLng: 'en',
    supportedLngs: supportedLanguages,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18n-language',
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: true },
  })

export default i18n
export const isRTL = (lang: string) => rtlLanguages.includes(lang as SupportedLanguage)
```

---

## 21.2 翻译资源

```typescript
// src/i18n/resources.ts
export const resources = {
  'zh-CN': {
    common: {
      confirm: '确认',
      cancel: '取消',
      back: '返回',
      next: '下一步',
      copy: '复制',
      copied: '已复制！',
    },
    wallet: {
      createWallet: '创建钱包',
      importWallet: '导入钱包',
      backup: '备份',
      noBackup: '未备份',
    },
  },
  en: {
    common: {
      confirm: 'Confirm',
      cancel: 'Cancel',
      back: 'Back',
      next: 'Next',
      copy: 'Copy',
      copied: 'Copied!',
    },
    wallet: {
      createWallet: 'Create Wallet',
      importWallet: 'Import Wallet',
      backup: 'Backup',
      noBackup: 'Not backed up',
    },
  },
  // ... 其他语言
} as const
```

---

## 21.3 组件中使用

```typescript
import { useTranslation } from 'react-i18next'

function WalletCard() {
  const { t } = useTranslation('wallet')
  
  return (
    <div>
      <h2>{t('createWallet')}</h2>
      <Button>{t('common:confirm')}</Button>
    </div>
  )
}
```

### 带参数的翻译

```json
{ "available": "可用: {{amount}} {{symbol}}" }
```

```typescript
t('available', { amount: '100', symbol: 'ETH' })
// → "可用: 100 ETH"
```

---

## 21.4 RTL 支持

```typescript
// src/components/providers/direction-provider.tsx
export function DirectionProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation()
  const isRTL = rtlLanguages.includes(i18n.language as SupportedLanguage)
  
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = i18n.language
  }, [isRTL, i18n.language])
  
  return <>{children}</>
}
```

### RTL CSS

```css
/* 使用逻辑属性 */
.card {
  padding-inline-start: 1rem;  /* 替代 padding-left */
  margin-inline-end: 0.5rem;   /* 替代 margin-right */
}

/* RTL 翻转图标 */
[dir="rtl"] .rtl-flip {
  transform: scaleX(-1);
}
```

---

## 21.5 语言切换

```typescript
// src/pages/settings/language.tsx
const languages = [
  { code: 'zh-CN', name: '简体中文' },
  { code: 'zh-TW', name: '繁體中文' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'ar', name: 'العربية' },
]

export function LanguageSettingsPage() {
  const { i18n } = useTranslation()
  
  return (
    <div className="space-y-2">
      {languages.map(({ code, name }) => (
        <button
          key={code}
          onClick={() => i18n.changeLanguage(code)}
          className={cn(
            'w-full p-4 text-left rounded-lg',
            i18n.language === code && 'bg-primary/10'
          )}
        >
          {name}
          {i18n.language === code && <IconCheck />}
        </button>
      ))}
    </div>
  )
}
```

---

## 本章小结

- i18next 提供完整的国际化方案
- 支持 6 种语言，包括 RTL 阿拉伯语
- 使用逻辑属性支持 RTL 布局
- 语言切换即时生效
