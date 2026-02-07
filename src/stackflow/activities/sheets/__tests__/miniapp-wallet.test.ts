import { beforeEach, describe, expect, it } from 'vitest'
import { walletStore } from '@/stores'
import {
  findMiniappWalletByAddress,
  findMiniappWalletIdByAddress,
  resolveMiniappChainId,
} from '../miniapp-wallet'

describe('miniapp-wallet matcher', () => {
  beforeEach(() => {
    walletStore.setState(() => ({
      wallets: [
        {
          id: 'wallet-1',
          name: 'Wallet 1',
          address: '0xAbCd000000000000000000000000000000000000',
          chain: 'ethereum',
          chainAddresses: [
            {
              chain: 'ethereum',
              address: '0xAbCd000000000000000000000000000000000000',
              publicKey: '0xpub1',
            },
            {
              chain: 'bfmetav2',
              address: 'b_sender_1',
              publicKey: 'pub-bf-1',
            },
          ],
          createdAt: 1,
          themeHue: 30,
        },
      ],
      currentWalletId: 'wallet-1',
      selectedChain: 'bfmetav2',
      chainPreferences: {},
      isLoading: false,
      isInitialized: true,
      migrationRequired: false,
    }))
  })

  it('normalizes chain id to keyapp format', () => {
    expect(resolveMiniappChainId(' BFMetaV2 ')).toBe('bfmetav2')
    expect(resolveMiniappChainId('bfmeta-v2')).toBe('bfmetav2')
  })

  it('matches chain id case-insensitively', () => {
    const result = findMiniappWalletByAddress('ETHEREUM', '0xAbCd000000000000000000000000000000000000')
    expect(result?.wallet.id).toBe('wallet-1')
  })

  it('matches hex address case-insensitively', () => {
    const result = findMiniappWalletByAddress('ethereum', '0xabcd000000000000000000000000000000000000')
    expect(result?.wallet.id).toBe('wallet-1')
  })

  it('matches after trimming chain and address', () => {
    const result = findMiniappWalletByAddress(' BFMetaV2 ', ' b_sender_1 ')
    expect(result?.wallet.id).toBe('wallet-1')
  })

  it('returns wallet id helper result', () => {
    expect(findMiniappWalletIdByAddress('ethereum', '0xabcd000000000000000000000000000000000000')).toBe('wallet-1')
  })

  it('returns null when wallet not found', () => {
    expect(findMiniappWalletByAddress('ethereum', '0x0000000000000000000000000000000000000000')).toBeNull()
    expect(findMiniappWalletIdByAddress('tron', 'T123')).toBeNull()
  })
})
