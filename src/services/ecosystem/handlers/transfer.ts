/**
 * Transfer-related method handlers
 */

import type { MethodHandler, TransferParams } from '../types'
import { BioErrorCodes } from '../types'
import { HandlerContext, type MiniappInfo } from './context'

// 兼容旧 API
let _showTransferDialog: ((params: TransferParams & { app: MiniappInfo }) => Promise<{ txHash: string } | null>) | null = null

/** @deprecated 使用 HandlerContext.register 替代 */
export function setTransferDialog(dialog: typeof _showTransferDialog): void {
  _showTransferDialog = dialog
}

/** 获取转账对话框 */
function getTransferDialog(appId: string) {
  const callbacks = HandlerContext.get(appId)
  return callbacks?.showTransferDialog ?? _showTransferDialog
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

  const showTransferDialog = getTransferDialog(context.appId)
  if (!showTransferDialog) {
    throw Object.assign(new Error('Transfer dialog not available'), { code: BioErrorCodes.INTERNAL_ERROR })
  }

  const transferParams: TransferParams & { app: MiniappInfo } = {
    from: opts.from,
    to: opts.to,
    amount: opts.amount,
    chain: opts.chain,
    app: { name: context.appId },
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
