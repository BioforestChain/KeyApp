/**
 * Signing-related method handlers
 */

import type { MethodHandler } from '../types'
import { BioErrorCodes } from '../types'
import { HandlerContext, type SigningParams, type SigningResult } from './context'

// 兼容旧 API（现在返回 SigningResult）
let _showSigningDialog: ((params: SigningParams) => Promise<SigningResult | null>) | null = null

/** @deprecated 使用 HandlerContext.register 替代 */
export function setSigningDialog(dialog: typeof _showSigningDialog): void {
  _showSigningDialog = dialog
}

/** 获取签名对话框 */
function getSigningDialog(appId: string) {
  const callbacks = HandlerContext.get(appId)
  return callbacks?.showSigningDialog ?? _showSigningDialog
}

/** bio_signMessage - Sign a message, returns { signature, publicKey } */
export const handleSignMessage: MethodHandler = async (params, context) => {
  const opts = params as { message?: string; address?: string } | undefined
  if (!opts?.message || !opts?.address) {
    throw Object.assign(new Error('Missing message or address'), { code: BioErrorCodes.INVALID_PARAMS })
  }

  const showSigningDialog = getSigningDialog(context.appId)
  if (!showSigningDialog) {
    throw Object.assign(new Error('Signing dialog not available'), { code: BioErrorCodes.INTERNAL_ERROR })
  }

  const result = await showSigningDialog({
    message: opts.message,
    address: opts.address,
    app: { name: context.appName },
  })

  if (!result) {
    throw Object.assign(new Error('User rejected'), { code: BioErrorCodes.USER_REJECTED })
  }

  // 返回 { signature, publicKey }，公钥为 hex 格式
  return result
}

/** bio_signTypedData - Sign typed data, returns { signature, publicKey } */
export const handleSignTypedData: MethodHandler = async (params, context) => {
  const opts = params as { data?: object; address?: string } | undefined
  if (!opts?.data || !opts?.address) {
    throw Object.assign(new Error('Missing data or address'), { code: BioErrorCodes.INVALID_PARAMS })
  }

  const showSigningDialog = getSigningDialog(context.appId)
  if (!showSigningDialog) {
    throw Object.assign(new Error('Signing dialog not available'), { code: BioErrorCodes.INTERNAL_ERROR })
  }

  // Convert typed data to readable message
  const message = JSON.stringify(opts.data, null, 2)

  const result = await showSigningDialog({
    message,
    address: opts.address,
    app: { name: context.appName },
  })

  if (!result) {
    throw Object.assign(new Error('User rejected'), { code: BioErrorCodes.USER_REJECTED })
  }

  // 返回 { signature, publicKey }，公钥为 hex 格式
  return result
}
