/**
 * BioForest Chain API
 *
 * Type-safe API client for BioForest Chain wallet services.
 *
 * @example
 * ```ts
 * import { BioForestApiClient, createMainnetClient } from '@/services/bioforest-api'
 *
 * // Create a client
 * const client = createMainnetClient()
 *
 * // Or with custom config
 * const client = new BioForestApiClient({
 *   rpcUrl: 'https://walletapi.bfmeta.info',
 *   chainId: 'bfm',
 * })
 *
 * // Get latest block
 * const block = await client.getLastBlock()
 *
 * // Get balance
 * const balance = await client.getBalance('bXXX...', 'BFM')
 *
 * // Check pay password status
 * const hasTwoStepSecret = await client.hasTwoStepSecret('bXXX...')
 *
 * // Get transaction history
 * const history = await client.getTransactionHistory('bXXX...')
 * ```
 */

export { BioForestApiClient, BioForestApiError, createMainnetClient } from './client'
export type { BioForestApiClientConfig } from './client'

export type {
  ApiResponse,
  ApiError,
  BlockInfo,
  BalanceInfo,
  AddressInfo,
  Transaction,
  TransactionInBlock,
  TransactionQueryResult,
  PendingTransaction,
  AccountAsset,
  AccountAssetsResult,
  BroadcastResult,
  FeeResult,
  TransactionQueryParams,
  PendingQueryParams,
  AccountAssetsParams,
  GenesisInfo,
  ChainStatus,
} from './types'
