import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import {
  encrypt,
  decrypt,
  encryptWithRawKey,
  decryptWithRawKey,
  deriveEncryptionKeyFromMnemonic,
  deriveEncryptionKeyFromSecret,
} from '@/lib/crypto';
import { safeParseArray } from '@/lib/safe-parse';
import {
  type WalleterInfo,
  type WalletInfo,
  type ChainAddressInfo,
  type AddressBookEntry,
  type StorageMetadata,
  type AssetInfo,
  WALLET_STORAGE_VERSION,
  WalletStorageError,
  WalletStorageErrorCode,
  WalletStorageMigrationError,
} from './types';
import { WalletInfoSchema, ChainAddressInfoSchema, WalleterInfoSchema } from './schema';

const DB_NAME = 'bfm-wallet-db';
const DB_VERSION = 1;

interface WalletDBSchema extends DBSchema {
  metadata: {
    key: string;
    value: StorageMetadata;
  };
  walleter: {
    key: string;
    value: WalleterInfo;
  };
  wallets: {
    key: string;
    value: WalletInfo;
    indexes: { 'by-chain': string };
  };
  chainAddresses: {
    key: string;
    value: ChainAddressInfo;
    indexes: { 'by-wallet': string; 'by-chain': string };
  };
  addressBook: {
    key: string;
    value: AddressBookEntry;
    indexes: { 'by-chain': string };
  };
}

/** 钱包存储服务 */
export class WalletStorageService {
  private db: IDBPDatabase<WalletDBSchema> | null = null;
  private initialized = false;

