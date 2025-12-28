/**
 * Wallet-related method handlers
 */

import type { MethodHandler, BioAccount } from '../types'
import { BioErrorCodes } from '../types'
import { HandlerContext } from './context'

// 兼容旧 API，逐步迁移到 HandlerContext
let _showAccountPicker: ((opts?: { chain?: string }) => Promise<BioAccount | null>) | null = null
let _showWalletPicker: ((opts?: { chain?: string; exclude?: string }) => Promise<BioAccount | null>) | null = null
let _getConnectedAccounts: (() => BioAccount[]) | null = null

/** @deprecated 使用 HandlerContext.register 替代 */
export function setAccountPicker(picker: typeof _showAccountPicker): void {
  _showAccountPicker = picker
}

/** @deprecated 使用 HandlerContext.register 替代 */
export function setWalletPicker(picker: typeof _showWalletPicker): void {
  _showWalletPicker = picker
}

/** @deprecated 使用 HandlerContext.register 替代 */
export function setGetAccounts(getter: typeof _getConnectedAccounts): void {
  _getConnectedAccounts = getter
}

/** 获取账户选择器（优先使用 context，回退到全局变量） */
function getAccountPicker(appId: string) {
  const callbacks = HandlerContext.get(appId)
  return callbacks?.showAccountPicker ?? _showAccountPicker
}

/** 获取钱包选择器 */
function getWalletPicker(appId: string) {
  const callbacks = HandlerContext.get(appId)
  return callbacks?.showWalletPicker ?? _showWalletPicker
}

/** 获取已连接账户函数 */
function getAccountsGetter(appId: string) {
  const callbacks = HandlerContext.get(appId)
  return callbacks?.getConnectedAccounts ?? _getConnectedAccounts
}

/** bio_connect - Internal handshake */
export const handleConnect: MethodHandler = async (_params, _context) => {
  return { connected: true }
}

/** bio_requestAccounts - Request wallet connection (shows UI) */
export const handleRequestAccounts: MethodHandler = async (_params, context) => {
  const showAccountPicker = getAccountPicker(context.appId)
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
export const handleAccounts: MethodHandler = async (_params, context) => {
  const getConnectedAccounts = getAccountsGetter(context.appId)
  if (!getConnectedAccounts) {
    return []
  }
  return getConnectedAccounts()
}

/** bio_selectAccount - Select an account (shows picker) */
export const handleSelectAccount: MethodHandler = async (params, context) => {
  const showAccountPicker = getAccountPicker(context.appId)
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
export const handlePickWallet: MethodHandler = async (params, context) => {
  const showWalletPicker = getWalletPicker(context.appId)
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
