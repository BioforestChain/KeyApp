# ITransactionService 交易服务

> 交易构建、签名、广播

---

## 职责

构建、签名、广播交易，查询交易状态和历史。

---

## 接口定义

```
ITransactionService {
  // 估算交易费用
  estimateFee(params: TransferParams): FeeEstimate
  
  // 构建未签名交易
  buildTransaction(params: TransferParams): UnsignedTransaction
  
  // 签名交易
  signTransaction(unsignedTx: UnsignedTransaction, privateKey: bytes): SignedTransaction
  
  // 广播交易
  broadcastTransaction(signedTx: SignedTransaction): TransactionHash
  
  // 查询交易状态
  getTransactionStatus(hash: TransactionHash): TransactionStatus
  
  // 查询交易详情
  getTransaction(hash: TransactionHash): Transaction
  
  // 查询交易历史
  getTransactionHistory(address: Address, options?: PaginationOptions): TransactionPage
  
  // 订阅交易状态
  subscribeTransaction(hash: TransactionHash, callback: (status: TransactionStatus) => void): Unsubscribe
}
```

---

## 数据结构

### TransferParams

```typescript
TransferParams {
  from: Address           // 发送方地址
  to: Address             // 接收方地址
  amount: Amount          // 发送金额（使用 Amount 类型）
  tokenAddress?: Address  // 代币地址（原生代币为空）
  memo?: string           // 备注（部分链支持）
  
  // 可选的费用覆盖
  gasLimit?: bigint
  gasPrice?: bigint
  maxFeePerGas?: bigint   // EIP-1559
  maxPriorityFeePerGas?: bigint
}
```

> 关于 Amount 类型的详细信息，请参阅 [Amount 类型系统](../../03-架构篇/08-Amount类型系统/index.md)。

### FeeEstimate

```typescript
FeeEstimate {
  slow: Fee               // 慢速（~5分钟）
  standard: Fee           // 标准（~1分钟）
  fast: Fee               // 快速（~15秒）
}

Fee {
  amount: Amount          // 费用金额（使用 Amount 类型）
  estimatedTime: number   // 预估确认时间（秒）
  gasLimit: bigint
  gasPrice: Amount
}
```

### TransactionStatus

```
TransactionStatus {
  status: 'pending' | 'confirming' | 'confirmed' | 'failed'
  confirmations: number
  requiredConfirmations: number
  error?: string          // 失败原因
}
```

### Transaction

```typescript
Transaction {
  hash: TransactionHash
  from: Address
  to: Address
  amount: Amount          // 交易金额（使用 Amount 类型）
  fee: Amount             // 手续费（使用 Amount 类型）
  status: TransactionStatus
  timestamp: number
  blockNumber?: bigint
  memo?: string
  type: TransactionType
}

TransactionType = 'transfer' | 'token-transfer' | 'contract-call' | 'stake' | 'unstake'
```

---

## 交易流程

### 状态机

```
          构建交易
              │
              ▼
      ┌───────────────┐
      │   Unsigned    │  ← 待签名
      └───────┬───────┘
              │ 签名
              ▼
      ┌───────────────┐
      │    Signed     │  ← 待广播
      └───────┬───────┘
              │ 广播
              ▼
      ┌───────────────┐
      │    Pending    │  ← 等待打包
      └───────┬───────┘
              │
      ┌───────┴───────┐
      ▼               ▼
 ┌─────────┐    ┌─────────┐
 │Confirming│   │ Failed  │
 └────┬────┘    └─────────┘
      │ 达到确认数
      ▼
 ┌─────────┐
 │Confirmed│
 └─────────┘
```

### 完整流程

```
1. 用户输入转账参数
        │
        ▼
2. estimateFee() 获取费用选项
        │
        ▼
3. 用户确认费用
        │
        ▼
4. buildTransaction() 构建交易
        │
        ▼
5. 用户绘制图案解锁私钥
        │
        ▼
6. signTransaction() 签名
        │
        ▼
7. broadcastTransaction() 广播
        │
        ▼
8. subscribeTransaction() 等待确认
        │
        ▼
9. 显示结果
```

---

## 方法详情

### estimateFee

估算交易费用，返回三个档位供用户选择。

**行为规范**：
- **MUST** 基于当前网络状态计算
- **MUST** 考虑代币转账的额外 gas
- **SHOULD** 留 20% 余量避免失败

### buildTransaction

构建未签名交易。

**行为规范**：
- **MUST** 自动获取 nonce
- **MUST** 验证余额充足
- **SHOULD** 支持自定义 gas 设置

### broadcastTransaction

将签名交易广播到网络。

**行为规范**：
- **MUST** 返回交易哈希
- **SHOULD** 检测交易是否已存在
- **MUST** 处理节点拒绝的情况

---

## 错误码

| 错误码 | 说明 | 用户提示 |
|-------|------|---------|
| INSUFFICIENT_BALANCE | 余额不足 | "余额不足，请确保有足够的 {symbol}" |
| INSUFFICIENT_FEE | 手续费不足 | "需要至少 {amount} {symbol} 作为手续费" |
| INVALID_RECIPIENT | 收款地址无效 | "请输入正确的收款地址" |
| NONCE_TOO_LOW | Nonce 冲突 | "交易冲突，请稍后重试" |
| TRANSACTION_REJECTED | 交易被拒绝 | "交易被网络拒绝：{reason}" |
| TRANSACTION_TIMEOUT | 交易超时 | "交易长时间未确认，请检查网络" |
| GAS_TOO_LOW | Gas 不足 | "手续费设置过低，交易可能失败" |

---

## 确认数要求

| 链 | 建议确认数 | 原因 |
|---|----------|------|
| Ethereum | 12 | 区块重组可能性 |
| BSC | 15 | 出块快，需更多确认 |
| Bitcoin | 6 | 行业标准 |
| BFM | 1 | 共识机制保证 |
