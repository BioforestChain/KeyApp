# Mpay Migration Service

> 源码: [`src/services/migration/`](https://github.com/BioforestChain/KeyApp/blob/main/src/services/migration/)

## 概述

Migration Service 实现从旧版 mpay 钱包到 KeyApp 的数据迁移，包括钱包、地址、资产、联系人的完整迁移流程。

## 迁移流程

```
检测 mpay 数据
    │
    ├── IndexedDB: walletv2-idb
    │   ├── mainWallet store
    │   └── chainAddress store
    │
    └── localStorage: 👨‍👩‍👧‍👦walletAppSetting
    
验证密码
    │
    └── 尝试解密第一个钱包的 importPhrase
    
读取数据
    │
    ├── readMpayWallets()
    ├── readMpayAddresses()
    └── readMpayAddressBook()
    
转换数据
    │
    └── transformMpayData() → TransformResult
    
导入数据
    │
    ├── walletStorageService.saveWallet()
    ├── walletStorageService.saveChainAddress()
    └── addressBookActions.importContacts()
```

## 接口定义

```typescript
interface IMigrationService {
  /** 检测 mpay 数据 */
  detect(): Promise<MpayDetectionResult>
  /** 验证密码 */
  verifyPassword(password: string): Promise<boolean>
  /** 执行迁移 */
  migrate(password: string, onProgress?: (progress: MigrationProgress) => void): Promise<void>
  /** 跳过迁移 */
  skip(): Promise<void>
  /** 获取迁移状态 */
  getStatus(): MigrationStatus
}
```

## 迁移状态

```typescript
type MigrationStatus =
  | 'idle'        // 未检测
  | 'detected'    // 检测到 mpay 数据
  | 'in_progress' // 迁移中
  | 'completed'   // 迁移完成
  | 'skipped'     // 用户跳过
  | 'error'       // 迁移失败
```

## 检测结果

```typescript
interface MpayDetectionResult {
  hasData: boolean        // 是否检测到数据
  walletCount: number     // 钱包数量
  addressCount: number    // 地址数量
  hasSettings: boolean    // 是否有设置数据
  addressBookCount: number // 联系人数量
}
```

## 进度回调

```typescript
interface MigrationProgress {
  step: 'detecting' | 'verifying' | 'reading' | 'transforming' | 'importing' | 'importing_contacts' | 'complete'
  percent: number           // 0-100
  currentWallet?: string    // 当前处理的钱包名称
  totalWallets?: number
  processedWallets?: number
}
```

## 使用示例

```typescript
import { migrationService } from '@/services/migration'

// 1. 检测 mpay 数据
const detection = await migrationService.detect()
if (!detection.hasData) {
  console.log('No mpay data found')
  return
}

console.log(`Found ${detection.walletCount} wallets, ${detection.addressCount} addresses`)

// 2. 验证密码
const isValid = await migrationService.verifyPassword(password)
if (!isValid) {
  console.error('Invalid password')
  return
}

// 3. 执行迁移
await migrationService.migrate(password, (progress) => {
  console.log(`${progress.step}: ${progress.percent}%`)
  if (progress.currentWallet) {
    console.log(`Processing: ${progress.currentWallet}`)
  }
})

console.log('Migration completed!')
```

## mpay 数据结构

### 身份钱包 (mainWallet)

```typescript
interface MpayMainWallet {
  mainWalletId: string
  name: string
  importPhrase: string       // 加密的助记词/私钥
  importType: 'mnemonic' | 'privateKey'
  addressKeyList: MpayMainWalletAddressInfo[]
  headSculpture: string      // 头像
  createTimestamp: number
  skipBackup?: boolean
}
```

### 链地址 (chainAddress)

```typescript
interface MpayChainAddressInfo {
  addressKey: string
  mainWalletId: string
  address: string
  chain: string
  symbol: string
  privateKey: string         // 加密的私钥
  publicKey?: string
  assets: MpayAddressAsset[]
  name: string
}
```

### 应用设置 (localStorage)

```typescript
interface MpayWalletAppSettings {
  password: string           // 加密后的密码
  passwordTips?: string
  lastWalletActivate?: MpayChainAddressInfo
  walletLock?: boolean
  fingerprintLock?: boolean
  fingerprintPay?: boolean
}
```

## 数据转换

### 链名映射

```typescript
function mapChainName(mpayChain: string): ChainType {
  const mapping: Record<string, ChainType> = {
    'eth': 'evm',
    'bnb': 'evm',
    'polygon': 'evm',
    'btc': 'bitcoin',
    'trx': 'tron',
    'bfm': 'bioforest',
    'bfchain': 'bioforest',
    // ...
  }
  return mapping[mpayChain.toLowerCase()] ?? 'evm'
}
```

### 地址簿转换

```typescript
function transformAddressBookEntry(entry: MpayAddressBookEntry): Contact {
  return {
    id: crypto.randomUUID(),
    name: entry.name,
    avatar: entry.iconName,
    addresses: [{
      id: crypto.randomUUID(),
      address: entry.address,
      label: entry.symbol,
    }],
    memo: entry.remarks,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}
```

## 加密解密

### 密码验证

```typescript
async function verifyMpayPassword(
  password: string,
  encryptedPhrase: string
): Promise<boolean> {
  try {
    await decryptMpayData(encryptedPhrase, password)
    return true
  } catch {
    return false
  }
}
```

### 数据解密

```typescript
async function decryptMpayData(
  encrypted: string,
  password: string
): Promise<string> {
  // mpay 使用 AES-CBC 加密
  // 密钥派生: SHA-256(password)
  // IV: 从加密数据前 16 字节提取
}
```

## 错误处理

| 错误 | 原因 | 处理 |
|------|------|------|
| `No mpay data found` | IndexedDB 为空 | 跳过迁移 |
| `Password verification failed` | 密码错误 | 允许重试 3 次 |
| `Decryption failed` | 数据损坏 | 标记为 error |

## 存储位置

| 数据 | mpay 位置 | KeyApp 位置 |
|------|-----------|-------------|
| 钱包 | IndexedDB `walletv2-idb` | IndexedDB `keyapp-wallet-db` |
| 设置 | localStorage `👨‍👩‍👧‍👦walletAppSetting` | localStorage `bfmpay_preferences` |
| 联系人 | IndexedDB `chainAddressBook-idb` | localStorage `bfm_address_book` |
| 迁移状态 | - | localStorage `keyapp_migration_status` |
