import { describe, it, expect } from 'vitest'
import {
  toHexChainId,
  parseHexChainId,
  getKeyAppChainId,
  getEvmChainId,
  isEvmChain,
  normalizeChainId,
  EVM_CHAIN_IDS,
} from './chain-id'

describe('chain-id utilities', () => {
  describe('toHexChainId', () => {
    it('should convert decimal to hex', () => {
      expect(toHexChainId(1)).toBe('0x1')
      expect(toHexChainId(56)).toBe('0x38')
      expect(toHexChainId(137)).toBe('0x89')
    })
  })

  describe('parseHexChainId', () => {
    it('should parse hex to decimal', () => {
      expect(parseHexChainId('0x1')).toBe(1)
      expect(parseHexChainId('0x38')).toBe(56)
      expect(parseHexChainId('0x89')).toBe(137)
    })

    it('should throw for invalid hex', () => {
      expect(() => parseHexChainId('38')).toThrow('Invalid hex chain ID')
      expect(() => parseHexChainId('invalid')).toThrow('Invalid hex chain ID')
    })
  })

  describe('getKeyAppChainId', () => {
    it('should map EVM hex chainId to KeyApp ID', () => {
      expect(getKeyAppChainId('0x1')).toBe('ethereum')
      expect(getKeyAppChainId('0x38')).toBe('binance')
    })

    it('should return null for unknown chainId', () => {
      expect(getKeyAppChainId('0x999')).toBeNull()
    })
  })

  describe('getEvmChainId', () => {
    it('should map KeyApp ID to EVM hex chainId', () => {
      expect(getEvmChainId('ethereum')).toBe('0x1')
      expect(getEvmChainId('binance')).toBe('0x38')
    })

    it('should return null for non-EVM chains', () => {
      expect(getEvmChainId('bfmeta')).toBeNull()
      expect(getEvmChainId('tron')).toBeNull()
    })
  })

  describe('isEvmChain', () => {
    it('should return true for EVM chains', () => {
      expect(isEvmChain('ethereum')).toBe(true)
      expect(isEvmChain('binance')).toBe(true)
    })

    it('should return false for non-EVM chains', () => {
      expect(isEvmChain('tron')).toBe(false)
      expect(isEvmChain('bfmeta')).toBe(false)
    })
  })

  describe('normalizeChainId', () => {
    it('should normalize API chain names to KeyApp IDs', () => {
      expect(normalizeChainId('BSC')).toBe('binance')
      expect(normalizeChainId('ETH')).toBe('ethereum')
      expect(normalizeChainId('TRON')).toBe('tron')
    })

    it('should handle lowercase variants', () => {
      expect(normalizeChainId('bsc')).toBe('binance')
      expect(normalizeChainId('eth')).toBe('ethereum')
    })

    it('should return lowercase for unknown chains', () => {
      expect(normalizeChainId('UNKNOWN')).toBe('unknown')
    })
  })

  describe('EVM_CHAIN_IDS', () => {
    it('should contain expected chains', () => {
      expect(EVM_CHAIN_IDS.ethereum).toBe(1)
      expect(EVM_CHAIN_IDS.binance).toBe(56)
    })
  })
})
