import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SignatureAuthService } from '../signature-auth'
import { WALLET_PLAOC_PATH } from '../paths'
import type { IPlaocAdapter } from '../types'
import type { MessagePayload } from '../types'
import type { TransferPayload } from '../types'
import type { DestroyPayload } from '../types'
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

describe('SignatureAuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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

    const service = new SignatureAuthService(adapter, 'evt-1')
    await service.approve('0xsig')
    await service.approve('0xsig2')

    expect(respondWith).toHaveBeenCalledTimes(1)
    expect(respondWith).toHaveBeenCalledWith('evt-1', WALLET_PLAOC_PATH.authorizeSignature, { signature: '0xsig' })

    expect(removeEventId).toHaveBeenCalledTimes(1)
    expect(removeEventId).toHaveBeenCalledWith('evt-1')
  })

  it('reject is single-use and sends error payload', async () => {
    const respondWith = vi.fn<IPlaocAdapter['respondWith']>().mockResolvedValue(undefined)
    const removeEventId = vi.fn<IPlaocAdapter['removeEventId']>().mockResolvedValue(undefined)

    const adapter: IPlaocAdapter = {
      getCallerAppInfo: vi.fn(),
      respondWith,
      removeEventId,
      isAvailable: vi.fn(),
    }

    const service = new SignatureAuthService(adapter, 'evt-2')
    await service.reject('insufficient_balance')

    expect(respondWith).toHaveBeenCalledWith('evt-2', WALLET_PLAOC_PATH.authorizeSignature, { error: 'insufficient_balance' })
    expect(removeEventId).toHaveBeenCalledWith('evt-2')
  })

  it('handleMessageSign verifies password and throws on invalid password', async () => {
    vi.mocked(crypto.decrypt).mockRejectedValue(new Error('bad password'))

    const adapter: IPlaocAdapter = {
      getCallerAppInfo: vi.fn(),
      respondWith: vi.fn(),
      removeEventId: vi.fn(),
      isAvailable: vi.fn(),
    }

    const encryptedSecret: EncryptedData = {
      ciphertext: 'x',
      salt: 'y',
      iv: 'z',
      iterations: 100000,
    }

    const payload: MessagePayload = {
      chainName: 'bfmeta',
      senderAddress: 'c123',
      message: 'hello',
    }

    const service = new SignatureAuthService(adapter, 'evt-3')

    await expect(service.handleMessageSign(payload, encryptedSecret, 'wrong')).rejects.toThrow('Invalid password')
    expect(crypto.decrypt).toHaveBeenCalledWith(encryptedSecret, 'wrong')
    expect(crypto.verifyPassword).not.toHaveBeenCalled()
  })

  it('handleMessageSign returns deterministic mock signature for non-bioforest chains without decrypting', async () => {
    vi.mocked(crypto.verifyPassword).mockResolvedValue(true)

    const adapter: IPlaocAdapter = {
      getCallerAppInfo: vi.fn(),
      respondWith: vi.fn(),
      removeEventId: vi.fn(),
      isAvailable: vi.fn(),
    }

    const encryptedSecret: EncryptedData = {
      ciphertext: 'x',
      salt: 'y',
      iv: 'z',
      iterations: 100000,
    }

    const payload: MessagePayload = {
      chainName: 'ethereum',
      senderAddress: '0x123',
      message: 'hello',
    }

    const service = new SignatureAuthService(adapter, 'evt-4')
    const sig1 = await service.handleMessageSign(payload, encryptedSecret, 'pwd')
    const sig2 = await service.handleMessageSign(payload, encryptedSecret, 'pwd')

    expect(sig1).toMatch(/^0x[0-9a-f]{128}$/)
    expect(sig1).toBe(sig2)
    expect(crypto.decrypt).not.toHaveBeenCalled()
  })

  it('handleMessageSign signs BioForest messages using decrypted secret', async () => {
    vi.mocked(crypto.decrypt).mockResolvedValue('my secret')

    const adapter: IPlaocAdapter = {
      getCallerAppInfo: vi.fn(),
      respondWith: vi.fn(),
      removeEventId: vi.fn(),
      isAvailable: vi.fn(),
    }

    const encryptedSecret: EncryptedData = {
      ciphertext: 'x',
      salt: 'y',
      iv: 'z',
      iterations: 100000,
    }

    const payload: MessagePayload = {
      chainName: 'bfmeta',
      senderAddress: 'c123',
      message: 'hello',
    }

    const service = new SignatureAuthService(adapter, 'evt-5')
    const sig1 = await service.handleMessageSign(payload, encryptedSecret, 'pwd')
    const sig2 = await service.handleMessageSign(payload, encryptedSecret, 'pwd')

    expect(sig1).toMatch(/^0x[0-9a-f]{128}$/)
    expect(sig1).toBe(sig2)
    expect(crypto.decrypt).toHaveBeenCalledWith(encryptedSecret, 'pwd')
    expect(crypto.verifyPassword).not.toHaveBeenCalled()
  })

  it('handleTransferSign returns deterministic mock signature for non-bioforest chains', async () => {
    vi.mocked(crypto.verifyPassword).mockResolvedValue(true)

    const adapter: IPlaocAdapter = {
      getCallerAppInfo: vi.fn(),
      respondWith: vi.fn(),
      removeEventId: vi.fn(),
      isAvailable: vi.fn(),
    }

    const encryptedSecret: EncryptedData = {
      ciphertext: 'x',
      salt: 'y',
      iv: 'z',
      iterations: 100000,
    }

    const payload = {
      chainName: 'ethereum',
      senderAddress: '0xsender',
      receiveAddress: '0xrecv',
      balance: '1.25',
      fee: '0.01',
    } satisfies TransferPayload

    const service = new SignatureAuthService(adapter, 'evt-6')
    const sig1 = await service.handleTransferSign(payload, encryptedSecret, 'pwd')
    const sig2 = await service.handleTransferSign(payload, encryptedSecret, 'pwd')

    expect(sig1).toMatch(/^0x[0-9a-f]{128}$/)
    expect(sig1).toBe(sig2)
    expect(crypto.decrypt).not.toHaveBeenCalled()
  })

  it('handleTransferSign signs BioForest transfer using decrypted secret', async () => {
    vi.mocked(crypto.decrypt).mockResolvedValue('my secret')

    const adapter: IPlaocAdapter = {
      getCallerAppInfo: vi.fn(),
      respondWith: vi.fn(),
      removeEventId: vi.fn(),
      isAvailable: vi.fn(),
    }

    const encryptedSecret: EncryptedData = {
      ciphertext: 'x',
      salt: 'y',
      iv: 'z',
      iterations: 100000,
    }

    const payload = {
      chainName: 'bfmeta',
      senderAddress: 'cSender',
      receiveAddress: 'cRecv',
      balance: '1.25',
      fee: '0.01',
      assetType: 'bft',
    } satisfies TransferPayload

    const service = new SignatureAuthService(adapter, 'evt-7')
    const sig1 = await service.handleTransferSign(payload, encryptedSecret, 'pwd')
    const sig2 = await service.handleTransferSign(payload, encryptedSecret, 'pwd')

    expect(sig1).toMatch(/^0x[0-9a-f]{128}$/)
    expect(sig1).toBe(sig2)
    expect(crypto.decrypt).toHaveBeenCalledWith(encryptedSecret, 'pwd')
    expect(crypto.verifyPassword).not.toHaveBeenCalled()
  })

  it('handleDestroySign returns deterministic mock signature for non-bioforest chains', async () => {
    vi.mocked(crypto.verifyPassword).mockResolvedValue(true)

    const adapter: IPlaocAdapter = {
      getCallerAppInfo: vi.fn(),
      respondWith: vi.fn(),
      removeEventId: vi.fn(),
      isAvailable: vi.fn(),
    }

    const encryptedSecret: EncryptedData = {
      ciphertext: 'x',
      salt: 'y',
      iv: 'z',
      iterations: 100000,
    }

    const payload = {
      chainName: 'ethereum',
      senderAddress: '0xsender',
      destoryAddress: '0xburn',
      destoryAmount: '1.25',
      fee: '0.01',
      assetType: 'token',
    } satisfies DestroyPayload

    const service = new SignatureAuthService(adapter, 'evt-8')
    const sig1 = await service.handleDestroySign(payload, encryptedSecret, 'pwd')
    const sig2 = await service.handleDestroySign(payload, encryptedSecret, 'pwd')

    expect(sig1).toMatch(/^0x[0-9a-f]{128}$/)
    expect(sig1).toBe(sig2)
    expect(crypto.decrypt).not.toHaveBeenCalled()
  })

  it('handleDestroySign signs BioForest destory using decrypted secret', async () => {
    vi.mocked(crypto.decrypt).mockResolvedValue('my secret')

    const adapter: IPlaocAdapter = {
      getCallerAppInfo: vi.fn(),
      respondWith: vi.fn(),
      removeEventId: vi.fn(),
      isAvailable: vi.fn(),
    }

    const encryptedSecret: EncryptedData = {
      ciphertext: 'x',
      salt: 'y',
      iv: 'z',
      iterations: 100000,
    }

    const payload = {
      chainName: 'bfmeta',
      senderAddress: 'cSender',
      destoryAddress: 'cBurn',
      destoryAmount: '1.25',
      fee: '0.01',
      assetType: 'bft',
    } satisfies DestroyPayload

    const service = new SignatureAuthService(adapter, 'evt-9')
    const sig1 = await service.handleDestroySign(payload, encryptedSecret, 'pwd')
    const sig2 = await service.handleDestroySign(payload, encryptedSecret, 'pwd')

    expect(sig1).toMatch(/^0x[0-9a-f]{128}$/)
    expect(sig1).toBe(sig2)
    expect(crypto.decrypt).toHaveBeenCalledWith(encryptedSecret, 'pwd')
    expect(crypto.verifyPassword).not.toHaveBeenCalled()
  })
})
