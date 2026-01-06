import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
import { EthWalletProvider, createEthwalletProvider } from '../ethwallet-provider'
import type { ParsedApiEntry } from '@/services/chain-config'

vi.mock('@/services/chain-config', () => ({
  chainConfigService: {
    getSymbol: () => 'ETH',
    getDecimals: () => 18,
  },
}))

const mockFetch = vi.fn()
const originalFetch = global.fetch
global.fetch = mockFetch

afterAll(() => {
  global.fetch = originalFetch
})

describe('EthWalletProvider', () => {
  const entry: ParsedApiEntry = {
    type: 'ethwallet-v1',
    endpoint: 'https://walletapi.example.com/wallet/eth',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createEthwalletProvider creates provider for ethwallet-v1', () => {
    const provider = createEthwalletProvider(entry, 'ethereum')
    expect(provider).toBeInstanceOf(EthWalletProvider)
  })

  it('maps balance string to Amount', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ success: true, result: '1000000000000000000' }) })

    const provider = new EthWalletProvider(entry, 'ethereum')
    const balance = await provider.getNativeBalance('0xabc')

    expect(balance.symbol).toBe('ETH')
    expect(balance.amount.raw).toBe(1000000000000000000n)
  })

  it('aggregates normal + erc20 history by hash and prioritizes token asset', async () => {
    const user = '0x75a6F48BF634868b2980c97CcEf467A127597e08'
    const hash = '0xabc123'

    const nativeTx = {
      hash,
      from: user,
      to: '0xContract',
      value: '0',
      timeStamp: '1700000000',
      isError: '0',
      blockNumber: '123',
      methodId: '0xa9059cbb',
      functionName: 'transfer(address,uint256)',
    }
    const tokenTx = {
      hash,
      from: user,
      to: '0xReceiver',
      value: '3000000',
      timeStamp: '1700000000',
      blockNumber: '123',
      tokenSymbol: 'USDT',
      tokenName: 'Tether USD',
      tokenDecimal: '6',
      contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    }

    mockFetch.mockImplementation(async (url: string, init?: RequestInit) => {
      if (url.endsWith('/trans/normal/history')) {
        expect(init?.method).toBe('POST')
        return { ok: true, json: async () => ({ success: true, result: { status: '1', result: [nativeTx] } }) }
      }
      if (url.endsWith('/trans/erc20/history')) {
        expect(init?.method).toBe('POST')
        return { ok: true, json: async () => ({ success: true, result: { status: '1', result: [tokenTx] } }) }
      }
      return { ok: true, json: async () => ({ success: true, result: { status: '1', result: [] } }) }
    })

    const provider = new EthWalletProvider(entry, 'ethereum')
    const txs = await provider.getTransactionHistory(user, 10)

    expect(txs).toHaveLength(1)
    expect(txs[0].hash).toBe(hash)
    expect(txs[0].assets[0]).toMatchObject({
      assetType: 'token',
      symbol: 'USDT',
      decimals: 6,
      contractAddress: tokenTx.contractAddress,
      value: tokenTx.value,
    })
  })
})
