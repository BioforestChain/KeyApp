import { describe, it, expect, beforeEach } from 'vitest'
import { handleChainId } from './wallet'
import { walletStore } from '@/stores/wallet'
import type { HandlerContext } from '../types'

describe('handleChainId', () => {
  const mockContext: HandlerContext = {
    appId: 'test-app',
    appName: 'Test App',
    origin: 'https://test.com',
    permissions: [],
  }

  beforeEach(() => {
    // Reset store state
    walletStore.setState(() => ({
      wallets: [],
      currentWalletId: null,
      selectedChain: 'bfmeta',
      chainPreferences: {},
      isLoading: false,
      isInitialized: false,
      migrationRequired: false,
    }))
  })

  it('should return the currently selected chain ID', async () => {
    // Set a different chain
    walletStore.setState((state) => ({
      ...state,
      selectedChain: 'ethereum',
    }))

    const chainId = await handleChainId({}, mockContext)
    expect(chainId).toBe('ethereum')
  })

  it('should return bfmeta if that is the selected chain', async () => {
    walletStore.setState((state) => ({
      ...state,
      selectedChain: 'bfmeta',
    }))

    const chainId = await handleChainId({}, mockContext)
    expect(chainId).toBe('bfmeta')
  })
})
