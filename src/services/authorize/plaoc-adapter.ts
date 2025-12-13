/**
 * DWEB/Plaoc Authorization Adapter Interface
 *
 * This module defines the interface for DWEB/Plaoc authorization flows.
 * Based on mpay spike research (PeerB 2025-12-13).
 *
 * Implementation pending DWEB runtime availability.
 * See: ../legacy-apps/apps/mpay/src/pages/authorize/
 *
 * @module services/authorize/plaoc-adapter
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
 * Base signature request structure
 */
export interface SignatureRequest {
  /** IPC callback handle */
  eventId: string
  /** Type of signature operation */
  type: SignatureType
  /** Operation-specific payload */
  payload: TransferPayload | MessagePayload | unknown
  /** Requesting application info */
  appName: string
  appHome: string
  appLogo: string
}

// ============================================================================
// Adapter Interface
// ============================================================================

/**
 * Plaoc DWEB authorization adapter interface
 *
 * Implementations of this interface handle communication between
 * external DWEB applications and the KeyApp wallet.
 */
export interface PlaocAdapter {
  /**
   * Handle address authorization request
   * Shows UI for user to approve sharing wallet addresses
   */
  handleAddressRequest(req: AddressAuthRequest): Promise<AddressAuthResponse[]>

  /**
   * Handle signature authorization request
   * Shows UI for user to approve signing operation
   */
  handleSignatureRequest(req: SignatureRequest): Promise<string>

  /**
   * Send response back to requesting DWEB app via IPC
   */
  respondWith(eventId: string, data: unknown): void

  /**
   * Check if DWEB runtime is available
   */
  isAvailable(): boolean
}

// ============================================================================
// Factory & Placeholder
// ============================================================================

/**
 * Create a Plaoc adapter instance
 *
 * @throws Error - DWEB/Plaoc runtime not available
 *
 * @example
 * ```typescript
 * const adapter = createPlaocAdapter()
 * if (adapter.isAvailable()) {
 *   const addresses = await adapter.handleAddressRequest(request)
 * }
 * ```
 */
export function createPlaocAdapter(): PlaocAdapter {
  // TODO: Implement when DWEB/Plaoc runtime is available
  // See: @aspect-aspect/aspect-channel or equivalent IPC
  throw new Error(
    'DWEB/Plaoc runtime not available. ' +
      'T022 authorize feature is blocked pending DWEB integration.'
  )
}

/**
 * Check if Plaoc runtime is available in current environment
 */
export function isPlaocAvailable(): boolean {
  // TODO: Implement runtime detection
  // Check for window.plaoc or similar DWEB global
  return false
}
