# BioForest Chain Adapter

> Source: [src/services/chain-adapter/bioforest/](https://github.com/BioforestChain/KeyApp/tree/main/src/services/chain-adapter/bioforest)

## 概览

BioForest Adapter 实现生物链林生态的链接口，使用 Ed25519 签名算法。

---

## 文件结构

```
chain-adapter/bioforest/
├── index.ts              # 导出
├── adapter.ts            # Adapter 主类
├── identity-service.ts   # 地址派生 (Ed25519)
├── asset-service.ts      # 余额/AST 代币查询
├── transaction-service.ts # 交易构建
├── chain-service.ts      # 链信息
├── schema.ts             # Zod 验证
└── types.ts              # BioForest 特有类型
```

---

## 与其他链的区别

| 特性 | BioForest | EVM | Bitcoin | Tron |
|------|-----------|-----|---------|------|
| 签名算法 | **Ed25519** | secp256k1 | secp256k1 | secp256k1 |
| 地址格式 | `b...` / `BFM...` | `0x...` | `bc1...` | `T...` |
| HD 派生 | 无 (单密钥) | BIP44 | BIP84 | BIP44 |
| 代币标准 | AST | ERC-20 | - | TRC-20 |
| 手续费 | 固定费率 | Gas | 费率 | 能量/带宽 |

---

## Identity Service

### 密钥派生

BioForest **不使用 HD 派生**，同一助记词/密钥生成固定地址。

```typescript
class BioforestIdentityService implements IIdentityService {
  async deriveAddress(seed: Uint8Array, _index = 0): Promise<Address> {
    // BioForest 使用相同密钥对所有索引
    const seedString = new TextDecoder().decode(seed);
    const keypair = createBioforestKeypair(seedString);
    return publicKeyToBioforestAddress(keypair.publicKey, this.getPrefix());
  }
  
  async deriveAddresses(seed: Uint8Array, _startIndex: number, count: number): Promise<Address[]> {
    // 所有索引返回相同地址
    const address = await this.deriveAddress(seed, 0);
    return Array(count).fill(address);
  }
}
```

### 地址格式

```
BioForest 地址结构:
┌────────┬────────────────────────────────────┬──────────┐
│ 前缀   │         公钥哈希 (20字节)          │  校验和  │
│ 'b'    │         BLAKE2b(pubkey)           │  4字节   │
└────────┴────────────────────────────────────┴──────────┘

示例: bXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX
```

### 前缀配置

```typescript
// 不同网络使用不同前缀
const prefixes = {
  mainnet: 'b',
  testnet: 't',
  devnet: 'd',
};

private getPrefix(): string {
  const config = chainConfigService.getConfig(this.chainId);
  return config?.prefix ?? 'b';
}
```

### 消息签名 (Ed25519)

```typescript
async signMessage(message: string | Uint8Array, privateKey: Uint8Array): Promise<Signature> {
  const signature = bioforestSign(message, privateKey);
  return bytesToHex(signature);
}
```

---

## Asset Service

### 原生代币余额

```typescript
async getNativeBalance(address: Address): Promise<Balance> {
  const result = await this.api.getBalance(address);
  return {
    amount: Amount.fromRaw(result.balance, this.config.decimals, this.config.symbol),
    symbol: this.config.symbol,
  };
}
```

### AST 代币查询

```typescript
// BioForest 使用 AST (Asset) 代币标准
async getTokenBalances(address: Address): Promise<Balance[]> {
  const assets = await this.api.getAssets(address);
  
  return assets.map(asset => ({
    amount: Amount.fromRaw(asset.balance, asset.decimals, asset.symbol),
    symbol: asset.symbol,
    contractAddress: asset.assetId,
  }));
}
```

---

## Transaction Service

### 交易类型

```typescript
type BioforestTransactionType = 
  | 'BSE-01'   // 转账
  | 'AST-01'   // 资产转账
  | 'AST-02'   // 资产创建
  | 'STK-01'   // 质押
  | 'STK-02'   // 解除质押
  | 'VOT-01'   // 投票
```

### 手续费模型

BioForest 使用 **固定费率** 模型:

```typescript
async estimateFee(params: TransferParams): Promise<FeeEstimate> {
  // 固定手续费
  const fixedFee = await this.api.getTransactionFee();
  
  const fee: Fee = {
    amount: Amount.fromRaw(fixedFee, this.config.decimals, this.config.symbol),
    estimatedTime: 3,  // 约 3 秒
  };
  
  return { slow: fee, standard: fee, fast: fee };
}
```

### 交易构建

```typescript
async buildTransaction(params: TransferParams): Promise<UnsignedTransaction> {
  const tx = {
    type: params.tokenAddress ? 'AST-01' : 'BSE-01',
    from: params.from,
    to: params.to,
    amount: params.amount.raw,
    assetId: params.tokenAddress,
    memo: params.memo,
    timestamp: Date.now(),
    nonce: await this.api.getNonce(params.from),
  };
  
  return {
    chainId: this.chainId,
    data: tx,
  };
}
```

### 签名与广播

```typescript
async signTransaction(unsignedTx: UnsignedTransaction, privateKey: Uint8Array): Promise<SignedTransaction> {
  const txData = unsignedTx.data as BioforestTx;
  const message = this.serializeTx(txData);
  const signature = await this.identity.signMessage(message, privateKey);
  
  return {
    chainId: unsignedTx.chainId,
    data: txData,
    signature,
  };
}

async broadcastTransaction(signedTx: SignedTransaction): Promise<TransactionHash> {
  const result = await this.api.broadcastTransaction({
    ...signedTx.data,
    signature: signedTx.signature,
  });
  
  return result.txHash;
}
```

---

## Chain Service

### 链信息

```typescript
getChainInfo(): ChainInfo {
  return {
    chainId: this.chainId,
    name: this.config.name,
    symbol: this.config.symbol,
    decimals: this.config.decimals,
    blockTime: 3,          // 3 秒出块
    confirmations: 1,      // 1 个确认即可
    explorerUrl: this.config.explorerUrl,
  };
}
```

### 健康检查

```typescript
async healthCheck(): Promise<HealthStatus> {
  const start = Date.now();
  const blockHeight = await this.getBlockHeight();
  const latency = Date.now() - start;
  
  return {
    isHealthy: true,
    latency,
    blockHeight,
    isSyncing: false,
    lastUpdated: Date.now(),
  };
}
```

---

## BioForest 特有错误

```typescript
const BioforestErrorCodes = {
  ADDRESS_FROZEN: 'ADDRESS_FROZEN',       // 地址被冻结
  PAYSECRET_REQUIRED: 'PAYSECRET_REQUIRED', // 需要支付密码
  ASSET_NOT_FOUND: 'ASSET_NOT_FOUND',     // 资产不存在
  INSUFFICIENT_STAKE: 'INSUFFICIENT_STAKE', // 质押不足
};

// 地址冻结
if (error.code === 'FROZEN') {
  throw new ChainServiceError(
    BioforestErrorCodes.ADDRESS_FROZEN,
    '该地址已被冻结，无法进行交易'
  );
}

// 需要支付密码
if (error.code === 'PAYSECRET') {
  throw new ChainServiceError(
    BioforestErrorCodes.PAYSECRET_REQUIRED,
    '此交易需要验证支付密码'
  );
}
```

---

## API 端点

| 端点 | 描述 |
|------|------|
| `/account/{address}` | 获取账户信息 |
| `/account/{address}/balance` | 获取余额 |
| `/account/{address}/assets` | 获取 AST 资产 |
| `/account/{address}/transactions` | 交易历史 |
| `/transaction/broadcast` | 广播交易 |
| `/chain/info` | 链信息 |
| `/chain/fee` | 手续费信息 |

---

## 依赖库

| 库 | 用途 |
|----|------|
| `@noble/ed25519` | Ed25519 签名 |
| `@noble/hashes` | BLAKE2b 哈希 |
| `@/lib/crypto` | BioForest 密钥工具 |

---

## 相关文档

- [Chain Adapter 架构](./01-Adapter.md)
- [BioForest SDK](../09-BioForest/01-SDK.md)
- [BioForest API](../09-BioForest/02-API.md)
