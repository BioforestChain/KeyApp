# 本地化规范

> 源码: [`src/i18n/`](https://github.com/BioforestChain/KeyApp/blob/main/src/i18n/)

---

## 数字格式化

### Hook 实现

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

### 格式化示例

| 数值 | zh-CN | en | ar |
|------|-------|-----|-----|
| 1234567 | 1,234,567 | 1,234,567 | ١٬٢٣٤٬٥٦٧ |
| 1234.56 | 1,234.56 | 1,234.56 | ١٬٢٣٤٫٥٦ |
| $1000 | US$1,000.00 | $1,000.00 | ١٬٠٠٠٫٠٠ US$ |

---

## 日期格式化

### Hook 实现

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

### 日期格式示例

| 格式 | zh-CN | en |
|------|-------|-----|
| 短日期 | 2024/01/15 | 01/15/2024 |
| 长日期 | 2024年1月15日 | January 15, 2024 |
| 时间 | 14:30 | 2:30 PM |

### 相对时间示例

| 时间差 | zh-CN | en |
|--------|-------|-----|
| < 1 分钟 | 刚刚 | just now |
| 5 分钟前 | 5 分钟前 | 5 minutes ago |
| 1 小时前 | 1 小时前 | 1 hour ago |
| 昨天 | 昨天 | yesterday |

---

## 术语对照表

### 技术术语 → 用户友好表述

| 技术术语 | 用户友好表述 | 英文 |
|----------|--------------|------|
| Mnemonic | 助记词 | Recovery Phrase |
| Private Key | 私钥 | Private Key |
| Gas Fee | 网络费用 | Network Fee |
| Block Confirmation | 交易确认中 | Confirming |
| Address | 钱包地址 | Wallet Address |
| Nonce | 交易序号 | Transaction Number |
| UTXO | 未花费输出 | Unspent Output |
| Smart Contract | 智能合约 | Smart Contract |

### 状态术语

| 英文 | 中文 | 使用场景 |
|------|------|----------|
| Pending | 处理中 | 交易等待确认 |
| Confirmed | 已确认 | 交易完成 |
| Failed | 失败 | 交易失败 |
| Cancelled | 已取消 | 用户取消 |

### 操作术语

| 英文 | 中文 | 使用场景 |
|------|------|----------|
| Send | 发送 | 转账操作 |
| Receive | 收款 | 接收资产 |
| Swap | 兑换 | 代币兑换 |
| Stake | 质押 | 参与质押 |
| Mint | 铸造 | 跨链铸造 |
| Burn | 销毁 | 跨链销毁 |

---

## 翻译文件结构

```
src/i18n/locales/
├── zh-CN/
│   ├── common.json      # 通用文案
│   ├── wallet.json      # 钱包相关
│   ├── transfer.json    # 转账相关
│   ├── settings.json    # 设置相关
│   └── error.json       # 错误消息
├── en/
│   └── ...
├── zh-TW/
│   └── ...
├── ja/
│   └── ...
├── ko/
│   └── ...
└── ar/
    └── ...
```

### 示例: common.json

```json
{
  "confirm": "确认",
  "cancel": "取消",
  "back": "返回",
  "next": "下一步",
  "done": "完成",
  "save": "保存",
  "delete": "删除",
  "edit": "编辑",
  "copy": "复制",
  "copied": "已复制",
  "loading": "加载中...",
  "retry": "重试"
}
```

### 示例: error.json

```json
{
  "network": {
    "timeout": "网络连接超时，请重试",
    "offline": "当前处于离线状态",
    "serverError": "服务器错误，请稍后再试"
  },
  "wallet": {
    "invalidMnemonic": "助记词格式不正确",
    "invalidAddress": "地址格式不正确",
    "insufficientBalance": "余额不足"
  },
  "auth": {
    "patternIncorrect": "图案不正确",
    "biometricFailed": "生物识别验证失败"
  }
}
```

---

## 行为约束

### MUST

- 使用 `Intl` API 进行数字/日期格式化
- 维护统一的术语对照表
- 翻译文件按模块组织

### SHOULD

- 使用相对时间显示近期时间
- 提供术语的上下文说明
- 保持翻译文件结构一致

### MUST NOT

- 在代码中硬编码数字格式
- 混用不同的日期格式

---

## 相关文档

- [多语言支持](./01-Language-Support.md)
- [术语表](../99-Appendix/01-Glossary.md)
