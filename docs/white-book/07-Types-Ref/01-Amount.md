# Amount 类型

> 源码: [`src/types/amount.ts`](https://github.com/BioforestChain/KeyApp/blob/main/src/types/amount.ts)

## 概述

`Amount` 是不可变的金额类型，使用 Big.js 进行精确计算，避免 JavaScript 浮点数精度问题。

## 设计原则

1. **精确计算**: 内部使用 Big.js
2. **不可变**: 所有操作返回新实例
3. **类型安全**: 通过静态工厂方法创建，防止混淆 raw/formatted
4. **自文档化**: 方法名清晰表达意图

## 创建方法

### fromRaw

从原始值创建（最小单位：wei、satoshi 等）。

```typescript
// 链上返回 1 ETH = 1000000000000000000 wei
const balance = Amount.fromRaw('1000000000000000000', 18, 'ETH')
console.log(balance.toFormatted()) // "1"
```

### fromFormatted

从格式化值创建（用户输入）。

```typescript
// 用户输入 1.5 ETH
const input = Amount.fromFormatted('1.5', 18, 'ETH')
console.log(input.toRawString()) // "1500000000000000000"
```

### tryFromFormatted

安全解析，失败返回 null。

```typescript
const amount = Amount.tryFromFormatted('abc', 18)
// null
```

### parse

智能解析（有小数点视为 formatted，否则为 raw）。

```typescript
Amount.parse('1.5', 18)    // fromFormatted
Amount.parse('1500000000000000000', 18)  // fromRaw
```

### zero

创建零值。

```typescript
const zero = Amount.zero(18, 'ETH')
```

## 转换方法

```typescript
const amount = Amount.fromFormatted('1.5', 18, 'ETH')

amount.toRawString()      // "1500000000000000000"
amount.toFormatted()      // "1.5"
amount.toNumber()         // 1.5 (可能丢失精度)
amount.toString()         // "1.5 ETH"
amount.toDisplayString()  // "1.5" (带千分位)
amount.toJSON()           // { raw: "...", decimals: 18, symbol: "ETH" }
```

## 比较方法

```typescript
const a = Amount.fromFormatted('1.5', 18)
const b = Amount.fromFormatted('1.0', 18)

a.gt(b)   // true  (大于)
a.gte(b)  // true  (大于等于)
a.lt(b)   // false (小于)
a.lte(b)  // false (小于等于)
a.eq(b)   // false (等于)

a.isZero()     // false
a.isPositive() // true
a.isNegative() // false
```

## 算术运算

```typescript
const a = Amount.fromFormatted('2', 18)
const b = Amount.fromFormatted('0.5', 18)

a.add(b)  // 2.5
a.sub(b)  // 1.5
a.mul(2)  // 4
a.div(2)  // 1
a.mod(3)  // 2
a.abs()   // |value|
a.neg()   // -value
a.min(b)  // 0.5
a.max(b)  // 2
a.percent(10) // 0.2 (10%)
```

## 精度转换

```typescript
const eth = Amount.fromFormatted('1', 18, 'ETH')
const usdt = eth.toDecimals(6)  // 转为 6 位精度
```

## Getters

```typescript
const amount = Amount.fromFormatted('1.5', 18, 'ETH')

amount.raw       // 1500000000000000000n (bigint)
amount.decimals  // 18
amount.symbol    // "ETH"
```

## 辅助函数

```typescript
import { amountFromAsset, isAmount, toAmount } from '@/types/amount'

// 从资产信息创建
const amount = amountFromAsset({
  amount: '1.5',
  decimals: 18,
  assetType: 'ETH',
})

// 类型守卫
if (isAmount(value)) {
  console.log(value.toFormatted())
}

// 安全转换
const amt = toAmount(maybeAmount, 18, 'ETH')
```

## JSON 序列化

```typescript
interface AmountJSON {
  raw: string
  decimals: number
  symbol?: string
}

// 序列化
const json = amount.toJSON()
// { raw: "1500000000000000000", decimals: 18, symbol: "ETH" }

// 反序列化
const restored = Amount.fromJSON(json)
```

## 使用示例

### 余额检查

```typescript
const balance = Amount.fromRaw(apiBalance, 18, 'ETH')
const sendAmount = Amount.fromFormatted(userInput, 18, 'ETH')
const fee = Amount.fromRaw(estimatedFee, 18, 'ETH')

const total = sendAmount.add(fee)

if (total.gt(balance)) {
  throw new Error('余额不足')
}

const remaining = balance.sub(total)
console.log(`剩余: ${remaining.toFormatted()} ETH`)
```

### 法币换算

```typescript
const amount = Amount.fromFormatted('1.5', 18, 'ETH')
const priceUsd = 2500
const fiatValue = amount.toNumber() * priceUsd
// $3,750
```
