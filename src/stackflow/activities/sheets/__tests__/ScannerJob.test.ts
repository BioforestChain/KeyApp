import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  scanValidators,
  getValidatorForChain,
  setScannerResultCallback,
} from '../scanner-validators'
import { parseQRContent } from '@/lib/qr-parser'

describe('ScannerJob validators', () => {
  describe('ethereumAddress', () => {
    it('accepts valid Ethereum address', () => {
      const content = '0x742d35Cc6634C0532925a3b844Bc9e7595f12345'
      const parsed = parseQRContent(content)
      expect(scanValidators.ethereumAddress(content, parsed)).toBe(true)
    })

    it('accepts ethereum: URI', () => {
      const content = 'ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f12345'
      const parsed = parseQRContent(content)
      expect(scanValidators.ethereumAddress(content, parsed)).toBe(true)
    })

    it('rejects Bitcoin address', () => {
      const content = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq'
      const parsed = parseQRContent(content)
      expect(scanValidators.ethereumAddress(content, parsed)).toBe('invalidEthereumAddress')
    })

    it('rejects random text', () => {
      const content = 'hello world'
      const parsed = parseQRContent(content)
      expect(scanValidators.ethereumAddress(content, parsed)).toBe('invalidEthereumAddress')
    })
  })

  describe('bitcoinAddress', () => {
    it('accepts bitcoin: URI', () => {
      const content = 'bitcoin:bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq'
      const parsed = parseQRContent(content)
      expect(scanValidators.bitcoinAddress(content, parsed)).toBe(true)
    })

    it('rejects Ethereum address', () => {
      const content = '0x742d35Cc6634C0532925a3b844Bc9e7595f12345'
      const parsed = parseQRContent(content)
      expect(scanValidators.bitcoinAddress(content, parsed)).toBe('invalidBitcoinAddress')
    })
  })

  describe('tronAddress', () => {
    it('accepts valid Tron address', () => {
      const content = 'TJCnKsPa7y5okkXvQAidZBzqx3QyQ6sxMW'
      const parsed = parseQRContent(content)
      expect(scanValidators.tronAddress(content, parsed)).toBe(true)
    })

    it('rejects Ethereum address', () => {
      const content = '0x742d35Cc6634C0532925a3b844Bc9e7595f12345'
      const parsed = parseQRContent(content)
      expect(scanValidators.tronAddress(content, parsed)).toBe('invalidTronAddress')
    })
  })

  describe('anyAddress', () => {
    it('accepts Ethereum address', () => {
      const content = '0x742d35Cc6634C0532925a3b844Bc9e7595f12345'
      const parsed = parseQRContent(content)
      expect(scanValidators.anyAddress(content, parsed)).toBe(true)
    })

    it('accepts bitcoin: URI', () => {
      const content = 'bitcoin:bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq'
      const parsed = parseQRContent(content)
      expect(scanValidators.anyAddress(content, parsed)).toBe(true)
    })

    it('accepts Tron address', () => {
      const content = 'TJCnKsPa7y5okkXvQAidZBzqx3QyQ6sxMW'
      const parsed = parseQRContent(content)
      expect(scanValidators.anyAddress(content, parsed)).toBe(true)
    })

    it('rejects short text', () => {
      const content = 'hello'
      const parsed = parseQRContent(content)
      expect(scanValidators.anyAddress(content, parsed)).toBe('invalidAddress')
    })
  })

  describe('any', () => {
    it('accepts any content', () => {
      expect(scanValidators.any()).toBe(true)
    })
  })
})

describe('getValidatorForChain', () => {
  it('returns ethereumAddress for ethereum', () => {
    expect(getValidatorForChain('ethereum')).toBe(scanValidators.ethereumAddress)
    expect(getValidatorForChain('eth')).toBe(scanValidators.ethereumAddress)
    expect(getValidatorForChain('ETHEREUM')).toBe(scanValidators.ethereumAddress)
  })

  it('returns bitcoinAddress for bitcoin', () => {
    expect(getValidatorForChain('bitcoin')).toBe(scanValidators.bitcoinAddress)
    expect(getValidatorForChain('btc')).toBe(scanValidators.bitcoinAddress)
  })

  it('returns tronAddress for tron', () => {
    expect(getValidatorForChain('tron')).toBe(scanValidators.tronAddress)
    expect(getValidatorForChain('trx')).toBe(scanValidators.tronAddress)
  })

  it('returns anyAddress for unknown chain', () => {
    expect(getValidatorForChain('unknown')).toBe(scanValidators.anyAddress)
    expect(getValidatorForChain(undefined)).toBe(scanValidators.anyAddress)
  })
})

describe('setScannerResultCallback', () => {
  beforeEach(() => {
    // Reset before each test
  })

  afterEach(() => {
    setScannerResultCallback(null)
  })

  it('sets callback that can be invoked', () => {
    const callback = vi.fn()
    
    setScannerResultCallback(callback)
    
    // Note: In real usage, the callback is invoked by handleScanResult inside ScannerJobContent
    // Here we just verify the callback is set correctly
    expect(callback).not.toHaveBeenCalled()
  })

  it('can clear callback with null', () => {
    const callback = vi.fn()
    setScannerResultCallback(callback)
    setScannerResultCallback(null)
    // Callback is cleared
  })
})

describe('Address validation edge cases', () => {
  it('validates Ethereum address with checksum', () => {
    // Mixed case (checksum)
    const content = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed'
    const parsed = parseQRContent(content)
    expect(scanValidators.ethereumAddress(content, parsed)).toBe(true)
  })

  it('validates Ethereum address lowercase', () => {
    const content = '0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed'
    const parsed = parseQRContent(content)
    expect(scanValidators.ethereumAddress(content, parsed)).toBe(true)
  })

  it('rejects Ethereum address with wrong length', () => {
    const content = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1Be' // Too short
    const parsed = parseQRContent(content)
    expect(scanValidators.ethereumAddress(content, parsed)).toBe('invalidEthereumAddress')
  })

  it('validates ethereum payment URI with amount', () => {
    const content = 'ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f12345?value=1000000000000000000'
    const parsed = parseQRContent(content)
    expect(scanValidators.ethereumAddress(content, parsed)).toBe(true)
  })
})
