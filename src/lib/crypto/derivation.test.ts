import { describe, it, expect } from 'vitest'
import {
  deriveKey,
  deriveMultiChainKeys,
  deriveHDKey,
  getBIP44Path,
  toChecksumAddress,
  isValidAddress,
  type ChainType,
} from './derivation'

// 测试助记词（标准 BIP39 测试向量）
const TEST_MNEMONIC = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

describe('derivation', () => {
  describe('deriveHDKey', () => {
    it('derives HD key from mnemonic', () => {
      const hdKey = deriveHDKey(TEST_MNEMONIC)
      expect(hdKey).toBeDefined()
      expect(hdKey.privateKey).toBeDefined()
      expect(hdKey.publicKey).toBeDefined()
    })
  })

  describe('getBIP44Path', () => {
    it('generates correct Ethereum path', () => {
      const path = getBIP44Path('ethereum', 0, 0, 0)
      expect(path).toBe("m/44'/60'/0'/0/0")
    })

    it('generates correct Bitcoin path', () => {
      const path = getBIP44Path('bitcoin', 0, 0, 0)
      expect(path).toBe("m/44'/0'/0'/0/0")
    })

    it('generates correct Tron path', () => {
      const path = getBIP44Path('tron', 0, 0, 0)
      expect(path).toBe("m/44'/195'/0'/0/0")
    })

    it('supports custom account and index', () => {
      const path = getBIP44Path('ethereum', 1, 0, 5)
      expect(path).toBe("m/44'/60'/1'/0/5")
    })
  })

  describe('deriveKey', () => {
    it('derives Ethereum key correctly', () => {
      const key = deriveKey(TEST_MNEMONIC, 'ethereum')
      
      expect(key.chain).toBe('ethereum')
      expect(key.path).toBe("m/44'/60'/0'/0/0")
      expect(key.privateKey).toHaveLength(64)
      expect(key.publicKey).toHaveLength(66) // compressed
      expect(key.address).toMatch(/^0x[a-fA-F0-9]{40}$/)
    })

    it('derives Bitcoin key correctly', () => {
      const key = deriveKey(TEST_MNEMONIC, 'bitcoin')
      
      expect(key.chain).toBe('bitcoin')
      expect(key.path).toBe("m/44'/0'/0'/0/0")
      expect(key.address).toMatch(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/)
    })

    it('derives Tron key correctly', () => {
      const key = deriveKey(TEST_MNEMONIC, 'tron')
      
      expect(key.chain).toBe('tron')
      expect(key.path).toBe("m/44'/195'/0'/0/0")
      expect(key.address).toMatch(/^T[a-zA-Z0-9]{33}$/)
    })

    it('derives different addresses for different indices', () => {
      const key0 = deriveKey(TEST_MNEMONIC, 'ethereum', 0)
      const key1 = deriveKey(TEST_MNEMONIC, 'ethereum', 1)
      
      expect(key0.address).not.toBe(key1.address)
      expect(key0.privateKey).not.toBe(key1.privateKey)
    })

    it('derives same address for same mnemonic and path', () => {
      const key1 = deriveKey(TEST_MNEMONIC, 'ethereum', 0)
      const key2 = deriveKey(TEST_MNEMONIC, 'ethereum', 0)
      
      expect(key1.address).toBe(key2.address)
      expect(key1.privateKey).toBe(key2.privateKey)
    })
  })

  describe('deriveMultiChainKeys', () => {
    it('derives keys for multiple chains', () => {
      const keys = deriveMultiChainKeys(TEST_MNEMONIC, ['ethereum', 'bitcoin', 'tron'])
      
      expect(keys).toHaveLength(3)
      expect(keys[0].chain).toBe('ethereum')
      expect(keys[1].chain).toBe('bitcoin')
      expect(keys[2].chain).toBe('tron')
    })

    it('derives keys for default chains', () => {
      const keys = deriveMultiChainKeys(TEST_MNEMONIC)
      
      expect(keys.length).toBeGreaterThan(0)
      expect(keys.every(k => k.address)).toBe(true)
    })
  })

  describe('toChecksumAddress', () => {
    it('converts to checksum address', () => {
      const address = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed'
      const checksum = toChecksumAddress(address.toLowerCase())
      
      expect(checksum).toBe('0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed')
    })

    it('handles all lowercase', () => {
      const address = '0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359'
      const checksum = toChecksumAddress(address)
      
      expect(checksum).toMatch(/^0x[a-fA-F0-9]{40}$/)
    })
  })

  describe('isValidAddress', () => {
    it('validates Ethereum addresses', () => {
      expect(isValidAddress('0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed', 'ethereum')).toBe(true)
      expect(isValidAddress('0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed', 'ethereum')).toBe(true)
      expect(isValidAddress('0xinvalid', 'ethereum')).toBe(false)
      expect(isValidAddress('5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed', 'ethereum')).toBe(false)
    })

    it('validates Bitcoin addresses', () => {
      expect(isValidAddress('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2', 'bitcoin')).toBe(true)
      expect(isValidAddress('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', 'bitcoin')).toBe(true)
      expect(isValidAddress('invalid', 'bitcoin')).toBe(false)
    })

    it('validates Tron addresses', () => {
      expect(isValidAddress('TJCnKsPa7y5okkXvQAidZBzqx3QyQ6sxMW', 'tron')).toBe(true)
      expect(isValidAddress('invalid', 'tron')).toBe(false)
    })
  })
})
