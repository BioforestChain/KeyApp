# 事件系统

> 定义数据变化的订阅机制

---

## 设计目标

钱包应用需要实时响应以下变化：

- **余额变化** - 收到转账、交易确认
- **交易状态变化** - pending → confirmed / failed
- **新区块** - 链上新区块产生
- **汇率变化** - 法币汇率更新

### 设计原则

- **类型安全** - 事件类型和数据类型严格对应
- **统一接口** - 所有事件源使用相同的订阅 API
- **资源管理** - 自动清理订阅，防止内存泄漏

---

## Subscribable 接口

### 核心接口

```
Subscription {
  unsubscribe(): void
  readonly closed: boolean
}

Observer<T> {
  next: (value: T) => void
  error?: (error: Error) => void
  complete?: () => void
}

Subscribable<T> {
  subscribe(observer: Observer<T>): Subscription
  getCurrentValue?(): T | undefined
}
```

### 规范要求

- **MUST** 实现 subscribe 方法返回 Subscription
- **MUST** 调用 unsubscribe 后停止推送事件
- **SHOULD** 实现 getCurrentValue 获取当前值
- **SHOULD** 在错误时调用 observer.error

---

## 事件类型定义

### BalanceChangeEvent 余额变化

| 字段 | 类型 | 说明 |
|-----|------|------|
| chainId | ChainId | 链标识 |
| address | Address | 账户地址 |
| tokenAddress | Address \| null | 代币地址（null=原生币） |
| newBalance | AssetBalance | 新余额 |
| previousBalance | AssetBalance | 旧余额（可选） |
| reason | string | 变化原因 |

### TransactionStatusEvent 交易状态

| 字段 | 类型 | 说明 |
|-----|------|------|
| chainId | ChainId | 链标识 |
| hash | TxHash | 交易哈希 |
| status | Status | pending/confirmed/failed/dropped |
| confirmations | number | 确认数 |
| receipt | TxReceipt | 交易回执（可选） |

### NewBlockEvent 新区块

| 字段 | 类型 | 说明 |
|-----|------|------|
| chainId | ChainId | 链标识 |
| blockNumber | bigint | 区块高度 |
| blockHash | string | 区块哈希 |
| timestamp | number | 时间戳 |

---

## 订阅服务接口

### IAssetSubscription 资产订阅

```
IAssetSubscription {
  // 订阅原生代币余额
  subscribeNativeBalance(query: {
    address: Address
  }): Subscribable<AssetBalance>
  
  // 订阅代币余额
  subscribeTokenBalance(query: {
    address: Address
    tokenAddress: Address
  }): Subscribable<AssetBalance>
  
  // 订阅所有资产变化
  subscribeAllAssets(query: {
    address: Address
  }): Subscribable<AssetBalance[]>
}
```

### ITransactionSubscription 交易订阅

```
ITransactionSubscription {
  // 订阅单笔交易状态
  subscribeTransactionStatus(
    hash: TxHash
  ): Subscribable<TransactionStatusEvent>
  
  // 订阅地址相关交易
  subscribeAddressTransactions(
    address: Address
  ): Subscribable<Transaction>
}
```

### IBlockSubscription 区块订阅

```
IBlockSubscription {
  // 订阅新区块
  subscribeNewBlocks(): Subscribable<NewBlockEvent>
  
  // 获取当前区块高度
  getCurrentBlockNumber(): Promise<bigint>
}
```

---

## 实现策略

### WebSocket 订阅

| 事件类型 | WebSocket 消息 | 适用链 |
|---------|---------------|-------|
| 余额变化 | pendingTransactions, newBlocks | EVM |
| 交易状态 | transactionReceipt | EVM |
| 新区块 | newHeads | EVM |

### 轮询订阅

当 WebSocket 不可用时的降级策略：

| 事件类型 | 轮询间隔 | 接口 |
|---------|---------|------|
| 余额变化 | 30s | getBalance |
| 交易状态 | 5s | getTransactionReceipt |
| 新区块 | 15s | getBlockNumber |

### 混合策略

- **MUST** 优先使用 WebSocket 获取实时数据
- **MUST** WebSocket 断开时自动降级到轮询
- **SHOULD** WebSocket 重连后恢复实时订阅
- **SHOULD** 合并相同查询避免重复请求

---

## UI 集成规范

### useSubscription Hook

```
useSubscription<T>(
  subscribable: Subscribable<T> | null,
  initialValue: T
): T
```

**行为规范：**

- **MUST** 在组件卸载时自动取消订阅
- **MUST** subscribable 变化时重新订阅
- **SHOULD** 支持初始值设置
- **SHOULD** 处理订阅错误

### 使用模式

```
组件挂载
    │
    ▼
创建 Subscribable（使用 useMemo）
    │
    ▼
调用 useSubscription
    │
    ├── 获取初始值
    │
    └── 订阅变化
         │
         ▼
    收到新值 → 触发重渲染
         │
         ▼
组件卸载 → 自动取消订阅
```

---

## 与状态缓存结合

### 订阅驱动缓存更新

```
订阅事件
    │
    ▼
收到新数据
    │
    ▼
更新状态缓存（Query Cache）
    │
    ▼
依赖该缓存的组件自动更新
```

### 缓存键映射

| 事件类型 | 缓存键 |
|---------|-------|
| 原生余额 | ['asset', 'native', chainId, address] |
| 代币余额 | ['asset', 'token', chainId, address, tokenAddress] |
| 交易状态 | ['transaction', 'status', hash] |

---

## 资源管理规范

### 订阅生命周期

- **MUST** 组件卸载时取消所有订阅
- **MUST** 重复订阅相同数据时复用连接
- **SHOULD** 无订阅者时释放 WebSocket 连接
- **MAY** 实现订阅引用计数

### 错误处理

| 错误类型 | 处理方式 |
|---------|---------|
| 连接断开 | 自动重连 + 降级轮询 |
| 订阅失败 | 调用 observer.error |
| 数据解析错误 | 记录日志 + 跳过 |

### 重连策略

```
连接断开
    │
    ▼
等待 1s
    │
    ▼
尝试重连
    │
    ├── 成功 ──► 恢复订阅
    │
    └── 失败 ──► 等待 2s ──► 重试（指数退避）
                              │
                              └── 最大 30s
```

---

## 最佳实践

1. **缓存 Subscribable** - 使用 useMemo 避免重复创建
2. **清理订阅** - 使用 useEffect 清理函数
3. **处理错误** - 提供 error 回调处理异常
4. **合并请求** - 相同数据使用单个订阅
5. **降级策略** - 准备轮询作为后备方案

---

## 本章小结

- Subscribable 提供统一的订阅接口
- 支持余额、交易状态、新区块等事件
- 优先 WebSocket，降级轮询
- 与状态缓存结合实现自动更新
- 完善的资源管理防止内存泄漏
