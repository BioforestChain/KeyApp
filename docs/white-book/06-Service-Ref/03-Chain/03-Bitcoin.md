# Bitcoin Chain Adapter

> Source: [src/services/chain-adapter/bitcoin/](https://github.com/BioforestChain/KeyApp/tree/main/src/services/chain-adapter/bitcoin)

## 概览

Bitcoin Adapter 实现 BTC UTXO 模型的完整支持，包括多种地址格式和 SegWit 交易。

---

## 文件结构

```
chain-adapter/bitcoin/
├── index.ts              # 导出
├── adapter.ts            # Adapter 主类
├── identity-service.ts   # 地址派生 (BIP84)
├── asset-service.ts      # 余额查询
├── transaction-service.ts # UTXO 交易构建
├── chain-service.ts      # 链信息
└── types.ts              # Bitcoin 特有类型
```

---

## 支持的地址格式

| 格式 | 前缀 | BIP | 描述 |
|------|------|-----|------|
| P2PKH (Legacy) | `1...` | BIP44 | 传统地址 |
| P2SH (Script) | `3...` | BIP49 | 脚本哈希 |
| P2WPKH (Native SegWit) | `bc1q...` | BIP84 | **默认** |
| P2TR (Taproot) | `bc1p...` | BIP86 | Taproot |

**默认使用 BIP84 (Native SegWit)**，手续费最低。

---

## Identity Service

### 地址派生

```typescript
class BitcoinIdentityService implements IIdentityService {
  async deriveAddress(seed: Uint8Array, index = 0): Promise<Address> {
    const mnemonic = new TextDecoder().decode(seed);
    // BIP84: m/84'/0'/0'/0/{index}
    const derived = deriveBitcoinKey(mnemonic, 84, index);
    return derived.address;  // bc1q...
  }
}
```

### 派生路径

```
BIP84 (Native SegWit):  m/84'/0'/0'/0/{index}
BIP49 (Wrapped SegWit): m/49'/0'/0'/0/{index}
BIP44 (Legacy):         m/44'/0'/0'/0/{index}
```

### 地址验证

```typescript
isValidAddress(address: string): boolean {
  // Legacy P2PKH (1...) 或 P2SH (3...)
  if (address.startsWith('1') || address.startsWith('3')) {
    const decoded = base58check(sha256).decode(address);
    return decoded.length === 21;
  }
  
  // Native SegWit P2WPKH (bc1q...)
  if (address.toLowerCase().startsWith('bc1q')) {
    const decoded = bech32.decode(address);
    const data = bech32.fromWords(decoded.words.slice(1));
    return decoded.prefix === 'bc' && decoded.words[0] === 0 && data.length === 20;
  }
  
  // Taproot P2TR (bc1p...)
  if (address.toLowerCase().startsWith('bc1p')) {
    const decoded = bech32m.decode(address);
    const data = bech32m.fromWords(decoded.words.slice(1));
    return decoded.prefix === 'bc' && decoded.words[0] === 1 && data.length === 32;
  }
  
  return false;
}
```

### 消息签名

```typescript
async signMessage(message: string | Uint8Array, privateKey: Uint8Array): Promise<Signature> {
  // Bitcoin 消息签名格式
  const prefix = '\x18Bitcoin Signed Message:\n';
  const msgLen = message.length;
  const fullMsg = prefix + msgLen + message;
  const hash = sha256(sha256(fullMsg));
  
  return secp256k1.sign(hash, privateKey);
}
```

---

## Transaction Service

### UTXO 类型

```typescript
interface BitcoinUtxo {
  txid: string;
  vout: number;
  value: number;      // satoshis
  status: {
    confirmed: boolean;
    block_height?: number;
  };
}

interface BitcoinUnsignedTx {
  inputs: Array<{
    txid: string;
    vout: number;
    value: number;
    scriptPubKey: string;
  }>;
  outputs: Array<{
    address: string;
    value: number;
  }>;
  feeRate: number;    // sat/vB
}
```

### 手续费估算

```typescript
async estimateFee(params: TransferParams): Promise<FeeEstimate> {
  // 从 mempool.space 获取推荐费率
  const fees = await this.api<BitcoinFeeEstimates>('/v1/fees/recommended');
  
  // 典型 P2WPKH 交易大小: ~140 vBytes (1输入2输出)
  const typicalVsize = 140;
  
  return {
    slow: {
      amount: Amount.fromSatoshi(fees.hourFee * typicalVsize),
      estimatedTime: 3600,  // 1 小时
    },
    standard: {
      amount: Amount.fromSatoshi(fees.halfHourFee * typicalVsize),
      estimatedTime: 1800,  // 30 分钟
    },
    fast: {
      amount: Amount.fromSatoshi(fees.fastestFee * typicalVsize),
      estimatedTime: 600,   // 10 分钟
    },
  };
}
```

### 交易构建

```typescript
async buildTransaction(params: TransferParams): Promise<UnsignedTransaction> {
  // 1. 获取 UTXO
  const utxos = await this.api<BitcoinUtxo[]>(`/address/${params.from}/utxo`);
  
  if (utxos.length === 0) {
    throw new ChainServiceError(ChainErrorCodes.INSUFFICIENT_BALANCE, 'No UTXOs');
  }
  
  // 2. 获取费率
  const fees = await this.api<BitcoinFeeEstimates>('/v1/fees/recommended');
  const feeRate = fees.halfHourFee;
  
  // 3. UTXO 选择 (简单策略: 使用所有)
  const totalInput = utxos.reduce((sum, u) => sum + u.value, 0);
  const sendAmount = Number(params.amount.raw);
  
  // 4. 估算交易大小
  const estimatedVsize = 10 + utxos.length * 68 + 2 * 31;
  const fee = feeRate * estimatedVsize;
  
  // 5. 检查余额
  if (totalInput < sendAmount + fee) {
    throw new ChainServiceError(ChainErrorCodes.INSUFFICIENT_BALANCE);
  }
  
  // 6. 计算找零
  const change = totalInput - sendAmount - fee;
  
  return {
    chainId: 'bitcoin',
    data: {
      inputs: utxos.map(u => ({ txid: u.txid, vout: u.vout, value: u.value })),
      outputs: [
        { address: params.to, value: sendAmount },
        ...(change > 546 ? [{ address: params.from, value: change }] : []),
      ],
      feeRate,
    },
  };
}
```

### UTXO 选择策略

```
┌─────────────────────────────────────────────────────────────┐
│                      UTXO 池                                │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│  │ 0.1 BTC│ │ 0.05   │ │ 0.02   │ │ 0.5 BTC│ │ 0.003  │   │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    UTXO 选择                                │
│  目标金额: 0.15 BTC + 手续费                                 │
│                                                             │
│  策略 1: 最大优先 → 选择 0.5 BTC                             │
│  策略 2: 最小满足 → 选择 0.1 + 0.05 + 0.02                   │
│  策略 3: 避免找零 → 尝试精确匹配                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      交易输出                               │
│  输出 1: 0.15 BTC → 接收方地址                              │
│  输出 2: 找零      → 发送方地址 (如果 > 546 sat)            │
└─────────────────────────────────────────────────────────────┘
```

### 粉尘限制

```typescript
// 最小输出值 (避免粉尘攻击)
const DUST_LIMIT = 546;  // satoshis

// 找零金额小于此值时，将其加入手续费
if (change > 0 && change <= DUST_LIMIT) {
  // 不创建找零输出，额外金额归矿工
}
```

---

## API 端点

使用 **mempool.space** API:

| 端点 | 描述 |
|------|------|
| `/address/{addr}/utxo` | 获取地址 UTXO |
| `/address/{addr}` | 获取地址信息 |
| `/v1/fees/recommended` | 获取推荐费率 |
| `/tx` | 广播交易 (POST) |
| `/tx/{txid}` | 获取交易详情 |
| `/tx/{txid}/status` | 获取交易状态 |

---

## 依赖库

| 库 | 用途 |
|----|------|
| `@noble/hashes` | SHA256, RIPEMD160 |
| `@noble/curves` | secp256k1 签名 |
| `@scure/base` | Base58, Bech32 编码 |
| `@scure/bip32` | HD 密钥派生 |
| `@scure/bip39` | 助记词处理 |

---

## 相关文档

- [Chain Adapter 架构](./01-Adapter.md)
- [API Providers](./06-Providers.md)
- [Key Derivation](../../10-Wallet-Guide/01-Account-System/01-Key-Derivation.md)
