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
  handleDestroyAsset,
  registerEvmHandlers,
  registerTronHandlers,
} from './handlers'
import {
  handleRequestCryptoToken,
  handleCryptoExecute,
  handleGetCryptoTokenInfo,
} from './handlers/crypto'

/** Track if handlers have been registered */
let initialized = false

/** Initialize the Bio provider with all handlers */
export function initBioProvider(): void {
  // Prevent double initialization
  if (initialized) return
  initialized = true

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

  // Destroy asset (BioForest chains only)
  bridge.registerHandler('bio_destroyAsset', handleDestroyAsset)

  // Crypto box (Token-based crypto operations)
  bridge.registerHandler('bio_requestCryptoToken', handleRequestCryptoToken)
  bridge.registerHandler('bio_cryptoExecute', handleCryptoExecute)
  bridge.registerHandler('bio_getCryptoTokenInfo', handleGetCryptoTokenInfo)

  // EVM methods (Ethereum/BSC via window.ethereum)
  registerEvmHandlers((method, handler) => bridge.registerHandler(method, handler))

  // TRON methods (via window.tronLink/tronWeb)
  registerTronHandlers((method, handler) => bridge.registerHandler(method, handler))


}

// Auto-initialize handlers at module load time to prevent race conditions
// where miniapp calls methods before React useEffect runs
initBioProvider()

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
  setDestroyDialog,
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

// Crypto box setters
export { setCryptoAuthorizeDialog } from './handlers/crypto'
