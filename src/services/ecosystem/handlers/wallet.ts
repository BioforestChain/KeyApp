/**
 * Wallet-related method handlers
 */

import type { MethodHandler, BioAccount } from '../types'
import { BioErrorCodes } from '../types'

// These will be injected from React context/stores
let showAccountPicker: ((opts?: { chain?: string }) => Promise<BioAccount | null>) | null = null
let showWalletPicker: ((opts?: { chain?: string; exclude?: string }) => Promise<BioAccount | null>) | null = null
let getConnectedAccounts: (() => BioAccount[]) | null = null

/** Set the account picker callback */
export function setAccountPicker(picker: typeof showAccountPicker): void {
  showAccountPicker = picker
}

/** Set the wallet picker callback */
export function setWalletPicker(picker: typeof showWalletPicker): void {
  showWalletPicker = picker
}

/** Set the get accounts callback */
export function setGetAccounts(getter: typeof getConnectedAccounts): void {
  getConnectedAccounts = getter
}

/** bio_connect - Internal handshake */
export const handleConnect: MethodHandler = async (_params, _context) => {
  return { connected: true }
}

/** bio_requestAccounts - Request wallet connection (shows UI) */
export const handleRequestAccounts: MethodHandler = async (_params, _context) => {
  if (!showAccountPicker) {
    throw Object.assign(new Error('Account picker not available'), { code: BioErrorCodes.INTERNAL_ERROR })
  }

  const account = await showAccountPicker()
  if (!account) {
    throw Object.assign(new Error('User rejected'), { code: BioErrorCodes.USER_REJECTED })
  }

  return [account]
}

/** bio_accounts - Get connected accounts (no UI) */
export const handleAccounts: MethodHandler = async (_params, _context) => {
  if (!getConnectedAccounts) {
    return []
  }
  return getConnectedAccounts()
}

/** bio_selectAccount - Select an account (shows picker) */
export const handleSelectAccount: MethodHandler = async (params, _context) => {
  if (!showAccountPicker) {
    throw Object.assign(new Error('Account picker not available'), { code: BioErrorCodes.INTERNAL_ERROR })
  }

  const opts = params as { chain?: string } | undefined
  const account = await showAccountPicker(opts)
  if (!account) {
    throw Object.assign(new Error('User rejected'), { code: BioErrorCodes.USER_REJECTED })
  }

  return account
}

/** bio_pickWallet - Pick another wallet address */
export const handlePickWallet: MethodHandler = async (params, _context) => {
  if (!showWalletPicker) {
    throw Object.assign(new Error('Wallet picker not available'), { code: BioErrorCodes.INTERNAL_ERROR })
  }

  const opts = params as { chain?: string; exclude?: string } | undefined
  const account = await showWalletPicker(opts)
  if (!account) {
    throw Object.assign(new Error('User rejected'), { code: BioErrorCodes.USER_REJECTED })
  }

  return account
}

/** bio_chainId - Get current chain ID */
export const handleChainId: MethodHandler = async (_params, _context) => {
  // TODO: Get from current selected chain
  return 'bfmeta'
}

/** bio_getBalance - Get balance */
export const handleGetBalance: MethodHandler = async (params, _context) => {
  const opts = params as { address?: string; chain?: string } | undefined
  if (!opts?.address || !opts?.chain) {
    throw Object.assign(new Error('Missing address or chain'), { code: BioErrorCodes.INVALID_PARAMS })
  }

  // TODO: Query actual balance from chain adapter
  return '0'
}
