# WalletStorageService

> Source: [src/services/wallet-storage/](https://github.com/BioforestChain/KeyApp/tree/main/src/services/wallet-storage)

## 概览

`WalletStorageService` 是钱包数据的加密持久化层，使用 IndexedDB 存储，AES-GCM 加密敏感数据。

---

## 文件结构

```
wallet-storage/
├── types.ts      # 类型定义 + 错误类
├── schema.ts     # Zod Schema 验证
├── service.ts    # 核心服务实现 (712 行)
├── index.ts      # 导出
└── __tests__/    # 单元测试
```

---

## 数据库 Schema

```typescript
interface WalletDBSchema extends DBSchema {
  metadata: {
    key: string;
    value: StorageMetadata;
  };
  walleter: {
    key: string;
    value: WalleterInfo;      // 主钱包信息 (加密的助记词)
  };
  wallets: {
    key: string;
    value: WalletInfo;        // 子钱包列表
    indexes: { 'by-chain': string };
  };
  chainAddresses: {
    key: string;
    value: ChainAddressInfo;  // 链地址 (加密的私钥)
    indexes: { 'by-wallet': string; 'by-chain': string };
  };
  addressBook: {
    key: string;
    value: AddressBookEntry;  // 地址簿
    indexes: { 'by-chain': string };
  };
}
```

---

## 核心类型

### WalleterInfo (主钱包)

```typescript
interface WalleterInfo {
  id: string;                    // 唯一标识
  name: string;                  // 显示名称
  encryptedMnemonic: string;     // AES-GCM 加密的助记词
  createdAt: number;
  updatedAt: number;
}
```

### WalletInfo (子钱包)

```typescript
interface WalletInfo {
  id: string;
  walleterId: string;            // 所属主钱包
  name: string;
  primaryChain: string;          // 主链 ID
  derivationPath?: string;       // HD 派生路径
  isBackedUp: boolean;           // 是否已备份
  createdAt: number;
}
```

### ChainAddressInfo (链地址)

```typescript
interface ChainAddressInfo {
  addressKey: string;            // walletId:chainId
  walletId: string;
  chain: string;
  address: string;
  encryptedPrivateKey: string;   // AES-GCM 加密的私钥
  derivationIndex: number;
  createdAt: number;
}
```

---

## 加密方案

### 密钥派生

```typescript
// 从助记词派生加密密钥
async function deriveEncryptionKeyFromMnemonic(mnemonic: string): Promise<CryptoKey>

// 从用户密码派生加密密钥
async function deriveEncryptionKeyFromSecret(secret: string, salt: Uint8Array): Promise<CryptoKey>
```

### 加密/解密

```typescript
// 使用密码加密
async function encrypt(plaintext: string, secret: string): Promise<string>
async function decrypt(ciphertext: string, secret: string): Promise<string>

// 使用原始密钥加密
async function encryptWithRawKey(plaintext: string, key: CryptoKey): Promise<string>
async function decryptWithRawKey(ciphertext: string, key: CryptoKey): Promise<string>
```

---

## 服务 API

### 初始化

```typescript
class WalletStorageService {
  async initialize(): Promise<void>
  isInitialized(): boolean
}
```

### 元数据

```typescript
async getMetadata(): Promise<StorageMetadata | null>
```

### Walleter (主钱包) 操作

```typescript
// 创建主钱包
async createWalleter(
  name: string,
  mnemonic: string,
  secret: string
): Promise<WalleterInfo>

// 获取主钱包
async getWalleter(): Promise<WalleterInfo | null>

// 解密助记词
async decryptMnemonic(
  walleter: WalleterInfo,
  secret: string
): Promise<string>

// 验证密码
async verifySecret(secret: string): Promise<boolean>
```

### Wallet (子钱包) 操作

```typescript
// 创建子钱包
async createWallet(wallet: Omit<WalletInfo, 'createdAt'>): Promise<WalletInfo>

// 获取所有子钱包
async getWallets(): Promise<WalletInfo[]>

// 获取单个子钱包
async getWallet(walletId: string): Promise<WalletInfo | null>

// 更新子钱包
async updateWallet(walletId: string, updates: Partial<WalletInfo>): Promise<void>

// 删除子钱包
async deleteWallet(walletId: string): Promise<void>
```

### ChainAddress (链地址) 操作

```typescript
// 添加链地址
async addChainAddress(
  walletId: string,
  chain: string,
  address: string,
  privateKey: Uint8Array,
  encryptionKey: CryptoKey,
  derivationIndex: number
): Promise<ChainAddressInfo>

// 获取钱包的所有链地址
async getChainAddresses(walletId: string): Promise<ChainAddressInfo[]>

// 获取特定链地址
async getChainAddress(walletId: string, chain: string): Promise<ChainAddressInfo | null>

// 解密私钥
async decryptPrivateKey(
  chainAddress: ChainAddressInfo,
  encryptionKey: CryptoKey
): Promise<Uint8Array>
```

### AddressBook (地址簿) 操作

```typescript
async addAddressBookEntry(entry: Omit<AddressBookEntry, 'id' | 'createdAt'>): Promise<AddressBookEntry>
async getAddressBook(): Promise<AddressBookEntry[]>
async getAddressBookByChain(chain: string): Promise<AddressBookEntry[]>
async updateAddressBookEntry(id: string, updates: Partial<AddressBookEntry>): Promise<void>
async deleteAddressBookEntry(id: string): Promise<void>
```

### 数据管理

```typescript
// 清除所有数据
async clearAll(): Promise<void>

// 导出数据 (加密)
async exportData(secret: string): Promise<string>

// 导入数据 (加密)
async importData(encryptedData: string, secret: string): Promise<void>
```

---

## 错误处理

```typescript
enum WalletStorageErrorCode {
  NOT_INITIALIZED = 'NOT_INITIALIZED',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  NOT_FOUND = 'NOT_FOUND',
  INVALID_SECRET = 'INVALID_SECRET',
  ENCRYPTION_FAILED = 'ENCRYPTION_FAILED',
  DECRYPTION_FAILED = 'DECRYPTION_FAILED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  MIGRATION_REQUIRED = 'MIGRATION_REQUIRED',
}

class WalletStorageError extends Error {
  code: WalletStorageErrorCode
}

class WalletStorageMigrationError extends WalletStorageError {
  fromVersion: number
  toVersion: number
}
```

---

## 使用示例

```typescript
import { walletStorageService } from '@/services/wallet-storage';

// 初始化
await walletStorageService.initialize();

// 创建主钱包
const walleter = await walletStorageService.createWalleter(
  'My Wallet',
  'abandon abandon abandon ... about',
  'user-password-123'
);

// 创建子钱包
const wallet = await walletStorageService.createWallet({
  id: crypto.randomUUID(),
  walleterId: walleter.id,
  name: 'ETH Wallet',
  primaryChain: 'ethereum',
  isBackedUp: false,
});

// 添加链地址
const encryptionKey = await deriveEncryptionKeyFromMnemonic(mnemonic);
await walletStorageService.addChainAddress(
  wallet.id,
  'ethereum',
  '0x1234...',
  privateKeyBytes,
  encryptionKey,
  0
);

// 获取并解密私钥
const chainAddress = await walletStorageService.getChainAddress(wallet.id, 'ethereum');
const privateKey = await walletStorageService.decryptPrivateKey(chainAddress, encryptionKey);
```

---

## 安全注意事项

1. **密钥管理**: 加密密钥仅在内存中短暂存在，操作完成后立即清除
2. **密码验证**: 使用 PBKDF2 派生密钥，防止暴力破解
3. **数据隔离**: 每个钱包的私钥独立加密存储
4. **版本迁移**: 支持数据格式版本检测和迁移

---

## 相关文档

- [Key Derivation](../../10-Wallet-Guide/01-Account-System/01-Key-Derivation.md)
- [Wallet Store](../../05-State-Ref/02-Stores/01-Wallet-Store.md)
- [Kernel Overview](../../01-Kernel-Ref/00-Overview.md)
