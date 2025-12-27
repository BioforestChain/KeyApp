/**
 * Signing-related method handlers
 */

import type { MethodHandler } from '../types'
import { BioErrorCodes } from '../types'

// These will be injected from React context
let showSigningDialog: ((params: {
  message: string
  address: string
  appName: string
}) => Promise<string | null>) | null = null

/** Set the signing dialog callback */
export function setSigningDialog(dialog: typeof showSigningDialog): void {
  showSigningDialog = dialog
}

/** bio_signMessage - Sign a message */
export const handleSignMessage: MethodHandler = async (params, context) => {
  const opts = params as { message?: string; address?: string } | undefined
  if (!opts?.message || !opts?.address) {
    throw Object.assign(new Error('Missing message or address'), { code: BioErrorCodes.INVALID_PARAMS })
  }

  if (!showSigningDialog) {
    throw Object.assign(new Error('Signing dialog not available'), { code: BioErrorCodes.INTERNAL_ERROR })
  }

  const signature = await showSigningDialog({
    message: opts.message,
    address: opts.address,
    appName: context.appId,
  })

  if (!signature) {
    throw Object.assign(new Error('User rejected'), { code: BioErrorCodes.USER_REJECTED })
  }

  return signature
}

/** bio_signTypedData - Sign typed data */
export const handleSignTypedData: MethodHandler = async (params, context) => {
  const opts = params as { data?: object; address?: string } | undefined
  if (!opts?.data || !opts?.address) {
    throw Object.assign(new Error('Missing data or address'), { code: BioErrorCodes.INVALID_PARAMS })
  }

  if (!showSigningDialog) {
    throw Object.assign(new Error('Signing dialog not available'), { code: BioErrorCodes.INTERNAL_ERROR })
  }

  // Convert typed data to readable message
  const message = JSON.stringify(opts.data, null, 2)

  const signature = await showSigningDialog({
    message,
    address: opts.address,
    appName: context.appId,
  })

  if (!signature) {
    throw Object.assign(new Error('User rejected'), { code: BioErrorCodes.USER_REJECTED })
  }

  return signature
}
