# 第十四章：事件系统

> 定义数据变化的订阅机制

---

## 14.1 设计目标

在钱包应用中，需要实时响应以下变化：

- **余额变化**：收到转账、交易确认
- **交易状态变化**：pending → confirmed / failed
- **新区块**：链上新区块产生

### 设计原则

- **类型安全**：事件类型和数据类型严格对应
- **统一接口**：所有事件源使用相同的订阅 API
- **资源管理**：自动清理订阅，防止内存泄漏

---

## 14.2 Subscribable 接口

### 核心定义

```typescript
// src/services/events/types.ts

export interface Subscription {
  unsubscribe(): void
  readonly closed: boolean
}

export interface SubscribeObserver<T> {
  next: (value: T) => void
  error?: (error: Error) => void
  complete?: () => void
}

export interface Subscribable<T> {
  subscribe(observer: SubscribeObserver<T>): Subscription
  getCurrentValue?(): T | undefined
}
```

### 创建工具函数

```typescript
// src/services/events/create-subscribable.ts

export function createSubscribable<T>(
  setup: (emit: (value: T) => void) => () => void
): Subscribable<T> {
  return {
    subscribe(observer) {
      let closed = false
      
      const cleanup = setup((value) => {
        if (!closed) {
          observer.next(value)
        }
      })
      
      return {
        get closed() {
          return closed
        },
        unsubscribe() {
          if (!closed) {
            closed = true
            cleanup()
          }
        },
      }
    },
  }
}
```

---

## 14.3 事件类型定义

### 余额变化事件

```typescript
// src/services/events/definitions.ts

export interface BalanceChangeEvent {
  readonly chainId: ChainId
  readonly address: Address
  readonly tokenAddress: Address | null  // null = 原生代币
  readonly newBalance: AssetBalance
  readonly previousBalance?: AssetBalance
  readonly reason: 'transfer-in' | 'transfer-out' | 'refresh'
}
```

### 交易状态事件

```typescript
export interface TransactionStatusEvent {
  readonly chainId: ChainId
  readonly hash: TransactionHash
  readonly status: 'pending' | 'confirmed' | 'failed' | 'dropped'
  readonly confirmations?: number
  readonly receipt?: TransactionReceipt
}
```

### 新区块事件

```typescript
export interface NewBlockEvent {
  readonly chainId: ChainId
  readonly blockNumber: bigint
  readonly blockHash: string
  readonly timestamp: number
}
```

---

## 14.4 订阅服务接口

### 资产订阅服务

```typescript
// src/services/modules/asset-subscription.ts

export interface IAssetSubscription {
  // 订阅原生代币余额变化
  subscribeNativeBalance(query: {
    address: Address
  }): Subscribable<AssetBalance>
  
  // 订阅代币余额变化
  subscribeTokenBalance(query: {
    address: Address
    tokenAddress: Address
  }): Subscribable<AssetBalance>
}
```

### 交易订阅服务

```typescript
// src/services/modules/transaction-subscription.ts

export interface ITransactionSubscription {
  // 订阅交易状态
  subscribeTransactionStatus(
    hash: TransactionHash
  ): Subscribable<TransactionStatusEvent>
}
```

### 区块订阅服务

```typescript
// src/services/modules/block-subscription.ts

export interface IBlockSubscription {
  // 订阅新区块
  subscribeNewBlocks(): Subscribable<NewBlockEvent>
}
```

---

## 14.5 EVM 实现示例

### WebSocket 余额订阅

```typescript
// src/services/adapters/evm/services/asset-subscription.ts
import { createSubscribable } from '@/services/events'

export class EvmAssetSubscription implements IAssetSubscription {
  constructor(private wsClient: WebSocketClient) {}
  
  subscribeNativeBalance({ address }: { address: Address }) {
    return createSubscribable<AssetBalance>((emit) => {
      // 订阅 pending 交易
      const unsubPending = this.wsClient.subscribe(
        'pendingTransactions',
        { address },
        async () => {
          // 重新获取余额
          const balance = await this.getBalance(address)
          emit(balance)
        }
      )
      
      // 订阅新区块（确认交易）
      const unsubBlock = this.wsClient.subscribe(
        'newBlocks',
        {},
        async () => {
          const balance = await this.getBalance(address)
          emit(balance)
        }
      )
      
      // 返回清理函数
      return () => {
        unsubPending()
        unsubBlock()
      }
    })
  }
  
  subscribeTokenBalance({ address, tokenAddress }) {
    return createSubscribable<AssetBalance>((emit) => {
      // 订阅 ERC20 Transfer 事件
      const unwatch = this.wsClient.watchContractEvent({
        address: tokenAddress,
        abi: erc20Abi,
        eventName: 'Transfer',
        args: { from: address },
        onLogs: async () => {
          const balance = await this.getTokenBalance(address, tokenAddress)
          emit(balance)
        },
      })
      
      return () => unwatch()
    })
  }
}
```

### 交易状态订阅

