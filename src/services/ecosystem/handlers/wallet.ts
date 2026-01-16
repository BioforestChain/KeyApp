/**
 * Wallet-related method handlers
 */

import type { MethodHandler, BioAccount } from '../types'
import { BioErrorCodes } from '../types'
import { HandlerContext } from './context'
import { getChainProvider } from '@/services/chain-adapter/providers'
import { walletStore } from '@/stores/wallet'

// 兼容旧 API，逐步迁移到 HandlerContext
let _showWalletPicker: ((opts?: { chain?: string; exclude?: string }) => Promise<BioAccount | null>) | null = null
let _getConnectedAccounts: (() => BioAccount[]) | null = null

/** @deprecated 使用 HandlerContext.register 替代 */
export function setWalletPicker(picker: typeof _showWalletPicker): void {
  _showWalletPicker = picker
}

/** @deprecated 使用 HandlerContext.register 替代 */
export function setGetAccounts(getter: typeof _getConnectedAccounts): void {
  _getConnectedAccounts = getter
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
  const showWalletPicker = getWalletPicker(context.appId)
  if (!showWalletPicker) {
    throw Object.assign(new Error('Wallet picker not available'), { code: BioErrorCodes.INTERNAL_ERROR })
  }

  const wallet = await showWalletPicker({
    app: { name: context.appName, icon: context.appIcon },
  })
  if (!wallet) {
    throw Object.assign(new Error('User rejected'), { code: BioErrorCodes.USER_REJECTED })
  }

  return [wallet]
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
  const showWalletPicker = getWalletPicker(context.appId)
  if (!showWalletPicker) {
    throw Object.assign(new Error('Wallet picker not available'), { code: BioErrorCodes.INTERNAL_ERROR })
  }

  const opts = params as { chain?: string } | undefined
  const wallet = await showWalletPicker({
    ...opts,
    app: { name: context.appName, icon: context.appIcon },
  })
  if (!wallet) {
    throw Object.assign(new Error('User rejected'), { code: BioErrorCodes.USER_REJECTED })
  }

  return wallet
}

/** bio_pickWallet - Pick another wallet address */
export const handlePickWallet: MethodHandler = async (params, context) => {
  const showWalletPicker = getWalletPicker(context.appId)
  if (!showWalletPicker) {
    throw Object.assign(new Error('Wallet picker not available'), { code: BioErrorCodes.INTERNAL_ERROR })
  }

  const opts = params as { chain?: string; exclude?: string } | undefined
  const account = await showWalletPicker({
    ...opts,
    app: { name: context.appName, icon: context.appIcon },
  })
  if (!account) {
    throw Object.assign(new Error('User rejected'), { code: BioErrorCodes.USER_REJECTED })
  }

  return account
}

/** bio_chainId - Get current chain ID */
export const handleChainId: MethodHandler = async (_params, _context) => {
  return walletStore.state.selectedChain
}

/** bio_getBalance - Get balance */
export const handleGetBalance: MethodHandler = async (params, _context) => {
  const opts = params as { address?: string; chain?: string } | undefined
  if (!opts?.address || !opts?.chain) {
    throw Object.assign(new Error('Missing address or chain'), { code: BioErrorCodes.INVALID_PARAMS })
  }

  const provider = getChainProvider(opts.chain)

  try {
    // 使用 ChainProvider 的 nativeBalance fetcher
    const balance = await provider.nativeBalance.fetch({ address: opts.address })
    return balance?.amount.toRawString() ?? '0'
  } catch {
    return '0'
  }
}

