/**
 * Bio Provider Host
 *
 * Registers all handlers and manages the PostMessage bridge
 */

import { bridge } from './bridge'
import {
  handleConnect,
  handleRequestAccounts,
  handleAccounts,
  handleSelectAccount,
  handlePickWallet,
  handleChainId,
  handleGetBalance,
  handleGetPublicKey,
  handleSignMessage,
  handleSignTypedData,
  handleCreateTransaction,
  handleSignTransaction,
  handleSendTransaction,
} from './handlers'

/** Initialize the Bio provider with all handlers */
export function initBioProvider(): void {
  // Wallet methods
  bridge.registerHandler('bio_connect', handleConnect)
  bridge.registerHandler('bio_requestAccounts', handleRequestAccounts)
  bridge.registerHandler('bio_accounts', handleAccounts)
  bridge.registerHandler('bio_selectAccount', handleSelectAccount)
  bridge.registerHandler('bio_pickWallet', handlePickWallet)
  bridge.registerHandler('bio_chainId', handleChainId)
  bridge.registerHandler('bio_getBalance', handleGetBalance)
  bridge.registerHandler('bio_getPublicKey', handleGetPublicKey)

  // Signing methods
  bridge.registerHandler('bio_signMessage', handleSignMessage)
  bridge.registerHandler('bio_signTypedData', handleSignTypedData)

  // Transaction pipeline
  bridge.registerHandler('bio_createTransaction', handleCreateTransaction)
  bridge.registerHandler('bio_signTransaction', handleSignTransaction)

  // Transfer methods
  bridge.registerHandler('bio_sendTransaction', handleSendTransaction)

  console.log('[BioProvider] Initialized with handlers:', [
    'bio_connect',
    'bio_requestAccounts',
    'bio_accounts',
    'bio_selectAccount',
    'bio_pickWallet',
    'bio_chainId',
    'bio_getBalance',
    'bio_getPublicKey',
    'bio_signMessage',
    'bio_signTypedData',
    'bio_createTransaction',
    'bio_signTransaction',
    'bio_sendTransaction',
  ])
}

/** Get the bridge instance */
export function getBridge() {
  return bridge
}

/** Re-export handler setters for React integration */
export {
  setWalletPicker,
  setGetAccounts,
  setSigningDialog,
  setTransferDialog,
  setSignTransactionDialog,
} from './handlers'
