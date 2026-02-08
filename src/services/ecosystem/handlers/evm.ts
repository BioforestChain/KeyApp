/**
 * EVM (Ethereum/BSC) method handlers
 *
 * Handles window.ethereum requests from miniapps.
 * Maps EIP-1193 methods to KeyApp wallet operations.
 */

import type { MethodHandler, BioAccount } from '../types'
import { BioErrorCodes } from '../types'
import { HandlerContext } from './context'
import { enqueueMiniappSheet } from '../sheet-queue'
import {
  toHexChainId,
  parseHexChainId,
  getKeyAppChainId,
  EVM_CHAIN_IDS,
} from '@biochain/bio-sdk'

import type { EvmTransactionRequest, MiniappInfo } from './context'

// Re-export for convenience
export type { EvmTransactionRequest } from './context'

// ============================================
// Types
// ============================================

/** EVM Sign Request */
export interface EvmSignRequest {
  address: string
  message: string
}

/** Typed Data (EIP-712) */
export interface TypedDataV4 {
  types: Record<string, Array<{ name: string; type: string }>>
  primaryType: string
  domain: {
    name?: string
    version?: string
    chainId?: number
    verifyingContract?: string
    salt?: string
  }
  message: Record<string, unknown>
}

// ============================================
// State
// ============================================

/** Current selected chain for each app */
const appChainState = new Map<string, string>()

/** Connected accounts for each app */
const appAccountState = new Map<string, string[]>()

// ============================================
// Callback setters (for UI integration)
// ============================================

let _showEvmWalletPicker: ((opts: { chainId: string; app?: MiniappInfo }) => Promise<BioAccount | null>) | null = null
let _showChainSwitchConfirm: ((opts: { fromChainId: string; toChainId: string; appName: string; appIcon?: string }) => Promise<boolean>) | null = null
let _showEvmSigningDialog: ((opts: { message: string; address: string; appName: string }) => Promise<{ signature: string } | null>) | null = null
let _showEvmTransactionDialog: ((opts: { tx: EvmTransactionRequest; appName: string }) => Promise<{ txHash: string } | null>) | null = null

export function setEvmWalletPicker(picker: typeof _showEvmWalletPicker): void {
  _showEvmWalletPicker = picker
}

export function setChainSwitchConfirm(confirm: typeof _showChainSwitchConfirm): void {
  _showChainSwitchConfirm = confirm
}

export function setEvmSigningDialog(dialog: typeof _showEvmSigningDialog): void {
  _showEvmSigningDialog = dialog
}

export function setEvmTransactionDialog(dialog: typeof _showEvmTransactionDialog): void {
  _showEvmTransactionDialog = dialog
}

// ============================================
// Helper functions
// ============================================

function getWalletPicker(appId: string) {
  const callbacks = HandlerContext.get(appId)
  return callbacks?.showEvmWalletPicker ?? _showEvmWalletPicker
}

function getSigningDialog(appId: string) {
  const callbacks = HandlerContext.get(appId)
  return callbacks?.showEvmSigningDialog ?? _showEvmSigningDialog
}

function getTransactionDialog(appId: string) {
  const callbacks = HandlerContext.get(appId)
  return callbacks?.showEvmTransactionDialog ?? _showEvmTransactionDialog
}

function getCurrentChainId(appId: string): string {
  // Default to BSC
  return appChainState.get(appId) ?? toHexChainId(EVM_CHAIN_IDS.binance)
}

function setCurrentChainId(appId: string, chainId: string): void {
  appChainState.set(appId, chainId)
}

function getConnectedAccounts(appId: string): string[] {
  return appAccountState.get(appId) ?? []
}

function setConnectedAccounts(appId: string, accounts: string[]): void {
  appAccountState.set(appId, accounts)
}

// ============================================
// Handlers
// ============================================

/** eth_chainId - Get current chain ID */
export const handleEthChainId: MethodHandler = async (_params, context) => {
  return getCurrentChainId(context.appId)
}

