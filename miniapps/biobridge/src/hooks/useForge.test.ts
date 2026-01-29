import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useForge, type ForgeParams } from './useForge'

vi.mock('@/api', () => ({
  rechargeApi: {
    submitRecharge: vi.fn(),
  },
}))

import { rechargeApi } from '@/api'

const mockBio = {
  request: vi.fn(),
}

const mockForgeParams: ForgeParams = {
  externalChain: 'ETH',
  externalAsset: 'ETH',
  depositAddress: '0x1234567890abcdef1234567890abcdef12345678',
  externalContract: undefined,
  externalDecimals: 18,
  amount: '1.5',
  externalAccount: { address: '0xabcdef1234567890abcdef1234567890abcdef12', chain: 'eth', publicKey: '0x' },
  internalChain: 'bfmeta',
  internalAsset: 'BFM',
  internalAccount: { address: 'bfmeta123', chain: 'bfmeta', publicKey: '0x' },
}

describe('useForge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.bio = mockBio as unknown as typeof window.bio
  })

  afterEach(() => {
    vi.restoreAllMocks()
    window.bio = undefined
  })

  it('should start with idle state', () => {
    const { result } = renderHook(() => useForge())

    expect(result.current.step).toBe('idle')
    expect(result.current.orderId).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('should handle forge flow successfully', async () => {
    mockBio.request
      .mockResolvedValueOnce({ txHash: 'unsigned123' }) // bio_createTransaction
      .mockResolvedValueOnce({ data: '0xsigned123' }) // bio_signTransaction
      .mockResolvedValueOnce({ signature: 'signature123', publicKey: 'pubkey123' }) // bio_signMessage

    vi.mocked(rechargeApi.submitRecharge).mockResolvedValue({ orderId: 'order123' })

    const { result } = renderHook(() => useForge())

    act(() => {
      result.current.forge(mockForgeParams)
    })

    // Should transition through states
    await waitFor(() => {
      expect(result.current.step).toBe('success')
    })

    expect(result.current.orderId).toBe('order123')
    expect(result.current.error).toBeNull()

    // Verify API calls (3 calls: createTx, signTx, signMessage)
    expect(mockBio.request).toHaveBeenCalledTimes(3)
    expect(rechargeApi.submitRecharge).toHaveBeenCalledTimes(1)
  })

  it('should handle missing bio SDK', async () => {
    window.bio = undefined

    const { result } = renderHook(() => useForge())

    act(() => {
      result.current.forge(mockForgeParams)
    })

    await waitFor(() => {
      expect(result.current.step).toBe('error')
    })

    expect(result.current.error).toBe('Bio SDK not available')
  })

  it('should handle transaction creation error', async () => {
    mockBio.request.mockRejectedValueOnce(new Error('User rejected'))

    const { result } = renderHook(() => useForge())

    act(() => {
      result.current.forge(mockForgeParams)
    })

    await waitFor(() => {
      expect(result.current.step).toBe('error')
    })

    expect(result.current.error).toBe('User rejected')
  })

  it('should handle signature error', async () => {
    mockBio.request
      .mockResolvedValueOnce({ txHash: 'unsigned123' })
      .mockResolvedValueOnce({ data: '0xsigned123' })
      .mockRejectedValueOnce(new Error('Signature failed'))

    const { result } = renderHook(() => useForge())

    act(() => {
      result.current.forge(mockForgeParams)
    })

    await waitFor(() => {
      expect(result.current.step).toBe('error')
    })

    expect(result.current.error).toBe('Signature failed')
  })

  it('should handle submit error', async () => {
    mockBio.request
      .mockResolvedValueOnce({ txHash: 'unsigned123' })
      .mockResolvedValueOnce({ data: '0xsigned123' })
      .mockResolvedValueOnce({ signature: 'signature123', publicKey: 'pubkey123' })

    vi.mocked(rechargeApi.submitRecharge).mockRejectedValue(new Error('Server error'))

    const { result } = renderHook(() => useForge())

    act(() => {
      result.current.forge(mockForgeParams)
    })

    await waitFor(() => {
      expect(result.current.step).toBe('error')
    })

    expect(result.current.error).toBe('Server error')
  })

  it('should reset state', async () => {
    mockBio.request.mockRejectedValueOnce(new Error('Test error'))

    const { result } = renderHook(() => useForge())

    act(() => {
      result.current.forge(mockForgeParams)
    })

    await waitFor(() => {
      expect(result.current.step).toBe('error')
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.step).toBe('idle')
    expect(result.current.orderId).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('should build correct fromTrJson for ETH', async () => {
    mockBio.request
      .mockResolvedValueOnce({ txHash: 'unsigned' })
      .mockResolvedValueOnce({ data: '0xsignedEthTx' })
      .mockResolvedValueOnce({ signature: 'sig', publicKey: 'pubkey' })

    vi.mocked(rechargeApi.submitRecharge).mockResolvedValue({ orderId: 'order' })

    const { result } = renderHook(() => useForge())

    act(() => {
      result.current.forge(mockForgeParams)
    })

    await waitFor(() => {
      expect(result.current.step).toBe('success')
    })

    const submitCall = vi.mocked(rechargeApi.submitRecharge).mock.calls[0][0]
    expect(submitCall.fromTrJson).toHaveProperty('eth')
    expect(submitCall.fromTrJson.eth?.signTransData).toBe('0xsignedEthTx')
  })

  it('should scale external amount by decimals when provided', async () => {
    mockBio.request
      .mockResolvedValueOnce({ txHash: 'unsigned123' })
      .mockResolvedValueOnce({ data: '0xsigned123' })
      .mockResolvedValueOnce({ signature: 'signature123', publicKey: 'pubkey123' })

    vi.mocked(rechargeApi.submitRecharge).mockResolvedValue({ orderId: 'order123' })

    const { result } = renderHook(() => useForge())

    act(() => {
      result.current.forge({
        ...mockForgeParams,
        amount: '10',
        externalDecimals: 18,
      })
    })

    await waitFor(() => {
      expect(result.current.step).toBe('success')
    })

    const createTxCall = mockBio.request.mock.calls[0][0] as {
      method: string
      params: Array<{ amount: string }>
    }
    expect(createTxCall.method).toBe('bio_createTransaction')
    expect(createTxCall.params[0]?.amount).toBe('10000000000000000000')
  })

  it('should build correct fromTrJson for BSC', async () => {
    mockBio.request
      .mockResolvedValueOnce({ txHash: 'unsigned' })
      .mockResolvedValueOnce({ data: '0xsignedBscTx' })
      .mockResolvedValueOnce({ signature: 'sig', publicKey: 'pubkey' })

    vi.mocked(rechargeApi.submitRecharge).mockResolvedValue({ orderId: 'order' })

    const { result } = renderHook(() => useForge())

    const bscParams = { ...mockForgeParams, externalChain: 'BSC' as const }

    act(() => {
      result.current.forge(bscParams)
    })

    await waitFor(() => {
      expect(result.current.step).toBe('success')
    })

    const submitCall = vi.mocked(rechargeApi.submitRecharge).mock.calls[0][0]
    expect(submitCall.fromTrJson).toHaveProperty('bsc')
    expect(submitCall.fromTrJson.bsc?.signTransData).toBe('0xsignedBscTx')
  })

  it('should build correct fromTrJson for TRON with base58 address', async () => {
    // TRON depositAddress should be base58 format (starts with T)
    const tronDepositAddress = 'TZ4UXDV5ZhNW7fb2AMSbgfAEZ7hWsnYS2g'
    
    mockBio.request
      .mockResolvedValueOnce({ txHash: 'unsigned' })
      .mockResolvedValueOnce({ data: { txID: 'tronTxId123', signature: ['sig'] } })
      .mockResolvedValueOnce({ signature: 'sig', publicKey: 'pubkey' })

    vi.mocked(rechargeApi.submitRecharge).mockResolvedValue({ orderId: 'order' })

    const { result } = renderHook(() => useForge())

    const tronParams: ForgeParams = {
      ...mockForgeParams,
      externalChain: 'TRON',
      externalAsset: 'TRX',
      depositAddress: tronDepositAddress,
      externalContract: undefined,
      externalAccount: { address: 'TUserAddress123456789012345678901234', chain: 'tron', publicKey: '' },
    }

    act(() => {
      result.current.forge(tronParams)
    })

    await waitFor(() => {
      expect(result.current.step).toBe('success')
    })

    // Verify bio_createTransaction was called with correct depositAddress
    const createTxCall = mockBio.request.mock.calls[0]
    expect(createTxCall[0].method).toBe('bio_createTransaction')
    expect(createTxCall[0].params[0].to).toBe(tronDepositAddress)

    const submitCall = vi.mocked(rechargeApi.submitRecharge).mock.calls[0][0]
    expect(submitCall.fromTrJson).toHaveProperty('tron')
  })

  it('should build correct fromTrJson for TRC20 when contract is provided', async () => {
    const tronDepositAddress = 'TZ4UXDV5ZhNW7fb2AMSbgfAEZ7hWsnYS2g'

    mockBio.request
      .mockResolvedValueOnce({ txHash: 'unsigned' })
      .mockResolvedValueOnce({ data: { txID: 'tronTxId123', signature: ['sig'] } })
      .mockResolvedValueOnce({ signature: 'sig', publicKey: 'pubkey' })

    vi.mocked(rechargeApi.submitRecharge).mockResolvedValue({ orderId: 'order' })

    const { result } = renderHook(() => useForge())

    const tronParams: ForgeParams = {
      ...mockForgeParams,
      externalChain: 'TRON',
      externalAsset: 'USDT',
      depositAddress: tronDepositAddress,
      externalContract: 'TABCDEF1234567890abcdef1234567890abcd',
      externalAccount: { address: 'TUserAddress123456789012345678901234', chain: 'tron', publicKey: '' },
    }

    act(() => {
      result.current.forge(tronParams)
    })

    await waitFor(() => {
      expect(result.current.step).toBe('success')
    })

    const submitCall = vi.mocked(rechargeApi.submitRecharge).mock.calls[0][0]
    expect(submitCall.fromTrJson).toHaveProperty('trc20')
  })

  it('should handle TRON transaction with 0x address format error', async () => {
    // This test verifies early validation catches invalid address format
    const invalidTronAddress = '0x1234567890abcdef1234567890abcdef12345678'

    const { result } = renderHook(() => useForge())

    const tronParams: ForgeParams = {
      ...mockForgeParams,
      externalChain: 'TRON',
      externalAsset: 'TRX',
      depositAddress: invalidTronAddress,
      externalAccount: { address: 'TUserAddress123456789012345678901234', chain: 'tron', publicKey: '' },
    }

    act(() => {
      result.current.forge(tronParams)
    })

    await waitFor(() => {
      expect(result.current.step).toBe('error')
    })

    // Should get a helpful error about address format, not a cryptic base58 error
    expect(result.current.error).toContain('Invalid TRON address')
    expect(result.current.error).toContain('EVM format')
    
    // bio.request should NOT have been called since we catch the error early
    expect(mockBio.request).not.toHaveBeenCalled()
  })
})
