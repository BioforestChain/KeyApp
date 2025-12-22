# Amount 类型系统

> 类型安全的货币金额处理

---

## 概述

`Amount` 类是 KeyApp 中处理所有货币金额的核心类型。它提供了类型安全的金额操作，避免了常见的精度问题和单位混淆。

### 为什么需要 Amount 类型？

在加密货币应用中，金额处理面临以下挑战：

1. **精度问题**: JavaScript 的 `number` 类型无法精确表示大数值
2. **单位混淆**: 混淆原始单位（如 wei）和格式化单位（如 ETH）
3. **类型不安全**: 字符串表示的金额容易出错
4. **缺乏元数据**: 金额需要知道其 decimals 和符号才能正确显示

`Amount` 类通过封装这些复杂性，提供了统一、安全的金额处理方式。

---

## 核心设计

### 不可变性

`Amount` 实例是不可变的。所有算术操作返回新的 `Amount` 实例：

```typescript
const a = Amount.fromFormatted('1', 18, 'ETH')
const b = Amount.fromFormatted('0.5', 18, 'ETH')
const c = a.add(b)  // 返回新实例，a 和 b 不变
```

### 元数据

每个 `Amount` 实例携带完整的元数据：

```typescript
interface AmountData {
  _value: Big         // 精确的数值（使用 Big.js）
  _decimals: number   // 小数位数
  _symbol?: string    // 货币符号
}
```

---

## API 参考

### 工厂方法

#### `Amount.fromRaw(raw: string | bigint, decimals: number, symbol?: string)`

从原始值（最小单位）创建 Amount。

```typescript
// 1 ETH = 10^18 wei
const eth = Amount.fromRaw('1000000000000000000', 18, 'ETH')
eth.toFormatted()  // "1"

// 100 USDT = 10^8 最小单位
const usdt = Amount.fromRaw('10000000000', 8, 'USDT')
usdt.toFormatted()  // "100"
```

#### `Amount.fromFormatted(formatted: string | number, decimals: number, symbol?: string)`

从格式化值（用户可读）创建 Amount。

```typescript
const eth = Amount.fromFormatted('1.5', 18, 'ETH')
eth.toRawString()  // "1500000000000000000"

const usdt = Amount.fromFormatted(100, 8, 'USDT')
usdt.toRawString()  // "10000000000"
```

#### `Amount.zero(decimals: number, symbol?: string)`

创建零值 Amount。

```typescript
const zero = Amount.zero(18, 'ETH')
zero.isZero()  // true
```

### 转换方法

#### `toRawString(): string`

返回原始值的字符串表示（无小数点）。

```typescript
Amount.fromFormatted('1.5', 18, 'ETH').toRawString()
// "1500000000000000000"
```

#### `toRawBigInt(): bigint`

返回原始值的 bigint 表示。

```typescript
Amount.fromFormatted('1', 18, 'ETH').toRawBigInt()
// 1000000000000000000n
```

#### `toFormatted(precision?: number): string`

返回格式化的字符串表示。

```typescript
const eth = Amount.fromRaw('1234567890000000000', 18, 'ETH')
eth.toFormatted()     // "1.23456789"
eth.toFormatted(2)    // "1.23"
eth.toFormatted(8)    // "1.23456789"
```

#### `toNumber(): number`

返回 JavaScript number（可能有精度损失）。

```typescript
Amount.fromFormatted('1.5', 18, 'ETH').toNumber()  // 1.5
```

### 算术操作

所有算术操作返回新的 `Amount` 实例。

#### `add(other: Amount): Amount`

加法。

```typescript
const a = Amount.fromFormatted('1', 18, 'ETH')
const b = Amount.fromFormatted('0.5', 18, 'ETH')
a.add(b).toFormatted()  // "1.5"
```

#### `subtract(other: Amount): Amount`

减法。

```typescript
const a = Amount.fromFormatted('1', 18, 'ETH')
const b = Amount.fromFormatted('0.3', 18, 'ETH')
a.subtract(b).toFormatted()  // "0.7"
```

#### `multiply(factor: number | string): Amount`

乘法（用于汇率转换等）。

```typescript
const eth = Amount.fromFormatted('2', 18, 'ETH')
eth.multiply(1.5).toFormatted()  // "3"
```

#### `divide(divisor: number | string): Amount`

除法。

```typescript
const eth = Amount.fromFormatted('10', 18, 'ETH')
eth.divide(4).toFormatted()  // "2.5"
```

### 比较操作

#### `isZero(): boolean`

判断是否为零。

#### `isPositive(): boolean`

判断是否为正数。

#### `isNegative(): boolean`

判断是否为负数。

#### `equals(other: Amount): boolean`

判断是否相等。

#### `greaterThan(other: Amount): boolean`

判断是否大于。

#### `lessThan(other: Amount): boolean`

判断是否小于。

#### `greaterThanOrEqual(other: Amount): boolean`

判断是否大于等于。

#### `lessThanOrEqual(other: Amount): boolean`

判断是否小于等于。

### 属性访问

```typescript
const eth = Amount.fromFormatted('1.5', 18, 'ETH')
eth.decimals  // 18
eth.symbol    // "ETH"
```

