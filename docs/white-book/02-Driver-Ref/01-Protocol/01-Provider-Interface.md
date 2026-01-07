# 01. Provider 接口定义 (ApiProvider Interface)

Code: `src/services/chain-adapter/providers/types.ts`

所有驱动必须实现此接口。它是系统的 HAL 标准。

## 接口定义

```typescript
export interface ApiProvider {
  /** 驱动类型标识 (e.g., 'etherscan-v2') */
  readonly type: string;
  
  /** 服务端点 */
  readonly endpoint: string;

  /** 能力声明 (Capabilities) */
  readonly supportsNativeBalance?: boolean;
  readonly supportsTransactionHistory?: boolean;
  readonly supportsTokenBalances?: boolean;

  /** 核心方法 */
  getNativeBalance?(address: string): Promise<Balance>;
  getTokenBalances?(address: string): Promise<TokenBalance[]>;
  getTransactionHistory?(address: string, limit?: number): Promise<Transaction[]>;
  getTransaction?(hash: string): Promise<Transaction | null>;
  
  /** 交易方法 (可选) */
  estimateFee?(params: TransferParams): Promise<FeeEstimate>;
  broadcastTransaction?(signedTx: SignedTransaction): Promise<string>;
}
```

## 关键数据结构

### Balance
```typescript
interface Balance {
  amount: Amount; // 使用 BigInt 的金额封装
  symbol: string;
}
```

### Transaction
```typescript
interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  status: 'confirmed' | 'pending' | 'failed';
  direction: 'in' | 'out' | 'self';
}
```
