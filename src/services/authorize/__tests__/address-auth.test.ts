import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AddressAuthService } from '../address-auth'
import { WALLET_PLAOC_PATH } from '../paths'
import type { IPlaocAdapter } from '../types'
import type { Wallet } from '@/stores'
import type { EncryptedData } from '@/lib/crypto'
import * as crypto from '@/lib/crypto'

vi.mock('@/lib/crypto', async () => {
  const actual = await vi.importActual<typeof import('@/lib/crypto')>('@/lib/crypto')
  return {
    ...actual,
    verifyPassword: vi.fn(),
    decrypt: vi.fn(),
  }
})

function createWallet(partial?: Partial<Wallet>): Wallet {
  return {
    id: 'w1',
    name: 'Wallet 1',
    address: '0xmain',
    chain: 'ethereum',
    chainAddresses: [
      { chain: 'ethereum', address: '0xmain', tokens: [] },
      { chain: 'bfmeta', address: 'c123', tokens: [] },
    ],
    createdAt: Date.now(),
    tokens: [],
    ...partial,
  }
}

describe('AddressAuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('handleNetworkAddresses returns addresses across wallets for the selected chain', () => {
    const adapter: IPlaocAdapter = {
      getCallerAppInfo: vi.fn(),
      respondWith: vi.fn(),
      removeEventId: vi.fn(),
      isAvailable: vi.fn(),
    }

    const service = new AddressAuthService(adapter, 'evt-net')

    const wallets = [
      createWallet({
        id: 'w1',
        name: 'W1',
        chainAddresses: [
          { chain: 'ethereum', address: '0x111', tokens: [] },
          { chain: 'bfmeta', address: 'c111', tokens: [] },
        ],
      }),
      createWallet({
        id: 'w2',
        name: 'W2',
        chainAddresses: [
          { chain: 'ethereum', address: '0x222', tokens: [] },
          { chain: 'ccchain', address: 'c222', tokens: [] },
        ],
      }),
    ]

    const responses = service.handleNetworkAddresses(wallets, 'ethereum')
    expect(responses).toHaveLength(2)
    expect(responses.map((r) => r.address)).toEqual(['0x111', '0x222'])
    expect(responses.map((r) => r.magic)).toEqual(['w1:ethereum', 'w2:ethereum'])
  })

  it('handleMainAddresses returns one response per chain address', () => {
    const wallet = createWallet({
      id: 'w-abc',
      name: 'My Wallet',
      chainAddresses: [
        { chain: 'ethereum', address: '0xaaa', tokens: [] },
        { chain: 'ccchain', address: 'cbbb', tokens: [] },
      ],
    })

    const adapter: IPlaocAdapter = {
      getCallerAppInfo: vi.fn(),
      respondWith: vi.fn(),
      removeEventId: vi.fn(),
      isAvailable: vi.fn(),
    }

    const service = new AddressAuthService(adapter, 'evt-1')
    const responses = service.handleMainAddresses(wallet)

    expect(responses).toHaveLength(2)
    expect(responses[0]).toEqual({
      name: 'My Wallet',
      address: '0xaaa',
      chainName: 'ethereum',
      publicKey: '',
      magic: 'w-abc:ethereum',
      signMessage: '',
    })
    expect(responses[1]?.magic).toBe('w-abc:ccchain')
  })

  it('handleAllAddresses returns all addresses across wallets', () => {
    const adapter: IPlaocAdapter = {
      getCallerAppInfo: vi.fn(),
      respondWith: vi.fn(),
      removeEventId: vi.fn(),
      isAvailable: vi.fn(),
    }

    const service = new AddressAuthService(adapter, 'evt-all')

    const wallets = [
      createWallet({
        id: 'w1',
        chainAddresses: [{ chain: 'ethereum', address: '0x111', tokens: [] }],
      }),
      createWallet({
        id: 'w2',
        chainAddresses: [
          { chain: 'ethereum', address: '0x222', tokens: [] },
          { chain: 'bfmeta', address: 'c222', tokens: [] },
        ],
      }),
    ]

    const responses = service.handleAllAddresses(wallets)
    expect(responses).toHaveLength(3)
    expect(responses.map((r) => r.magic)).toEqual(['w1:ethereum', 'w2:ethereum', 'w2:bfmeta'])
  })

  it('approve is single-use and always cleans up eventId', async () => {
    const respondWith = vi.fn<IPlaocAdapter['respondWith']>().mockResolvedValue(undefined)
    const removeEventId = vi.fn<IPlaocAdapter['removeEventId']>().mockResolvedValue(undefined)

    const adapter: IPlaocAdapter = {
      getCallerAppInfo: vi.fn(),
      respondWith,
      removeEventId,
      isAvailable: vi.fn(),
    }

    const service = new AddressAuthService(adapter, 'evt-2')
    await service.approve([])
    await service.approve([])

    expect(respondWith).toHaveBeenCalledTimes(1)
    expect(respondWith).toHaveBeenCalledWith('evt-2', WALLET_PLAOC_PATH.authorizeAddress, [])

    expect(removeEventId).toHaveBeenCalledTimes(1)
    expect(removeEventId).toHaveBeenCalledWith('evt-2')
  })

  it('reject is single-use and sends null payload', async () => {
    const respondWith = vi.fn<IPlaocAdapter['respondWith']>().mockResolvedValue(undefined)
    const removeEventId = vi.fn<IPlaocAdapter['removeEventId']>().mockResolvedValue(undefined)

    const adapter: IPlaocAdapter = {
      getCallerAppInfo: vi.fn(),
      respondWith,
      removeEventId,
      isAvailable: vi.fn(),
    }

    const service = new AddressAuthService(adapter, 'evt-3')
    await service.reject('rejected')

    expect(respondWith).toHaveBeenCalledWith('evt-3', WALLET_PLAOC_PATH.authorizeAddress, null)
    expect(removeEventId).toHaveBeenCalledWith('evt-3')
  })

  it('handleMainAddressesSigned signs bioforest signMessage using decrypted secret', async () => {
    vi.mocked(crypto.decrypt).mockResolvedValue('my secret')

    const adapter: IPlaocAdapter = {
      getCallerAppInfo: vi.fn(),
      respondWith: vi.fn(),
      removeEventId: vi.fn(),
      isAvailable: vi.fn(),
    }

    const encryptedMnemonic: EncryptedData = {
      ciphertext: 'x',
      salt: 'y',
      iv: 'z',
      iterations: 100000,
    }

    const wallet = createWallet({
      id: 'w-bio',
      encryptedMnemonic,
      chainAddresses: [{ chain: 'bfmeta', address: 'c111', tokens: [] }],
    })

    const service = new AddressAuthService(adapter, 'evt-sign-bio')
    const responses = await service.handleMainAddressesSigned(wallet, { signMessage: 'hello', password: 'pwd' })

    expect(responses).toHaveLength(1)
    expect(responses[0]?.signMessage).toMatch(/^0x[0-9a-f]{128}$/)
    expect(responses[0]?.publicKey).toMatch(/^[0-9a-f]{64}$/)
    expect(crypto.decrypt).toHaveBeenCalledWith(encryptedMnemonic, 'pwd')
    expect(crypto.verifyPassword).not.toHaveBeenCalled()
  })

  it('handleMainAddressesSigned returns deterministic mock signatures for non-bioforest chains', async () => {
    vi.mocked(crypto.verifyPassword).mockResolvedValue(true)

    const adapter: IPlaocAdapter = {
      getCallerAppInfo: vi.fn(),
      respondWith: vi.fn(),
      removeEventId: vi.fn(),
      isAvailable: vi.fn(),
    }

    const encryptedMnemonic: EncryptedData = {
      ciphertext: 'x',
      salt: 'y',
      iv: 'z',
      iterations: 100000,
    }

    const wallet = createWallet({
      id: 'w-evm',
      encryptedMnemonic,
      chainAddresses: [{ chain: 'ethereum', address: '0x111', tokens: [] }],
    })

    const service = new AddressAuthService(adapter, 'evt-sign-evm')
    const responses1 = await service.handleMainAddressesSigned(wallet, { signMessage: 'hello', password: 'pwd' })
    const responses2 = await service.handleMainAddressesSigned(wallet, { signMessage: 'hello', password: 'pwd' })

    expect(responses1[0]?.signMessage).toMatch(/^0x[0-9a-f]{128}$/)
    expect(responses1[0]?.signMessage).toBe(responses2[0]?.signMessage)
    expect(crypto.decrypt).not.toHaveBeenCalled()
  })

  it('handleMainAddressesSigned throws on invalid password', async () => {
    vi.mocked(crypto.verifyPassword).mockResolvedValue(false)

    const adapter: IPlaocAdapter = {
      getCallerAppInfo: vi.fn(),
      respondWith: vi.fn(),
      removeEventId: vi.fn(),
      isAvailable: vi.fn(),
    }

    const encryptedMnemonic: EncryptedData = {
      ciphertext: 'x',
      salt: 'y',
      iv: 'z',
      iterations: 100000,
    }

    const wallet = createWallet({
      id: 'w-evm',
      encryptedMnemonic,
      chainAddresses: [{ chain: 'ethereum', address: '0x111', tokens: [] }],
    })

    const service = new AddressAuthService(adapter, 'evt-sign-badpwd')
    await expect(service.handleMainAddressesSigned(wallet, { signMessage: 'hello', password: 'wrong' })).rejects.toThrow(
      'Invalid password'
    )
  })

  it('applySensitiveOptions populates main when getMain=true (without signMessage)', async () => {
    vi.mocked(crypto.decrypt).mockResolvedValue('import phrase')

    const adapter: IPlaocAdapter = {
      getCallerAppInfo: vi.fn(),
      respondWith: vi.fn(),
      removeEventId: vi.fn(),
      isAvailable: vi.fn(),
    }

    const encryptedMnemonic: EncryptedData = {
      ciphertext: 'x',
      salt: 'y',
      iv: 'z',
      iterations: 100000,
    }

    const wallet = createWallet({
      id: 'w-main',
      encryptedMnemonic,
      chainAddresses: [{ chain: 'ethereum', address: '0x111', tokens: [] }],
    })

    const service = new AddressAuthService(adapter, 'evt-main')
    const responses = service.handleMainAddresses(wallet)
    const secured = await service.applySensitiveOptions(responses, [wallet], {
      password: 'pwd',
      getMain: true,
    })

    expect(secured).toHaveLength(1)
    expect(secured[0]?.main).toBe('import phrase')
    expect(secured[0]?.signMessage).toBe('')
    expect(crypto.decrypt).toHaveBeenCalledWith(encryptedMnemonic, 'pwd')
    expect(crypto.verifyPassword).not.toHaveBeenCalled()
  })
})
