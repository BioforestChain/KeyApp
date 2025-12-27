import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useChainIconUrls } from './useChainIconUrls'

// Mock useChainConfigs
vi.mock('@/stores', () => ({
  useChainConfigs: vi.fn(),
}))

import { useChainConfigs } from '@/stores'

describe('useChainIconUrls', () => {
  it('returns empty object when no chain configs', () => {
    vi.mocked(useChainConfigs).mockReturnValue([])

    const { result } = renderHook(() => useChainIconUrls())

    expect(result.current).toEqual({})
  })

  it('maps chain ids to icon urls', () => {
    vi.mocked(useChainConfigs).mockReturnValue([
      { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', icon: '/icons/eth.svg' },
      { id: 'tron', name: 'Tron', symbol: 'TRX', icon: '/icons/tron.svg' },
      { id: 'bfmeta', name: 'BFMeta', symbol: 'BFM', icon: '/icons/bfm.svg' },
    ] as ReturnType<typeof useChainConfigs>)

    const { result } = renderHook(() => useChainIconUrls())

    expect(result.current).toEqual({
      ethereum: '/icons/eth.svg',
      tron: '/icons/tron.svg',
      bfmeta: '/icons/bfm.svg',
    })
  })

  it('excludes chains without icons', () => {
    vi.mocked(useChainConfigs).mockReturnValue([
      { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', icon: '/icons/eth.svg' },
      { id: 'tron', name: 'Tron', symbol: 'TRX', icon: undefined },
      { id: 'bfmeta', name: 'BFMeta', symbol: 'BFM', icon: '' },
    ] as ReturnType<typeof useChainConfigs>)

    const { result } = renderHook(() => useChainIconUrls())

    expect(result.current).toEqual({
      ethereum: '/icons/eth.svg',
    })
  })

  it('memoizes result based on chain configs', () => {
    const configs = [
      { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', icon: '/icons/eth.svg' },
    ] as ReturnType<typeof useChainConfigs>

    vi.mocked(useChainConfigs).mockReturnValue(configs)

    const { result, rerender } = renderHook(() => useChainIconUrls())
    const firstResult = result.current

    // Re-render with same configs
    rerender()
    expect(result.current).toBe(firstResult)

    // Update configs
    vi.mocked(useChainConfigs).mockReturnValue([
      ...configs,
      { id: 'tron', name: 'Tron', symbol: 'TRX', icon: '/icons/tron.svg' },
    ] as ReturnType<typeof useChainConfigs>)

    rerender()
    expect(result.current).not.toBe(firstResult)
    expect(result.current).toEqual({
      ethereum: '/icons/eth.svg',
      tron: '/icons/tron.svg',
    })
  })

  it('handles various icon url formats', () => {
    vi.mocked(useChainConfigs).mockReturnValue([
      { id: 'chain1', name: 'Chain 1', symbol: 'C1', icon: '/local/icon.svg' },
      { id: 'chain2', name: 'Chain 2', symbol: 'C2', icon: 'https://cdn.example.com/icon.png' },
      { id: 'chain3', name: 'Chain 3', symbol: 'C3', icon: 'data:image/svg+xml;base64,PHN2Zy4uLg==' },
    ] as ReturnType<typeof useChainConfigs>)

    const { result } = renderHook(() => useChainIconUrls())

    expect(result.current).toEqual({
      chain1: '/local/icon.svg',
      chain2: 'https://cdn.example.com/icon.png',
      chain3: 'data:image/svg+xml;base64,PHN2Zy4uLg==',
    })
  })
})
