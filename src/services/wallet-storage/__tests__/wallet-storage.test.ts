import 'fake-indexeddb/auto'
import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import {
  WalletStorageService,
  WalletStorageError,
  WalletStorageErrorCode,
  type WalleterInfo,
  type WalletInfo,
  type ChainAddressInfo,
  type AddressBookEntry,
} from '../index'

// 有效的 12 词 BIP39 助记词（用于测试）
const VALID_MNEMONIC = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

describe('WalletStorageService', () => {
  let service: WalletStorageService

  beforeEach(async () => {
    service = new WalletStorageService()
    await service.initialize()
  })

  afterEach(() => {
    service.close()
    indexedDB.deleteDatabase('bfm-wallet-db')
  })

  describe('initialization', () => {
    it('initializes successfully', async () => {
      expect(service.isInitialized()).toBe(true)
    })

    it('can be initialized multiple times safely', async () => {
      await expect(service.initialize()).resolves.not.toThrow()
      expect(service.isInitialized()).toBe(true)
    })

    it('throws when accessing data before initialization', async () => {
      const uninitService = new WalletStorageService()

      await expect(uninitService.getAllWallets()).rejects.toThrow(
        WalletStorageError
      )
    })

    it('returns metadata after initialization', async () => {
      const metadata = await service.getMetadata()

      expect(metadata).toBeDefined()
      expect(metadata?.version).toBe(2)
      expect(metadata?.createdAt).toBeGreaterThan(0)
    })
  })

  describe('walleter info', () => {
    const mockWalleter: WalleterInfo = {
      name: 'Test User',
      passwordTips: 'Test hint',
      activeWalletId: null,
      biometricEnabled: false,
      walletLockEnabled: true,
      agreementAccepted: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    it('saves and retrieves walleter info', async () => {
      await service.saveWalleterInfo(mockWalleter)
      const retrieved = await service.getWalleterInfo()

      expect(retrieved).toEqual(mockWalleter)
    })

    it('returns null when no walleter info exists', async () => {
      const result = await service.getWalleterInfo()
      expect(result).toBeNull()
    })

    it('updates walleter info', async () => {
      await service.saveWalleterInfo(mockWalleter)
      const updated: WalleterInfo = {
        ...mockWalleter,
        name: 'Updated User',
        biometricEnabled: true,
      }
      await service.saveWalleterInfo(updated)

      const retrieved = await service.getWalleterInfo()
      expect(retrieved?.name).toBe('Updated User')
      expect(retrieved?.biometricEnabled).toBe(true)
    })
  })

  describe('wallet management', () => {
    const mockWallet: Omit<WalletInfo, 'encryptedMnemonic'> = {
      id: 'wallet-1',
      name: 'My Wallet',
      keyType: 'mnemonic',
      primaryChain: 'bfmeta',
      primaryAddress: 'bTestAddress123',
      isBackedUp: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    it('creates wallet with encrypted mnemonic', async () => {
      const result = await service.createWallet(
        mockWallet,
        VALID_MNEMONIC,
        'password123'
      )

      expect(result.id).toBe('wallet-1')
      expect(result.encryptedMnemonic).toBeDefined()
      expect(result.encryptedMnemonic?.ciphertext).toBeTruthy()
      // 验证双向加密：encryptedWalletLock 也应该存在
      expect(result.encryptedWalletLock).toBeDefined()
      expect(result.encryptedWalletLock?.ciphertext).toBeTruthy()
    })

    it('retrieves created wallet', async () => {
      await service.createWallet(mockWallet, VALID_MNEMONIC, 'password123')
      const retrieved = await service.getWallet('wallet-1')

      expect(retrieved).toBeDefined()
      expect(retrieved?.name).toBe('My Wallet')
    })

    it('returns null for non-existent wallet', async () => {
      const result = await service.getWallet('non-existent')
      expect(result).toBeNull()
    })

    it('gets all wallets', async () => {
      await service.createWallet(mockWallet, VALID_MNEMONIC, 'pass1')
      await service.createWallet(
        { ...mockWallet, id: 'wallet-2', name: 'Wallet 2' },
        VALID_MNEMONIC,
        'pass2'
      )

      const wallets = await service.getAllWallets()
      expect(wallets).toHaveLength(2)
    })

    it('updates wallet', async () => {
      await service.createWallet(mockWallet, VALID_MNEMONIC, 'password')
      await service.updateWallet('wallet-1', { name: 'Updated Name' })

      const updated = await service.getWallet('wallet-1')
      expect(updated?.name).toBe('Updated Name')
      expect(updated?.updatedAt).toBeGreaterThan(mockWallet.updatedAt)
    })

    it('throws when updating non-existent wallet', async () => {
      await expect(
        service.updateWallet('non-existent', { name: 'Test' })
      ).rejects.toThrow(WalletStorageError)
    })

    it('deletes wallet', async () => {
      await service.createWallet(mockWallet, VALID_MNEMONIC, 'password')
      await service.deleteWallet('wallet-1')

      const result = await service.getWallet('wallet-1')
      expect(result).toBeNull()
    })

    it('deletes associated chain addresses when deleting wallet', async () => {
      await service.createWallet(mockWallet, VALID_MNEMONIC, 'password')
      await service.saveChainAddress({
        addressKey: 'wallet-1:bfmeta',
        walletId: 'wallet-1',
        chain: 'bfmeta',
        address: 'testAddress',
        assets: [],
        isCustomAssets: false,
        isFrozen: false,
      })

      await service.deleteWallet('wallet-1')

      const addresses = await service.getWalletChainAddresses('wallet-1')
      expect(addresses).toHaveLength(0)
    })
  })

  describe('mnemonic encryption', () => {
    const mockWallet: Omit<WalletInfo, 'encryptedMnemonic'> = {
      id: 'wallet-crypto',
      name: 'Crypto Wallet',
      keyType: 'mnemonic',
      primaryChain: 'bfmeta',
      primaryAddress: 'bAddress',
      isBackedUp: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    const password = 'securePassword123'

    it('retrieves decrypted mnemonic with correct password', async () => {
      await service.createWallet(mockWallet, VALID_MNEMONIC, password)

      const decrypted = await service.getMnemonic('wallet-crypto', password)
      expect(decrypted).toBe(VALID_MNEMONIC)
    })

    it('throws when decrypting with wrong password', async () => {
      await service.createWallet(mockWallet, VALID_MNEMONIC, password)

      await expect(
        service.getMnemonic('wallet-crypto', 'wrongPassword')
      ).rejects.toThrow(WalletStorageError)
    })

    it('throws when wallet not found', async () => {
      await expect(
        service.getMnemonic('non-existent', password)
      ).rejects.toThrow(WalletStorageError)
    })

    it('updates wallet lock encryption with new wallet lock', async () => {
      await service.createWallet(mockWallet, VALID_MNEMONIC, password)

      const newWalletLock = 'newSecurePassword456'
      await service.updateWalletLockEncryption(
        'wallet-crypto',
        password,
        newWalletLock
      )

      const decrypted = await service.getMnemonic('wallet-crypto', newWalletLock)
      expect(decrypted).toBe(VALID_MNEMONIC)

      await expect(
        service.getMnemonic('wallet-crypto', password)
      ).rejects.toThrow()
    })

    it('resets wallet lock by mnemonic', async () => {
      await service.createWallet(mockWallet, VALID_MNEMONIC, password)

      const newWalletLock = 'resetPassword789'
      await service.resetWalletLockByMnemonic(
        'wallet-crypto',
        VALID_MNEMONIC,
        newWalletLock
      )

      // 新钱包锁应该可以解密助记词
      const decrypted = await service.getMnemonic('wallet-crypto', newWalletLock)
      expect(decrypted).toBe(VALID_MNEMONIC)

      // 旧钱包锁应该失效
      await expect(
        service.getMnemonic('wallet-crypto', password)
      ).rejects.toThrow()
    })

    it('throws when resetting wallet lock with invalid mnemonic', async () => {
      await service.createWallet(mockWallet, VALID_MNEMONIC, password)

      await expect(
        service.resetWalletLockByMnemonic(
          'wallet-crypto',
          'invalid mnemonic phrase that does not match',
          'newPassword'
        )
      ).rejects.toThrow()
    })
  })

  describe('chain addresses', () => {
    const mockAddress: ChainAddressInfo = {
      addressKey: 'wallet-1:bfmeta',
      walletId: 'wallet-1',
      chain: 'bfmeta',
      address: 'bTestAddress123',
      publicKey: 'pubKey123',
      derivationPath: "m/44'/0'/0'/0/0",
      assets: [
        {
          assetType: 'native',
          symbol: 'BFM',
          decimals: 8,
          balance: '1000000000',
        },
      ],
      isCustomAssets: false,
      isFrozen: false,
    }

    it('saves and retrieves chain address', async () => {
      await service.saveChainAddress(mockAddress)
      const retrieved = await service.getChainAddress('wallet-1:bfmeta')

      expect(retrieved).toEqual(mockAddress)
    })

    it('returns null for non-existent address', async () => {
      const result = await service.getChainAddress('non-existent')
      expect(result).toBeNull()
    })

    it('gets all addresses for a wallet', async () => {
      await service.saveChainAddress(mockAddress)
      await service.saveChainAddress({
        ...mockAddress,
        addressKey: 'wallet-1:bfcc',
        chain: 'bfcc',
      })
      await service.saveChainAddress({
        ...mockAddress,
        addressKey: 'wallet-2:bfmeta',
        walletId: 'wallet-2',
      })

      const addresses = await service.getWalletChainAddresses('wallet-1')
      expect(addresses).toHaveLength(2)
      expect(addresses.every((a) => a.walletId === 'wallet-1')).toBe(true)
    })

    it('gets all addresses for a chain', async () => {
      await service.saveChainAddress(mockAddress)
      await service.saveChainAddress({
        ...mockAddress,
        addressKey: 'wallet-2:bfmeta',
        walletId: 'wallet-2',
      })

      const addresses = await service.getChainAddresses('bfmeta')
      expect(addresses).toHaveLength(2)
      expect(addresses.every((a) => a.chain === 'bfmeta')).toBe(true)
    })

    it('updates assets', async () => {
      await service.saveChainAddress(mockAddress)
      const newAssets = [
        { assetType: 'token', symbol: 'USDT', decimals: 6, balance: '100000000' },
      ]

      await service.updateAssets('wallet-1:bfmeta', newAssets)

      const updated = await service.getChainAddress('wallet-1:bfmeta')
      expect(updated?.assets).toEqual(newAssets)
      expect(updated?.isCustomAssets).toBe(true)
    })

    it('throws when updating assets for non-existent address', async () => {
      await expect(service.updateAssets('non-existent', [])).rejects.toThrow(
        WalletStorageError
      )
    })

    it('deletes chain address', async () => {
      await service.saveChainAddress(mockAddress)
      await service.deleteChainAddress('wallet-1:bfmeta')

      const result = await service.getChainAddress('wallet-1:bfmeta')
      expect(result).toBeNull()
    })
  })

  describe('private key storage', () => {
    const mockAddress: ChainAddressInfo = {
      addressKey: 'wallet-1:bfmeta',
      walletId: 'wallet-1',
      chain: 'bfmeta',
      address: 'bTestAddress',
      assets: [],
      isCustomAssets: false,
      isFrozen: false,
    }

    const privateKey = 'privateKeyHex1234567890'
    const password = 'securePass123'

    it('saves and retrieves encrypted private key', async () => {
      await service.saveChainAddress(mockAddress)
      await service.savePrivateKey('wallet-1:bfmeta', privateKey, password)

      const decrypted = await service.getPrivateKey('wallet-1:bfmeta', password)
      expect(decrypted).toBe(privateKey)
    })

    it('throws when saving private key for non-existent address', async () => {
      await expect(
        service.savePrivateKey('non-existent', privateKey, password)
      ).rejects.toThrow(WalletStorageError)
    })

    it('throws when retrieving with wrong password', async () => {
      await service.saveChainAddress(mockAddress)
      await service.savePrivateKey('wallet-1:bfmeta', privateKey, password)

      await expect(
        service.getPrivateKey('wallet-1:bfmeta', 'wrongPass')
      ).rejects.toThrow(WalletStorageError)
    })
  })

  describe('address book', () => {
    const mockEntry: AddressBookEntry = {
      id: 'entry-1',
      chain: 'bfmeta',
      address: 'bRecipientAddress',
      name: 'Alice',
      note: 'Friend wallet',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    it('saves and retrieves address book entry', async () => {
      await service.saveAddressBookEntry(mockEntry)
      const retrieved = await service.getAddressBookEntry('entry-1')

      expect(retrieved).toEqual(mockEntry)
    })

    it('returns null for non-existent entry', async () => {
      const result = await service.getAddressBookEntry('non-existent')
      expect(result).toBeNull()
    })

    it('gets all address book entries', async () => {
      await service.saveAddressBookEntry(mockEntry)
      await service.saveAddressBookEntry({
        ...mockEntry,
        id: 'entry-2',
        name: 'Bob',
      })

      const entries = await service.getAllAddressBookEntries()
      expect(entries).toHaveLength(2)
    })

    it('gets entries by chain', async () => {
      await service.saveAddressBookEntry(mockEntry)
      await service.saveAddressBookEntry({
        ...mockEntry,
        id: 'entry-2',
        chain: 'ethereum',
      })

      const bfmetaEntries = await service.getChainAddressBookEntries('bfmeta')
      expect(bfmetaEntries).toHaveLength(1)
      expect(bfmetaEntries[0]?.name).toBe('Alice')
    })

    it('deletes address book entry', async () => {
      await service.saveAddressBookEntry(mockEntry)
      await service.deleteAddressBookEntry('entry-1')

      const result = await service.getAddressBookEntry('entry-1')
      expect(result).toBeNull()
    })
  })

  describe('data management', () => {
    it('clears all data', async () => {
      await service.saveWalleterInfo({
        name: 'User',
        activeWalletId: null,
        biometricEnabled: false,
        walletLockEnabled: false,
        agreementAccepted: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      await service.createWallet(
        {
          id: 'wallet-1',
          name: 'Wallet',
          keyType: 'mnemonic',
          primaryChain: 'bfmeta',
          primaryAddress: 'addr',
          isBackedUp: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        VALID_MNEMONIC,
        'pass'
      )

      await service.clearAll()

      expect(await service.getWalleterInfo()).toBeNull()
      expect(await service.getAllWallets()).toHaveLength(0)
    })
  })

  describe('localStorage migration', () => {
    afterEach(() => {
      localStorage.clear()
    })

    it('migrates data from localStorage', async () => {
      const oldData = {
        wallets: [
          {
            id: 'old-wallet-1',
            name: 'Legacy Wallet',
            keyType: 'mnemonic',
            address: 'bLegacyAddress',
            chain: 'bfmeta',
            createdAt: Date.now() - 1000000,
            chainAddresses: [
              {
                chain: 'bfmeta',
                address: 'bLegacyAddress',
              },
              {
                chain: 'bfcc',
                address: 'bLegacyCC',
              },
            ],
          },
        ],
        currentWalletId: 'old-wallet-1',
      }
      localStorage.setItem('bfm_wallets', JSON.stringify(oldData))

      const migrated = await service.migrateFromLocalStorage()

      expect(migrated).toBe(true)
      expect(localStorage.getItem('bfm_wallets')).toBeNull()

      const wallets = await service.getAllWallets()
      expect(wallets).toHaveLength(1)
      expect(wallets[0]?.name).toBe('Legacy Wallet')

      const addresses = await service.getWalletChainAddresses('old-wallet-1')
      expect(addresses).toHaveLength(2)

      const walleter = await service.getWalleterInfo()
      expect(walleter?.activeWalletId).toBe('old-wallet-1')
    })

    it('returns false when no localStorage data', async () => {
      const migrated = await service.migrateFromLocalStorage()
      expect(migrated).toBe(false)
    })

    it('throws on malformed localStorage data', async () => {
      localStorage.setItem('bfm_wallets', 'invalid json')

      await expect(service.migrateFromLocalStorage()).rejects.toThrow(
        WalletStorageError
      )
    })
  })

  describe('error codes', () => {
    it('provides correct error code for uninitialized storage', async () => {
      const uninitService = new WalletStorageService()

      try {
        await uninitService.getAllWallets()
      } catch (err) {
        expect(err).toBeInstanceOf(WalletStorageError)
        expect((err as WalletStorageError).code).toBe(
          WalletStorageErrorCode.NOT_INITIALIZED
        )
      }
    })

    it('provides correct error code for wallet not found', async () => {
      try {
        await service.getMnemonic('non-existent', 'password')
      } catch (err) {
        expect(err).toBeInstanceOf(WalletStorageError)
        expect((err as WalletStorageError).code).toBe(
          WalletStorageErrorCode.WALLET_NOT_FOUND
        )
      }
    })

    it('provides correct error code for address not found', async () => {
      try {
        await service.updateAssets('non-existent', [])
      } catch (err) {
        expect(err).toBeInstanceOf(WalletStorageError)
        expect((err as WalletStorageError).code).toBe(
          WalletStorageErrorCode.ADDRESS_NOT_FOUND
        )
      }
    })
  })
})
