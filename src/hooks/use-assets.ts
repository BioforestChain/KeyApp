import { useState, useCallback, useMemo } from 'react'
import type { AssetInfo, ChainAssets, AssetState } from '@/types/asset'

/** Mock assets for development */
const MOCK_ASSETS: ChainAssets[] = [
  {
    chain: 'ethereum',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f5Ef71',
    assets: [
      {
        assetType: 'ETH',
        name: 'Ethereum',
        amount: '1500000000000000000', // 1.5 ETH
        decimals: 18,
        logoUrl: undefined,
      },
      {
        assetType: 'USDT',
        name: 'Tether USD',
        amount: '100000000', // 100 USDT
        decimals: 6,
        contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        logoUrl: undefined,
      },
      {
        assetType: 'USDC',
        name: 'USD Coin',
        amount: '50000000', // 50 USDC
        decimals: 6,
        contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        logoUrl: undefined,
      },
    ],
  },
  {
    chain: 'bitcoin',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    assets: [
      {
        assetType: 'BTC',
        name: 'Bitcoin',
        amount: '50000000', // 0.5 BTC
        decimals: 8,
        logoUrl: undefined,
      },
    ],
  },
  {
    chain: 'tron',
    address: 'TJYzTzjSQJZeyZQgWn9gFxoGdTQMPcGQcx',
    assets: [
      {
        assetType: 'TRX',
        name: 'TRON',
        amount: '10000000000', // 10000 TRX
        decimals: 6,
        logoUrl: undefined,
      },
    ],
  },
  {
    chain: 'bfmeta',
    address: 'BFMabcdef1234567890',
    assets: [
      {
        assetType: 'BFM',
        name: 'BioForest Meta',
        amount: '500000000000', // 5000 BFM
        decimals: 8,
        logoUrl: undefined,
      },
    ],
  },
]

interface UseAssetsOptions {
  /** Use mock data (default: true for development) */
  useMock?: boolean
}

interface UseAssetsReturn {
  /** Asset state */
  state: AssetState
  /** All assets flattened */
  allAssets: AssetInfo[]
  /** Assets by chain */
  assetsByChain: Map<string, AssetInfo[]>
  /** Refresh assets */
  refresh: () => Promise<void>
}

/**
 * Hook for managing asset state
 * Uses mock data for development, can be extended for real API
 */
export function useAssets(options: UseAssetsOptions = {}): UseAssetsReturn {
  const { useMock = true } = options

  const [state, setState] = useState<AssetState>({
    chainAssets: useMock ? MOCK_ASSETS : [],
    isLoading: false,
    error: null,
  })

  // Flatten all assets
  const allAssets = useMemo(() => {
    return state.chainAssets.flatMap((chain) => chain.assets)
  }, [state.chainAssets])

  // Group by chain
  const assetsByChain = useMemo(() => {
    const map = new Map<string, AssetInfo[]>()
    for (const chainAsset of state.chainAssets) {
      map.set(chainAsset.chain, chainAsset.assets)
    }
    return map
  }, [state.chainAssets])

  // Refresh (mock implementation)
  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (useMock) {
        setState({
          chainAssets: MOCK_ASSETS,
          isLoading: false,
          error: null,
        })
      } else {
        // TODO: Implement real API call
        throw new Error('Real API not implemented')
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }))
    }
  }, [useMock])

  return {
    state,
    allAssets,
    assetsByChain,
    refresh,
  }
}

export { MOCK_ASSETS }
