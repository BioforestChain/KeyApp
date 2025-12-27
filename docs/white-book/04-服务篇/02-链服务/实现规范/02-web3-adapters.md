# Web3 链适配器实现

> 本文档描述 EVM、Tron、Bitcoin 链适配器的实现细节。

## 概述

Web3 适配器为非 Bioforest 链提供统一接口，包括：

| 链类型 | 适配器 | API 端点 | 签名状态 |
|-------|--------|---------|---------|
| EVM (ETH/BSC) | `EvmAdapter` | PublicNode JSON-RPC | ✅ 完整 |
| Tron | `TronAdapter` | PublicNode HTTP API | ✅ 完整 |
| Bitcoin | `BitcoinAdapter` | mempool.space REST | ⚠️ 部分 |

## 目录结构

```
src/services/chain-adapter/
├── evm/
│   ├── adapter.ts           # 主适配器
│   ├── identity-service.ts  # 地址验证
│   ├── asset-service.ts     # 余额查询
│   ├── chain-service.ts     # 链信息、Gas 价格
│   ├── transaction-service.ts # 交易构建、签名、广播
│   └── types.ts
├── tron/
│   ├── adapter.ts
│   ├── identity-service.ts  # Base58Check 地址
│   ├── asset-service.ts     # TRX 余额
│   ├── chain-service.ts     # 带宽/能量
│   ├── transaction-service.ts
│   └── types.ts
├── bitcoin/
│   ├── adapter.ts
│   ├── identity-service.ts  # Bech32/Base58 地址
│   ├── asset-service.ts     # UTXO 余额
│   ├── chain-service.ts     # 费率估算
│   ├── transaction-service.ts # UTXO 选择
│   └── types.ts
└── index.ts                 # 适配器注册
```

## EVM 适配器

### 地址派生

使用 BIP44 路径 `m/44'/60'/0'/0/index`：

```typescript
import { HDKey } from '@scure/bip32'
import { keccak_256 } from '@noble/hashes/sha3.js'

async deriveAddress(seed: Uint8Array, index = 0): Promise<Address> {
  const hdKey = HDKey.fromMasterSeed(seed)
  const derived = hdKey.derive(`m/44'/60'/0'/0/${index}`)
  const pubKey = secp256k1.getPublicKey(derived.privateKey!, false)
  const hash = keccak_256(pubKey.slice(1))
  return '0x' + bytesToHex(hash.slice(-20))
}
```

### 交易签名

使用 RLP 编码和 EIP-155 签名：

```typescript
// 1. 构建交易数据
const txData = {
  nonce: await this.rpc('eth_getTransactionCount', [from, 'pending']),
  gasPrice: await this.rpc('eth_gasPrice'),
  gasLimit: '0x5208', // 21000 for simple transfer
  to, value, data: '0x',
  chainId: this.evmChainId,
}

// 2. RLP 编码（EIP-155 预签名）
const rawTx = this.rlpEncode([nonce, gasPrice, gasLimit, to, value, data, chainId, '0x', '0x'])

// 3. 签名
const msgHash = keccak_256(hexToBytes(rawTx.slice(2)))
const sig = secp256k1.sign(msgHash, privateKey, { format: 'recovered' })
const v = chainId * 2 + 35 + sig.recovery

// 4. 编码签名交易
const signedRaw = this.rlpEncode([nonce, gasPrice, gasLimit, to, value, data, v, r, s])
```

### API 调用

使用标准 Ethereum JSON-RPC：

```typescript
private async rpc<T>(method: string, params: unknown[] = []): Promise<T> {
  const response = await fetch(this.rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
  })
  const json = await response.json()
  return json.result
}
```

## Tron 适配器

### 地址格式

Tron 使用 Base58Check 编码，前缀 `0x41`：

```typescript
// 公钥 → 地址
const pubKeyHash = keccak_256(pubKey.slice(1)).slice(-20)
const payload = new Uint8Array([0x41, ...pubKeyHash])
const checksum = sha256(sha256(payload)).slice(0, 4)
return base58.encode([...payload, ...checksum]) // 以 'T' 开头
```

### 交易流程

1. **创建交易**：调用 `/wallet/createtransaction`
2. **签名**：对 `txID`（已是 hash）进行 secp256k1 签名
3. **广播**：调用 `/wallet/broadcasttransaction`

```typescript
// 创建交易
const rawTx = await this.api('/wallet/createtransaction', {
  owner_address: hexAddress,
  to_address: toHexAddress,
  amount: Number(amount.raw),
})

// 签名（Tron 的 txID 已经是 hash）
const sig = secp256k1.sign(hexToBytes(rawTx.txID), privateKey, { format: 'recovered' })

// 广播
await this.api('/wallet/broadcasttransaction', { ...rawTx, signature: [bytesToHex(sig)] })
```

## Bitcoin 适配器

### 地址类型支持

| 类型 | 前缀 | BIP 路径 | 编码 |
|-----|------|---------|------|
| P2WPKH (SegWit) | bc1q | m/84'/0'/0'/0/x | Bech32 |
| P2TR (Taproot) | bc1p | m/86'/0'/0'/0/x | Bech32m |
| P2PKH (Legacy) | 1 | m/44'/0'/0'/0/x | Base58Check |

默认使用 P2WPKH (Native SegWit)：

```typescript
import { bech32 } from '@scure/base'

async deriveAddress(seed: Uint8Array, index = 0): Promise<Address> {
  const hdKey = HDKey.fromMasterSeed(seed)
  const derived = hdKey.derive(`m/84'/0'/0'/0/${index}`)
  const pubKeyHash = ripemd160(sha256(derived.publicKey!))
  const words = bech32.toWords(pubKeyHash)
  return bech32.encode('bc', [0, ...words])
}
```

### UTXO 查询

使用 mempool.space API：

```typescript
// 获取 UTXO 列表
const utxos = await this.api<BitcoinUtxo[]>(`/address/${address}/utxo`)

// 计算余额
const info = await this.api<BitcoinAddressInfo>(`/address/${address}`)
const balance = info.chain_stats.funded_txo_sum - info.chain_stats.spent_txo_sum
```

### 交易签名限制

Bitcoin 交易签名比 EVM/Tron 复杂，需要：

1. UTXO 选择算法
2. 为每个输入构建 sighash
3. 签名每个输入
4. 构建完整的 witness 数据

**当前状态**：余额查询、UTXO 列表、交易历史已实现。完整签名需要集成 `bitcoinjs-lib` 或类似库。

## 依赖库

| 库 | 用途 |
|---|------|
| `@noble/curves` | secp256k1 签名 |
| `@noble/hashes` | sha256, keccak256, ripemd160 |
| `@scure/bip32` | HD 密钥派生 |
| `@scure/bip39` | 助记词处理 |
| `@scure/base` | bech32, base58 编码 |
| `viem` | EVM 工具（可选，用于进一步简化）|

## 测试

```bash
# 运行适配器测试
pnpm test -- --testPathPattern="chain-adapter"
```

## 相关文档

- [链配置管理](../07-链配置管理/index.md)
- [测试网络](../../08-测试篇/06-测试网络/index.md)
- [ITransactionService](../ITransactionService.md)
