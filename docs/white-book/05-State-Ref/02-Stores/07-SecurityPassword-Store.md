# Security Password Store

> 源码: [`src/stores/security-password.ts`](https://github.com/AInewsAPP/KeyApp/blob/main/src/stores/security-password.ts)

## 概述

Security Password Store 管理 BioForest 链的安全密码（secondPublicKey）状态。用于判断交易签名是否需要安全密码。

## 背景

BioForest 链支持"安全密码"机制：
- 用户可为地址设置 secondPublicKey
- 设置后，所有交易需要额外的安全密码签名
- 提供双重保护，防止私钥泄露导致资产损失

## 数据结构

```typescript
interface SecurityPasswordState {
  /** 地址 -> secondPublicKey 映射 */
  publicKeys: Record<string, string | null>
  /** 地址 -> 是否正在加载 */
  loading: Record<string, boolean>
  /** 地址 -> 错误信息 */
  errors: Record<string, string | null>
}
```

## Actions

```typescript
import { securityPasswordActions } from '@/stores/security-password'

// 设置地址的安全密码公钥
securityPasswordActions.setPublicKey('bfm_address', 'publicKeyHex')

// 设置为 null 表示确认没有安全密码
securityPasswordActions.setPublicKey('bfm_address', null)

// 设置加载状态
securityPasswordActions.setLoading('bfm_address', true)

// 设置错误
securityPasswordActions.setError('bfm_address', 'Network error')

// 清除单个地址缓存
securityPasswordActions.clearAddress('bfm_address')

// 清除所有缓存
securityPasswordActions.clearAll()
```

## Selectors

```typescript
import { securityPasswordSelectors, securityPasswordStore } from '@/stores/security-password'
import { useStore } from '@tanstack/react-store'

function useSecurityPassword(address: string) {
  const state = useStore(securityPasswordStore)
  
  // 获取安全密码公钥
  const publicKey = securityPasswordSelectors.getPublicKey(state, address)
  // string | null | undefined
  // - string: 有安全密码
  // - null: 确认没有安全密码
  // - undefined: 未加载
  
  // 是否设置了安全密码
  const hasPassword = securityPasswordSelectors.hasSecurityPassword(state, address)
  
  // 是否正在加载
  const loading = securityPasswordSelectors.isLoading(state, address)
  
  // 获取错误
  const error = securityPasswordSelectors.getError(state, address)
  
  // 是否已加载（包括确认没有的情况）
  const loaded = securityPasswordSelectors.isLoaded(state, address)
}
```

## 使用场景

### 进入钱包时查询

```typescript
async function onWalletEnter(address: string) {
  securityPasswordActions.setLoading(address, true)
  
  try {
    const account = await bioforestApi.getAccount(address)
    securityPasswordActions.setPublicKey(address, account.secondPublicKey ?? null)
  } catch (error) {
    securityPasswordActions.setError(address, error.message)
  }
}
```

### 交易签名时判断

```typescript
async function signTransaction(address: string, tx: Transaction) {
  const state = securityPasswordStore.state
  const hasSecurityPassword = securityPasswordSelectors.hasSecurityPassword(state, address)
  
  if (hasSecurityPassword) {
    // 需要安全密码
    const password = await promptSecurityPassword()
    return signWithSecurityPassword(tx, password)
  } else {
    // 普通签名
    return sign(tx)
  }
}
```

## 数据流

```
进入钱包 / 切换地址
    │
    ├── setLoading(address, true)
    │
    ├── API 查询 secondPublicKey
    │       │
    │       ├── 成功 → setPublicKey(address, key)
    │       └── 失败 → setError(address, msg)
    │
    └── 后续交易使用缓存判断

交易签名
    │
    ├── hasSecurityPassword(address)?
    │       │
    │       ├── true → 弹出安全密码输入框
    │       └── false → 直接签名
    │
    └── 提交交易
```

## 注意事项

1. **不持久化**: 仅内存缓存，App 重启需重新查询
2. **三态值**: publicKey 可能是 string/null/undefined
3. **加载状态**: 必须等待 isLoaded 为 true 才能判断是否有安全密码
