# 钱包数据存储服务

> 定义钱包敏感数据的安全存储规范

---

## 概述

钱包数据存储服务负责安全地存储和管理钱包相关的敏感数据，包括：
- 加密的助记词/私钥
- 钱包元数据
- 链地址信息
- 资产数据

---

## 架构设计

### 存储层次

```
┌─────────────────────────────────────────────────┐
│                  WalletStorageService            │
├─────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────┐  │
│  │  SecureStorage  │  │     IndexedDB       │  │
│  │  (加密敏感数据)   │  │   (非敏感大数据)      │  │
│  └─────────────────┘  └─────────────────────┘  │
│         ▼                      ▼               │
│  ┌─────────────────────────────────────────┐   │
│  │         localStorage / IDB              │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### 数据分类

| 类别 | 存储位置 | 加密 | 示例 |
|-----|---------|------|------|
| 敏感数据 | SecureStorage | AES-GCM | 助记词、私钥 |
| 钱包元数据 | IndexedDB | 否 | 钱包名称、地址、创建时间 |
| 资产数据 | IndexedDB | 否 | 余额、代币列表 |
| 偏好设置 | localStorage | 否 | 当前钱包ID、选中的链 |

---

## 数据结构

### 钱包用户信息 (WalleterInfo)

```typescript
interface WalleterInfo {
  /** 钱包使用者名称 */
  name: string
  /** 图案哈希（用于验证） */
  patternHash: string
  /** 图案提示 */
  patternTips?: string
  /** 当前激活的钱包ID */
  activeWalletId: string
  /** 是否启用生物识别 */
  biometricEnabled: boolean
  /** 是否启用钱包锁 */
  walletLockEnabled: boolean
  /** 用户协议已阅读 */
  agreementAccepted: boolean
  /** 创建时间 */
  createdAt: number
}
```

### 钱包信息 (WalletInfo)

```typescript
interface WalletInfo {
  /** 钱包唯一ID */
  id: string
  /** 钱包名称 */
  name: string
  /** 密钥类型 */
  keyType: 'mnemonic' | 'arbitrary' | 'privateKey'
  /** 主链 */
  primaryChain: string
  /** 主地址 */
  primaryAddress: string
  /** 是否已备份 */
  isBackedUp: boolean
  /** 创建时间 */
  createdAt: number
  /** 更新时间 */
  updatedAt: number
}
```

### 链地址信息 (ChainAddressInfo)

```typescript
interface ChainAddressInfo {
  /** 地址Key (walletId:chain) */
  addressKey: string
  /** 钱包ID */
  walletId: string
  /** 链标识 */
  chain: string
  /** 地址 */
  address: string
  /** 公钥（可选） */
  publicKey?: string
  /** 派生路径（BIP44） */
  derivationPath?: string
  /** 资产列表 */
  assets: AssetInfo[]
  /** 是否自定义过资产 */
  isCustomAssets: boolean
  /** 是否冻结 */
  isFrozen: boolean
}
```

### 资产信息 (AssetInfo)

```typescript
interface AssetInfo {
  /** 资产类型标识 */
  assetType: string
  /** 资产符号 */
  symbol: string
  /** 精度 */
  decimals: number
  /** 余额 */
  balance: string
  /** 合约地址（代币） */
  contractAddress?: string
  /** Logo URL */
  logoUrl?: string
}
```

---

## 存储键规范

### SecureStorage 键

| 键模式 | 说明 | 示例 |
|--------|------|------|
| `mnemonic:{walletId}` | 加密的助记词 | `mnemonic:uuid-1234` |
| `privateKey:{addressKey}` | 加密的私钥 | `privateKey:uuid:ethereum` |

### IndexedDB 存储

| Store名称 | 键 | 值类型 |
|-----------|-----|--------|
| walleter | `main` | WalleterInfo |
| wallets | walletId | WalletInfo |
| chainAddresses | addressKey | ChainAddressInfo |
| addressBook | bookId | AddressBookEntry |

---

## 接口定义

```typescript
interface IWalletStorageService {
  // ==================== 初始化 ====================
  
  /** 初始化存储服务 */
  initialize(): Promise<void>
  
  /** 检查是否已初始化 */
  isInitialized(): boolean
  
  // ==================== 钱包用户 ====================
  
  /** 保存钱包用户信息 */
  saveWalleterInfo(info: WalleterInfo): Promise<void>
  
  /** 获取钱包用户信息 */
  getWalleterInfo(): Promise<WalleterInfo | null>
  
  // ==================== 钱包管理 ====================
  
