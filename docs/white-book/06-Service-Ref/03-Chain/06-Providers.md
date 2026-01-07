# API Providers

> Source: [src/services/chain-adapter/providers/](https://github.com/BioforestChain/KeyApp/tree/main/src/services/chain-adapter/providers)

## 概览

Providers 是区块链 API 的抽象层，支持多数据源和故障转移。

---

## 文件结构

```
chain-adapter/providers/
├── index.ts                    # 导出
├── types.ts                    # Provider 接口定义
├── base-provider.ts            # 基类
├── eth-wallet-provider.ts      # ETH 综合 Provider
├── etherscan-provider.ts       # Etherscan API
├── bscscan-provider.ts         # BscScan API
├── btc-wallet-provider.ts      # BTC 综合 Provider
├── blockcypher-provider.ts     # BlockCypher API
├── tron-wallet-provider.ts     # Tron 综合 Provider
├── trongrid-provider.ts        # TronGrid API
└── __tests__/                  # 测试
```

---

## Provider 接口

```typescript
interface IWalletProvider {
  // 能力声明
  readonly capabilities: ProviderCapabilities;
  
  // 余额查询
  getBalance(address: string): Promise<BalanceResponse>;
  getTokenBalances?(address: string): Promise<TokenBalance[]>;
  
  // 交易查询
  getTransactionHistory(address: string, options?: HistoryOptions): Promise<Transaction[]>;
  getTransaction(hash: string): Promise<Transaction | null>;
  
  // 交易广播
  broadcastTransaction?(signedTx: string): Promise<string>;
  
  // 健康检查
  healthCheck(): Promise<HealthStatus>;
}

interface ProviderCapabilities {
  balance: boolean;
  tokenBalances: boolean;
  transactionHistory: boolean;
  transactionDetails: boolean;
  broadcast: boolean;
  gasEstimate: boolean;
}
```

---

## ETH Provider

### EthWalletProvider

组合多个数据源的综合 Provider。

```typescript
class EthWalletProvider implements IWalletProvider {
  private readonly etherscanProvider: EtherscanProvider;
  private readonly rpcProvider: JsonRpcProvider;
  
  capabilities = {
    balance: true,
    tokenBalances: true,
    transactionHistory: true,
    transactionDetails: true,
    broadcast: true,
    gasEstimate: true,
  };
  
  async getBalance(address: string): Promise<BalanceResponse> {
    // 优先使用 RPC
    const balance = await this.rpcProvider.getBalance(address);
    return {
      balance: balance.toString(),
      symbol: 'ETH',
      decimals: 18,
    };
  }
  
  async getTransactionHistory(address: string): Promise<Transaction[]> {
    // 使用 Etherscan API
    return this.etherscanProvider.getTransactionHistory(address);
  }
}
```

### EtherscanProvider

```typescript
class EtherscanProvider {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  
  async getTransactionHistory(address: string, options?: HistoryOptions): Promise<Transaction[]> {
    const response = await fetch(
      `${this.baseUrl}/api?module=account&action=txlist&address=${address}&apikey=${this.apiKey}`
    );
    
    const data = await response.json();
    return this.parseTransactions(data.result);
  }
  
  // Schema 验证
  private parseTransactions(raw: unknown[]): Transaction[] {
    return raw.map(tx => EtherscanTxSchema.parse(tx));
  }
}
```

---

## BTC Provider

### BtcWalletProvider

```typescript
class BtcWalletProvider implements IWalletProvider {
  private readonly blockcypherProvider: BlockCypherProvider;
  
  capabilities = {
    balance: true,
    tokenBalances: false,  // BTC 无代币
    transactionHistory: true,
    transactionDetails: true,
    broadcast: true,
    gasEstimate: true,
  };
  
  async getBalance(address: string): Promise<BalanceResponse> {
    const data = await this.blockcypherProvider.getAddressInfo(address);
    return {
      balance: data.balance.toString(),
      symbol: 'BTC',
      decimals: 8,
    };
  }
}
```

### BlockCypherProvider

```typescript
class BlockCypherProvider {
  private readonly token: string;
  private readonly network: 'main' | 'test3';
  
  async getAddressInfo(address: string): Promise<AddressInfo> {
    const response = await fetch(
      `https://api.blockcypher.com/v1/btc/${this.network}/addrs/${address}?token=${this.token}`
    );
    return BlockCypherAddressSchema.parse(await response.json());
  }
  
  async getTransactions(address: string): Promise<Transaction[]> {
    const response = await fetch(
      `https://api.blockcypher.com/v1/btc/${this.network}/addrs/${address}/full?token=${this.token}`
    );
    const data = await response.json();
    return this.parseTransactions(data.txs);
  }
}
```

---

## Tron Provider

### TronWalletProvider

```typescript
class TronWalletProvider implements IWalletProvider {
  private readonly trongridProvider: TronGridProvider;
  