  /** 初始化存储服务 */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    this.db = await openDB<WalletDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, _newVersion, transaction) {
        // metadata store
        let metadataStore: ReturnType<typeof db.createObjectStore<'metadata'>> | undefined;
        if (!db.objectStoreNames.contains('metadata')) {
          metadataStore = db.createObjectStore('metadata');
        }

        // walleter store
        if (!db.objectStoreNames.contains('walleter')) {
          db.createObjectStore('walleter');
        }

        // wallets store
        if (!db.objectStoreNames.contains('wallets')) {
          const walletStore = db.createObjectStore('wallets', { keyPath: 'id' });
          walletStore.createIndex('by-chain', 'primaryChain');
        }

        // chainAddresses store
        if (!db.objectStoreNames.contains('chainAddresses')) {
          const addressStore = db.createObjectStore('chainAddresses', {
            keyPath: 'addressKey',
          });
          addressStore.createIndex('by-wallet', 'walletId');
          addressStore.createIndex('by-chain', 'chain');
        }

        // addressBook store
        if (!db.objectStoreNames.contains('addressBook')) {
          const bookStore = db.createObjectStore('addressBook', { keyPath: 'id' });
          bookStore.createIndex('by-chain', 'chain');
        }

        // Initialize metadata on first creation
        if (oldVersion === 0 && metadataStore) {
          metadataStore.put(
            {
              version: WALLET_STORAGE_VERSION,
              createdAt: Date.now(),
            },
            'main',
          );
        } else if (oldVersion === 0) {
          transaction.objectStore('metadata').put(
            {
              version: WALLET_STORAGE_VERSION,
              createdAt: Date.now(),
            },
            'main',
          );
        }
      },
    });

    // Set initialized before migrations so getMetadata works
    this.initialized = true;

    // 检测版本不兼容
    const metadata = await this.getMetadata();
    const storedVersion = metadata?.version ?? 0;
    if (storedVersion > 0 && storedVersion < WALLET_STORAGE_VERSION) {
      throw new WalletStorageMigrationError(storedVersion, WALLET_STORAGE_VERSION);
    }

    // Run migrations if needed
    await this.runMigrations();
  }

  /** 检查是否已初始化 */
  isInitialized(): boolean {
    return this.initialized;
  }

  private ensureInitialized(): void {
    if (!this.initialized || !this.db) {
      throw new WalletStorageError(
        WalletStorageErrorCode.NOT_INITIALIZED,
        'Storage service not initialized. Call initialize() first.',
      );
    }
  }

  // ==================== 元数据 ====================

  /** 获取存储元数据 */
  async getMetadata(): Promise<StorageMetadata | null> {
    this.ensureInitialized();
    return (await this.db!.get('metadata', 'main')) ?? null;
  }

  // ==================== 钱包用户 ====================

  /** 保存钱包用户信息 */
  async saveWalleterInfo(info: WalleterInfo): Promise<void> {
    this.ensureInitialized();
    await this.db!.put('walleter', info, 'main');
  }

  /** 获取钱包用户信息 */
  async getWalleterInfo(): Promise<WalleterInfo | null> {
    this.ensureInitialized();
    const raw = await this.db!.get('walleter', 'main');
    if (!raw) return null;
    const result = WalleterInfoSchema.safeParse(raw);
    if (!result.success) {
      console.warn('[WalletStorage] Invalid walleter info:', result.error.issues[0]);
      return null;
    }
    return result.data as WalleterInfo;
  }

  // ==================== 钱包管理 ====================

  /** 创建钱包（同时存储双向加密数据） */
  async createWallet(
    wallet: Omit<WalletInfo, 'encryptedMnemonic' | 'encryptedWalletLock'>,
    mnemonic: string,
    walletLock: string,
  ): Promise<WalletInfo> {
    this.ensureInitialized();

    // 验证参数
    if (!mnemonic || typeof mnemonic !== 'string') {
      throw new WalletStorageError(WalletStorageErrorCode.ENCRYPTION_FAILED, 'Invalid mnemonic: mnemonic is required');
    }
    if (!walletLock || typeof walletLock !== 'string') {
      throw new WalletStorageError(
        WalletStorageErrorCode.ENCRYPTION_FAILED,
        'Invalid walletLock: wallet lock password is required',
      );
    }

    // 检查 crypto.subtle 可用性（仅在安全上下文中可用）
    if (typeof crypto === 'undefined' || !crypto.subtle) {
      throw new WalletStorageError(
        WalletStorageErrorCode.ENCRYPTION_FAILED,
        'Web Crypto API is not available. Please use HTTPS or localhost.',
      );
    }

    try {
      // 双向加密：
      // 1. 使用钱包锁加密助记词/密钥
      const encryptedMnemonic = await encrypt(mnemonic, walletLock);
      // 2. 根据密钥类型选择派生方法加密钱包锁
      // - mnemonic: 使用 BIP32 派生（兼容标准助记词）
      // - arbitrary/privateKey: 使用 SHA256 派生（支持任意字符串）
      const secretKey =
        wallet.keyType === 'mnemonic'
          ? deriveEncryptionKeyFromMnemonic(mnemonic)
          : deriveEncryptionKeyFromSecret(mnemonic);
      const encryptedWalletLock = await encryptWithRawKey(walletLock, secretKey);

      const walletWithEncryption: WalletInfo = {
        ...wallet,
        encryptedMnemonic,
        encryptedWalletLock,
      };

      await this.db!.put('wallets', walletWithEncryption);
      return walletWithEncryption;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new WalletStorageError(
        WalletStorageErrorCode.ENCRYPTION_FAILED,
        `Failed to encrypt wallet data: ${message}`,
        err instanceof Error ? err : undefined,
      );
    }
  }

  /** 保存钱包（无加密，用于导入已有加密数据） */
  async saveWallet(wallet: WalletInfo): Promise<void> {
    this.ensureInitialized();
    await this.db!.put('wallets', wallet);
  }

  /** 获取钱包信息 */
  async getWallet(walletId: string): Promise<WalletInfo | null> {
    this.ensureInitialized();
    const raw = await this.db!.get('wallets', walletId);
    if (!raw) return null;
    const result = WalletInfoSchema.safeParse(raw);
    if (!result.success) {
      console.warn('[WalletStorage] Invalid wallet info:', result.error.issues[0]);
      return null;
    }
    return result.data as WalletInfo;
  }

  /** 获取所有钱包 */
  async getAllWallets(): Promise<WalletInfo[]> {
    this.ensureInitialized();
    const raw = await this.db!.getAll('wallets');
    return safeParseArray(WalletInfoSchema, raw, 'indexeddb:wallets') as WalletInfo[];
  }

  /** 更新钱包信息 */
  async updateWallet(walletId: string, updates: Partial<Omit<WalletInfo, 'id'>>): Promise<void> {
    this.ensureInitialized();

    const wallet = await this.getWallet(walletId);
    if (!wallet) {
      throw new WalletStorageError(WalletStorageErrorCode.WALLET_NOT_FOUND, `Wallet not found: ${walletId}`);
    }

    await this.db!.put('wallets', {
      ...wallet,
      ...updates,
      updatedAt: Date.now(),
    });
  }

  /** 删除钱包 */
  async deleteWallet(walletId: string): Promise<void> {
    this.ensureInitialized();

    // Delete wallet
    await this.db!.delete('wallets', walletId);

    // Delete associated chain addresses
    const addresses = await this.getWalletChainAddresses(walletId);
    const tx = this.db!.transaction('chainAddresses', 'readwrite');
    await Promise.all(addresses.map((addr) => tx.store.delete(addr.addressKey)));
    await tx.done;
  }

  // ==================== 助记词/私钥 ====================

  /** 获取解密的助记词 */
  async getMnemonic(walletId: string, password: string): Promise<string> {
    this.ensureInitialized();

    const wallet = await this.getWallet(walletId);
    if (!wallet) {
      throw new WalletStorageError(WalletStorageErrorCode.WALLET_NOT_FOUND, `Wallet not found: ${walletId}`);
    }

    if (!wallet.encryptedMnemonic) {
      throw new WalletStorageError(
        WalletStorageErrorCode.DECRYPTION_FAILED,
        'No encrypted mnemonic found for this wallet',
      );
    }

    try {
      return await decrypt(wallet.encryptedMnemonic, password);
    } catch (err) {
      throw new WalletStorageError(
        WalletStorageErrorCode.DECRYPTION_FAILED,
        'Failed to decrypt mnemonic. Wrong password or corrupted data.',
        err instanceof Error ? err : undefined,
      );
    }
  }

  /** 更新钱包锁加密（钱包锁变更时） */
  async updateWalletLockEncryption(walletId: string, oldWalletLock: string, newWalletLock: string): Promise<void> {
    this.ensureInitialized();

    const wallet = await this.getWallet(walletId);
    if (!wallet) {
      throw new WalletStorageError(WalletStorageErrorCode.WALLET_NOT_FOUND, `Wallet not found: ${walletId}`);
    }

    // 用旧钱包锁解密助记词
    const mnemonic = await this.getMnemonic(walletId, oldWalletLock);

    // 重新双向加密
    try {
      // 1. 使用新钱包锁加密助记词
      const encryptedMnemonic = await encrypt(mnemonic, newWalletLock);
      // 2. 根据密钥类型选择派生方法加密新钱包锁
      const secretKey =
        wallet.keyType === 'mnemonic'
          ? deriveEncryptionKeyFromMnemonic(mnemonic)
          : deriveEncryptionKeyFromSecret(mnemonic);
      const encryptedWalletLock = await encryptWithRawKey(newWalletLock, secretKey);

      await this.updateWallet(walletId, { encryptedMnemonic, encryptedWalletLock });
    } catch (err) {
      throw new WalletStorageError(
        WalletStorageErrorCode.ENCRYPTION_FAILED,
        'Failed to re-encrypt wallet data',
        err instanceof Error ? err : undefined,
      );
    }
  }

  /** 验证助记词是否正确（不修改数据） */
  async verifyMnemonic(walletId: string, mnemonic: string): Promise<boolean> {
    this.ensureInitialized();

    const wallet = await this.getWallet(walletId);
    if (!wallet) {
      throw new WalletStorageError(WalletStorageErrorCode.WALLET_NOT_FOUND, `Wallet not found: ${walletId}`);
    }

    if (!wallet.encryptedWalletLock) {
      throw new WalletStorageError(
        WalletStorageErrorCode.DECRYPTION_FAILED,
        'No encrypted wallet lock found for this wallet',
      );
    }

    // 验证助记词/密钥：尝试用派生密钥解密钱包锁
    try {
      const secretKey =
        wallet.keyType === 'mnemonic'
          ? deriveEncryptionKeyFromMnemonic(mnemonic)
          : deriveEncryptionKeyFromSecret(mnemonic);
      await decryptWithRawKey(wallet.encryptedWalletLock, secretKey);
      return true;
    } catch {
      return false;
    }
  }

  /** 使用助记词重置钱包锁 */
  async resetWalletLockByMnemonic(walletId: string, mnemonic: string, newWalletLock: string): Promise<void> {
    this.ensureInitialized();

    const wallet = await this.getWallet(walletId);
    if (!wallet) {
      throw new WalletStorageError(WalletStorageErrorCode.WALLET_NOT_FOUND, `Wallet not found: ${walletId}`);
    }

    if (!wallet.encryptedWalletLock) {
      throw new WalletStorageError(
        WalletStorageErrorCode.DECRYPTION_FAILED,
        'No encrypted wallet lock found for this wallet',
      );
    }

    // 验证助记词/密钥：尝试用派生密钥解密钱包锁
    const secretKey =
      wallet.keyType === 'mnemonic'
        ? deriveEncryptionKeyFromMnemonic(mnemonic)
        : deriveEncryptionKeyFromSecret(mnemonic);

    try {
      await decryptWithRawKey(wallet.encryptedWalletLock, secretKey);
    } catch {
      throw new WalletStorageError(
        WalletStorageErrorCode.INVALID_PASSWORD,
        'Invalid mnemonic/secret: failed to decrypt wallet lock',
      );
    }

    // 验证通过，重新双向加密
    try {
      // 1. 使用新钱包锁加密助记词/密钥
      const encryptedMnemonic = await encrypt(mnemonic, newWalletLock);
      // 2. 使用派生密钥加密新钱包锁
      const encryptedWalletLock = await encryptWithRawKey(newWalletLock, secretKey);

      await this.updateWallet(walletId, { encryptedMnemonic, encryptedWalletLock });
    } catch (err) {
      throw new WalletStorageError(
        WalletStorageErrorCode.ENCRYPTION_FAILED,
        'Failed to re-encrypt wallet data',
        err instanceof Error ? err : undefined,
      );
    }
  }

  /** 存储私钥 */
  async savePrivateKey(addressKey: string, privateKey: string, password: string): Promise<void> {
    this.ensureInitialized();

    const address = await this.getChainAddress(addressKey);
    if (!address) {
      throw new WalletStorageError(WalletStorageErrorCode.ADDRESS_NOT_FOUND, `Chain address not found: ${addressKey}`);
    }

    try {
      const encryptedPrivateKey = await encrypt(privateKey, password);
      await this.db!.put('chainAddresses', {
        ...address,
        encryptedPrivateKey,
      });
    } catch (err) {
      throw new WalletStorageError(
        WalletStorageErrorCode.ENCRYPTION_FAILED,
        'Failed to encrypt private key',
        err instanceof Error ? err : undefined,
      );
    }
  }

  /** 获取解密的私钥 */
  async getPrivateKey(addressKey: string, password: string): Promise<string> {
    this.ensureInitialized();

    const address = await this.getChainAddress(addressKey);
    if (!address) {
      throw new WalletStorageError(WalletStorageErrorCode.ADDRESS_NOT_FOUND, `Chain address not found: ${addressKey}`);
    }

    if (!address.encryptedPrivateKey) {
      throw new WalletStorageError(
        WalletStorageErrorCode.DECRYPTION_FAILED,
        'No encrypted private key found for this address',
      );
    }

    try {
      return await decrypt(address.encryptedPrivateKey, password);
    } catch (err) {
      throw new WalletStorageError(
        WalletStorageErrorCode.DECRYPTION_FAILED,
        'Failed to decrypt private key. Wrong password or corrupted data.',
        err instanceof Error ? err : undefined,
      );
    }
  }

  // ==================== 链地址 ====================

  /** 保存链地址信息 */
  async saveChainAddress(info: ChainAddressInfo): Promise<void> {
    this.ensureInitialized();
    await this.db!.put('chainAddresses', info);
  }

  /** 获取链地址信息 */
  async getChainAddress(addressKey: string): Promise<ChainAddressInfo | null> {
    this.ensureInitialized();
    const raw = await this.db!.get('chainAddresses', addressKey);
    if (!raw) return null;
    const result = ChainAddressInfoSchema.safeParse(raw);
    if (!result.success) {
      console.warn('[WalletStorage] Invalid chain address:', result.error.issues[0]);
      return null;
    }
    return result.data as ChainAddressInfo;
  }

  /** 获取钱包的所有链地址 */
  async getWalletChainAddresses(walletId: string): Promise<ChainAddressInfo[]> {
    this.ensureInitialized();
    const raw = await this.db!.getAllFromIndex('chainAddresses', 'by-wallet', walletId);
    return safeParseArray(ChainAddressInfoSchema, raw, 'indexeddb:chainAddresses') as ChainAddressInfo[];
  }

  /** 获取链的所有地址 */
  async getChainAddresses(chain: string): Promise<ChainAddressInfo[]> {
    this.ensureInitialized();
    const raw = await this.db!.getAllFromIndex('chainAddresses', 'by-chain', chain);
    return safeParseArray(ChainAddressInfoSchema, raw, 'indexeddb:chainAddresses') as ChainAddressInfo[];
  }

  /** 更新资产信息 */
  async updateAssets(addressKey: string, assets: AssetInfo[]): Promise<void> {
    this.ensureInitialized();

    const address = await this.getChainAddress(addressKey);
    if (!address) {
      throw new WalletStorageError(WalletStorageErrorCode.ADDRESS_NOT_FOUND, `Chain address not found: ${addressKey}`);
    }

    await this.db!.put('chainAddresses', {
      ...address,
      assets,
      isCustomAssets: true,
    });
  }

  /** 删除链地址 */
  async deleteChainAddress(addressKey: string): Promise<void> {
    this.ensureInitialized();
    await this.db!.delete('chainAddresses', addressKey);
  }

  // ==================== 地址簿 ====================

  /** 保存地址簿条目 */
  async saveAddressBookEntry(entry: AddressBookEntry): Promise<void> {
    this.ensureInitialized();
    await this.db!.put('addressBook', entry);
  }

  /** 获取地址簿条目 */
  async getAddressBookEntry(id: string): Promise<AddressBookEntry | null> {
    this.ensureInitialized();
    return (await this.db!.get('addressBook', id)) ?? null;
  }

  /** 获取所有地址簿条目 */
  async getAllAddressBookEntries(): Promise<AddressBookEntry[]> {
    this.ensureInitialized();
    return this.db!.getAll('addressBook');
  }

  /** 获取链的地址簿条目 */
  async getChainAddressBookEntries(chain: string): Promise<AddressBookEntry[]> {
    this.ensureInitialized();
    return this.db!.getAllFromIndex('addressBook', 'by-chain', chain);
  }

  /** 删除地址簿条目 */
  async deleteAddressBookEntry(id: string): Promise<void> {
    this.ensureInitialized();
    await this.db!.delete('addressBook', id);
  }

  // ==================== 数据管理 ====================

  /** 清除所有数据 */
  async clearAll(): Promise<void> {
    this.ensureInitialized();

    const tx = this.db!.transaction(['walleter', 'wallets', 'chainAddresses', 'addressBook'], 'readwrite');

    await Promise.all([
      tx.objectStore('walleter').clear(),
      tx.objectStore('wallets').clear(),
      tx.objectStore('chainAddresses').clear(),
      tx.objectStore('addressBook').clear(),
    ]);

    await tx.done;
  }

  /** 关闭数据库连接 */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initialized = false;
    }
  }

  // ==================== 数据迁移 ====================

  private async runMigrations(): Promise<void> {
    const metadata = await this.getMetadata();
    if (!metadata) return;

    // Future migrations will be added here
    // if (metadata.version < 2) { ... }
  }

  /** 从 localStorage 迁移旧数据 */
  async migrateFromLocalStorage(): Promise<boolean> {
    this.ensureInitialized();

    const oldData = localStorage.getItem('bfm_wallets');
    if (!oldData) return false;

    try {
      const { wallets, currentWalletId } = JSON.parse(oldData) as {
        wallets: Array<{
          id: string;
          name: string;
          keyType?: string;
          address: string;
          chain: string;
          encryptedMnemonic?: unknown;
          createdAt: number;
          chainAddresses?: Array<{
            chain: string;
            address: string;
            tokens?: unknown[];
          }>;
        }>;
        currentWalletId: string | null;
      };

      // Migrate wallets
      for (const oldWallet of wallets) {
        const newWallet: WalletInfo = {
          id: oldWallet.id,
          name: oldWallet.name,
          keyType: (oldWallet.keyType as 'mnemonic' | 'arbitrary') || 'mnemonic',
          primaryChain: oldWallet.chain,
          primaryAddress: oldWallet.address,
          encryptedMnemonic: oldWallet.encryptedMnemonic as WalletInfo['encryptedMnemonic'],
          isBackedUp: false,
          createdAt: oldWallet.createdAt,
          updatedAt: Date.now(),
        };
        await this.saveWallet(newWallet);

        // Migrate chain addresses
        if (oldWallet.chainAddresses) {
          for (const oldAddr of oldWallet.chainAddresses) {
            const addressKey = `${oldWallet.id}:${oldAddr.chain}`;
            const newAddr: ChainAddressInfo = {
              addressKey,
              walletId: oldWallet.id,
              chain: oldAddr.chain,
              address: oldAddr.address,
              assets: [],
              isCustomAssets: false,
              isFrozen: false,
            };
            await this.saveChainAddress(newAddr);
          }
        }
      }

      // Update walleter info
      const existingWalleter = await this.getWalleterInfo();
      if (!existingWalleter) {
        await this.saveWalleterInfo({
          name: 'User',
          activeWalletId: currentWalletId,
          biometricEnabled: false,
          walletLockEnabled: false,
          agreementAccepted: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      } else if (currentWalletId) {
        await this.saveWalleterInfo({
          ...existingWalleter,
          activeWalletId: currentWalletId,
          updatedAt: Date.now(),
        });
      }

      // Remove old data after successful migration
      localStorage.removeItem('bfm_wallets');

      return true;
    } catch (err) {
      console.error('Failed to migrate from localStorage:', err);
      throw new WalletStorageError(
        WalletStorageErrorCode.MIGRATION_FAILED,
        'Failed to migrate data from localStorage',
        err instanceof Error ? err : undefined,
      );
    }
  }
}

/** 单例实例 */
export const walletStorageService = new WalletStorageService();
