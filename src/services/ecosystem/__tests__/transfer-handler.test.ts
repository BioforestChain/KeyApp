import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { EcosystemTransferParams } from '../types'
import { BioErrorCodes } from '../types'
import { handleSendTransaction, setTransferDialog } from '../handlers/transfer'
import { HandlerContext } from '../handlers/context'

const baseContext = {
  appId: 'test-miniapp',
  appName: 'Test Miniapp',
  appIcon: 'https://miniapp.example/icon.png',
  origin: 'https://test.app',
  permissions: ['bio_sendTransaction'],
}

const baseParams: EcosystemTransferParams = {
  from: 'b_sender',
  to: 'b_receiver',
  amount: '125000000',
  chain: 'bfmeta',
}

describe('handleSendTransaction', () => {
  beforeEach(() => {
    HandlerContext.clear()
    setTransferDialog(null)
  })

  it('rejects formatted amount before opening dialog', async () => {
    const showTransferDialog = vi.fn(async () => ({
      txHash: 'tx-hash-ctx-icon',
      txId: 'tx-hash-ctx-icon',
      transaction: { hash: 'tx-hash-ctx-icon' },
    }))

    HandlerContext.register(baseContext.appId, {
      showWalletPicker: async () => null,
      getConnectedAccounts: () => [],
      showSigningDialog: async () => null,
      showTransferDialog,
      showSignTransactionDialog: async () => null,
    })

    await expect(
      handleSendTransaction(
        {
          ...baseParams,
          amount: '1.25',
        },
        baseContext,
      ),
    ).rejects.toMatchObject({
      code: BioErrorCodes.INVALID_PARAMS,
      message: 'Invalid amount: expected raw integer string',
    })

    expect(showTransferDialog).not.toHaveBeenCalled()
  })

  it('passes miniapp icon from handler context', async () => {
    const showTransferDialog = vi.fn(async () => ({
      txHash: 'tx-hash-ctx-icon',
      txId: 'tx-hash-ctx-icon',
      transaction: { hash: 'tx-hash-ctx-icon' },
    }))

    HandlerContext.register(baseContext.appId, {
      showWalletPicker: async () => null,
      getConnectedAccounts: () => [],
      showSigningDialog: async () => null,
      showTransferDialog,
      showSignTransactionDialog: async () => null,
    })

    await handleSendTransaction(baseParams, baseContext)

    expect(showTransferDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        app: {
          name: baseContext.appName,
          icon: baseContext.appIcon,
        },
      }),
    )
  })

  it('returns normalized object transaction for new callback shape', async () => {
    HandlerContext.register(baseContext.appId, {
      showWalletPicker: async () => null,
      getConnectedAccounts: () => [],
      showSigningDialog: async () => null,
      showTransferDialog: async () => ({
        txHash: 'tx-hash-1',
        txId: 'tx-hash-1',
        transaction: { hash: 'tx-hash-1', type: 'AST-01', senderId: 'b_sender' },
      }),
      showSignTransactionDialog: async () => null,
    })

    const result = await handleSendTransaction(baseParams, baseContext)

    expect(result).toEqual({
      txHash: 'tx-hash-1',
      txId: 'tx-hash-1',
      transaction: { hash: 'tx-hash-1', type: 'AST-01', senderId: 'b_sender' },
    })
    expect(typeof (result as { transaction: unknown }).transaction).toBe('object')
  })

  it('keeps backward compatibility for legacy txHash-only callback', async () => {
    HandlerContext.register(baseContext.appId, {
      showWalletPicker: async () => null,
      getConnectedAccounts: () => [],
      showSigningDialog: async () => null,
      showTransferDialog: async () => ({ txHash: 'legacy-hash' }),
      showSignTransactionDialog: async () => null,
    })

    const result = await handleSendTransaction(baseParams, baseContext)

    expect(result).toEqual({
      txHash: 'legacy-hash',
      txId: 'legacy-hash',
      transaction: {
        txId: 'legacy-hash',
        txHash: 'legacy-hash',
      },
    })
    expect(typeof (result as { transaction: unknown }).transaction).toBe('object')
  })

  it('rejects invalid callback payload without tx id', async () => {
    HandlerContext.register(baseContext.appId, {
      showWalletPicker: async () => null,
      getConnectedAccounts: () => [],
      showSigningDialog: async () => null,
      showTransferDialog: async () => ({ txHash: '' }),
      showSignTransactionDialog: async () => null,
    })

    await expect(handleSendTransaction(baseParams, baseContext)).rejects.toMatchObject({
      code: BioErrorCodes.INTERNAL_ERROR,
      message: 'Invalid transfer result: missing tx id',
    })
  })
})
