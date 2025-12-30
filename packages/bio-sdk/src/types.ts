/**
 * Bio SDK Types
 * EIP-1193 style provider interface for Bio ecosystem
 */

/** Account information */
export interface BioAccount {
  address: string
  chain: string
  name?: string
}

/** Transfer parameters */
export interface TransferParams {
  from: string
  to: string
  amount: string
  chain: string
  asset?: string
}

/** Unsigned transaction payload (chain-specific) */
export interface BioUnsignedTransaction {
  chainId: string
  data: unknown
}

/** Signed transaction payload (chain-specific) */
export interface BioSignedTransaction {
  chainId: string
  data: unknown
  signature: string
}

/** Provider request arguments */
export interface RequestArguments {
  method: string
  params?: unknown[]
}

/** Provider RPC error */
export interface ProviderRpcError extends Error {
  code: number
  data?: unknown
}

/** Event handler type */
export type EventHandler<T = unknown> = (...args: T[]) => void

/**
 * Bio Provider Interface (EIP-1193 style)
 */
export interface BioProvider {
  /** Make a request to the provider */
  request<T = unknown>(args: RequestArguments): Promise<T>

  /** Subscribe to an event */
  on(event: string, handler: EventHandler): void

  /** Unsubscribe from an event */
  off(event: string, handler: EventHandler): void

  /** Check if connected */
  isConnected(): boolean
}

/**
 * Bio method definitions
 */
export interface BioMethods {
  /** Request wallet accounts (shows connection UI) */
  bio_requestAccounts: () => Promise<BioAccount[]>

  /** Get connected accounts (no UI) */
  bio_accounts: () => Promise<BioAccount[]>

  /** Select an account (shows account picker UI) */
  bio_selectAccount: (opts?: { chain?: string }) => Promise<BioAccount>

  /** Pick another wallet address (shows wallet picker UI) */
  bio_pickWallet: (opts?: { chain?: string; exclude?: string }) => Promise<BioAccount>

  /** Get public key for an address (hex encoded) */
  bio_getPublicKey: (params: { address: string }) => Promise<string>

  /** Sign a message */
  bio_signMessage: (params: { message: string; address: string }) => Promise<string>

  /** Sign typed data */
  bio_signTypedData: (params: { data: object; address: string }) => Promise<string>

  /** Create an unsigned transaction (no signature, no broadcast) */
  bio_createTransaction: (params: TransferParams) => Promise<BioUnsignedTransaction>

  /** Sign an unsigned transaction (requires user confirmation) */
  bio_signTransaction: (params: { from: string; chain: string; unsignedTx: BioUnsignedTransaction }) => Promise<BioSignedTransaction>

  /** Send a transaction */
  bio_sendTransaction: (params: TransferParams) => Promise<{ txHash: string }>

  /** Get current chain ID */
  bio_chainId: () => Promise<string>

  /** Get balance */
  bio_getBalance: (params: { address: string; chain: string }) => Promise<string>

  /** Close splash screen (indicates app is ready) */
  bio_closeSplashScreen: () => Promise<void>
}

/**
 * Bio event definitions
 */
export interface BioEvents {
  /** Emitted when accounts change */
  accountsChanged: (accounts: BioAccount[]) => void

  /** Emitted when chain changes */
  chainChanged: (chainId: string) => void

  /** Emitted when connected */
  connect: (info: { chainId: string }) => void

  /** Emitted when disconnected */
  disconnect: (error: { code: number; message: string }) => void
}

/** Method names */
export type BioMethodName = keyof BioMethods

/** Event names */
export type BioEventName = keyof BioEvents

/** RPC error codes */
export const BioErrorCodes = {
  USER_REJECTED: 4001,
  UNAUTHORIZED: 4100,
  UNSUPPORTED_METHOD: 4200,
  DISCONNECTED: 4900,
  CHAIN_DISCONNECTED: 4901,
  INTERNAL_ERROR: -32603,
  INVALID_PARAMS: -32602,
  METHOD_NOT_FOUND: -32601,
} as const

/** Create a provider RPC error */
export function createProviderError(code: number, message: string, data?: unknown): ProviderRpcError {
  const error = new Error(message) as ProviderRpcError
  error.code = code
  error.data = data
  return error
}
