/**
 * EVM Chain Adapter Types
 */

import type { ChainConfig } from '@/services/chain-config'

export interface EvmChainConfig extends ChainConfig {
  chainKind: 'evm'
  /** EVM Chain ID (e.g., 1 for Ethereum mainnet, 56 for BSC) */
  chainId?: number
  /** RPC endpoint URL */
  rpcUrl?: string
}

export interface EvmTransactionReceipt {
  transactionHash: string
  blockNumber: bigint
  blockHash: string
  status: 'success' | 'reverted'
  gasUsed: bigint
  effectiveGasPrice: bigint
}

export interface EvmTransactionRequest {
  from: string
  to: string
  value: bigint
  data?: string
  nonce?: number
  gasLimit?: bigint
  gasPrice?: bigint
  maxFeePerGas?: bigint
  maxPriorityFeePerGas?: bigint
}
