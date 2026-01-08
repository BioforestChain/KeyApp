# EVM Chain Adapter

> Source: [src/services/chain-adapter/evm/](https://github.com/BioforestChain/KeyApp/tree/main/src/services/chain-adapter/evm)

## 概览

EVM Adapter 实现以太坊及兼容链 (BSC, Polygon, Arbitrum 等) 的统一接口。

---

## 文件结构

```
chain-adapter/evm/
├── index.ts              # 导出
├── adapter.ts            # EVM Adapter 主实现
├── identity.ts           # 地址派生/签名
├── asset.ts              # 余额/代币查询
├── transaction.ts        # 交易构建/广播
├── chain.ts              # 链信息/Gas
└── types.ts              # EVM 特有类型
```

---

## 支持的链

| 链 | Chain ID | 符号 | RPC |
|----|----------|------|-----|
| Ethereum | 1 | ETH | Infura/Alchemy |
| BSC | 56 | BNB | BSC RPC |
| Polygon | 137 | MATIC | Polygon RPC |
| Arbitrum | 42161 | ETH | Arbitrum RPC |
| Optimism | 10 | ETH | Optimism RPC |
| Avalanche | 43114 | AVAX | Avalanche RPC |

---

## Identity Service

```typescript
class EvmIdentityService implements IIdentityService {
  // 从种子派生地址 (BIP44: m/44'/60'/0'/0/index)
  async deriveAddress(seed: Uint8Array, index = 0): Promise<Address> {
    const hdNode = HDNodeWallet.fromSeed(seed);
    const path = `m/44'/60'/0'/0/${index}`;
    const wallet = hdNode.derivePath(path);
    return wallet.address;
  }
  
  // 批量派生
  async deriveAddresses(seed: Uint8Array, startIndex: number, count: number): Promise<Address[]>
  
  // 地址验证 (checksum)
  isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }
  
  // 标准化地址 (添加 checksum)
  normalizeAddress(address: string): Address {
    return ethers.getAddress(address);
  }
  
  // 签名消息 (EIP-191)
  async signMessage(message: string | Uint8Array, privateKey: Uint8Array): Promise<Signature>
  
  // 验证签名
  async verifyMessage(message: string | Uint8Array, signature: Signature, address: Address): Promise<boolean>
}
```

---

## Asset Service

```typescript
class EvmAssetService implements IAssetService {
  // 原生代币余额
  async getNativeBalance(address: Address): Promise<Balance> {
    const balance = await provider.getBalance(address);
    return {
      amount: Amount.fromWei(balance, 18),
      symbol: 'ETH',
    };
  }
  
  // ERC-20 代币余额
  async getTokenBalance(address: Address, tokenAddress: Address): Promise<Balance> {
    const contract = new Contract(tokenAddress, ERC20_ABI, provider);
    const [balance, decimals, symbol] = await Promise.all([
      contract.balanceOf(address),
      contract.decimals(),
      contract.symbol(),
    ]);
    return {
      amount: Amount.fromWei(balance, decimals),
      symbol,
    };
  }
  
  // 获取所有代币余额 (通过 Multicall)
  async getTokenBalances(address: Address): Promise<Balance[]>
  
  // 代币元数据
  async getTokenMetadata(tokenAddress: Address): Promise<TokenMetadata>
}
```

---

## Transaction Service

```typescript
class EvmTransactionService implements ITransactionService {
  // 估算手续费 (EIP-1559)
  async estimateFee(params: TransferParams): Promise<FeeEstimate> {
    const feeData = await provider.getFeeData();
    const gasLimit = await this.estimateGas(params);
    
    return {
      slow: {
        amount: Amount.fromWei(gasLimit * feeData.maxFeePerGas * 0.8n, 18),
        estimatedTime: 120,
      },
      standard: {
        amount: Amount.fromWei(gasLimit * feeData.maxFeePerGas, 18),
        estimatedTime: 30,
      },
      fast: {
        amount: Amount.fromWei(gasLimit * feeData.maxFeePerGas * 1.2n, 18),
        estimatedTime: 15,
      },
    };
  }
  
