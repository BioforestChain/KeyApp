/**
 * Handler exports
 */

export {
  HandlerContext,
  getCallbacksOrThrow,
  type HandlerCallbacks,
  type SigningParams,
  type SignTransactionParams,
  type EvmTransactionRequest,
  type TronTransaction,
  type EvmSigningParams,
  type EvmTransactionParams,
  type TronSigningParams,
} from './context'

export { handleCloseSplashScreen } from './system'

export {
  handleConnect,
  handleRequestAccounts,
  handleAccounts,
  handleSelectAccount,
  handlePickWallet,
  handleChainId,
  handleGetBalance,
  setWalletPicker,
  setGetAccounts,
} from './wallet'

export {
  handleSignMessage,
  handleSignTypedData,
  setSigningDialog,
} from './signing'

export {
  handleSendTransaction,
  setTransferDialog,
} from './transfer'

export {
  handleDestroyAsset,
  setDestroyDialog,
} from './destroy'

export {
  handleCreateTransaction,
  handleSignTransaction,
  setSignTransactionDialog,
  signUnsignedTransaction,
} from './transaction'

// EVM handlers
export {
  evmHandlers,
  registerEvmHandlers,
  setEvmWalletPicker,
  setChainSwitchConfirm,
  setEvmSigningDialog,
  setEvmTransactionDialog,
} from './evm'

// TRON handlers
export {
  tronHandlers,
  registerTronHandlers,
  setTronWalletPicker,
  setTronSigningDialog,
  type TronAddress,
} from './tron'
