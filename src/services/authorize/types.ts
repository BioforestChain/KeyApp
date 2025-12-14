/**
 * DWEB/Plaoc Authorization Types
 *
 * This module hosts all shared types for the authorize service.
 *
 * @module services/authorize/types
 */

// ============================================================================
// Address Authorization Types
// ============================================================================

/**
 * Type of addresses to authorize
 * - `main`: addresses from current wallet only
 * - `network`: all addresses on a specific chain
 * - `all`: all addresses from all wallets
 */
export type AddressAuthType = 'main' | 'network' | 'all'

/**
 * Request from external DWEB app for wallet addresses
 */
export interface AddressAuthRequest {
  /** IPC callback handle for responding */
  eventId: string
  /** Target blockchain network */
  chainName: string
  /** Scope of addresses to return */
  type: AddressAuthType
  /** Optional message to sign with each address */
  signMessage?: string
  /** Request main phrase (sensitive - requires extra confirmation) */
  getMain?: string
  /** Requesting application name */
  appName: string
  /** Requesting application home URL */
  appHome: string
  /** Requesting application logo URL */
  appLogo: string
}

/**
 * Response containing authorized wallet addresses
 */
export interface AddressAuthResponse {
  /** Wallet display name */
  name: string
  /** Wallet address */
  address: string
  /** Chain this address belongs to */
  chainName: string
  /** Public key for the address */
  publicKey: string
  /** Magic identifier */
  magic: string
  /** Signed message (if signMessage was requested) */
  signMessage: string
  /** Main phrase (only if getMain was requested and approved) */
  main?: string
}

// ============================================================================
// Signature Authorization Types
// ============================================================================

/**
 * Types of signature operations supported
 */
export type SignatureType =
  | 'message' // Simple message signing
  | 'json' // JSON object signing
  | 'transfer' // Token/coin transfer
  | 'destory' // Asset destruction (sic - matches mpay typo)
  | 'bioforestChainCertificateTransfer' // Certificate transfer
  | 'ENTITY' // NFT operations (exchange, issue, gift, grab)
  | 'assetTypeBalance' // Get asset balance
  | 'contract' // Smart contract call (Binance)

/**
 * Payload for transfer signature requests
 */
export interface TransferPayload {
  /** Target blockchain */
  chainName: string
  /** Sender wallet address */
  senderAddress: string
  /** Recipient wallet address */
  receiveAddress: string
  /** Amount to transfer */
  balance: string
  /** Transaction fee */
  fee?: string
  /** Asset type identifier */
  assetType?: string
  /** Contract details for token transfers */
  contractInfo?: {
    assetType: string
    decimals: number
    contractAddress: string
  }
}

/**
 * Payload for message signature requests
 */
export interface MessagePayload {
  /** Target blockchain */
  chainName: string
  /** Signer wallet address */
  senderAddress: string
  /** Message to sign */
  message: string
}

/**
 * Payload for asset destruction (burn) signature requests
 *
 * NOTE: The type name `destory` (sic) matches legacy mpay.
 */
export interface DestroyPayload {
  /** Target blockchain */
  chainName: string
  /** Sender wallet address */
  senderAddress: string
  /** Burn/destroy target address */
  destoryAddress: string
  /** Amount to destroy */
  destoryAmount: string
  /** Transaction fee */
  fee?: string
  /** Asset type identifier */
  assetType?: string
}

/**
 * Base signature request structure
 */
export interface SignatureRequest {
  /** IPC callback handle */
  eventId: string
  /** Type of signature operation */
  type: SignatureType
  /** Operation-specific payload */
  payload: TransferPayload | MessagePayload | DestroyPayload | unknown
  /** Requesting application info */
  appName: string
  appHome: string
  appLogo: string
}

// ============================================================================
// IPC / Platform Adapter Types
// ============================================================================

export interface CallerAppInfo {
  appId: string
  appName: string
  appIcon: string
  origin: string
}

/**
 * Plaoc IPC adapter interface (low-level)
 *
 * This interface represents the platform IPC boundary; implementations are
 * selected at compile-time via Vite alias `#authorize-impl`.
 */
export interface IPlaocAdapter {
  getCallerAppInfo(eventId: string): Promise<CallerAppInfo>
  respondWith(eventId: string, path: string, data: unknown): Promise<void>
  removeEventId(eventId: string): Promise<void>
  isAvailable(): boolean
}
