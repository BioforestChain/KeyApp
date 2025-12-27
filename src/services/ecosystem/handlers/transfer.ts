/**
 * Transfer-related method handlers
 */

import type { MethodHandler, TransferParams } from '../types'
import { BioErrorCodes } from '../types'

// These will be injected from React context
let showTransferDialog: ((params: TransferParams & { appName: string }) => Promise<{ txHash: string } | null>) | null = null

/** Set the transfer dialog callback */
export function setTransferDialog(dialog: typeof showTransferDialog): void {
  showTransferDialog = dialog
}

/** bio_sendTransaction - Send a transaction */
export const handleSendTransaction: MethodHandler = async (params, context) => {
  const opts = params as Partial<TransferParams> | undefined
  if (!opts?.from || !opts?.to || !opts?.amount || !opts?.chain) {
    throw Object.assign(
      new Error('Missing required parameters: from, to, amount, chain'),
      { code: BioErrorCodes.INVALID_PARAMS }
    )
  }

  if (!showTransferDialog) {
    throw Object.assign(new Error('Transfer dialog not available'), { code: BioErrorCodes.INTERNAL_ERROR })
  }

  const transferParams: TransferParams & { appName: string } = {
    from: opts.from,
    to: opts.to,
    amount: opts.amount,
    chain: opts.chain,
    appName: context.appId,
  }
  if (opts.asset) {
    transferParams.asset = opts.asset
  }

  const result = await showTransferDialog(transferParams)

  if (!result) {
    throw Object.assign(new Error('User rejected'), { code: BioErrorCodes.USER_REJECTED })
  }

  return result
}
