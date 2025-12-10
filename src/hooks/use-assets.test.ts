import { describe, it, expect } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAssets, MOCK_ASSETS } from './use-assets'

describe('useAssets', () => {
  it('initializes with mock data by default', () => {
    const { result } = renderHook(() => useAssets())

    expect(result.current.state.chainAssets).toEqual(MOCK_ASSETS)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBeNull()
  })

  it('flattens all assets', () => {
    const { result } = renderHook(() => useAssets())

    // Count total assets from mock data
    const totalAssets = MOCK_ASSETS.reduce((sum, chain) => sum + chain.assets.length, 0)
    expect(result.current.allAssets).toHaveLength(totalAssets)
  })

  it('groups assets by chain', () => {
    const { result } = renderHook(() => useAssets())

    expect(result.current.assetsByChain.get('ethereum')).toBeDefined()
    expect(result.current.assetsByChain.get('bitcoin')).toBeDefined()
    expect(result.current.assetsByChain.get('tron')).toBeDefined()
  })

  it('contains expected asset types', () => {
    const { result } = renderHook(() => useAssets())

    const assetTypes = result.current.allAssets.map((a) => a.assetType)
    expect(assetTypes).toContain('ETH')
    expect(assetTypes).toContain('BTC')
    expect(assetTypes).toContain('USDT')
    expect(assetTypes).toContain('TRX')
  })

  it('refresh sets loading state', async () => {
    const { result } = renderHook(() => useAssets())

    act(() => {
      result.current.refresh()
    })

    expect(result.current.state.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.state.isLoading).toBe(false)
    })
  })

  it('refresh completes successfully with mock data', async () => {
    const { result } = renderHook(() => useAssets())

    await act(async () => {
      await result.current.refresh()
    })

    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBeNull()
    expect(result.current.state.chainAssets).toEqual(MOCK_ASSETS)
  })

  it('initializes empty when useMock is false', () => {
    const { result } = renderHook(() => useAssets({ useMock: false }))

    expect(result.current.state.chainAssets).toEqual([])
    expect(result.current.allAssets).toHaveLength(0)
  })

  it('refresh sets error when useMock is false', async () => {
    const { result } = renderHook(() => useAssets({ useMock: false }))

    await act(async () => {
      await result.current.refresh()
    })

    expect(result.current.state.error).toBe('Real API not implemented')
  })
})
