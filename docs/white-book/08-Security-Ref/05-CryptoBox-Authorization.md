# Crypto Box 授权系统

> 源码: [`src/services/crypto-box/`](https://github.com/BioforestChain/KeyApp/blob/main/src/services/crypto-box/)

---

## 概述

Crypto Box 是一个"加密黑盒"系统，允许 Miniapp 执行加密操作（非对称加密、签名）而**不暴露私钥**。

```
┌─────────────────┐                    ┌─────────────────┐
│   Miniapp       │  bio_requestToken  │   KeyApp        │
│   (RWA Hub)     │ ◄────────────────► │   (Crypto Box)  │
│                 │  bio_cryptoExecute │                 │
│  无法访问私钥    │                    │  私钥安全存储    │
└─────────────────┘                    └─────────────────┘
```

---

## 安全设计

### Token 授权流程

```
1. Miniapp 请求 Token
       │
       ▼
2. 用户输入手势密码授权
       │
       ▼
3. 派生 sessionSecret = SHA256(walletId + patternKey + miniappId + tokenId)
       │
       ▼
4. 加密 Payload（含 patternKey）存入 IndexedDB
       │
       ▼
5. 返回 tokenId + sessionSecret 给 Miniapp
       │
       ▼
6. Miniapp 使用 tokenId + sessionSecret 执行加密操作
       │
       ▼
7. KeyApp 解密 Payload，获取 patternKey，执行操作
```

### 密钥安全

| 安全约束 | 实现 |
|----------|------|
| **MUST** | patternKey 不在内存中长期保留 |
| **MUST** | patternKey 使用 sessionSecret 加密存储 |
| **MUST** | sessionSecret 派生需要 patternKey 参与 |
| **MUST** | Token 验证从加密 Payload 读取（不信任明文副本）|

### sessionSecret 派生

```typescript
sessionSecret = SHA256(walletId + ":" + patternKey + ":" + miniappId + ":" + tokenId)
```

- 包含 `patternKey`：确保只有授权时的用户才能派生相同的 secret
- 包含 `tokenId`：每个 Token 的 sessionSecret 唯一
- 包含 `miniappId`：防止跨 app 使用

---

## API 参考

### bio_requestCryptoToken

请求加密操作授权，用户需输入手势密码。

**请求参数：**

```typescript
interface RequestCryptoTokenParams {
  actions: ('asymmetricEncrypt' | 'sign')[]
  duration: '5min' | '15min' | '1hour' | '1day'
  address: string
  chainId?: string
}
```

**响应：**

```typescript
interface RequestCryptoTokenResponse {
  tokenId: string
  sessionSecret: string  // 用于后续执行
  expiresAt: number
  grantedActions: CryptoAction[]
}
```

### bio_cryptoExecute

使用 Token 执行加密操作。

**请求参数：**

```typescript
interface CryptoExecuteParams {
  tokenId: string
  sessionSecret: string
  action: 'asymmetricEncrypt' | 'sign'
  params: AsymmetricEncryptParams | SignParams
}
```

**响应：**

```typescript
interface CryptoExecuteResponse {
  result: string    // hex 编码结果
  publicKey: string // hex 编码公钥
}
```

---

## Token 存储

### IndexedDB Schema

```typescript
interface StoredToken {
  tokenId: string
  miniappId: string        // 明文副本（便于查询）
  walletId: string         // 明文副本
  address: string          // 明文副本
  actions: CryptoAction[]  // 明文副本
  expiresAt: number        // 明文副本
  createdAt: number
  encryptedPayload: string // 加密的真实数据
}
```

### 加密 Payload 内容

```typescript
interface TokenPayload {
  patternKey: string       // 手势密码（加密存储）
  miniappId: string
  walletId: string
  address: string
  actions: CryptoAction[]
  expiresAt: number
}
```

验证时**始终从解密的 Payload 读取**，明文副本仅用于查询展示。

---

## 非对称加密实现

### Ed25519 → X25519 转换

BFMetaSignUtil 使用 X25519 ECDH，而 KeyApp 使用 Ed25519 密钥对：

```typescript
import ed2curve from 'ed2curve'

// 转换公钥
const curvePublicKey = ed2curve.convertPublicKey(ed25519PublicKey)

// 转换私钥
const curveSecretKey = ed2curve.convertSecretKey(ed25519SecretKey)

// X25519 box 加密
const encrypted = nacl.box(message, nonce, curveRecipientPK, curveSecretKey)
```

### 固定 Nonce

与 BFMetaSignUtil 兼容，使用全零 nonce：

```typescript
const nonce = new Uint8Array(24)  // 24 字节全零
```

> ⚠️ 固定 nonce 在密码学上不推荐，但为兼容现有系统必须使用。

---

## 错误代码

| 代码 | 含义 |
|------|------|
| 4100 | Token 未找到 |
| 4101 | Miniapp ID 不匹配 |
| 4102 | Token 已过期 |
| 4103 | 操作未授权 |
| 4104 | Session Secret 无效 |
| 4001 | 用户拒绝授权 |

---

## 使用示例

### RWA Hub 登录

```typescript
import { rwaLogin } from '@biochain/dweb-compat'

// 一键登录（封装了完整流程）
const { address, publicKey, signcode } = await rwaLogin(systemPublicKey)

// 发送到 RWA 后端验证
await rwaBackend.login({ address, publicKey, signcode })
```

### 手动流程

```typescript
import { requestCryptoToken, asymmetricEncrypt } from '@biochain/dweb-compat'

// 1. 请求授权
const { tokenId, sessionSecret } = await requestCryptoToken(
  ['asymmetricEncrypt'],
  '5min',
  address
)

// 2. 执行加密
const { result, publicKey } = await asymmetricEncrypt(
  tokenId,
  sessionSecret,
  'data to encrypt',
  recipientPublicKey
)
```

---

## 相关文档

- [密钥管理](./01-Key-Management.md)
- [身份认证](./02-Authentication.md)
- [DWEB 授权](./03-DWEB-Authorization.md)
