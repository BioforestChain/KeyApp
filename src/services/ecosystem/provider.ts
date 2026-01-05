/**
 * Bio Provider Host
 *
 * Registers all handlers and manages the PostMessage bridge
 */

import { bridge } from './bridge'
import {
  handleConnect,
  handleCloseSplashScreen,
  handleRequestAccounts,
  handleAccounts,
  handleSelectAccount,
  handlePickWallet,
  handleChainId,
  handleGetBalance,
  handleSignMessage,
  handleSignTypedData,
  handleCreateTransaction,
  handleSignTransaction,
  handleSendTransaction,
  registerEvmHandlers,
  registerTronHandlers,
} from './handlers'

/** Initialize the Bio provider with all handlers */
export function initBioProvider(): void {
  // Bio methods (BioChain + wallet features)
  bridge.registerHandler('bio_connect', handleConnect)
  bridge.registerHandler('bio_closeSplashScreen', handleCloseSplashScreen)
  bridge.registerHandler('bio_requestAccounts', handleRequestAccounts)
  bridge.registerHandler('bio_accounts', handleAccounts)
  bridge.registerHandler('bio_selectAccount', handleSelectAccount)
  bridge.registerHandler('bio_pickWallet', handlePickWallet)
  bridge.registerHandler('bio_chainId', handleChainId)
  bridge.registerHandler('bio_getBalance', handleGetBalance)

  // Signing methods
  bridge.registerHandler('bio_signMessage', handleSignMessage)
  bridge.registerHandler('bio_signTypedData', handleSignTypedData)

  // Transaction pipeline
  bridge.registerHandler('bio_createTransaction', handleCreateTransaction)
  bridge.registerHandler('bio_signTransaction', handleSignTransaction)

  // Transfer methods
  bridge.registerHandler('bio_sendTransaction', handleSendTransaction)

  // EVM methods (Ethereum/BSC via window.ethereum)
  registerEvmHandlers((method, handler) => bridge.registerHandler(method, handler))

  // TRON methods (via window.tronLink/tronWeb)
  registerTronHandlers((method, handler) => bridge.registerHandler(method, handler))

  console.log('[BioProvider] Initialized with handlers:', {
    bio: [
      'bio_connect',
      'bio_closeSplashScreen',
      'bio_requestAccounts',
      'bio_accounts',
      'bio_selectAccount',
      'bio_pickWallet',
      'bio_chainId',
      'bio_getBalance',
      'bio_signMessage',
      'bio_signTypedData',
      'bio_createTransaction',
      'bio_signTransaction',
      'bio_sendTransaction',
    ],
    evm: [
      'eth_chainId',
      'eth_requestAccounts',
      'eth_accounts',
      'wallet_switchEthereumChain',
      'personal_sign',
      'eth_sendTransaction',
      // ...
    ],
    tron: [
      'tron_requestAccounts',
      'tron_accounts',
      'tron_signTransaction',
      // ...
    ],
  })
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
  // EVM setters
  setEvmWalletPicker,
  setChainSwitchConfirm,
  setEvmSigningDialog,
  setEvmTransactionDialog,
  // TRON setters
  setTronWalletPicker,
  setTronSigningDialog,
} from './handlers'
