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
export { EvmAdapter, createEvmAdapter } from './evm'
export { Bip39Adapter, createBip39Adapter } from './bip39'

// Setup function to register all adapters
import { getAdapterRegistry } from './registry'
import { createBioforestAdapter } from './bioforest'
import { createEvmAdapter } from './evm'
import { createBip39Adapter } from './bip39'

export function setupAdapters(): void {
  const registry = getAdapterRegistry()
  registry.register('bioforest', createBioforestAdapter)
  registry.register('evm', createEvmAdapter)
  registry.register('bip39', createBip39Adapter)
}
