# 📘 Book T7: The Types Reference (类型系统参考)

> 源码: [`src/types/`](https://github.com/BioforestChain/KeyApp/blob/main/src/types/)

核心类型定义，为整个应用提供类型安全的基础。

## 📖 目录

| 文档 | 说明 |
|------|------|
| [00-Index](./00-Index.md) | 类型索引与设计原则 |
| [01-Amount](./01-Amount.md) | 精确金额计算 (Big.js) |
| [02-Asset](./02-Asset.md) | 资产/代币信息类型 |
| [03-Staking](./03-Staking.md) | 跨链质押类型 |

---

## 🎯 核心要点

### Amount - 精确金额

```typescript
import { Amount } from '@/types/amount'

const balance = Amount.fromRaw('1000000000000000000', 18, 'ETH')
balance.toFormatted()  // "1"
balance.toRawString()  // "1000000000000000000"
```

### Asset - 资产信息

```typescript
import { AssetInfo } from '@/types/asset'

const asset: AssetInfo = {
  assetType: 'ETH',
  amount: Amount.fromFormatted('1.5', 18),
  decimals: 18,
  priceUsd: 2500,
}
```

### Staking - 跨链质押

```typescript
import { MintRequest, BurnRequest } from '@/types/staking'

// Mint: 外部链 → 内部链
// Burn: 内部链 → 外部链
```

---

## 设计原则

| 原则 | 说明 |
|------|------|
| **不可变** | 所有操作返回新实例 |
| **类型安全** | Zod Schema 运行时验证 |
| **自文档化** | 方法名清晰表达意图 |
| **边界安全** | 精度检查、溢出保护 |

---

## 相关文档

- [Service Reference](../06-Service-Ref/00-Index.md) - 服务层使用这些类型
- [Wallet Guide](../10-Wallet-Guide/README.md) - 业务场景中的类型应用
