/**
 * DWEB Authorization Services
 *
 * @module services/authorize
 */

export type {
  IPlaocAdapter,
  CallerAppInfo,
  AddressAuthType,
  AddressAuthRequest,
  AddressAuthResponse,
  SignatureType,
  TransferPayload,
  MessagePayload,
  DestroyPayload,
  SignatureRequest,
} from './types'

export { AddressAuthService } from './address-auth'
export { SignatureAuthService, type SignatureAuthError } from './signature-auth'

// High-level adapter interface (import directly from './plaoc-adapter' if needed)
export { createPlaocAdapter, isPlaocAvailable } from './plaoc-adapter'

// Low-level IPC adapter (compile-time switched via #authorize-impl alias)
import { PlaocAdapter } from '#authorize-impl'
export { PlaocAdapter }
export const plaocAdapter = new PlaocAdapter()