---

## 序列化

### JSON 序列化

`Amount` 实现了 `toJSON()` 方法，返回可序列化的对象：

```typescript
const eth = Amount.fromFormatted('1.5', 18, 'ETH')
JSON.stringify(eth)
// {"raw":"1500000000000000000","decimals":18,"symbol":"ETH"}
```

### 从 JSON 恢复

```typescript
const json = { raw: '1500000000000000000', decimals: 18, symbol: 'ETH' }
const eth = Amount.fromRaw(json.raw, json.decimals, json.symbol)
```

### Zod Schema

用于验证 API 响应：

```typescript
import { z } from 'zod'
import { Amount } from '@/types/amount'

export const AmountSchema = z.object({
  raw: z.string(),
  decimals: z.number(),
  symbol: z.string().optional(),
}).transform(data => Amount.fromRaw(data.raw, data.decimals, data.symbol))
```

---

## 使用场景

### 资产余额

```typescript
interface AssetInfo {
  assetType: string
  name: string
  amount: Amount        // 使用 Amount 类型
  decimals: number
  logo?: string
}

// 使用
const asset: AssetInfo = {
  assetType: 'ETH',
  name: 'Ethereum',
  amount: Amount.fromRaw('1500000000000000000', 18, 'ETH'),
  decimals: 18,
}

// 显示
console.log(`余额: ${asset.amount.toFormatted()} ${asset.assetType}`)
```

### 交易记录

```typescript
interface TransactionRecord {
  id: string
  type: 'send' | 'receive'
  amount: Amount        // 交易金额
  fee?: Amount          // 手续费
  // ...
}
```

### 发送交易

```typescript
// 用户输入
const userInput = '1.5'
const amount = Amount.fromFormatted(userInput, 18, 'ETH')

// 验证余额
if (amount.greaterThan(balance.amount)) {
  throw new Error('余额不足')
}

// 构建交易（使用原始值）
const rawAmount = amount.toRawBigInt()
```

### 费用显示

```typescript
const fee = Amount.fromRaw('2000000000000000', 18, 'ETH')
console.log(`手续费: ${fee.toFormatted(6)} ETH`)  // "手续费: 0.002 ETH"
```

---

## 最佳实践

### 1. 始终使用工厂方法

```typescript
// ✅ 正确
const amount = Amount.fromFormatted('1.5', 18, 'ETH')

// ❌ 错误 - 不要直接构造
const amount = new Amount(...)  // Amount 构造函数是私有的
```

### 2. 保持 decimals 一致

在同一上下文中操作的 Amount 应该使用相同的 decimals：

```typescript
// ✅ 正确
const a = Amount.fromFormatted('1', 18, 'ETH')
const b = Amount.fromFormatted('0.5', 18, 'ETH')
const c = a.add(b)

// ❌ 危险 - decimals 不匹配
const a = Amount.fromFormatted('1', 18, 'ETH')
const b = Amount.fromFormatted('100', 6, 'USDT')  // 不同 decimals
const c = a.add(b)  // 可能导致错误
```

### 3. 使用 toNumber() 谨慎

`toNumber()` 可能有精度损失，仅用于显示目的：

```typescript
// ✅ 用于显示
<AmountDisplay value={amount.toNumber()} />

// ❌ 用于计算
const result = amount.toNumber() * 2  // 可能丢失精度
// ✅ 应该使用
const result = amount.multiply(2)
```

### 4. API 边界转换

在 API 边界进行 Amount 和原始值的转换：

```typescript
// 接收 API 响应
const apiResponse = await fetch('/api/balance')
const data = await apiResponse.json()
const balance = Amount.fromRaw(data.balance, data.decimals, data.symbol)

// 发送 API 请求
const amount = Amount.fromFormatted(userInput, 18, 'ETH')
await fetch('/api/transfer', {
  body: JSON.stringify({
    amount: amount.toRawString(),
    // ...
  })
})
```

---

## 迁移指南

### 从 string 迁移

```typescript
// 旧代码
interface OldAssetInfo {
  amount: string  // "1.5"
}

// 新代码
interface NewAssetInfo {
  amount: Amount
}

// 迁移
const oldAsset: OldAssetInfo = { amount: '1.5' }
const newAsset: NewAssetInfo = {
  amount: Amount.fromFormatted(oldAsset.amount, 18, 'ETH')
}
```

### 从 bigint 迁移

```typescript
// 旧代码
interface OldBalance {
  raw: bigint      // 1500000000000000000n
  formatted: string
  decimals: number
}

// 新代码
interface NewBalance {
  amount: Amount
}

// 迁移
const oldBalance: OldBalance = { 
  raw: 1500000000000000000n, 
  formatted: '1.5', 
  decimals: 18 
}
const newBalance: NewBalance = {
  amount: Amount.fromRaw(oldBalance.raw.toString(), oldBalance.decimals)
}
```

---

## 相关文档

- [AmountDisplay 组件](../../05-组件篇/02-通用组件/AmountDisplay.md)
- [ITransactionService](../../04-服务篇/02-链服务/ITransactionService.md)
- [IAssetService](../../04-服务篇/02-链服务/IAssetService.md)
