/**
 * BIP39 Transaction Service (Bitcoin, Tron)
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

export class Bip39TransactionService implements ITransactionService {
  readonly supportsTransactionHistory = true
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
    // Default fee estimates
    const feeAmount = this.config.id === 'bitcoin'
      ? Amount.fromRaw('10000', this.config.decimals, this.config.symbol) // ~0.0001 BTC
      : Amount.fromRaw('1000000', this.config.decimals, this.config.symbol) // 1 TRX

    const fee: Fee = {
      amount: feeAmount,
      estimatedTime: this.config.id === 'bitcoin' ? 600 : 3,
    }

    return {
      slow: { ...fee, estimatedTime: fee.estimatedTime * 2 },
      standard: fee,
      fast: { ...fee, estimatedTime: Math.ceil(fee.estimatedTime / 2) },
    }
  }

  async buildTransaction(params: TransferParams): Promise<UnsignedTransaction> {
    return {
      chainId: this.config.id,
      data: {
        from: params.from,
        to: params.to,
        amount: params.amount.raw.toString(),
      },
    }
  }

  async signTransaction(
    _unsignedTx: UnsignedTransaction,
    _privateKey: Uint8Array,
  ): Promise<SignedTransaction> {
    throw new ChainServiceError(
      ChainErrorCodes.CHAIN_NOT_SUPPORTED,
      `${this.config.id} transaction signing not yet implemented`,
    )
  }

  async broadcastTransaction(_signedTx: SignedTransaction): Promise<TransactionHash> {
    throw new ChainServiceError(
      ChainErrorCodes.CHAIN_NOT_SUPPORTED,
      `${this.config.id} transaction broadcast not yet implemented`,
    )
  }

  async getTransactionStatus(hash: TransactionHash): Promise<TransactionStatus> {
    try {
      const result = await this.fetch<{ 
        confirmations: number
        status: string
      }>('/transaction/status', { hash })

      const requiredConfirmations = this.config.id === 'bitcoin' ? 6 : 19

      return {
        status: result.confirmations >= requiredConfirmations ? 'confirmed' : 'confirming',
        confirmations: result.confirmations,
        requiredConfirmations,
      }
    } catch {
      return {
        status: 'pending',
        confirmations: 0,
        requiredConfirmations: this.config.id === 'bitcoin' ? 6 : 19,
      }
    }
  }

  async getTransaction(hash: TransactionHash): Promise<Transaction | null> {
    try {
      const result = await this.fetch<{
        hash: string
        from: string
        to: string
        amount: string
        fee: string
        status: string
        timestamp: number
        blockNumber?: string
      }>('/transaction', { hash })

      return {
        hash: result.hash,
        from: result.from,
        to: result.to,
        amount: Amount.fromRaw(result.amount, this.config.decimals, this.config.symbol),
        fee: Amount.fromRaw(result.fee, this.config.decimals, this.config.symbol),
        status: {
          status: result.status === 'confirmed' ? 'confirmed' : 'pending',
          confirmations: result.status === 'confirmed' ? 6 : 0,
          requiredConfirmations: this.config.id === 'bitcoin' ? 6 : 19,
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
        amount: string
        fee: string
        status: string
        timestamp: number
        blockNumber?: string
      }>>('/transactions', { address, limit })

      return result.map((tx) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        amount: Amount.fromRaw(tx.amount, this.config.decimals, this.config.symbol),
        fee: Amount.fromRaw(tx.fee, this.config.decimals, this.config.symbol),
        status: {
          status: tx.status === 'confirmed' ? 'confirmed' as const : 'pending' as const,
          confirmations: tx.status === 'confirmed' ? 6 : 0,
          requiredConfirmations: this.config.id === 'bitcoin' ? 6 : 19,
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
