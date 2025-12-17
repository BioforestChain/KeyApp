# 第十八章：密钥管理

> 定义助记词、私钥的生成和存储方案

---

## 18.1 助记词生成

### BIP39 标准

```typescript
// src/lib/crypto/mnemonic.ts
import { generateMnemonic, mnemonicToSeed, validateMnemonic } from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english'

// 生成 12 词助记词
export function generateMnemonic12(): string {
  return generateMnemonic(wordlist, 128)  // 128 bits = 12 words
}

// 生成 24 词助记词
export function generateMnemonic24(): string {
  return generateMnemonic(wordlist, 256)  // 256 bits = 24 words
}

// 验证助记词
export function isValidMnemonic(mnemonic: string): boolean {
  return validateMnemonic(mnemonic, wordlist)
}

// 助记词转种子
export async function mnemonicToSeedBytes(mnemonic: string, passphrase = ''): Promise<Uint8Array> {
  return mnemonicToSeed(mnemonic, passphrase)
}
```

### 安全注意事项

- ⚠️ 助记词只能在创建时显示一次
- ⚠️ 不能存储明文助记词
- ⚠️ 生成时确保足够的熵源

---

## 18.2 多链地址派生

### 派生架构

```
助记词
   │
   ▼
种子 (Seed)
   │
   ├──────────────────────────────────────┐
   │                                      │
   ▼                                      ▼
BIP32/BIP44                          Ed25519
(外部链)                             (BioForest 链)
   │                                      │
   ├── Ethereum (m/44'/60'/0'/0/x)       ├── BFMeta
   ├── Bitcoin (m/44'/0'/0'/0/x)         ├── PMChain
   ├── Tron (m/44'/195'/0'/0/x)          └── CCChain
   └── BSC (m/44'/60'/0'/0/x)
```

### BIP44 派生 (EVM/BTC/TRX)

```typescript
// src/lib/crypto/derive-bip44.ts
import { HDKey } from '@scure/bip32'

const COIN_TYPES = {
  ethereum: 60,
  bitcoin: 0,
  tron: 195,
  bsc: 60,  // 使用与 ETH 相同的路径
}

export function deriveBIP44Address(
  seed: Uint8Array,
  chain: keyof typeof COIN_TYPES,
  index = 0
): { privateKey: Uint8Array; publicKey: Uint8Array } {
  const coinType = COIN_TYPES[chain]
  const path = `m/44'/${coinType}'/0'/0/${index}`
  
  const hdKey = HDKey.fromMasterSeed(seed)
  const derived = hdKey.derive(path)
  
  return {
    privateKey: derived.privateKey!,
    publicKey: derived.publicKey!,
  }
}
```

### Ed25519 派生 (BioForest)

```typescript
// src/lib/crypto/derive-ed25519.ts
import { ed25519 } from '@noble/curves/ed25519'
import { sha256 } from '@noble/hashes/sha256'

export function deriveEd25519Address(
  seed: Uint8Array,
  chainPrefix: string,
  index = 0
): { privateKey: Uint8Array; publicKey: Uint8Array; address: string } {
  // 使用 SHA256(seed + index) 作为私钥种子
  const indexBytes = new Uint8Array(4)
  new DataView(indexBytes.buffer).setUint32(0, index, true)
  
  const privateKeySeed = sha256(new Uint8Array([...seed, ...indexBytes]))
  const privateKey = privateKeySeed.slice(0, 32)
  const publicKey = ed25519.getPublicKey(privateKey)
  
  // 地址 = 前缀 + Base58(publicKey)
  const address = chainPrefix + base58Encode(publicKey)
  
  return { privateKey, publicKey, address }
}
```

---

## 18.3 加密存储

### 存储结构

```typescript
interface WalletData {
  wallets: EncryptedWallet[]
  currentWalletId: string | null
  selectedChain: ChainId | null
}

interface EncryptedWallet {
  id: string
  name: string
  encryptedMnemonic: EncryptedData
  chainAddresses: ChainAddress[]
  createdAt: number
  isBackedUp: boolean
}

interface EncryptedData {
  ciphertext: string   // Base64 编码的密文
  iv: string           // Base64 编码的初始向量
  salt: string         // Base64 编码的盐
  iterations: number   // PBKDF2 迭代次数
}
```

### AES-GCM 加密

```typescript
// src/lib/crypto/aes.ts

export async function encryptMnemonic(
  mnemonic: string,
  password: string
): Promise<EncryptedData> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  
  // 从密码派生密钥
  const key = await deriveKey(password, salt)
  
  // 加密
  const encoder = new TextEncoder()
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(mnemonic)
  )
  
  return {
    ciphertext: base64Encode(new Uint8Array(ciphertext)),
    iv: base64Encode(iv),
    salt: base64Encode(salt),
    iterations: 100000,
  }
}

export async function decryptMnemonic(
  encrypted: EncryptedData,
  password: string
): Promise<string> {
  const salt = base64Decode(encrypted.salt)
  const iv = base64Decode(encrypted.iv)
  const ciphertext = base64Decode(encrypted.ciphertext)
  
  // 从密码派生密钥
  const key = await deriveKey(password, salt, encrypted.iterations)
  
  // 解密
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  )
  
  return new TextDecoder().decode(plaintext)
}

async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations = 100000
): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}
```

---

## 18.4 密钥使用流程

### 创建钱包

```
用户输入密码
      ↓
生成助记词 (BIP39)
      ↓
显示助记词让用户备份
      ↓
验证用户备份
      ↓
加密助记词 (AES-GCM)
      ↓
从助记词派生各链地址
      ↓
存储加密数据到 localStorage
```

### 签名交易

```
用户确认交易
      ↓
输入密码/指纹验证
      ↓
解密助记词
      ↓
派生对应链的私钥
      ↓
签名交易
      ↓
清除内存中的私钥
      ↓
广播交易
```

---

## 18.5 安全最佳实践

### 内存安全

```typescript
// 使用后清除敏感数据
function clearSensitiveData(data: Uint8Array): void {
  crypto.getRandomValues(data)  // 用随机数覆盖
}

// 使用示例
const privateKey = derivePrivateKey(seed, path)
try {
  const signature = sign(transaction, privateKey)
  return signature
} finally {
  clearSensitiveData(privateKey)
}
```

### 密码强度验证

```typescript
// src/lib/crypto/password.ts

export function validatePasswordStrength(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('密码至少8位')
  }
  if (password.length > 20) {
    errors.push('密码最多20位')
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}
```

### 防暴力破解

```typescript
// 使用高迭代次数的 PBKDF2
const PBKDF2_ITERATIONS = 100000  // 10万次迭代

// 添加延迟防止时序攻击
async function constantTimeCompare(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder()
  const aBytes = encoder.encode(a)
  const bBytes = encoder.encode(b)
  
  if (aBytes.length !== bBytes.length) {
    return false
  }
  
  let result = 0
  for (let i = 0; i < aBytes.length; i++) {
    result |= aBytes[i] ^ bBytes[i]
  }
  
  return result === 0
}
```

---

## 本章小结

- 使用 BIP39 生成助记词
- BIP44 派生外部链地址，Ed25519 派生 BioForest 地址
- AES-GCM 加密存储，PBKDF2 派生密钥
- 使用后及时清除内存中的敏感数据

---

## 下一章

继续阅读 [第十九章：身份认证](../02-身份认证/)，了解用户认证机制。
