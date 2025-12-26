import { describe, it, expect } from 'vitest'
import {
  parseQRContent,
  detectAddressChain,
  generateContactQRContent,
  type ParsedAddress,
  type ParsedPayment,
  type ParsedContact,
  type ParsedUnknown,
} from './qr-parser'

describe('qr-parser', () => {
  describe('detectAddressChain', () => {
    it('detects Ethereum address', () => {
      expect(detectAddressChain('0x742d35Cc6634C0532925a3b844Bc9e7595f123ab')).toBe('ethereum')
      expect(detectAddressChain('0x0000000000000000000000000000000000000000')).toBe('ethereum')
    })

    it('detects Bitcoin legacy address', () => {
      expect(detectAddressChain('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2')).toBe('bitcoin')
      expect(detectAddressChain('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy')).toBe('bitcoin')
    })

    it('detects Bitcoin native segwit address', () => {
      expect(detectAddressChain('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq')).toBe('bitcoin')
    })

    it('detects Tron address', () => {
      expect(detectAddressChain('TKqAaDJMYTu9ZLJxytoYT8wEhHLmdxozap')).toBe('tron')
      expect(detectAddressChain('TWsm8HtU2A5eEzoT8ev8yaoFjHsXLLrckb')).toBe('tron')
    })

    it('returns unknown for invalid addresses', () => {
      expect(detectAddressChain('hello world')).toBe('unknown')
      expect(detectAddressChain('0x123')).toBe('unknown') // Too short
      expect(detectAddressChain('')).toBe('unknown')
    })
  })

  describe('parseQRContent', () => {
    describe('plain addresses', () => {
      it('parses plain Ethereum address', () => {
        const result = parseQRContent('0x742d35Cc6634C0532925a3b844Bc9e7595f123ab')
        expect(result).toEqual<ParsedAddress>({
          type: 'address',
          chain: 'ethereum',
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f123ab',
        })
      })

      it('parses plain Bitcoin address', () => {
        const result = parseQRContent('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2')
        expect(result).toEqual<ParsedAddress>({
          type: 'address',
          chain: 'bitcoin',
          address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
        })
      })

      it('parses plain Tron address', () => {
        const result = parseQRContent('TKqAaDJMYTu9ZLJxytoYT8wEhHLmdxozap')
        expect(result).toEqual<ParsedAddress>({
          type: 'address',
          chain: 'tron',
          address: 'TKqAaDJMYTu9ZLJxytoYT8wEhHLmdxozap',
        })
      })

      it('trims whitespace', () => {
        const result = parseQRContent('  0x742d35Cc6634C0532925a3b844Bc9e7595f123ab  ')
        expect(result.type).toBe('address')
        expect((result as ParsedAddress).address).toBe('0x742d35Cc6634C0532925a3b844Bc9e7595f123ab')
      })
    })

    describe('ethereum: URI', () => {
      it('parses simple ethereum: address', () => {
        const result = parseQRContent('ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f123ab')
        expect(result).toEqual<ParsedAddress>({
          type: 'address',
          chain: 'ethereum',
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f123ab',
        })
      })

      it('parses ethereum: payment with value', () => {
        const result = parseQRContent(
          'ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f123ab?value=1000000000000000000'
        )
        expect(result).toEqual<ParsedPayment>({
          type: 'payment',
          chain: 'ethereum',
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f123ab',
          amount: '1000000000000000000',
          data: undefined,
          gasLimit: undefined,
          gasPrice: undefined,
          chainId: undefined,
        })
      })

      it('parses ethereum: payment with data', () => {
        const result = parseQRContent(
          'ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f123ab?data=0xa9059cbb'
        )
        expect(result.type).toBe('payment')
        expect((result as ParsedPayment).data).toBe('0xa9059cbb')
      })

      it('parses ethereum: payment with all params', () => {
        const result = parseQRContent(
          'ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f123ab?value=100&data=0x123&gasLimit=21000&gasPrice=20000000000&chainId=1'
        )
        const payment = result as ParsedPayment
        expect(payment.type).toBe('payment')
        expect(payment.amount).toBe('100')
        expect(payment.data).toBe('0x123')
        expect(payment.gasLimit).toBe('21000')
        expect(payment.gasPrice).toBe('20000000000')
        expect(payment.chainId).toBe(1)
      })

      it('handles EIP-681 format with chain_id', () => {
        const result = parseQRContent(
          'ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f123ab@1'
        )
        expect(result).toEqual<ParsedAddress>({
          type: 'address',
          chain: 'ethereum',
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f123ab',
        })
      })
    })

    describe('bitcoin: URI', () => {
      it('parses simple bitcoin: address', () => {
        const result = parseQRContent('bitcoin:1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2')
        expect(result).toEqual<ParsedAddress>({
          type: 'address',
          chain: 'bitcoin',
          address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
        })
      })

      it('parses bitcoin: payment with amount (BTC to satoshi)', () => {
        const result = parseQRContent('bitcoin:1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2?amount=0.001')
        expect(result).toEqual<ParsedPayment>({
          type: 'payment',
          chain: 'bitcoin',
          address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
          amount: '100000', // 0.001 BTC = 100000 satoshi
        })
      })

      it('converts 1 BTC to satoshi', () => {
        const result = parseQRContent('bitcoin:1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2?amount=1')
        expect((result as ParsedPayment).amount).toBe('100000000') // 1 BTC = 100000000 satoshi
      })
    })

    describe('tron: URI', () => {
      it('parses simple tron: address', () => {
        const result = parseQRContent('tron:TKqAaDJMYTu9ZLJxytoYT8wEhHLmdxozap')
        expect(result).toEqual<ParsedAddress>({
          type: 'address',
          chain: 'tron',
          address: 'TKqAaDJMYTu9ZLJxytoYT8wEhHLmdxozap',
        })
      })

      it('parses tron: payment with amount', () => {
        const result = parseQRContent('tron:TKqAaDJMYTu9ZLJxytoYT8wEhHLmdxozap?amount=1000000')
        expect(result).toEqual<ParsedPayment>({
          type: 'payment',
          chain: 'tron',
          address: 'TKqAaDJMYTu9ZLJxytoYT8wEhHLmdxozap',
          amount: '1000000',
        })
      })

      it('parses tron: payment with value param', () => {
        const result = parseQRContent('tron:TKqAaDJMYTu9ZLJxytoYT8wEhHLmdxozap?value=500000')
        expect((result as ParsedPayment).amount).toBe('500000')
      })
    })

    describe('unknown content', () => {
      it('returns unknown for random text', () => {
        const result = parseQRContent('Hello World')
        expect(result).toEqual<ParsedUnknown>({
          type: 'unknown',
          content: 'Hello World',
        })
      })

      it('returns unknown for URLs', () => {
        const result = parseQRContent('https://example.com')
        expect(result.type).toBe('unknown')
        expect((result as ParsedUnknown).content).toBe('https://example.com')
      })

      it('returns unknown for empty string', () => {
        const result = parseQRContent('')
        expect(result.type).toBe('unknown')
      })
    })
  })

  describe('scanQRFromImageData', () => {
    it.skip('returns null for empty image data (requires browser ImageData)', () => {
      // ImageData is not available in Node.js/jsdom without canvas polyfill
      // This test requires browser environment
    })
  })

  describe('contact protocol', () => {
    describe('JSON format', () => {
      it('parses valid contact JSON', () => {
        const content = '{"type":"contact","name":"张三","addresses":[{"chainType":"ethereum","address":"0x742d35Cc6634C0532925a3b844Bc9e7595f12345"}]}'
        const result = parseQRContent(content)
        expect(result.type).toBe('contact')
        const contact = result as ParsedContact
        expect(contact.name).toBe('张三')
        expect(contact.addresses).toHaveLength(1)
        // 旧格式的 chainType 会被用作 label
        expect(contact.addresses[0]?.label).toBe('ethereum')
        expect(contact.addresses[0]?.address).toBe('0x742d35Cc6634C0532925a3b844Bc9e7595f12345')
      })

      it('parses contact with multiple addresses', () => {
        const content = JSON.stringify({
          type: 'contact',
          name: '李四',
          addresses: [
            { label: 'ETH', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f12345' },
            { label: 'BTC', address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq' },
            { label: 'TRX', address: 'TJCnKsPa7y5okkXvQAidZBzqx3QyQ6sxMW' },
          ],
        })
        const result = parseQRContent(content)
        expect(result.type).toBe('contact')
        const contact = result as ParsedContact
        expect(contact.addresses).toHaveLength(3)
      })

      it('parses contact with memo and avatar', () => {
        const content = JSON.stringify({
          type: 'contact',
          name: '王五',
          addresses: [{ label: 'ETH', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f12345' }],
          memo: '好友',
          avatar: '👨‍💼',
        })
        const result = parseQRContent(content)
        expect(result.type).toBe('contact')
        const contact = result as ParsedContact
        expect(contact.memo).toBe('好友')
        expect(contact.avatar).toBe('👨‍💼')
      })

      it('returns unknown for contact without name', () => {
        const content = '{"type":"contact","name":"","addresses":[{"chainType":"ethereum","address":"0x742d35Cc6634C0532925a3b844Bc9e7595f12345"}]}'
        const result = parseQRContent(content)
        // Empty name should fail validation
        expect(result.type).toBe('unknown')
      })

      it('returns unknown for contact without addresses', () => {
        const content = '{"type":"contact","name":"测试","addresses":[]}'
        const result = parseQRContent(content)
        expect(result.type).toBe('unknown')
      })

      it('returns unknown for non-contact type JSON', () => {
        const content = '{"type":"other","data":"test"}'
        const result = parseQRContent(content)
        expect(result.type).toBe('unknown')
      })

      it('returns unknown for invalid JSON', () => {
        const content = '{"type":"contact",invalid}'
        const result = parseQRContent(content)
        expect(result.type).toBe('unknown')
      })
    })

    describe('URI format', () => {
      it('parses contact:// URI with ETH address', () => {
        const content = 'contact://张三?eth=0x742d35Cc6634C0532925a3b844Bc9e7595f12345'
        const result = parseQRContent(content)
        expect(result.type).toBe('contact')
        const contact = result as ParsedContact
        expect(contact.name).toBe('张三')
        expect(contact.addresses).toHaveLength(1)
        expect(contact.addresses[0]?.label).toBe('ETH')
      })

      it('parses contact:// URI with multiple addresses', () => {
        const content = 'contact://测试?eth=0x742d35Cc6634C0532925a3b844Bc9e7595f12345&btc=bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq'
        const result = parseQRContent(content)
        expect(result.type).toBe('contact')
        const contact = result as ParsedContact
        expect(contact.addresses).toHaveLength(2)
      })

      it('parses contact:// URI with memo', () => {
        const content = 'contact://张三?eth=0x742d35Cc6634C0532925a3b844Bc9e7595f12345&memo=%E5%A5%BD%E5%8F%8B'
        const result = parseQRContent(content)
        expect(result.type).toBe('contact')
        const contact = result as ParsedContact
        expect(contact.memo).toBe('好友')
      })

      it('returns unknown for contact:// without valid addresses', () => {
        const content = 'contact://张三?memo=test'
        const result = parseQRContent(content)
        expect(result.type).toBe('unknown')
      })

      it('returns unknown for contact:// without name', () => {
        const content = 'contact://?eth=0x742d35Cc6634C0532925a3b844Bc9e7595f12345'
        const result = parseQRContent(content)
        expect(result.type).toBe('unknown')
      })
    })

    describe('generateContactQRContent', () => {
      it('generates valid JSON for single address', () => {
        const content = generateContactQRContent({
          name: '张三',
          addresses: [{ label: 'ETH', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f12345' }],
        })
        const parsed = JSON.parse(content)
        expect(parsed.type).toBe('contact')
        expect(parsed.name).toBe('张三')
        expect(parsed.addresses).toHaveLength(1)
      })

      it('generates content that can be parsed back', () => {
        const original = {
          name: '李四',
          addresses: [
            { label: 'ETH' as const, address: '0x742d35Cc6634C0532925a3b844Bc9e7595f12345' },
            { label: 'BTC' as const, address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq' },
          ],
          avatar: '👩‍💻',
        }
        const content = generateContactQRContent(original)
        const result = parseQRContent(content)
        expect(result.type).toBe('contact')
        const contact = result as ParsedContact
        expect(contact.name).toBe(original.name)
        expect(contact.addresses).toHaveLength(2)
        expect(contact.avatar).toBe(original.avatar)
        // memo 不应该被包含在分享内容中
        expect(contact.memo).toBeUndefined()
      })

      it('handles special characters in name', () => {
        const content = generateContactQRContent({
          name: '张三 (老板)',
          addresses: [{ label: 'ETH', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f12345' }],
        })
        const result = parseQRContent(content)
        expect(result.type).toBe('contact')
        expect((result as ParsedContact).name).toBe('张三 (老板)')
      })
    })
  })
})
