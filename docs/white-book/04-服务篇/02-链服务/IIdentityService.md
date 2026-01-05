# IIdentityService 身份服务

> 地址派生和消息签名

---

## 职责

管理用户身份，包括从种子派生地址、签名消息、验证签名。

---

## 接口定义

```
IIdentityService {
  // 从种子派生地址
  deriveAddress(seed: bytes, index?: number): Address
  
  // 批量派生地址
  deriveAddresses(seed: bytes, startIndex: number, count: number): Address[]
  
  // 验证地址格式
  isValidAddress(address: string): boolean
  
  // 规范化地址（如 EVM 的 checksum）
  normalizeAddress(address: string): Address
  
  // 签名消息
  signMessage(message: string | bytes, privateKey: bytes): Signature
  
  // 验证消息签名
  verifyMessage(message: string | bytes, signature: Signature, address: Address): boolean
}
```

---

## 方法详情

### deriveAddress

从助记词种子派生区块链地址。

**参数**：

| 参数 | 类型 | 必需 | 说明 |
|-----|------|-----|------|
| seed | bytes | Y | 助记词种子（64 bytes） |
| index | number | N | 地址索引，默认 0 |

**返回**：`Address` - 派生的区块链地址

**行为规范**：
- **MUST** 使用 BIP44 标准派生路径
- **MUST** 返回规范化格式的地址
- **SHOULD** 缓存派生结果以提高性能

---

### isValidAddress

验证地址格式是否正确。

**参数**：

| 参数 | 类型 | 必需 | 说明 |
|-----|------|-----|------|
| address | string | Y | 待验证的地址 |

**返回**：`boolean` - 是否有效

**验证规则**：

| 链类型 | 规则 |
|-------|------|
| EVM | 0x 开头，40 位十六进制，可选 checksum |
| Bitcoin | 符合 Base58Check 或 Bech32 |
| BFM | 符合 BFM 地址规范 |

---

### signMessage

使用私钥签名消息。

**参数**：

| 参数 | 类型 | 必需 | 说明 |
|-----|------|-----|------|
| message | string \| bytes | Y | 待签名消息 |
| privateKey | bytes | Y | 私钥 |

**返回**：`Signature` - 签名结果

**行为规范**：
- **MUST** 签名后立即清除私钥内存
- **MUST** 使用链对应的签名算法
- **SHOULD** 对消息添加前缀防止跨链重放

---

## 派生路径规范

| 链类型 | 派生路径 | 算法 | 地址格式 |
|-------|---------|------|---------|
| EVM 兼容 | m/44'/60'/0'/0/{index} | secp256k1 | 0x... (checksum) |
| Bitcoin | m/84'/0'/0'/0/{index} | secp256k1 | bc1q... (Native SegWit) |
| Tron | m/44'/195'/0'/0/{index} | secp256k1 | T... (Base58Check) |
| BioForest | m/44'/9999'/0'/0/{index} | Ed25519 | b... (Base58) |

> **注意**: Bitcoin 使用 BIP84 路径（Native SegWit），不再使用 BIP44 Legacy 路径。

### 派生流程

```
助记词
    │
    ▼ BIP39
种子 (64 bytes)
    │
    ▼ BIP32/SLIP-0010
主密钥
    │
    ▼ 派生路径
私钥
    │
    ▼ 椭圆曲线
公钥
    │
    ▼ 哈希 + 编码
地址
```

---

## 错误码

| 错误码 | 说明 | 处理建议 |
|-------|------|---------|
| INVALID_SEED | 种子格式无效 | 检查助记词 |
| INVALID_ADDRESS | 地址格式无效 | 提示用户检查 |
| SIGNATURE_FAILED | 签名失败 | 检查私钥 |
| VERIFICATION_FAILED | 签名验证失败 | 签名可能被篡改 |
| UNSUPPORTED_CHAIN | 不支持的链类型 | 检查链配置 |

---

## 安全要求

| 要求 | 说明 |
|-----|------|
| 私钥不持久化 | 私钥仅在内存中临时存在 |
| 及时清除 | 使用后立即覆写内存 |
| 不记录日志 | 私钥相关数据不写入日志 |
| 隔离环境 | **SHOULD** 在 Web Worker 中执行 |
