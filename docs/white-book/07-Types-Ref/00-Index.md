# Types 参考索引

> 源码: [`src/types/`](https://github.com/BioforestChain/KeyApp/blob/main/src/types/)

## 类型文件

| 文件 | 说明 | 文档 |
|------|------|------|
| `amount.ts` | 精确金额计算 | [01-Amount.md](./01-Amount.md) |
| `asset.ts` | 资产/代币类型 | [02-Asset.md](./02-Asset.md) |
| `staking.ts` | 跨链质押类型 | [03-Staking.md](./03-Staking.md) |
| `provider-result.ts` | Provider 响应 | (内联文档) |

---

## Amount

精确金额类型，使用 Big.js 进行计算。

```typescript
import { Amount } from '@/types/amount'

// 创建
const balance = Amount.fromRaw('1000000000000000000', 18, 'ETH')
const input = Amount.fromFormatted('1.5', 18, 'ETH')

// 运算
const total = balance.add(input)
const diff = balance.sub(input)

// 比较
if (input.gt(balance)) { /* 余额不足 */ }

// 转换
balance.toFormatted()   // "1"
balance.toRawString()   // "1000000000000000000"
balance.toNumber()      // 1
```

[详细文档 →](./01-Amount.md)

---

## Asset

资产/代币信息类型。

```typescript
import { AssetInfo, formatFiatValue, formatPriceChange } from '@/types/asset'

const asset: AssetInfo = {
  assetType: 'ETH',
  amount: Amount.fromFormatted('1.5', 18),
  decimals: 18,
  priceUsd: 2500,
  priceChange24h: 2.3,
}

formatFiatValue(asset.amount, 18, asset.priceUsd)
// "$3,750.00"

formatPriceChange(asset.priceChange24h)
// "+2.30%"
```

[详细文档 →](./02-Asset.md)

---

## Staking

跨链质押类型。

```typescript
import { MintRequest, BurnRequest, StakingTransaction } from '@/types/staking'

// Mint: 外部链 → 内部链
const mint: MintRequest = {
  sourceChain: 'ETH',
  sourceAsset: 'USDT',
  amount: Amount.fromFormatted('100', 6),
  targetChain: 'BFMeta',
  targetAsset: 'wUSDT',
}

// Burn: 内部链 → 外部链
const burn: BurnRequest = {
  sourceChain: 'BFMeta',
  sourceAsset: 'wUSDT',
  amount: Amount.fromFormatted('100', 8),
  targetChain: 'ETH',
  targetAsset: 'USDT',
}
```

[详细文档 →](./03-Staking.md)

---

## Provider Result

链适配器返回值类型。

```typescript
// src/types/provider-result.ts

/** 支持的结果 */
interface SupportedResult<T> {
  data: T
  supported: true
}

/** 不支持的结果 (带 fallback) */
interface UnsupportedResult<T> {
  data: T
  supported: false
  reason: string
}

type ProviderResult<T> = SupportedResult<T> | UnsupportedResult<T>

// 使用
function isSupported<T>(result: ProviderResult<T>): result is SupportedResult<T> {
  return result.supported
}

const result = await chainProvider.getBalance(address)
if (isSupported(result)) {
  console.log(result.data)  // 真实数据
} else {
  console.log(result.reason)  // 失败原因
}
```

---

## 类型设计原则

### 1. 不可变

```typescript
// Amount 所有操作返回新实例
const a = Amount.fromFormatted('1', 18)
const b = a.add(Amount.fromFormatted('0.5', 18))
// a 不变, b 是新实例
```

### 2. 类型安全

```typescript
// 使用 Zod Schema 运行时验证
import { ExternalChainSchema } from '@/types/staking'

ExternalChainSchema.parse('ETH')  // OK
ExternalChainSchema.parse('SOL')  // throws ZodError
```

### 3. 自文档化

```typescript
// 方法名清晰表达意图
amount.toFormatted()  // 人类可读
amount.toRawString()  // 链上格式
amount.toNumber()     // 可能丢失精度
```

### 4. 边界安全

```typescript
// 精度检查
const a = Amount.fromFormatted('1', 18)
const b = Amount.fromFormatted('1', 6)

a.add(b)  // throws: decimals mismatch

// 安全转换
const safe = a.toDecimals(6)
```