/** eth_requestAccounts - Request wallet connection */
export const handleEthRequestAccounts: MethodHandler = async (_params, context) => {
  const showWalletPicker = getWalletPicker(context.appId)
  if (!showWalletPicker) {
    throw Object.assign(new Error('Wallet picker not available'), { code: BioErrorCodes.INTERNAL_ERROR })
  }

  const chainId = getCurrentChainId(context.appId)

  const wallet = await enqueueMiniappSheet(context.appId, () =>
    showWalletPicker({ chainId, app: { name: context.appName, icon: context.appIcon } }),
  )
  if (!wallet) {
    throw Object.assign(new Error('User rejected'), { code: BioErrorCodes.USER_REJECTED })
  }

  const accounts = [wallet.address]
  setConnectedAccounts(context.appId, accounts)
  return accounts
}

/** eth_accounts - Get connected accounts (no UI) */
export const handleEthAccounts: MethodHandler = async (_params, context) => {
  return getConnectedAccounts(context.appId)
}

/** wallet_switchEthereumChain - Switch to a different chain */
export const handleSwitchChain: MethodHandler = async (params, context) => {
  const request = params as { chainId: string } | undefined
  if (!request?.chainId) {
    throw Object.assign(new Error('Missing chainId'), { code: BioErrorCodes.INVALID_PARAMS })
  }

  const targetChainId = request.chainId
  const keyAppChainId = getKeyAppChainId(targetChainId)

  if (!keyAppChainId) {
    // Chain not supported
    throw Object.assign(
      new Error(`Chain ${targetChainId} not supported`),
      { code: 4902 } // EIP-3326 chain not added
    )
  }

  const currentChainId = getCurrentChainId(context.appId)
  if (currentChainId === targetChainId) {
    // Already on this chain
    return null
  }

  // Show confirmation dialog
  if (_showChainSwitchConfirm) {
    const approved = await enqueueMiniappSheet(context.appId, () =>
      _showChainSwitchConfirm({
        fromChainId: currentChainId,
        toChainId: targetChainId,
        appName: context.appName,
        appIcon: context.appIcon,
      }),
    )
    if (!approved) {
      throw Object.assign(new Error('User rejected'), { code: BioErrorCodes.USER_REJECTED })
    }
  }

  setCurrentChainId(context.appId, targetChainId)

  // Note: chainChanged event should be emitted by the bridge
  return null
}

/** wallet_addEthereumChain - Add a new chain (not supported) */
export const handleAddChain: MethodHandler = async (_params, _context) => {
  throw Object.assign(
    new Error('Adding custom chains is not supported'),
    { code: BioErrorCodes.UNSUPPORTED_METHOD }
  )
}

/** personal_sign - Sign a message */
export const handlePersonalSign: MethodHandler = async (params, context) => {
  // personal_sign params: [message, address]
  const [message, address] = params as [string, string]
  if (!message || !address) {
    throw Object.assign(new Error('Missing message or address'), { code: BioErrorCodes.INVALID_PARAMS })
  }

  const showSigningDialog = getSigningDialog(context.appId)
  if (!showSigningDialog) {
    throw Object.assign(new Error('Signing dialog not available'), { code: BioErrorCodes.INTERNAL_ERROR })
  }

  const result = await enqueueMiniappSheet(context.appId, () =>
    showSigningDialog({ message, address, appName: context.appName }),
  )
  if (!result) {
    throw Object.assign(new Error('User rejected'), { code: BioErrorCodes.USER_REJECTED })
  }

  return result.signature
}

/** eth_sign - Sign data (deprecated, same as personal_sign) */
export const handleEthSign: MethodHandler = async (params, context) => {
  // eth_sign params: [address, message] (order is reversed from personal_sign)
  const [address, message] = params as [string, string]
  return handlePersonalSign([message, address], context)
}

/** eth_signTypedData_v4 - Sign EIP-712 typed data */
export const handleSignTypedDataV4: MethodHandler = async (params, context) => {
  const [address, typedData] = params as [string, string | TypedDataV4]
  if (!address || !typedData) {
    throw Object.assign(new Error('Missing address or typedData'), { code: BioErrorCodes.INVALID_PARAMS })
  }

  const data = typeof typedData === 'string' ? JSON.parse(typedData) : typedData

  const showSigningDialog = getSigningDialog(context.appId)
  if (!showSigningDialog) {
    throw Object.assign(new Error('Signing dialog not available'), { code: BioErrorCodes.INTERNAL_ERROR })
  }

  // Format typed data for display
  const displayMessage = JSON.stringify(data, null, 2)

  const result = await enqueueMiniappSheet(context.appId, () =>
    showSigningDialog({
      message: displayMessage,
      address,
      appName: context.appName,
    }),
  )
  if (!result) {
    throw Object.assign(new Error('User rejected'), { code: BioErrorCodes.USER_REJECTED })
  }

  return result.signature
}

