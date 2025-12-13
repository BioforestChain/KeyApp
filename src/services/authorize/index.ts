/**
 * DWEB Authorization Services
 *
 * This module provides interfaces and utilities for DWEB/Plaoc authorization.
 * Implementation blocked pending DWEB runtime availability.
 *
 * @module services/authorize
 */

export {
  // Types
  type AddressAuthType,
  type AddressAuthRequest,
  type AddressAuthResponse,
  type SignatureType,
  type TransferPayload,
  type MessagePayload,
  type SignatureRequest,
  type PlaocAdapter,
  // Functions
  createPlaocAdapter,
  isPlaocAvailable,
} from './plaoc-adapter'
