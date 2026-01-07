# Secure Storage Service

> 源码: [`src/services/storage/`](https://github.com/BioforestChain/KeyApp/blob/main/src/services/storage/)

## 概述

Secure Storage Service 提供加密的键值对存储，用于保存敏感数据（如加密后的私钥、用户凭证等）。

## 服务元信息

```typescript
// types.ts
import { z } from 'zod'
import { defineServiceMeta } from '@/lib/service-meta'

export const secureStorageServiceMeta = defineServiceMeta('secureStorage', (s) =>
  s
    .description('安全存储服务 - 加密存储键值对')
    .api('set', {
      description: '存储数据',
      input: z.object({ key: z.string(), value: z.string() }),
      output: z.void(),
    })
    .api('get', {
      description: '获取数据',
      input: z.object({ key: z.string() }),
      output: z.string().nullable(),
    })
    .api('remove', {
      description: '删除数据',
      input: z.object({ key: z.string() }),
      output: z.void(),
    })
    .api('has', {
      description: '检查是否存在',
      input: z.object({ key: z.string() }),
      output: z.boolean(),
    })
    .api('clear', {
      description: '清空存储',
      input: z.void(),
      output: z.void(),
    })
)
```

## API

### set({ key, value })

存储加密数据：

```typescript
import { secureStorageService } from '@/services/storage'

await secureStorageService.set({
  key: 'wallet_credential',
  value: JSON.stringify({ encryptedKey: '...' }),
})
```

### get({ key })

获取数据：

```typescript
const value = await secureStorageService.get({ key: 'wallet_credential' })
if (value) {
  const credential = JSON.parse(value)
}
```

### remove({ key })

删除数据：

```typescript
await secureStorageService.remove({ key: 'wallet_credential' })
```

### has({ key })

检查是否存在：

```typescript
const exists = await secureStorageService.has({ key: 'wallet_credential' })
```

### clear()

清空所有数据：

```typescript
await secureStorageService.clear()
```

## 平台实现

### Web (web.ts)

使用 localStorage + 应用级加密：

```typescript
export const secureStorageService = secureStorageServiceMeta.impl({
  async set({ key, value }) {
    const prefixedKey = `secure_${key}`
    localStorage.setItem(prefixedKey, value)
  },

  async get({ key }) {
    const prefixedKey = `secure_${key}`
    return localStorage.getItem(prefixedKey)
  },

  async remove({ key }) {
    const prefixedKey = `secure_${key}`
    localStorage.removeItem(prefixedKey)
  },

  async has({ key }) {
    const prefixedKey = `secure_${key}`
    return localStorage.getItem(prefixedKey) !== null
  },

  async clear() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('secure_'))
    keys.forEach(k => localStorage.removeItem(k))
  },
})
```

### DWeb (dweb.ts)

使用原生安全存储（Keychain/Keystore）：

```typescript
export const secureStorageService = secureStorageServiceMeta.impl({
  async set({ key, value }) {
    await dwebSecureStorage.set(key, value)
  },

  async get({ key }) {
    return dwebSecureStorage.get(key)
  },
  // ...
})
```

### Mock (mock.ts)

测试环境内存实现：

```typescript
const mockStorage = new Map<string, string>()

export const secureStorageService = secureStorageServiceMeta.impl({
  async set({ key, value }) {
    mockStorage.set(key, value)
  },
  async get({ key }) {
    return mockStorage.get(key) ?? null
  },
  // ...
})
```

## 使用场景

### 钱包凭证存储

```typescript
// 保存钱包加密数据
async function saveWalletCredential(walletId: string, encrypted: string) {
  await secureStorageService.set({
    key: `wallet:${walletId}`,
    value: encrypted,
  })
}

// 读取钱包加密数据
async function loadWalletCredential(walletId: string): Promise<string | null> {
  return secureStorageService.get({ key: `wallet:${walletId}` })
}
```

### 生物识别凭证

```typescript
// 保存生物识别解锁凭证
async function saveBiometricCredential(credential: string) {
  await secureStorageService.set({
    key: 'biometric_credential',
    value: credential,
  })
}
```

## 安全说明

| 平台 | 存储位置 | 安全级别 |
|------|---------|---------|
| Web | localStorage | 应用级加密 |
| DWeb iOS | Keychain | 硬件加密 |
| DWeb Android | Keystore | 硬件加密 |

**Web 平台注意**：
- 数据存储在 localStorage，需应用层加密
- 建议配合 `walletStorageService` 使用 AES-256-GCM 加密
- 不要存储明文敏感数据

## 与 Wallet Storage 的关系

```
secureStorageService (底层)
    │
    └── 提供通用键值存储
    
walletStorageService (上层)
    │
    ├── 使用 IndexedDB 存储结构化数据
    ├── 使用 AES-256-GCM 加密敏感字段
    └── 调用 secureStorageService 存储加密密钥
```
