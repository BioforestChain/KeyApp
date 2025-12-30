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
  depositAddress: '0xdeposit123',
  amount: '1.5',
  externalAccount: { address: '0xexternal123', chain: 'eth' },
  internalChain: 'bfmeta',
  internalAsset: 'BFM',
  internalAccount: { address: 'bfmeta123', chain: 'bfmeta' },
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
})
