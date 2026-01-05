/**
 * Chain Adapter Service
 *
 * Provides unified interface for interacting with different blockchain networks.
 * 
 * NOTE: For new code, prefer using ChainProvider from '@/services/chain-adapter/providers'.
 * The old adapter registry is deprecated but kept for internal use by wrapped providers.
 */

// Types
export type {
  Address,
  TransactionHash,
  Signature,
  Balance,
  TokenMetadata,
  FeeEstimate,
  Fee,
  TransferParams,
  UnsignedTransaction,
  SignedTransaction,
  TransactionStatus,
  TransactionStatusType,
  Transaction,
  TransactionType,
  ChainInfo,
  GasPrice,
  HealthStatus,
  IIdentityService,
  IAssetService,
  ITransactionService,
  IChainService,
  IStakingService,
  IChainAdapter,
  IAdapterRegistry,
  AdapterFactory,
} from './types'

export { ChainServiceError, ChainErrorCodes } from './types'

// New ChainProvider API (recommended)
export { 
  ChainProvider,
  getChainProvider,
  createChainProvider,
  clearProviderCache,
} from './providers'

// Unified derivation helper (single source of truth)
export {
  deriveWalletChainAddresses,
  type DerivedChainAddress,
  type DeriveWalletChainAddressesParams,
} from './derive-wallet-chain-addresses'

// =================================================================
// DEPRECATED: Old adapter registry API
// Use ChainProvider from './providers' instead
// =================================================================

/** @deprecated Use getChainProvider() from './providers' instead */
export { getAdapterRegistry, resetAdapterRegistry } from './registry'

// Adapters (kept for internal use by wrapped providers)
export { BioforestAdapter, createBioforestAdapter } from './bioforest'
export { EvmAdapter, createEvmAdapter } from './evm'
export { TronAdapter, createTronAdapter } from './tron'
export { BitcoinAdapter, createBitcoinAdapter } from './bitcoin'
