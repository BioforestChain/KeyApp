import { describe, it, expect } from 'vitest'
import {
  createBioforestKeypair,
  keypairFromSecretKey,
  publicKeyToBioforestAddress,
  privateKeyToBioforestAddress,
  isValidBioforestAddress,
  deriveBioforestKey,
  deriveBioforestKeyFromChainConfig,
  deriveBioforestAddresses,
  deriveBioforestAddressesFromChainConfigs,
  deriveBioforestMultiChainKeys,
  isBioforestChain,
  isBioforestChainConfig,
  getBioforestChains,
  getBioforestChainConfig,
  toBioforestChainConfig,
  base58Encode,
  base58Decode,
  signMessage,
  verifySignature,
  BIOFOREST_CHAINS,
  type BioforestChainType,
} from './bioforest'
import type { ChainConfig } from '@/services/chain-config'

// Helper function for tests
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

describe('BioForest Crypto', () => {
  describe('createBioforestKeypair', () => {
    it('should create keypair from string', () => {
      const keypair = createBioforestKeypair('test')
      
      expect(keypair.secretKey).toBeInstanceOf(Uint8Array)
      expect(keypair.publicKey).toBeInstanceOf(Uint8Array)
      expect(keypair.secretKey.length).toBe(64) // Ed25519 extended key
      expect(keypair.publicKey.length).toBe(32)
    })

    it('should create deterministic keypairs', () => {
      const keypair1 = createBioforestKeypair('hello')
      const keypair2 = createBioforestKeypair('hello')
      
      expect(bytesToHex(keypair1.publicKey)).toBe(bytesToHex(keypair2.publicKey))
      expect(bytesToHex(keypair1.secretKey)).toBe(bytesToHex(keypair2.secretKey))
    })

    it('should create different keypairs for different secrets', () => {
      const keypair1 = createBioforestKeypair('secret1')
      const keypair2 = createBioforestKeypair('secret2')
      
      expect(bytesToHex(keypair1.publicKey)).not.toBe(bytesToHex(keypair2.publicKey))
    })

    it('should work with empty string', () => {
      const keypair = createBioforestKeypair('')
      
      expect(keypair.publicKey.length).toBe(32)
      expect(keypair.secretKey.length).toBe(64)
    })

    it('should work with unicode characters', () => {
      const keypair = createBioforestKeypair('你好世界🌍')
      
      expect(keypair.publicKey.length).toBe(32)
    })

    it('should work with mnemonic phrase', () => {
      const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
      const keypair = createBioforestKeypair(mnemonic)
      
      expect(keypair.publicKey.length).toBe(32)
    })
  })

  describe('keypairFromSecretKey', () => {
    it('should recreate keypair from 64-byte secret key', () => {
      const original = createBioforestKeypair('test')
      const secretKeyHex = bytesToHex(original.secretKey)
      
      const recreated = keypairFromSecretKey(secretKeyHex)
      
      expect(bytesToHex(recreated.publicKey)).toBe(bytesToHex(original.publicKey))
      expect(bytesToHex(recreated.secretKey)).toBe(bytesToHex(original.secretKey))
    })

    it('should recreate keypair from 32-byte seed', () => {
      const original = createBioforestKeypair('test')
      const seedHex = bytesToHex(original.secretKey.slice(0, 32))
      
      const recreated = keypairFromSecretKey(seedHex)
      
      expect(bytesToHex(recreated.publicKey)).toBe(bytesToHex(original.publicKey))
    })

    it('should throw for invalid key length', () => {
      expect(() => keypairFromSecretKey('abcd')).toThrow('Invalid secret key length')
    })
  })

  describe('Base58', () => {
    it('should encode and decode correctly', () => {
      const original = new Uint8Array([1, 2, 3, 4, 5])
      const encoded = base58Encode(original)
      const decoded = base58Decode(encoded)
      
      expect(decoded).toEqual(original)
    })

    it('should handle leading zeros', () => {
      const original = new Uint8Array([0, 0, 1, 2, 3])
      const encoded = base58Encode(original)
      
      expect(encoded.startsWith('11')).toBe(true) // '1' is Base58 for 0
      
      const decoded = base58Decode(encoded)
      expect(decoded).toEqual(original)
    })

    it('should throw for invalid characters', () => {
      expect(() => base58Decode('0OIl')).toThrow('Invalid Base58 character')
    })
  })

  describe('publicKeyToBioforestAddress', () => {
    it('should generate address with default prefix', () => {
      const keypair = createBioforestKeypair('test')
      const address = publicKeyToBioforestAddress(keypair.publicKey)
      
      expect(address).toMatch(/^c[1-9A-HJ-NP-Za-km-z]+$/)
      expect(address.length).toBeGreaterThan(20)
    })

    it('should generate address with custom prefix', () => {
      const keypair = createBioforestKeypair('test')
      const address = publicKeyToBioforestAddress(keypair.publicKey, 'b')
      
      expect(address.startsWith('b')).toBe(true)
    })

    it('should generate deterministic addresses', () => {
      const keypair1 = createBioforestKeypair('hello')
      const keypair2 = createBioforestKeypair('hello')
      
      const addr1 = publicKeyToBioforestAddress(keypair1.publicKey)
      const addr2 = publicKeyToBioforestAddress(keypair2.publicKey)
      
      expect(addr1).toBe(addr2)
    })
  })

  describe('privateKeyToBioforestAddress', () => {
    it('should generate same address as publicKeyToBioforestAddress', () => {
      const keypair = createBioforestKeypair('test')
      
      const addr1 = publicKeyToBioforestAddress(keypair.publicKey)
      const addr2 = privateKeyToBioforestAddress(keypair.secretKey)
      
      expect(addr1).toBe(addr2)
    })
  })

  describe('isValidBioforestAddress', () => {
    it('should validate correct addresses', () => {
      const keypair = createBioforestKeypair('test')
      const address = publicKeyToBioforestAddress(keypair.publicKey)
      
      expect(isValidBioforestAddress(address)).toBe(true)
    })

    it('should validate with chain type', () => {
      const keypair = createBioforestKeypair('test')
      const address = publicKeyToBioforestAddress(keypair.publicKey, 'c')
      
      expect(isValidBioforestAddress(address, 'bfmeta')).toBe(true)
    })

    it('should reject wrong prefix for chain', () => {
      const keypair = createBioforestKeypair('test')
      const address = publicKeyToBioforestAddress(keypair.publicKey, 'b')
      
      expect(isValidBioforestAddress(address, 'bfmeta')).toBe(false)
    })

    it('should reject invalid addresses', () => {
      expect(isValidBioforestAddress('')).toBe(false)
      expect(isValidBioforestAddress('a')).toBe(false)
      expect(isValidBioforestAddress('c0OIl')).toBe(false) // invalid Base58
      expect(isValidBioforestAddress(123 as unknown as string)).toBe(false)
    })
  })

  describe('deriveBioforestKey', () => {
    it('should derive key for bfmeta', () => {
      const result = deriveBioforestKey('test', 'bfmeta')
      
      expect(result.chain).toBe('bfmeta')
      expect(result.address.startsWith('c')).toBe(true)
      expect(result.privateKey).toHaveLength(128) // 64 bytes hex
      expect(result.publicKey).toHaveLength(64) // 32 bytes hex
    })

    it('should derive key for all supported chains', () => {
      const chains = getBioforestChains()
      
      for (const chain of chains) {
        const result = deriveBioforestKey('test', chain)
        const config = getBioforestChainConfig(chain)
        
        expect(result.chain).toBe(chain)
        expect(result.address.startsWith(config.prefix)).toBe(true)
      }
    })

    it('should throw for unsupported chain', () => {
      expect(() => deriveBioforestKey('test', 'invalid' as BioforestChainType))
        .toThrow('Unsupported BioForest chain')
    })
  })

  describe('chain-config adapters', () => {
    it('should detect bioforest configs and derive keys from chain-config', () => {
      const bioforestConfig: ChainConfig = {
        id: 'bfmeta',
        version: '1.0',
        type: 'bioforest',
        name: 'BFMeta',
        symbol: 'BFT',
        decimals: 8,
        prefix: 'c',
        enabled: true,
        source: 'manual',
      }

      expect(isBioforestChainConfig(bioforestConfig)).toBe(true)
      expect(toBioforestChainConfig(bioforestConfig).prefix).toBe('c')

      const derived = deriveBioforestKeyFromChainConfig('test', bioforestConfig)
      expect(derived.chain).toBe('bfmeta')
      expect(derived.address.startsWith('c')).toBe(true)
    })

    it('should support custom bioforest chain ids from chain-config', () => {
      const customConfig: ChainConfig = {
        id: 'custom-bioforest',
        version: '1.0',
        type: 'bioforest',
        name: 'Custom BioForest',
        symbol: 'CBF',
        decimals: 8,
        prefix: 'c',
        enabled: true,
        source: 'manual',
      }

      expect(isBioforestChainConfig(customConfig)).toBe(true)

      const derived = deriveBioforestKeyFromChainConfig('test', customConfig)
      expect(derived.chain).toBe('custom-bioforest')
      expect(derived.address.startsWith('c')).toBe(true)

      const addresses = deriveBioforestAddressesFromChainConfigs('test', [customConfig])
      expect(addresses).toEqual([{ chainId: 'custom-bioforest', address: derived.address }])
    })

    it('should reject non-bioforest configs', () => {
      const evmConfig: ChainConfig = {
        id: 'eth',
        version: '1.0',
        type: 'evm',
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        rpcUrl: 'https://example.invalid',
        enabled: true,
        source: 'default',
      }

      expect(isBioforestChainConfig(evmConfig)).toBe(false)
      expect(() => deriveBioforestKeyFromChainConfig('test', evmConfig)).toThrow('Unsupported BioForest chain')
    })
  })

  describe('deriveBioforestAddresses', () => {
    it('falls back to built-in chains when chain configs are not provided', () => {
      const addresses = deriveBioforestAddresses('test')
      expect(addresses.length).toBe(getBioforestChains().length)
      expect(addresses.some((item) => item.chainId === 'bfmeta')).toBe(true)
    })

    it('does not fallback when an empty chain-config set is provided', () => {
      const addresses = deriveBioforestAddresses('test', [])
      expect(addresses).toEqual([])
    })

    it('derives from provided chain-config list', () => {
      const customConfig: ChainConfig = {
        id: 'custom-bioforest',
        version: '1.0',
        type: 'bioforest',
        name: 'Custom BioForest',
        symbol: 'CBF',
        decimals: 8,
        prefix: 'c',
        enabled: true,
        source: 'manual',
      }

      const derived = deriveBioforestKeyFromChainConfig('test', customConfig)
      expect(deriveBioforestAddresses('test', [customConfig])).toEqual([
        { chainId: 'custom-bioforest', address: derived.address },
      ])
    })
  })

  describe('deriveBioforestMultiChainKeys', () => {
    it('should derive keys for multiple chains', () => {
      const results = deriveBioforestMultiChainKeys('test', ['bfmeta', 'pmchain', 'ccchain'])

      expect(results).toHaveLength(3)
      expect(results[0]!.chain).toBe('bfmeta')
      expect(results[1]!.chain).toBe('pmchain')
      expect(results[2]!.chain).toBe('ccchain')
    })

    it('should use same keypair for all chains', () => {
      const results = deriveBioforestMultiChainKeys('test', ['bfmeta', 'pmchain'])

      expect(results[0]!.publicKey).toBe(results[1]!.publicKey)
      expect(results[0]!.privateKey).toBe(results[1]!.privateKey)
    })

    it('should use default chains when not specified', () => {
      const results = deriveBioforestMultiChainKeys('test')
      
      expect(results.length).toBeGreaterThan(0)
    })
  })

  describe('isBioforestChain', () => {
    it('should return true for bioforest chains', () => {
      expect(isBioforestChain('bfmeta')).toBe(true)
      expect(isBioforestChain('ccchain')).toBe(true)
      expect(isBioforestChain('pmchain')).toBe(true)
    })

    it('should return false for non-bioforest chains', () => {
      expect(isBioforestChain('ethereum')).toBe(false)
      expect(isBioforestChain('bitcoin')).toBe(false)
      expect(isBioforestChain('tron')).toBe(false)
      expect(isBioforestChain('unknown')).toBe(false)
    })
  })

  describe('getBioforestChains', () => {
    it('should return all supported chains', () => {
      const chains = getBioforestChains()
      
      expect(chains).toContain('bfmeta')
      expect(chains).toContain('ccchain')
      expect(chains).toContain('pmchain')
      expect(chains.length).toBe(Object.keys(BIOFOREST_CHAINS).length)
    })
  })

  describe('getBioforestChainConfig', () => {
    it('should return config for valid chain', () => {
      const config = getBioforestChainConfig('bfmeta')
      
      expect(config.prefix).toBe('c')
      expect(config.decimals).toBe(8)
      expect(config.symbol).toBe('BFT')
      expect(config.name).toBe('BFMeta')
    })

    it('should throw for invalid chain', () => {
      expect(() => getBioforestChainConfig('invalid' as BioforestChainType))
        .toThrow('Unsupported BioForest chain')
    })
  })

  describe('signMessage and verifySignature', () => {
    it('should sign and verify string message', () => {
      const keypair = createBioforestKeypair('test')
      const message = 'Hello, BioForest!'
      
      const signature = signMessage(message, keypair.secretKey)
      
      expect(signature.length).toBe(64)
      expect(verifySignature(message, signature, keypair.publicKey)).toBe(true)
    })

    it('should sign and verify bytes message', () => {
      const keypair = createBioforestKeypair('test')
      const message = new Uint8Array([1, 2, 3, 4, 5])
      
      const signature = signMessage(message, keypair.secretKey)
      
      expect(verifySignature(message, signature, keypair.publicKey)).toBe(true)
    })

    it('should fail verification with wrong message', () => {
      const keypair = createBioforestKeypair('test')
      const message = 'Original message'
      
      const signature = signMessage(message, keypair.secretKey)
      
      expect(verifySignature('Wrong message', signature, keypair.publicKey)).toBe(false)
    })

    it('should fail verification with wrong public key', () => {
      const keypair1 = createBioforestKeypair('secret1')
      const keypair2 = createBioforestKeypair('secret2')
      const message = 'Test message'
      
      const signature = signMessage(message, keypair1.secretKey)
      
      expect(verifySignature(message, signature, keypair2.publicKey)).toBe(false)
    })
  })

  describe('Compatibility with mpay reference', () => {
    // 这些测试用于验证与 mpay 实现的兼容性
    // 使用 README 中的测试用例: createKeypair("123")
    
    it('should generate consistent keypair for "123"', () => {
      const keypair = createBioforestKeypair('123')
      const address = publicKeyToBioforestAddress(keypair.publicKey, 'c')
      
      // 验证地址格式正确
      expect(address.startsWith('c')).toBe(true)
      expect(isValidBioforestAddress(address)).toBe(true)
      
      // 输出用于与 mpay 对比
      console.log('Secret "123" derived values:')
      console.log('  Public Key:', bytesToHex(keypair.publicKey))
      console.log('  Address:', address)
    })
  })
})
