<!--
Type: Reference
Area: Driver
Code Source: src/services/chain-adapter/providers/types.ts
-->

# 01. ApiProvider 接口规范 (HAL)

`ApiProvider` 是 KeyApp 多链架构的核心抽象接口，相当于操作系统的 **硬件抽象层 (HAL)**。任何想要接入 KeyApp 的区块链网络，都必须实现此接口。

## 接口定义

```typescript
export interface ApiProvider {
  /** 
   * 驱动类型标识 
   * Format: `{protocol}-{variant}`
   * Example: 'etherscan-v2', 'ethereum-rpc', 'mempool-v1'
   */
  readonly type: string;
  
  /** 
   * 服务端点 URL
   * Example: 'https://api.etherscan.io/v2/api'
   */
  readonly endpoint: string;

  /** 
   * 配置参数
   * Example: { apiKeyEnv: 'ETHERSCAN_API_KEY' } 
   */
  readonly config?: Record<string, unknown>;

  // ========== 能力声明 (Capabilities) ==========
  // Provider 必须显式声明其支持的功能，以便 ChainProvider 进行路由和降级

  /** 是否支持原生代币余额查询 (e.g. ETH, BTC) */
  readonly supportsNativeBalance?: boolean;
  
  /** 是否支持交易历史查询 */
  readonly supportsTransactionHistory?: boolean;
  
  /** 是否支持代币余额查询 (e.g. ERC20, TRC20) */
  readonly supportsTokenBalances?: boolean;
  
  /** 是否支持单笔交易查询 */
  readonly supportsTransaction?: boolean;
  
  /** 是否支持区块高度查询 */
  readonly supportsBlockHeight?: boolean;

  /** 是否支持交易广播 */
  readonly supportsBroadcast?: boolean;

  // ========== 核心方法 (Core Methods) ==========

  /**
   * 查询原生代币余额
   * @param address 钱包地址
   * @returns 标准化的余额对象
   */
  getNativeBalance?(address: string): Promise<Balance>;

  /**
   * 查询代币余额列表
   * @param address 钱包地址
   */
  getTokenBalances?(address: string): Promise<TokenBalance[]>;

  /**
   * 查询交易历史
   * @param address 钱包地址
   * @param limit 条数限制 (默认 20)
   */
  getTransactionHistory?(address: string, limit?: number): Promise<Transaction[]>;

  /**
   * 查询单笔交易详情
   * @param hash 交易哈希
   */
  getTransaction?(hash: string): Promise<Transaction | null>;

  /**
   * 获取当前区块高度
   */
  getBlockHeight?(): Promise<bigint>;

  // ========== 交易方法 (Transaction Methods) ==========

  /**
   * 估算交易费用
   * @param params 转账参数
   */
  estimateFee?(params: TransferParams): Promise<FeeEstimate>;

  /**
   * 广播已签名的交易
   * @param signedTx 已签名的交易数据 (hex string)
   * @returns 交易哈希
   */
  broadcastTransaction?(signedTx: SignedTransaction): Promise<string>;
}
```

## 标准化数据类型

为了屏蔽底层链的差异，Driver 层必须将数据转换为统一的内部格式。

### 1. Balance
```typescript
interface Balance {
  amount: Amount; // 封装了 BigInt, Decimals, Symbol 的值对象
  symbol: string;
}
```

### 2. Transaction
这是最复杂的数据结构，需要兼容 UTXO 和 Account 模型。

```typescript
interface Transaction {
  hash: string;
  
  /** 发送方地址 (UTXO 模型中可能是输入地址之一) */
  from: string;
  
  /** 接收方地址 */
  to: string;
  
  /** 交易时间戳 (ms) */
  timestamp: number;
  
  /** 交易状态 */
  status: 'confirmed' | 'pending' | 'failed';
  
  /** 所在区块号 */
  blockNumber?: bigint;
  
  /** 
   * 交易动作类型 
   * - transfer: 普通转账
   * - contract: 合约调用
   * - swap: 代币兑换
   * - approve: 授权
   */
  action: Action;
  
  /** 
   * 相对于当前钱包的方向 
   * - in: 收入
   * - out: 支出
   * - self: 自转
   */
  direction: Direction;
  
  /** 
   * 交易涉及的资产列表
   * 一笔交易可能包含多个资产变动 (e.g. Swap ETH -> USDT)
   */
  assets: AssetTransfer[];
}
```

## 错误处理

Driver 不应抛出原始的 HTTP 错误，而应抛出标准化的 `ChainServiceError`。

```typescript
throw new ChainServiceError(
  ChainErrorCodes.NETWORK_ERROR, 
  'Failed to reach endpoint', 
  { endpoint: this.endpoint }
);
```