```typescript
// src/services/adapters/evm/services/transaction-subscription.ts

export class EvmTransactionSubscription implements ITransactionSubscription {
  constructor(private client: PublicClient) {}
  
  subscribeTransactionStatus(hash: TransactionHash) {
    return createSubscribable<TransactionStatusEvent>((emit) => {
      let polling = true
      
      const poll = async () => {
        while (polling) {
          try {
            const receipt = await this.client.getTransactionReceipt({ hash })
            
            if (receipt) {
              emit({
                chainId: this.chainId,
                hash,
                status: receipt.status === 'success' ? 'confirmed' : 'failed',
                receipt,
              })
              polling = false
              return
            }
          } catch {
            // 继续轮询
          }
          
          await new Promise(r => setTimeout(r, 3000))
        }
      }
      
      // 先发送 pending 状态
      emit({
        chainId: this.chainId,
        hash,
        status: 'pending',
      })
      
      poll()
      
      return () => {
        polling = false
      }
    })
  }
}
```

---

## 14.6 React Hooks 集成

### useSubscription Hook

```typescript
// src/hooks/use-subscription.ts
import { useEffect, useState, useRef } from 'react'
import type { Subscribable } from '@/services/events/types'

export function useSubscription<T>(
  subscribable: Subscribable<T> | null,
  initialValue: T
): T {
  const [value, setValue] = useState<T>(initialValue)
  const subscribableRef = useRef(subscribable)
  
  useEffect(() => {
    if (!subscribable) return
    
    // 如果有初始值，先获取
    if (subscribable.getCurrentValue) {
      const current = subscribable.getCurrentValue()
      if (current !== undefined) {
        setValue(current)
      }
    }
    
    // 订阅
    const subscription = subscribable.subscribe({
      next: setValue,
      error: (error) => console.error('Subscription error:', error),
    })
    
    return () => subscription.unsubscribe()
  }, [subscribable])
  
  return value
}
```

### 使用示例

```typescript
function LiveBalance({ address, chainId }: Props) {
  const assetSubscription = useService('assetSubscription')
  
  const subscribable = useMemo(() => {
    if (!assetSubscription) return null
    return assetSubscription.subscribeNativeBalance({ address })
  }, [assetSubscription, address])
  
  const balance = useSubscription(subscribable, null)
  
  if (!balance) return <Skeleton />
  
  return (
    <div>
      <span>{balance.formatted}</span>
      <span>{balance.token.symbol}</span>
    </div>
  )
}
```

### 交易状态订阅

```typescript
function TransactionStatus({ hash }: { hash: TransactionHash }) {
  const txSubscription = useService('transactionSubscription')
  
  const subscribable = useMemo(() => {
    if (!txSubscription) return null
    return txSubscription.subscribeTransactionStatus(hash)
  }, [txSubscription, hash])
  
  const status = useSubscription(subscribable, { status: 'pending' })
  
  return (
    <div className={cn(
      status.status === 'confirmed' && 'text-green-500',
      status.status === 'failed' && 'text-red-500',
    )}>
      {status.status === 'pending' && '确认中...'}
      {status.status === 'confirmed' && '已确认'}
      {status.status === 'failed' && '失败'}
    </div>
  )
}
```

---

## 14.7 与 TanStack Query 结合

### 订阅驱动的缓存更新

```typescript
// src/features/wallet/use-live-balance.ts
import { useQueryClient } from '@tanstack/react-query'

export function useLiveBalanceUpdater(chainId: ChainId, address: Address) {
  const queryClient = useQueryClient()
  const assetSubscription = useService('assetSubscription')
  
  useEffect(() => {
    if (!assetSubscription) return
    
    const subscription = assetSubscription
      .subscribeNativeBalance({ address })
      .subscribe({
        next: (balance) => {
          // 更新 Query 缓存
          queryClient.setQueryData(
            ['asset', 'native', chainId, address],
            balance
          )
        },
      })
    
    return () => subscription.unsubscribe()
  }, [assetSubscription, chainId, address, queryClient])
}
```

---

## 14.8 最佳实践

### 1. 始终清理订阅

```typescript
// ✅ 在 useEffect 清理函数中取消订阅
useEffect(() => {
  const sub = subscribable.subscribe({ next: setValue })
  return () => sub.unsubscribe()
}, [subscribable])
```

### 2. 避免频繁创建订阅

```typescript
// ✅ 使用 useMemo 缓存 subscribable
const subscribable = useMemo(
  () => service.subscribeBalance({ address }),
  [service, address]
)

// ❌ 每次渲染都创建新订阅
const subscribable = service.subscribeBalance({ address })
```

### 3. 处理错误

```typescript
const subscription = subscribable.subscribe({
  next: setValue,
  error: (error) => {
    console.error('Subscription error:', error)
    // 可以设置错误状态或重试
  },
})
```

---

## 本章小结

- Subscribable 提供统一的订阅接口
- 支持余额、交易状态、新区块等事件
- useSubscription Hook 简化 React 集成
- 可与 TanStack Query 缓存结合使用

---

## 下一篇

完成服务篇后，继续阅读 [第五篇：组件篇](../../05-组件篇/)，了解 UI 组件体系。
