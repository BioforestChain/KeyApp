# Tron Chain Adapter

> Source: [src/services/chain-adapter/tron/](https://github.com/BioforestChain/KeyApp/tree/main/src/services/chain-adapter/tron)

## 概览

Tron Adapter 实现 TRX 和 TRC-20 代币的完整支持，包括能量/带宽资源模型。

---

## 文件结构

```
chain-adapter/tron/
├── index.ts              # 导出
├── adapter.ts            # Adapter 主类
├── identity-service.ts   # 地址派生
├── asset-service.ts      # 余额/TRC-20 查询
├── transaction-service.ts # 交易构建
├── chain-service.ts      # 链信息
└── types.ts              # Tron 特有类型
```

---

## 地址格式

| 格式 | 示例 | 描述 |
|------|------|------|
| Base58Check | `T...` (34字符) | 标准地址 |
| Hex | `41...` (42字符) | 内部格式 |

**地址结构**: `0x41` 前缀 + 20字节地址 + 4字节校验和

---

## Identity Service

### 地址派生

```typescript
class TronIdentityService implements IIdentityService {
  async deriveAddress(seed: Uint8Array, index = 0): Promise<Address> {
    const mnemonic = new TextDecoder().decode(seed);
    // BIP44: m/44'/195'/0'/0/{index}
    const derived = deriveKey(mnemonic, 'tron', index);
    return derived.address;  // T...
  }
}
```

### 派生路径

```
Tron: m/44'/195'/0'/0/{index}
      └── 195 是 Tron 的 coin_type
```

### 地址验证

```typescript
isValidAddress(address: string): boolean {
  // 必须以 'T' 开头，长度 34
  if (!address.startsWith('T') || address.length !== 34) {
    return false;
  }
  
  // 验证 Base58 字符
  const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  for (const char of address) {
    if (!ALPHABET.includes(char)) return false;
  }
  
  // 验证校验和
  const decoded = decodeBase58(address);
  const payload = decoded.slice(0, 21);
  const checksum = decoded.slice(21);
  const hash = sha256(sha256(payload));
  
  return checksum.every((byte, i) => byte === hash[i]);
}
```

### 消息签名

```typescript
async signMessage(message: string | Uint8Array, privateKey: Uint8Array): Promise<Signature> {
  // Tron 使用 keccak256
  const prefix = '\x19TRON Signed Message:\n' + message.length;
  const hash = keccak256(prefix + message);
  
  return secp256k1.sign(hash, privateKey);
}
```

---

## Asset Service

### TRX 余额查询

```typescript
async getNativeBalance(address: Address): Promise<Balance> {
  const account = await this.trongrid.getAccount(address);
  return {
    amount: Amount.fromRaw((account.balance ?? 0).toString(), 6, 'TRX'),
    symbol: 'TRX',
  };
}
```

### TRC-20 代币余额

```typescript
async getTokenBalances(address: Address): Promise<Balance[]> {
  const tokens = await this.trongrid.getTrc20Balances(address);
  
  return tokens.map(t => ({
    amount: Amount.fromRaw(t.balance, t.tokenDecimal, t.tokenSymbol),
    symbol: t.tokenSymbol,
    contractAddress: t.tokenAddress,
  }));
}
```

---

## Transaction Service

### Tron 资源模型

```
┌─────────────────────────────────────────────────────────────┐
│                     Tron 资源系统                           │
│                                                             │
│  ┌─────────────────┐      ┌─────────────────┐              │
│  │     带宽        │      │     能量        │              │
│  │   (Bandwidth)   │      │    (Energy)     │              │
│  └────────┬────────┘      └────────┬────────┘              │
│           │                        │                        │
│           ▼                        ▼                        │
│  ┌─────────────────┐      ┌─────────────────┐              │
│  │ 普通转账消耗    │      │ 合约调用消耗    │              │
│  │ ~300 带宽/笔    │      │ 变动量          │              │
│  └─────────────────┘      └─────────────────┘              │
│                                                             │
│  获取方式:                                                  │
│  1. 冻结 TRX 获得资源                                       │
│  2. 不足时消耗 TRX (按费率)                                 │
└─────────────────────────────────────────────────────────────┘
```

### 手续费估算

```typescript
async estimateFee(params: TransferParams): Promise<FeeEstimate> {
  // TRX 转账 (消耗带宽)
  if (!params.tokenAddress) {
    const bandwidthCost = 300;  // 典型 TRX 转账
    const bandwidthPrice = 1000; // 1 TRX = 1000 带宽
    
    return {
      slow: { amount: Amount.fromTRX('0'), estimatedTime: 3 },
      standard: { amount: Amount.fromTRX('0'), estimatedTime: 3 },
      fast: { amount: Amount.fromTRX('0'), estimatedTime: 3 },
    };
    // 如果有足够带宽，免费
  }
  
  // TRC-20 转账 (消耗能量)
  const energyEstimate = await this.estimateEnergy(params);
  const energyPrice = await this.getEnergyPrice();
  const fee = energyEstimate * energyPrice;
  
  return {
    slow: { amount: Amount.fromSun(fee), estimatedTime: 3 },
    standard: { amount: Amount.fromSun(fee), estimatedTime: 3 },
    fast: { amount: Amount.fromSun(fee), estimatedTime: 3 },
  };
}
```

### 交易构建

```typescript
async buildTransaction(params: TransferParams): Promise<UnsignedTransaction> {
  if (params.tokenAddress) {
    // TRC-20 转账
    return this.buildTrc20Transfer(params);
  }
  
  // TRX 转账
  const tx = await this.trongrid.createTransaction({
    to_address: this.toHexAddress(params.to),
    owner_address: this.toHexAddress(params.from),
    amount: Number(params.amount.raw),
  });
  
  return {
    chainId: 'tron',
    data: tx,
  };
}

async buildTrc20Transfer(params: TransferParams): Promise<UnsignedTransaction> {
  // 调用 TRC-20 合约的 transfer 方法
  const parameter = [
    { type: 'address', value: params.to },
    { type: 'uint256', value: params.amount.raw },
  ];
  
  const tx = await this.trongrid.triggerSmartContract({
    owner_address: this.toHexAddress(params.from),
    contract_address: this.toHexAddress(params.tokenAddress),
    function_selector: 'transfer(address,uint256)',
    parameter,
    fee_limit: 100_000_000,  // 100 TRX
  });
  
  return {
    chainId: 'tron',
    data: tx.transaction,
  };
}
```

### 地址激活

```typescript
// Tron 新地址首次接收 TRX 时自动激活
// 激活需要 1.1 TRX (1 TRX 账户费 + 0.1 TRX 带宽)

async isAddressActivated(address: Address): Promise<boolean> {
  try {
    const account = await this.trongrid.getAccount(address);
    return account !== null && account.address !== undefined;
  } catch {
    return false;
  }
}
```

---

## TronGrid API

| 端点 | 描述 |
|------|------|
| `/v1/accounts/{address}` | 获取账户信息 |
| `/v1/accounts/{address}/transactions` | 获取交易历史 |
| `/v1/accounts/{address}/transactions/trc20` | TRC-20 交易 |
| `/wallet/createtransaction` | 创建 TRX 转账 |
| `/wallet/triggersmartcontract` | 调用合约 |
| `/wallet/broadcasttransaction` | 广播交易 |

---

## 特殊错误处理

```typescript
const TronErrorCodes = {
  ADDRESS_NOT_ACTIVATED: 'ADDRESS_NOT_ACTIVATED',
  ENERGY_INSUFFICIENT: 'ENERGY_INSUFFICIENT',
  BANDWIDTH_INSUFFICIENT: 'BANDWIDTH_INSUFFICIENT',
  CONTRACT_VALIDATE_ERROR: 'CONTRACT_VALIDATE_ERROR',
};

// 地址未激活
if (error.message.includes('account not found')) {
  throw new ChainServiceError(
    TronErrorCodes.ADDRESS_NOT_ACTIVATED,
    '接收地址未激活，首次转账需至少 1.1 TRX'
  );
}

// 能量不足
if (error.message.includes('energy')) {
  throw new ChainServiceError(
    TronErrorCodes.ENERGY_INSUFFICIENT,
    '能量不足，请冻结 TRX 或支付手续费'
  );
}
```

---

## 依赖库

| 库 | 用途 |
|----|------|
| `@noble/hashes` | SHA256, Keccak256 |
| `@noble/curves` | secp256k1 签名 |
| `@scure/bip32` | HD 密钥派生 |

---

## 相关文档

- [Chain Adapter 架构](./01-Adapter.md)
- [API Providers](./06-Providers.md)
- [Transaction Flow](../../10-Wallet-Guide/03-Transaction-Flow/01-Lifecycle.md)
