# Security Password Query

> 源码: [`src/queries/use-security-password-query.ts`](https://github.com/BioforestChain/KeyApp/blob/main/src/queries/use-security-password-query.ts)

## 概述

查询 BioForest 链地址的安全密码公钥 (secondPublicKey)，用于判断交易是否需要安全密码签名。

## 接口定义

```typescript
interface SecurityPasswordQueryResult {
  address: string
  secondPublicKey: string | null
}

// Query Keys
const securityPasswordQueryKeys = {
  all: ['securityPassword'] as const,
  address: (chain: ChainType, address: string) => 
    ['securityPassword', chain, address] as const,
}
```

## Hooks

### useSecurityPasswordQuery

查询安全密码公钥。

```typescript
function useSecurityPasswordQuery(
  chain: ChainType | undefined,
  address: string | undefined
): UseQueryResult<SecurityPasswordQueryResult>
```

### useSecurityPublicKey

直接获取公钥值。

```typescript
function useSecurityPublicKey(
  chain: ChainType | undefined,
  address: string | undefined
): string | null | undefined
```

### useHasSecurityPassword

判断是否设置了安全密码。

```typescript
function useHasSecurityPassword(
  chain: ChainType | undefined,
  address: string | undefined
): boolean
```

### useRefreshSecurityPassword

手动刷新缓存。

```typescript
function useRefreshSecurityPassword(): {
  refresh: (chain: ChainType, address: string) => Promise<void>
  refreshAll: () => Promise<void>
}
```

## 使用示例

### 判断是否需要安全密码

```typescript
import { useHasSecurityPassword } from '@/queries/use-security-password-query'

function TransferConfirm({ chain, address }) {
  const hasSecurityPassword = useHasSecurityPassword(chain, address)
  
  const handleConfirm = async () => {
    if (hasSecurityPassword) {
      // 弹出安全密码输入框
      const payPassword = await promptPayPassword()
      await submitWithTwoStepSecret(password, payPassword)
    } else {
      // 直接签名
      await submit(password)
    }
  }
}
```

### 设置安全密码后刷新

```typescript
import { useRefreshSecurityPassword } from '@/queries/use-security-password-query'

function SetSecurityPasswordSheet({ chain, address }) {
  const { refresh } = useRefreshSecurityPassword()
  
  const handleSet = async (newPayPassword: string) => {
    await setTwoStepSecret({ chain, address, newPayPassword })
    // 刷新缓存
    await refresh(chain, address)
  }
}
```

## 缓存策略

| 配置 | 值 | 说明 |
|------|-----|------|
| `staleTime` | 5 min | 安全密码不常变化 |
| `gcTime` | 30 min | 长期缓存 |
| `refetchOnWindowFocus` | false | 不需要频繁刷新 |

## 数据流

```
useSecurityPasswordQuery(chain, address)
    │
    ├── 获取链配置 chainConfigStore
    │   └── 找到 biowallet-v1 API 端点
    │
    ├── getAddressInfo(apiUrl, apiPath, address)
    │   └── BioForest Wallet API
    │
    └── 返回 { address, secondPublicKey }
```

## 与 Store 的关系

Query 和 Store 都可以管理安全密码状态：

| 方式 | 用途 | 持久化 |
|------|------|--------|
| `useSecurityPasswordQuery` | TanStack Query 缓存 | 内存 |
| `securityPasswordStore` | 手动状态管理 | 无 |

**推荐**: 使用 Query 方式，自动处理缓存和刷新。
