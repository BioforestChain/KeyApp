/**
 * Destroy asset method handlers
 */

import type { MethodHandler, EcosystemDestroyParams } from '../types'
import { BioErrorCodes } from '../types'
import { HandlerContext, type MiniappInfo, toMiniappInfo } from './context'

// 兼容旧 API
let _showDestroyDialog: ((params: EcosystemDestroyParams & { app: MiniappInfo }) => Promise<{ txHash: string } | null>) | null = null

/** @deprecated 使用 HandlerContext.register 替代 */
export function setDestroyDialog(dialog: typeof _showDestroyDialog): void {
  _showDestroyDialog = dialog
}

/** 获取销毁对话框 */
function getDestroyDialog(appId: string) {
  const callbacks = HandlerContext.get(appId)
  return callbacks?.showDestroyDialog ?? _showDestroyDialog
}

/** bio_destroyAsset - Destroy an asset (BioForest chains only) */
export const handleDestroyAsset: MethodHandler = async (params, context) => {
  const opts = params as Partial<EcosystemDestroyParams> | undefined
  if (!opts?.from || !opts?.amount || !opts?.chain || !opts?.asset) {
    throw Object.assign(
      new Error('Missing required parameters: from, amount, chain, asset'),
      { code: BioErrorCodes.INVALID_PARAMS }
    )
  }

  const showDestroyDialog = getDestroyDialog(context.appId)
  if (!showDestroyDialog) {
    throw Object.assign(new Error('Destroy dialog not available'), { code: BioErrorCodes.INTERNAL_ERROR })
  }

  const destroyParams: EcosystemDestroyParams & { app: MiniappInfo } = {
    from: opts.from,
    amount: opts.amount,
    chain: opts.chain,
    asset: opts.asset,
    app: toMiniappInfo(context),
  }

  const result = await showDestroyDialog(destroyParams)

  if (!result) {
    throw Object.assign(new Error('User rejected'), { code: BioErrorCodes.USER_REJECTED })
  }

  return result
}
