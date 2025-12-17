# 第二十二章：本地化规范

> 翻译流程、格式化、术语表

---

## 22.1 数字格式化

```typescript
export function useNumberFormat() {
  const { i18n } = useTranslation()
  
  return {
    integer: (value: number) =>
      new Intl.NumberFormat(i18n.language).format(value),
    
    decimal: (value: number, decimals = 2) =>
      new Intl.NumberFormat(i18n.language, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value),
    
    currency: (value: number, currency = 'USD') =>
      new Intl.NumberFormat(i18n.language, {
        style: 'currency',
        currency,
      }).format(value),
  }
}
```

---

## 22.2 日期格式化

```typescript
export function useDateFormat() {
  const { i18n } = useTranslation()
  
  return {
    date: (value: Date | number) =>
      new Intl.DateTimeFormat(i18n.language, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(value),
    
    relative: (value: Date | number) => {
      const rtf = new Intl.RelativeTimeFormat(i18n.language, { numeric: 'auto' })
      const diff = Date.now() - new Date(value).getTime()
      
      if (diff < 60_000) return rtf.format(-Math.floor(diff / 1000), 'second')
      if (diff < 3600_000) return rtf.format(-Math.floor(diff / 60_000), 'minute')
      if (diff < 86400_000) return rtf.format(-Math.floor(diff / 3600_000), 'hour')
      return rtf.format(-Math.floor(diff / 86400_000), 'day')
    },
  }
}
```

---

## 22.3 术语对照表

| 技术术语 | 用户友好表述 | 英文 |
|---------|-------------|------|
| Mnemonic | 助记词 | Mnemonic |
| Private Key | 私钥 | Private Key |
| Gas Fee | 网络费用 | Network Fee |
| Block Confirmation | 交易确认中 | Confirming |
| Address | 钱包地址 | Wallet Address |

---

## 22.4 翻译文件规范

```
src/i18n/locales/
├── zh-CN/
│   ├── common.json      # 通用文案
│   ├── wallet.json      # 钱包相关
│   ├── transfer.json    # 转账相关
│   └── settings.json    # 设置相关
├── en/
│   └── ...
└── ...
```

### 命名规范

- 使用 camelCase
- 按功能模块分组
- 避免重复定义

```json
{
  "title": "转账",
  "recipient": "收款地址",
  "amount": "金额",
  "errors": {
    "invalidAddress": "地址格式不正确",
    "insufficientBalance": "余额不足"
  }
}
```

---

## 本章小结

- 使用 Intl API 进行本地化格式化
- 维护统一的术语对照表
- 翻译文件按模块组织