  /** 创建钱包（同时存储加密助记词） */
  createWallet(
    wallet: WalletInfo,
    mnemonic: string,
    patternKey: string  // 钱包锁图案密钥
  ): Promise<void>
  
  /** 获取钱包信息 */
  getWallet(walletId: string): Promise<WalletInfo | null>
  
  /** 获取所有钱包 */
  getAllWallets(): Promise<WalletInfo[]>
  
  /** 更新钱包信息 */
  updateWallet(walletId: string, updates: Partial<WalletInfo>): Promise<void>
  
  /** 删除钱包 */
  deleteWallet(walletId: string): Promise<void>
  
  // ==================== 助记词/私钥 ====================
  
  /** 获取解密的助记词 */
  getMnemonic(walletId: string, patternKey: string): Promise<string>
  
  /** 更新助记词加密（钱包锁变更时） */
  updateMnemonicEncryption(
    walletId: string,
    oldPatternKey: string,
    newPatternKey: string
  ): Promise<void>
  
  /** 存储私钥 */
  savePrivateKey(
    addressKey: string,
    privateKey: string,
    patternKey: string  // 钱包锁图案密钥
  ): Promise<void>
  
  /** 获取解密的私钥 */
  getPrivateKey(addressKey: string, patternKey: string): Promise<string>
  
  // ==================== 链地址 ====================
  
  /** 保存链地址信息 */
  saveChainAddress(info: ChainAddressInfo): Promise<void>
  
  /** 获取链地址信息 */
  getChainAddress(addressKey: string): Promise<ChainAddressInfo | null>
  
  /** 获取钱包的所有链地址 */
  getWalletChainAddresses(walletId: string): Promise<ChainAddressInfo[]>
  
  /** 更新资产信息 */
  updateAssets(addressKey: string, assets: AssetInfo[]): Promise<void>
  
  // ==================== 数据管理 ====================
  
  /** 清除所有数据 */
  clearAll(): Promise<void>
  
  /** 导出钱包数据（不含敏感信息） */
  exportWalletData(): Promise<ExportedData>
}
```

---

## 安全要求

### 加密规范

1. **助记词加密**
   - 使用 AES-256-GCM
   - 密钥由用户图案通过 PBKDF2 派生
   - 每次加密使用随机 IV

2. **图案验证**
   - 存储图案哈希而非明文
   - 使用 PBKDF2 + 随机盐

3. **内存安全**
   - 解密后的敏感数据使用后立即清零
   - 避免在日志中输出敏感信息

### DWEB 环境增强

在 DWEB 环境中：
- 优先使用生物识别保护
- 使用系统 Keychain/Keystore
- 支持生物识别解锁

---

## 数据迁移

### 版本管理

```typescript
const STORAGE_VERSION = 1

interface StorageMetadata {
  version: number
  createdAt: number
  lastMigratedAt?: number
}
```

### 迁移策略

1. 启动时检查版本号
2. 如果版本低于当前版本，执行迁移
3. 迁移完成后更新版本号
4. 迁移失败时保留原数据，记录错误

### 从 localStorage 迁移

```typescript
async function migrateFromLocalStorage(): Promise<void> {
  const oldData = localStorage.getItem('bfm_wallets')
  if (!oldData) return
  
  // 解析旧数据
  const { wallets, currentWalletId } = JSON.parse(oldData)
  
  // 迁移到新存储
  for (const wallet of wallets) {
    await walletStorageService.saveWallet(wallet)
  }
  
  // 更新偏好设置
  await walletStorageService.setActiveWalletId(currentWalletId)
  
  // 清理旧数据
  localStorage.removeItem('bfm_wallets')
}
```

---

## 错误处理

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| STORAGE_NOT_INITIALIZED | 存储未初始化 | 调用 initialize() |
| WALLET_NOT_FOUND | 钱包不存在 | 检查钱包ID |
| DECRYPTION_FAILED | 解密失败 | 图案错误或数据损坏 |
| STORAGE_FULL | 存储空间满 | 清理缓存数据 |
| MIGRATION_FAILED | 迁移失败 | 保留原数据，记录错误 |

---

## 测试要点

1. **加密正确性**：加密后能正确解密
2. **图案验证**：错误图案应抛出异常
3. **数据持久化**：重启后数据保持
4. **迁移测试**：旧数据能正确迁移
5. **并发安全**：多个操作不冲突

---

## 下一步

- [IStorageService](../03-平台服务/IStorageService.md) - 底层存储抽象
- [安全篇](../../06-安全篇/) - 安全规范