/** eth_sendTransaction - Send a transaction */
export const handleEthSendTransaction: MethodHandler = async (params, context) => {
  const tx = params as EvmTransactionRequest | undefined
  if (!tx?.from) {
    throw Object.assign(new Error('Missing transaction data'), { code: BioErrorCodes.INVALID_PARAMS })
  }

  const showTransactionDialog = getTransactionDialog(context.appId)
  if (!showTransactionDialog) {
    throw Object.assign(new Error('Transaction dialog not available'), { code: BioErrorCodes.INTERNAL_ERROR })
  }

  // Add current chainId if not specified
  if (!tx.chainId) {
    tx.chainId = getCurrentChainId(context.appId)
  }

  const result = await enqueueMiniappSheet(context.appId, () => showTransactionDialog({ tx, appName: context.appName }))
  if (!result) {
    throw Object.assign(new Error('User rejected'), { code: BioErrorCodes.USER_REJECTED })
  }

  return result.txHash
}

/** eth_signTransaction - Sign transaction without broadcasting */
export const handleEthSignTransaction: MethodHandler = async (params, _context) => {
  const tx = params as EvmTransactionRequest | undefined
  if (!tx?.from) {
    throw Object.assign(new Error('Missing transaction data'), { code: BioErrorCodes.INVALID_PARAMS })
  }

  // TODO: Implement sign-only (no broadcast)
  // For now, not supported
  throw Object.assign(
    new Error('eth_signTransaction not yet supported, use eth_sendTransaction'),
    { code: BioErrorCodes.UNSUPPORTED_METHOD }
  )
}

/** eth_getBalance - Get account balance */
export const handleEthGetBalance: MethodHandler = async (params, _context) => {
  const [address] = params as [string, string?]
  if (!address) {
    throw Object.assign(new Error('Missing address'), { code: BioErrorCodes.INVALID_PARAMS })
  }

  // TODO: Query balance from chain adapter
  // For now, return 0
  return '0x0'
}

/** net_version - Get network version (decimal chain ID) */
export const handleNetVersion: MethodHandler = async (_params, context) => {
  const hexChainId = getCurrentChainId(context.appId)
  const decimal = parseHexChainId(hexChainId)
  return String(decimal)
}

/** eth_blockNumber - Get current block number */
export const handleEthBlockNumber: MethodHandler = async (_params, _context) => {
  // TODO: Query from RPC
  return '0x0'
}

/** web3_clientVersion - Get client version */
export const handleWeb3ClientVersion: MethodHandler = async (_params, _context) => {
  return 'KeyApp/1.0.0'
}

// ============================================
// Export all handlers map
// ============================================

export const evmHandlers: Record<string, MethodHandler> = {
  eth_chainId: handleEthChainId,
  eth_requestAccounts: handleEthRequestAccounts,
  eth_accounts: handleEthAccounts,
  wallet_switchEthereumChain: handleSwitchChain,
  wallet_addEthereumChain: handleAddChain,
  personal_sign: handlePersonalSign,
  eth_sign: handleEthSign,
  eth_signTypedData_v4: handleSignTypedDataV4,
  eth_sendTransaction: handleEthSendTransaction,
  eth_signTransaction: handleEthSignTransaction,
  eth_getBalance: handleEthGetBalance,
  net_version: handleNetVersion,
  eth_blockNumber: handleEthBlockNumber,
  web3_clientVersion: handleWeb3ClientVersion,
}

/** Register all EVM handlers with the bridge */
export function registerEvmHandlers(registerHandler: (method: string, handler: MethodHandler) => void): void {
  for (const [method, handler] of Object.entries(evmHandlers)) {
    registerHandler(method, handler)
  }
}
