/**
 * mpay-transformer 单元测试
 *
 * 测试 mpay → KeyApp 数据转换
 */

import { describe, it, expect, vi } from 'vitest'
import {
  transformMpayData,
  mapChainName,
  transformChainAddress,
  transformAsset,
  transformAddressBookEntry,
  determineChainFromList,
} from './mpay-transformer'
import type {
  MpayMainWallet,
  MpayChainAddressInfo,
  MpayAddressAsset,
  MpayAddressBookEntry,
} from './types'

// Mock mpay-crypto 模块
vi.mock('./mpay-crypto', () => ({
  decryptMpayData: vi.fn(async (_password: string, encrypted: string) => {
    // 模拟解密：假设加密数据是 base64(plaintext)
    return atob(encrypted)
  }),
}))

// Mock crypto encrypt
vi.mock('@/lib/crypto', () => ({
  encrypt: vi.fn(async (plaintext: string, _password: string) => ({
    ciphertext: btoa(plaintext),
    iv: 'test-iv',
    salt: 'test-salt',
    iterations: 100000,
  })),
}))

describe('mpay-transformer', () => {
  describe('mapChainName', () => {
    it('should map BFMeta to bfmeta', () => {
      expect(mapChainName('BFMeta')).toBe('bfmeta')
    })

    it('should map Malibu to malibu', () => {
      expect(mapChainName('Malibu')).toBe('malibu')
    })

    it('should map PMChain to pmchain', () => {
      expect(mapChainName('PMChain')).toBe('pmchain')
    })

    it('should map Ethereum to ethereum', () => {
      expect(mapChainName('Ethereum')).toBe('ethereum')
    })

    it('should map Tron to tron', () => {
      expect(mapChainName('Tron')).toBe('tron')
    })

    it('should map BTC to bitcoin', () => {
      expect(mapChainName('BTC')).toBe('bitcoin')
    })

    it('should map BSC to binance', () => {
      expect(mapChainName('BSC')).toBe('binance')
    })

    it('should return null for unknown chain', () => {
      expect(mapChainName('UnknownChain')).toBeNull()
    })
  })

  describe('transformAsset', () => {
    it('should transform basic asset', () => {
      const asset: MpayAddressAsset = {
        assetType: 'BFT',
        amount: '1000',
        decimals: 8,
      }

      const token = transformAsset(asset, 'bfmeta')

      expect(token.id).toBe('bfmeta-BFT')
      expect(token.symbol).toBe('BFT')
      expect(token.name).toBe('BFT')
      expect(token.balance).toBe('1000')
      expect(token.decimals).toBe(8)
      expect(token.chain).toBe('bfmeta')
      expect(token.fiatValue).toBe(0)
      expect(token.change24h).toBe(0)
    })

    it('should include logoUrl as icon when present', () => {
      const asset: MpayAddressAsset = {
        assetType: 'ETH',
        amount: '500',
        decimals: 18,
        logoUrl: 'https://example.com/eth.png',
      }

      const token = transformAsset(asset, 'ethereum')

      expect(token.icon).toBe('https://example.com/eth.png')
    })

    it('should not include icon when logoUrl is absent', () => {
      const asset: MpayAddressAsset = {
        assetType: 'ETH',
        amount: '500',
        decimals: 18,
      }

      const token = transformAsset(asset, 'ethereum')

      expect(token.icon).toBeUndefined()
    })

    it('should include contractAddress when present', () => {
      const asset: MpayAddressAsset = {
        assetType: 'USDT',
        amount: '100',
        decimals: 6,
        contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      }

      const token = transformAsset(asset, 'ethereum')

      expect(token.contractAddress).toBe('0xdac17f958d2ee523a2206206994597c13d831ec7')
    })

    it('should default balance to 0 when amount is undefined', () => {
      const asset: MpayAddressAsset = {
        assetType: 'BFT',
        decimals: 8,
      }

      const token = transformAsset(asset, 'bfmeta')

      expect(token.balance).toBe('0')
    })
  })

  describe('transformChainAddress', () => {
    it('should transform valid chain address', () => {
      const mpayAddress: MpayChainAddressInfo = {
        addressKey: 'addr-1',
        mainWalletId: 'wallet-1',
        chain: 'BFMeta',
        address: 'bfm123456',
        privateKey: 'encrypted-pk',
        assets: [
          { assetType: 'BFT', amount: '1000', decimals: 8 },
        ],
        symbol: 'BFT',
        name: 'BFMeta Address',
      }

      const chainAddr = transformChainAddress(mpayAddress)

      expect(chainAddr).not.toBeNull()
      expect(chainAddr?.chain).toBe('bfmeta')
      expect(chainAddr?.address).toBe('bfm123456')
      expect(chainAddr?.tokens).toHaveLength(1)
      expect(chainAddr?.tokens[0]?.symbol).toBe('BFT')
    })

    it('should return null for unknown chain', () => {
      const mpayAddress: MpayChainAddressInfo = {
        addressKey: 'addr-1',
        mainWalletId: 'wallet-1',
        chain: 'UnknownChain',
        address: 'unknown123',
        privateKey: 'encrypted-pk',
        assets: [],
        symbol: 'UNK',
        name: 'Unknown Address',
      }

      // Mock console.warn to prevent noise in test output
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const chainAddr = transformChainAddress(mpayAddress)
      warnSpy.mockRestore()

      expect(chainAddr).toBeNull()
    })

    it('should transform multiple assets', () => {
      const mpayAddress: MpayChainAddressInfo = {
        addressKey: 'addr-1',
        mainWalletId: 'wallet-1',
        chain: 'Ethereum',
        address: '0x123',
        privateKey: 'encrypted-pk',
        assets: [
          { assetType: 'ETH', amount: '5', decimals: 18 },
          { assetType: 'USDT', amount: '1000', decimals: 6 },
        ],
        symbol: 'ETH',
        name: 'Ethereum Address',
      }

      const chainAddr = transformChainAddress(mpayAddress)

      expect(chainAddr?.tokens).toHaveLength(2)
      expect(chainAddr?.tokens[0]?.symbol).toBe('ETH')
      expect(chainAddr?.tokens[1]?.symbol).toBe('USDT')
    })
  })

  describe('determineChainFromList', () => {
    it('should return undefined for undefined chainList', () => {
      expect(determineChainFromList(undefined)).toBeUndefined()
    })

    it('should return undefined for empty chainList', () => {
      expect(determineChainFromList([])).toBeUndefined()
    })

    it('should return first mappable chain', () => {
      expect(determineChainFromList(['BFMeta', 'Ethereum'])).toBe('bfmeta')
    })

    it('should skip unmappable chains and return first mappable', () => {
      expect(determineChainFromList(['UnknownChain', 'Ethereum', 'BFMeta'])).toBe('ethereum')
    })

    it('should return undefined if all chains are unmappable', () => {
      expect(determineChainFromList(['UnknownChain1', 'UnknownChain2'])).toBeUndefined()
    })

    it('should handle single mappable chain', () => {
      expect(determineChainFromList(['Tron'])).toBe('tron')
    })
  })

  describe('transformAddressBookEntry', () => {
    it('should transform basic address book entry', () => {
      const entry: MpayAddressBookEntry = {
        addressBookId: 'addr-book-1',
        name: 'Alice',
        address: 'bfm123456',
        chainList: ['BFMeta'],
        remarks: 'My friend',
      }

      const contact = transformAddressBookEntry(entry)

      expect(contact.id).toBe('addr-book-1')
      expect(contact.name).toBe('Alice')
      expect(contact.address).toBe('bfm123456')
      expect(contact.chain).toBe('bfmeta')
      expect(contact.memo).toBe('My friend')
      expect(contact.createdAt).toBeTypeOf('number')
      expect(contact.updatedAt).toBeTypeOf('number')
    })

    it('should handle entry without chainList', () => {
      const entry: MpayAddressBookEntry = {
        addressBookId: 'addr-book-2',
        name: 'Bob',
        address: '0xabc123',
      }

      const contact = transformAddressBookEntry(entry)

      expect(contact.id).toBe('addr-book-2')
      expect(contact.name).toBe('Bob')
      expect(contact.address).toBe('0xabc123')
      expect(contact.chain).toBeUndefined()
      expect(contact.memo).toBeUndefined()
    })

    it('should handle entry with empty chainList', () => {
      const entry: MpayAddressBookEntry = {
        addressBookId: 'addr-book-3',
        name: 'Charlie',
        address: 'tron123',
        chainList: [],
      }

      const contact = transformAddressBookEntry(entry)

      expect(contact.chain).toBeUndefined()
    })

    it('should select first mappable chain from multi-chain entry', () => {
      const entry: MpayAddressBookEntry = {
        addressBookId: 'addr-book-4',
        name: 'MultiChain Contact',
        address: '0xmulti',
        chainList: ['Ethereum', 'BFMeta', 'Tron'],
      }

      const contact = transformAddressBookEntry(entry)

      // First mappable chain should be selected
      expect(contact.chain).toBe('ethereum')
    })

    it('should skip unmappable chains and use first mappable', () => {
      const entry: MpayAddressBookEntry = {
        addressBookId: 'addr-book-5',
        name: 'Unknown First',
        address: '0xunknown',
        chainList: ['UnknownChain', 'OtherUnknown', 'BFMeta'],
      }

      const contact = transformAddressBookEntry(entry)

      expect(contact.chain).toBe('bfmeta')
    })

    it('should return undefined chain when all chains are unmappable', () => {
      const entry: MpayAddressBookEntry = {
        addressBookId: 'addr-book-6',
        name: 'All Unknown',
        address: '0xallunknown',
        chainList: ['UnknownChain1', 'UnknownChain2'],
      }

      const contact = transformAddressBookEntry(entry)

      expect(contact.chain).toBeUndefined()
    })

    it('should handle entry without remarks', () => {
      const entry: MpayAddressBookEntry = {
        addressBookId: 'addr-book-7',
        name: 'No Remarks',
        address: 'bfm789',
        chainList: ['BFMeta'],
      }

      const contact = transformAddressBookEntry(entry)

      expect(contact.memo).toBeUndefined()
    })

    it('should set createdAt and updatedAt to current timestamp', () => {
      const before = Date.now()

      const entry: MpayAddressBookEntry = {
        addressBookId: 'addr-book-8',
        name: 'Timestamp Test',
        address: 'test123',
      }

      const contact = transformAddressBookEntry(entry)

      const after = Date.now()

      expect(contact.createdAt).toBeGreaterThanOrEqual(before)
      expect(contact.createdAt).toBeLessThanOrEqual(after)
      expect(contact.updatedAt).toBe(contact.createdAt)
    })
  })

  describe('transformMpayData', () => {
    const password = 'testpassword'

    const createMockWallet = (id: string, name: string): MpayMainWallet => ({
      mainWalletId: id,
      name,
      importPhrase: btoa('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'),
      importType: 'mnemonic',
      addressKeyList: [],
      createTimestamp: Date.now(),
      headSculpture: '',
    })

    const createMockAddress = (
      walletId: string,
      chain: string,
      address: string
    ): MpayChainAddressInfo => ({
      addressKey: `${walletId}-${chain}`,
      mainWalletId: walletId,
      chain,
      address,
      privateKey: 'encrypted-pk',
      assets: [{ assetType: 'BFT', amount: '100', decimals: 8 }],
      symbol: 'BFT',
      name: `${chain} Address`,
    })

    it('should transform single wallet with single address', async () => {
      const wallets = [createMockWallet('w1', 'My Wallet')]
      const addresses = [createMockAddress('w1', 'BFMeta', 'bfm123')]

      const result = await transformMpayData(wallets, addresses, password)

      expect(result.wallets).toHaveLength(1)
      expect(result.wallets[0]?.name).toBe('My Wallet')
      expect(result.wallets[0]?.chain).toBe('bfmeta')
      expect(result.wallets[0]?.address).toBe('bfm123')
      expect(result.wallets[0]?.chainAddresses).toHaveLength(1)
    })

    it('should transform wallet with multiple chain addresses', async () => {
      const wallets = [createMockWallet('w1', 'Multi Chain Wallet')]
      const addresses = [
        createMockAddress('w1', 'BFMeta', 'bfm123'),
        createMockAddress('w1', 'Ethereum', '0xeth123'),
        createMockAddress('w1', 'Tron', 'tron123'),
      ]

      const result = await transformMpayData(wallets, addresses, password)

      expect(result.wallets).toHaveLength(1)
      expect(result.wallets[0]?.chainAddresses).toHaveLength(3)
      // BFMeta should be primary
      expect(result.wallets[0]?.chain).toBe('bfmeta')
      expect(result.wallets[0]?.address).toBe('bfm123')
    })

    it('should use Ethereum as primary when no BFMeta', async () => {
      const wallets = [createMockWallet('w1', 'ETH Wallet')]
      const addresses = [
        createMockAddress('w1', 'Ethereum', '0xeth'),
        createMockAddress('w1', 'Tron', 'tron'),
      ]

      const result = await transformMpayData(wallets, addresses, password)

      expect(result.wallets[0]?.chain).toBe('ethereum')
      expect(result.wallets[0]?.address).toBe('0xeth')
    })

    it('should skip unknown chain addresses', async () => {
      const wallets = [createMockWallet('w1', 'Wallet')]
      const addresses = [
        createMockAddress('w1', 'BFMeta', 'bfm'),
        createMockAddress('w1', 'UnknownChain', 'unknown'),
      ]

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const result = await transformMpayData(wallets, addresses, password)
      warnSpy.mockRestore()

      expect(result.wallets[0]?.chainAddresses).toHaveLength(1)
      expect(result.skippedAddresses).toHaveLength(1)
      expect(result.skippedAddresses[0]?.chain).toBe('UnknownChain')
    })

    it('should transform multiple wallets', async () => {
      const wallets = [
        createMockWallet('w1', 'Wallet 1'),
        createMockWallet('w2', 'Wallet 2'),
      ]
      const addresses = [
        createMockAddress('w1', 'BFMeta', 'bfm1'),
        createMockAddress('w2', 'Ethereum', '0xeth2'),
      ]

      const result = await transformMpayData(wallets, addresses, password)

      expect(result.wallets).toHaveLength(2)
      expect(result.wallets[0]?.name).toBe('Wallet 1')
      expect(result.wallets[1]?.name).toBe('Wallet 2')
    })

    it('should include encrypted mnemonic', async () => {
      const wallets = [createMockWallet('w1', 'Wallet')]
      const addresses = [createMockAddress('w1', 'BFMeta', 'bfm')]

      const result = await transformMpayData(wallets, addresses, password)

      expect(result.wallets[0]?.encryptedMnemonic).toBeDefined()
      expect(result.wallets[0]?.encryptedMnemonic?.ciphertext).toBeDefined()
    })

    it('should return correct stats', async () => {
      const wallets = [createMockWallet('w1', 'W1'), createMockWallet('w2', 'W2')]
      const addresses = [
        createMockAddress('w1', 'BFMeta', 'bfm1'),
        createMockAddress('w1', 'UnknownChain', 'unknown'),
        createMockAddress('w2', 'Ethereum', '0x'),
      ]

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const result = await transformMpayData(wallets, addresses, password)
      warnSpy.mockRestore()

      expect(result.stats.totalWallets).toBe(2)
      expect(result.stats.totalAddresses).toBe(3)
      expect(result.stats.skippedAddresses).toBe(1)
    })
  })
})
