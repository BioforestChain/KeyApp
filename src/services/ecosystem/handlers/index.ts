/**
 * Handler exports
 */

export { HandlerContext, getCallbacksOrThrow, type HandlerCallbacks, type SigningParams, type SignTransactionParams } from './context'

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
  handleCreateTransaction,
  handleSignTransaction,
  setSignTransactionDialog,
  signUnsignedTransaction,
} from './transaction'
