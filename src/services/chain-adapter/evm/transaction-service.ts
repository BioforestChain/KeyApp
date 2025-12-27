/**
 * EVM Transaction Service
 * 
 * Handles transaction building, signing, and broadcasting for EVM chains.
 */

import type { ChainConfig } from '@/services/chain-config'
import type {
  ITransactionService,
  TransferParams,
  UnsignedTransaction,
  SignedTransaction,
  TransactionHash,
  TransactionStatus,
  Transaction,
  FeeEstimate,
  Fee,
} from '../types'
import { Amount } from '@/types/amount'
import { ChainServiceError, ChainErrorCodes } from '../types'

export class EvmTransactionService implements ITransactionService {
  private readonly config: ChainConfig
  private readonly apiUrl: string
  private readonly apiPath: string

  constructor(config: ChainConfig) {
    this.config = config
    this.apiUrl = config.api?.url ?? 'https://walletapi.bfmeta.info'
    this.apiPath = config.api?.path ?? config.id
  }

  private async fetch<T>(endpoint: string, body?: unknown): Promise<T> {
    const url = `${this.apiUrl}/wallet/${this.apiPath}${endpoint}`
    const init: RequestInit = body
      ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      : { method: 'GET' }
    const response = await fetch(url, init)

    if (!response.ok) {
      throw new ChainServiceError(
        ChainErrorCodes.NETWORK_ERROR,
        `HTTP ${response.status}: ${response.statusText}`,
      )
    }

    const json = await response.json() as { success: boolean; result?: T; error?: { message: string } }
    if (!json.success) {
      throw new ChainServiceError(
        ChainErrorCodes.NETWORK_ERROR,
        json.error?.message ?? 'API request failed',
      )
    }

    return json.result as T
  }

  async estimateFee(_params: TransferParams): Promise<FeeEstimate> {
    // Estimate gas for a simple transfer (21000 gas)
    const gasLimit = 21000n
    const gasPrice = 20000000000n // 20 Gwei default

    const fee = Amount.fromRaw((gasLimit * gasPrice).toString(), this.config.decimals, this.config.symbol)

    const feeObj: Fee = {
      amount: fee,
      estimatedTime: 15, // ~15 seconds
    }

    return {
      slow: { ...feeObj, estimatedTime: 60 },
      standard: feeObj,
      fast: { ...feeObj, estimatedTime: 5 },
    }
  }

  async buildTransaction(params: TransferParams): Promise<UnsignedTransaction> {
    // Build EVM transaction
    return {
      chainId: this.config.id,
      data: {
        from: params.from,
        to: params.to,
        value: params.amount.raw.toString(),
        gasLimit: '21000',
      },
    }
  }

  async signTransaction(
    _unsignedTx: UnsignedTransaction,
    _privateKey: Uint8Array,
  ): Promise<SignedTransaction> {
    // TODO: Implement EVM transaction signing using @noble/secp256k1
    throw new ChainServiceError(
      ChainErrorCodes.CHAIN_NOT_SUPPORTED,
      'EVM transaction signing not yet implemented',
    )
  }

  async broadcastTransaction(_signedTx: SignedTransaction): Promise<TransactionHash> {
    throw new ChainServiceError(
      ChainErrorCodes.CHAIN_NOT_SUPPORTED,
      'EVM transaction broadcast not yet implemented',
    )
  }

  async getTransactionStatus(hash: TransactionHash): Promise<TransactionStatus> {
    try {
      const result = await this.fetch<{ 
        status: string
        confirmations: number 
      }>('/transaction/status', { hash })

      return {
        status: result.status === 'confirmed' ? 'confirmed' : 'pending',
        confirmations: result.confirmations,
        requiredConfirmations: 12,
      }
    } catch {
      return {
        status: 'pending',
        confirmations: 0,
        requiredConfirmations: 12,
      }
    }
  }

  async getTransaction(hash: TransactionHash): Promise<Transaction | null> {
    try {
      const result = await this.fetch<{
        hash: string
        from: string
        to: string
        value: string
        gasUsed: string
        gasPrice: string
        status: string
        timestamp: number
        blockNumber: string
      }>('/transaction', { hash })

      return {
        hash: result.hash,
        from: result.from,
        to: result.to,
        amount: Amount.fromRaw(result.value, this.config.decimals, this.config.symbol),
        fee: Amount.fromRaw(
          (BigInt(result.gasUsed) * BigInt(result.gasPrice)).toString(),
          this.config.decimals,
          this.config.symbol,
        ),
        status: {
          status: result.status === 'success' ? 'confirmed' : 'failed',
          confirmations: 12,
          requiredConfirmations: 12,
        },
        timestamp: result.timestamp,
        blockNumber: result.blockNumber ? BigInt(result.blockNumber) : undefined,
        type: 'transfer',
      }
    } catch {
      return null
    }
  }

  async getTransactionHistory(address: string, limit = 20): Promise<Transaction[]> {
    try {
      const result = await this.fetch<Array<{
        hash: string
        from: string
        to: string
        value: string
        gasUsed: string
        gasPrice: string
        status: string
        timestamp: number
        blockNumber: string
      }>>('/transactions', { address, limit })

      return result.map((tx) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        amount: Amount.fromRaw(tx.value, this.config.decimals, this.config.symbol),
        fee: Amount.fromRaw(
          (BigInt(tx.gasUsed) * BigInt(tx.gasPrice)).toString(),
          this.config.decimals,
          this.config.symbol,
        ),
        status: {
          status: tx.status === 'success' ? 'confirmed' as const : 'failed' as const,
          confirmations: 12,
          requiredConfirmations: 12,
        },
        timestamp: tx.timestamp,
        blockNumber: tx.blockNumber ? BigInt(tx.blockNumber) : undefined,
        type: 'transfer' as const,
      }))
    } catch {
      return []
    }
  }
}
