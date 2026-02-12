/**
 * Transfer-related method handlers
 */

import type { MethodHandler, EcosystemTransferParams } from '../types'
import { BioErrorCodes } from '../types'
import { HandlerContext, type MiniappInfo, type TransferDialogResult, toMiniappInfo } from './context'
import { enqueueMiniappSheet } from '../sheet-queue'
import { isRawAmountString } from '../raw-amount'

// 兼容旧 API
let _showTransferDialog: ((params: EcosystemTransferParams & { app: MiniappInfo }) => Promise<TransferDialogResult | null>) | null = null

/** @deprecated 使用 HandlerContext.register 替代 */
export function setTransferDialog(dialog: typeof _showTransferDialog): void {
  _showTransferDialog = dialog
}

/** 获取转账对话框 */
function getTransferDialog(appId: string) {
  const callbacks = HandlerContext.get(appId)
  return callbacks?.showTransferDialog ?? _showTransferDialog
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeTransferResult(result: TransferDialogResult) {
  const txHash = result.txHash || result.txId
  const txId = result.txId || result.txHash
  if (!txHash || !txId) {
    throw Object.assign(new Error('Invalid transfer result: missing tx id'), { code: BioErrorCodes.INTERNAL_ERROR })
  }

  const transaction = isRecord(result.transaction)
    ? result.transaction
    : {
      txId,
      txHash,
    }

  return {
    txHash,
    txId,
    transaction,
  }
}

/** bio_sendTransaction - Send a transaction */
export const handleSendTransaction: MethodHandler = async (params, context) => {
  const opts = params as Partial<EcosystemTransferParams> | undefined
  if (!opts?.from || !opts?.to || !opts?.amount || !opts?.chain) {
    throw Object.assign(
      new Error('Missing required parameters: from, to, amount, chain'),
      { code: BioErrorCodes.INVALID_PARAMS }
    )
  }

  if (!isRawAmountString(opts.amount)) {
    throw Object.assign(
      new Error('Invalid amount: expected raw integer string'),
      { code: BioErrorCodes.INVALID_PARAMS }
    )
  }

  const showTransferDialog = getTransferDialog(context.appId)
  if (!showTransferDialog) {
    throw Object.assign(new Error('Transfer dialog not available'), { code: BioErrorCodes.INTERNAL_ERROR })
  }

  const transferParams: EcosystemTransferParams & { app: MiniappInfo } = {
    from: opts.from,
    to: opts.to,
    amount: opts.amount,
    chain: opts.chain,
    app: toMiniappInfo(context),
  }
  if (opts.asset) {
    transferParams.asset = opts.asset
  }
  if (opts.tokenAddress) {
    transferParams.tokenAddress = opts.tokenAddress
  }

  const result = await enqueueMiniappSheet(context.appId, () => showTransferDialog(transferParams))

  if (!result) {
    throw Object.assign(new Error('User rejected'), { code: BioErrorCodes.USER_REJECTED })
  }

  return normalizeTransferResult(result)
}