  capabilities = {
    balance: true,
    tokenBalances: true,  // TRC-20
    transactionHistory: true,
    transactionDetails: true,
    broadcast: true,
    gasEstimate: true,
  };
  
  async getBalance(address: string): Promise<BalanceResponse> {
    const account = await this.trongridProvider.getAccount(address);
    return {
      balance: (account.balance ?? 0).toString(),
      symbol: 'TRX',
      decimals: 6,
    };
  }
  
  async getTokenBalances(address: string): Promise<TokenBalance[]> {
    const tokens = await this.trongridProvider.getTrc20Balances(address);
    return tokens.map(t => ({
      contractAddress: t.tokenAddress,
      symbol: t.tokenSymbol,
      balance: t.balance,
      decimals: t.tokenDecimal,
    }));
  }
}
```

### TronGridProvider

```typescript
class TronGridProvider {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.trongrid.io';
  
  async getAccount(address: string): Promise<TronAccount> {
    const response = await fetch(
      `${this.baseUrl}/v1/accounts/${address}`,
      { headers: { 'TRON-PRO-API-KEY': this.apiKey } }
    );
    return TronAccountSchema.parse(await response.json());
  }
  
  async getTransactions(address: string): Promise<Transaction[]> {
    const response = await fetch(
      `${this.baseUrl}/v1/accounts/${address}/transactions`,
      { headers: { 'TRON-PRO-API-KEY': this.apiKey } }
    );
    const data = await response.json();
    return this.parseTransactions(data.data);
  }
}
```

---

## Schema 验证 (Zod)

```typescript
// Etherscan 响应 Schema
const EtherscanTxSchema = z.object({
  hash: z.string(),
  from: z.string(),
  to: z.string(),
  value: z.string(),
  gas: z.string(),
  gasPrice: z.string(),
  timeStamp: z.string(),
  blockNumber: z.string(),
  isError: z.string().optional(),
});

// BlockCypher 响应 Schema
const BlockCypherTxSchema = z.object({
  hash: z.string(),
  total: z.number(),
  fees: z.number(),
  confirmed: z.string().optional(),
  received: z.string(),
  inputs: z.array(BlockCypherInputSchema),
  outputs: z.array(BlockCypherOutputSchema),
});

// TronGrid 响应 Schema
const TronGridTxSchema = z.object({
  txID: z.string(),
  raw_data: z.object({
    contract: z.array(z.object({
      type: z.string(),
      parameter: z.object({
        value: z.record(z.unknown()),
      }),
    })),
    timestamp: z.number(),
  }),
  ret: z.array(z.object({
    contractRet: z.string(),
  })).optional(),
});
```

---

## 故障转移

```typescript
class FallbackProvider implements IWalletProvider {
  private readonly providers: IWalletProvider[];
  
  async getBalance(address: string): Promise<BalanceResponse> {
    for (const provider of this.providers) {
      try {
        return await provider.getBalance(address);
      } catch (error) {
        console.warn(`Provider failed, trying next:`, error);
        continue;
      }
    }
    throw new Error('All providers failed');
  }
}
```

---

## API Key 配置

```typescript
// 环境变量注入
const providerConfig = {
  etherscan: {
    apiKey: import.meta.env.VITE_ETHERSCAN_API_KEY,
    baseUrl: 'https://api.etherscan.io',
  },
  bscscan: {
    apiKey: import.meta.env.VITE_BSCSCAN_API_KEY,
    baseUrl: 'https://api.bscscan.com',
  },
  blockcypher: {
    token: import.meta.env.VITE_BLOCKCYPHER_TOKEN,
  },
  trongrid: {
    apiKey: import.meta.env.VITE_TRONGRID_API_KEY,
  },
};
```

---

## 相关文档

- [Chain Adapter 架构](./01-Adapter.md)
- [EVM Adapter](./02-EVM.md)
- [Bitcoin Adapter](./03-Bitcoin.md)
- [Tron Adapter](./04-Tron.md)
