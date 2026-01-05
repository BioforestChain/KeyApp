/**
 * TRON method handlers
 *
 * Handles window.tronLink/tronWeb requests from miniapps.
 * Maps TronLink API to KeyApp wallet operations.
 */

import type { MethodHandler, BioAccount } from '../types'
import { BioErrorCodes } from '../types'
import { HandlerContext, type TronTransaction } from './context'

// Re-export for convenience
export type { TronTransaction } from './context'

// ============================================
// Types
// ============================================

/** Tron address format */
export interface TronAddress {
  base58: string
  hex: string
}

// ============================================
// State
// ============================================

/** Connected address for each app */
const appAddressState = new Map<string, TronAddress>()

// ============================================
// Callback setters (for UI integration)
// ============================================

let _showTronWalletPicker: (() => Promise<BioAccount | null>) | null = null
let _showTronSigningDialog: ((opts: { transaction: TronTransaction; appName: string }) => Promise<{ signedTransaction: TronTransaction } | null>) | null = null

export function setTronWalletPicker(picker: typeof _showTronWalletPicker): void {
  _showTronWalletPicker = picker
}

export function setTronSigningDialog(dialog: typeof _showTronSigningDialog): void {
  _showTronSigningDialog = dialog
}

// ============================================
// Helper functions
// ============================================

function getWalletPicker(appId: string) {
  const callbacks = HandlerContext.get(appId)
  return callbacks?.showTronWalletPicker ?? _showTronWalletPicker
}

function getSigningDialog(appId: string) {
  const callbacks = HandlerContext.get(appId)
  return callbacks?.showTronSigningDialog ?? _showTronSigningDialog
}

function getCurrentAddress(appId: string): TronAddress | null {
  return appAddressState.get(appId) ?? null
}

function setCurrentAddress(appId: string, address: TronAddress): void {
  appAddressState.set(appId, address)
}

/**
 * Convert KeyApp BioAccount to TronAddress
 * Note: KeyApp stores Tron addresses in base58 format
 */
function bioAccountToTronAddress(account: BioAccount): TronAddress {
  return {
    base58: account.address,
    // Hex conversion would require TronWeb library
    // For now, we return base58 for both (host will convert)
    hex: account.address,
  }
}

// ============================================
// Handlers
// ============================================

/** tron_requestAccounts - Request wallet connection */
export const handleTronRequestAccounts: MethodHandler = async (_params, context) => {
  const showWalletPicker = getWalletPicker(context.appId)
  if (!showWalletPicker) {
    throw Object.assign(new Error('Wallet picker not available'), { code: BioErrorCodes.INTERNAL_ERROR })
  }

  const wallet = await showWalletPicker()
  if (!wallet) {
    throw Object.assign(new Error('User rejected'), { code: BioErrorCodes.USER_REJECTED })
  }

  const tronAddress = bioAccountToTronAddress(wallet)
  setCurrentAddress(context.appId, tronAddress)

  return {
    code: 200,
    message: 'ok',
    data: tronAddress,
  }
}

/** tron_accounts - Get connected accounts */
export const handleTronAccounts: MethodHandler = async (_params, context) => {
  const address = getCurrentAddress(context.appId)
  if (!address) {
    return {
      code: 4000,
      message: 'Not connected',
      data: null,
    }
  }

  return {
    code: 200,
    message: 'ok',
    data: address,
  }
}

/** tron_getDefaultAddress - Get current default address */
export const handleTronGetDefaultAddress: MethodHandler = async (_params, context) => {
  return getCurrentAddress(context.appId)
}

/** tron_signTransaction - Sign a transaction */
export const handleTronSignTransaction: MethodHandler = async (params, context) => {
  const transaction = params as TronTransaction | undefined
  if (!transaction?.txID) {
    throw Object.assign(new Error('Invalid transaction'), { code: BioErrorCodes.INVALID_PARAMS })
  }

  const showSigningDialog = getSigningDialog(context.appId)
  if (!showSigningDialog) {
    throw Object.assign(new Error('Signing dialog not available'), { code: BioErrorCodes.INTERNAL_ERROR })
  }

  const result = await showSigningDialog({
    transaction,
    appName: context.appName,
  })

  if (!result) {
    throw Object.assign(new Error('User rejected'), { code: BioErrorCodes.USER_REJECTED })
  }

  return result.signedTransaction
}

/** tron_sendRawTransaction - Broadcast signed transaction */
export const handleTronSendRawTransaction: MethodHandler = async (params, _context) => {
  const signedTransaction = params as TronTransaction | undefined
  if (!signedTransaction?.txID || !signedTransaction.signature) {
    throw Object.assign(new Error('Invalid signed transaction'), { code: BioErrorCodes.INVALID_PARAMS })
  }

  // TODO: Broadcast to TRON network via chain adapter
  // For now, return success with txID
  return {
    result: true,
    txid: signedTransaction.txID,
  }
}

/** tron_getBalance - Get TRX balance */
export const handleTronGetBalance: MethodHandler = async (params, _context) => {
  const address = params as string | undefined
  if (!address) {
    throw Object.assign(new Error('Missing address'), { code: BioErrorCodes.INVALID_PARAMS })
  }

  // TODO: Query balance from chain adapter
  return 0
}

/** tron_getAccount - Get account info */
export const handleTronGetAccount: MethodHandler = async (params, _context) => {
  const address = params as string | undefined
  if (!address) {
    throw Object.assign(new Error('Missing address'), { code: BioErrorCodes.INVALID_PARAMS })
  }

  // TODO: Query account from chain adapter
  return {
    address,
    balance: 0,
  }
}

// ============================================
// Export all handlers map
// ============================================

export const tronHandlers: Record<string, MethodHandler> = {
  tron_requestAccounts: handleTronRequestAccounts,
  tron_accounts: handleTronAccounts,
  tron_getDefaultAddress: handleTronGetDefaultAddress,
  tron_signTransaction: handleTronSignTransaction,
  tron_sendRawTransaction: handleTronSendRawTransaction,
  tron_getBalance: handleTronGetBalance,
  tron_getAccount: handleTronGetAccount,
}

/** Register all TRON handlers with the bridge */
export function registerTronHandlers(registerHandler: (method: string, handler: MethodHandler) => void): void {
  for (const [method, handler] of Object.entries(tronHandlers)) {
    registerHandler(method, handler)
  }
}