  // 构建交易
  async buildTransaction(params: TransferParams): Promise<UnsignedTransaction> {
    const nonce = await provider.getTransactionCount(params.from);
    const feeData = await provider.getFeeData();
    
    if (params.tokenAddress) {
      // ERC-20 转账
      const contract = new Contract(params.tokenAddress, ERC20_ABI);
      const data = contract.interface.encodeFunctionData('transfer', [
        params.to,
        params.amount.toWei(),
      ]);
      
      return {
        chainId: this.chainId,
        data: {
          to: params.tokenAddress,
          data,
          nonce,
          maxFeePerGas: feeData.maxFeePerGas,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
          gasLimit: await this.estimateGas(params),
        },
      };
    }
    
    // 原生代币转账
    return {
      chainId: this.chainId,
      data: {
        to: params.to,
        value: params.amount.toWei(),
        nonce,
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        gasLimit: 21000n,
      },
    };
  }
  
  // 签名交易
  async signTransaction(unsignedTx: UnsignedTransaction, privateKey: Uint8Array): Promise<SignedTransaction>
  
  // 广播交易
  async broadcastTransaction(signedTx: SignedTransaction): Promise<TransactionHash>
  
  // 查询交易状态
  async getTransactionStatus(hash: TransactionHash): Promise<TransactionStatus>
  
  // 获取交易详情
  async getTransaction(hash: TransactionHash): Promise<Transaction | null>
  
  // 交易历史 (通过 Etherscan API)
  async getTransactionHistory(address: Address, limit?: number): Promise<Transaction[]>
}
```

---

## Chain Service

```typescript
class EvmChainService implements IChainService {
  getChainInfo(): ChainInfo {
    return {
      chainId: this.chainId,
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
      blockTime: 12,
      confirmations: 12,
      explorerUrl: 'https://etherscan.io',
    };
  }
  
  async getBlockHeight(): Promise<bigint> {
    return BigInt(await provider.getBlockNumber());
  }
  
  async getGasPrice(): Promise<GasPrice> {
    const feeData = await provider.getFeeData();
    return {
      slow: Amount.fromWei(feeData.maxFeePerGas * 0.8n, 9),
      standard: Amount.fromWei(feeData.maxFeePerGas, 9),
      fast: Amount.fromWei(feeData.maxFeePerGas * 1.2n, 9),
      baseFee: Amount.fromWei(feeData.lastBaseFeePerGas, 9),
      lastUpdated: Date.now(),
    };
  }
  
  async healthCheck(): Promise<HealthStatus>
}
```

---

## EIP-1559 支持

```typescript
interface EIP1559Transaction {
  type: 2;
  chainId: number;
  nonce: number;
  maxPriorityFeePerGas: bigint;  // 小费
  maxFeePerGas: bigint;          // 最大 Gas 价格
  gasLimit: bigint;
  to: Address;
  value: bigint;
  data: string;
}
```

---

## 使用示例

```typescript
import { adapterRegistry } from '@/services/chain-adapter';

// 获取 EVM 适配器
const adapter = adapterRegistry.getAdapter('ethereum');

// 派生地址
const address = await adapter.identity.deriveAddress(seed, 0);

// 查询余额
const balance = await adapter.asset.getNativeBalance(address);
console.log(`${balance.amount.format()} ${balance.symbol}`);

// 转账
const unsignedTx = await adapter.transaction.buildTransaction({
  from: address,
  to: '0x...',
  amount: Amount.fromEther('0.1'),
});

const signedTx = await adapter.transaction.signTransaction(unsignedTx, privateKey);
const txHash = await adapter.transaction.broadcastTransaction(signedTx);
```

---

## 相关文档

- [Chain Adapter 架构](./01-Adapter.md)
- [API Providers](./06-Providers.md)
- [Transaction Flow](../../10-Wallet-Guide/03-Transaction-Flow/01-Lifecycle.md)
