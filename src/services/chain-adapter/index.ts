/**
 * Chain Adapter Service
 *
 * Provides unified interface for interacting with different blockchain networks.
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

// Registry
export { getAdapterRegistry, resetAdapterRegistry } from './registry'

// Adapters
export { BioforestAdapter, createBioforestAdapter } from './bioforest'

// Setup function to register all adapters
import { getAdapterRegistry } from './registry'
import { createBioforestAdapter } from './bioforest'

export function setupAdapters(): void {
  const registry = getAdapterRegistry()
  registry.register('bioforest', createBioforestAdapter)
  // TODO: Register other adapters
  // registry.register('evm', createEvmAdapter)
  // registry.register('bip39', createBip39Adapter)
}
