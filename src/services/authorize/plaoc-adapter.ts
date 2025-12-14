/**
 * DWEB/Plaoc Authorization Adapter Interface
 *
 * This module defines the high-level interface for DWEB/Plaoc authorization flows.
 * Based on mpay spike research (PeerB 2025-12-13).
 *
 * Implementation pending DWEB runtime availability.
 * See: ../legacy-apps/apps/mpay/src/pages/authorize/
 *
 * @module services/authorize/plaoc-adapter
 */

export type {
  AddressAuthType,
  AddressAuthRequest,
  AddressAuthResponse,
  SignatureType,
  TransferPayload,
  MessagePayload,
  SignatureRequest,
} from './types'

import type { AddressAuthRequest, AddressAuthResponse, SignatureRequest } from './types'

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
  return typeof globalThis === 'object' && globalThis !== null && 'plaoc' in globalThis
}
