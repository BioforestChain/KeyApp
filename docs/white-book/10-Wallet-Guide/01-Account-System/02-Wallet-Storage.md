<!--
Type: Guide
Area: Wallet
Code Source: src/services/wallet-storage/types.ts
-->

# 02. 安全存储 (Wallet Storage)

KeyApp 的钱包存储层采用 **IndexedDB** 进行持久化，并结合 **Web Crypto API** 进行敏感数据加密。

## 数据模型

### 1. WalleterInfo (用户全局信息)
存储用户的全局配置和状态。
```typescript
interface WalleterInfo {
  name: string;
  activeWalletId: string | null; // 当前选中的钱包
  biometricEnabled: boolean;     // 是否开启生物识别
  walletLockEnabled: boolean;    // 是否开启钱包锁
  agreementAccepted: boolean;
}
```

### 2. WalletInfo (钱包实体)
仅存储钱包的元数据和**加密后的**敏感信息。
```typescript
interface WalletInfo {
  id: string;
  name: string;
  
  /** 密钥类型: mnemonic (BIP39) | arbitrary (Raw Key) */
  keyType: WalletKeyType;
  
  /** 主链和主地址 */
  primaryChain: string;
  primaryAddress: string;
  
  /** 
   * 加密后的助记词
   * Key: 使用 Wallet Lock (用户密码) 加密的 AES 密钥
   */
  encryptedMnemonic?: EncryptedData;
  
  /** 
   * 加密后的 Wallet Lock
   * Key: 使用助记词派生的密钥
   * 用途: 用于生物识别解锁或验证密码正确性
   */
  encryptedWalletLock?: EncryptedData;
}
```

### 3. ChainAddressInfo (链地址)
存储派生出的多链地址及其资产状态。
```typescript
interface ChainAddressInfo {
  /** 复合主键: `{walletId}:{chainId}` */
  addressKey: string;
  walletId: string;
  chain: string;
  address: string;
  publicKey?: string;
  
  /** 资产列表 (Token List) */
  assets: AssetInfo[];
}
```

## 加密机制

KeyApp 采用了双重加密机制，确保安全性与易用性的平衡。

### 1. 钱包锁 (Wallet Lock)
*   **定义**: 用户设置的支付密码 (6位数字或复杂密码)。
*   **用途**: 加密 `mnemonic`。
*   **存储**: 不直接存储。内存中仅在解锁期间保留。

### 2. 助记词 (Mnemonic)
*   **用途**: 派生私钥，同时也用于加密 `Wallet Lock` (作为验证机制)。

### 3. 互解验证
系统存储了 `Encrypted(Mnemonic, Key=Lock)` 和 `Encrypted(Lock, Key=Mnemonic)`。
*   当用户输入密码时，尝试解密 Mnemonic。如果解密成功且校验和通过，说明密码正确。
*   这种设计允许系统验证密码，而无需明文存储密码。

## 数据库架构 (IndexedDB)

使用 `idb` 库操作 IndexedDB。

*   **Database Name**: `keyapp_wallet_db`
*   **Stores**:
    *   `walleter`: 单例 store，存储 `WalleterInfo`。
    *   `wallets`: 存储 `WalletInfo`，主键 `id`。
    *   `addresses`: 存储 `ChainAddressInfo`，主键 `addressKey`，索引 `walletId`。

这种分离设计使得我们可以快速加载钱包列表 (`wallets`)，而无需加载庞大的资产数据 (`addresses`)。
