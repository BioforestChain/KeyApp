/**
 * BioForest Transaction Service
 * 
 * Implements full transaction creation, signing, and broadcasting
 * using Ed25519 signatures compatible with BioForest chain.
 */

import type { ChainConfig } from '@/services/chain-config'
import type {
  ITransactionService,
  TransferParams,
  FeeEstimate,
  Fee,
  UnsignedTransaction,
  SignedTransaction,
  TransactionHash,
  TransactionStatus,
  Transaction,
  Address,
} from '../types'
import { ChainServiceError, ChainErrorCodes } from '../types'
import { BioforestChainService } from './chain-service'
import { signMessage, bytesToHex } from '@/lib/crypto'

export class BioforestTransactionService implements ITransactionService {
  private readonly config: ChainConfig
  private readonly baseUrl: string
  private readonly chainService: BioforestChainService

  constructor(config: ChainConfig) {
    this.config = config
    this.baseUrl = config.rpcUrl ?? ''
    this.chainService = new BioforestChainService(config)
  }

  async estimateFee(_params: TransferParams): Promise<FeeEstimate> {
    const gasPrice = await this.chainService.getGasPrice()

    const createFee = (amount: bigint, time: number): Fee => ({
      amount,
      formatted: this.formatAmount(amount),
      estimatedTime: time,
    })

    return {
      slow: createFee(gasPrice.slow, 30),
      standard: createFee(gasPrice.standard, 15),
      fast: createFee(gasPrice.fast, 5),
    }
  }

  async buildTransaction(params: TransferParams): Promise<UnsignedTransaction> {
    // Validate addresses
    if (!params.from || !params.to) {
      throw new ChainServiceError(ChainErrorCodes.INVALID_ADDRESS, 'Invalid address')
    }

    // Get fee estimate
    const feeEstimate = await this.estimateFee(params)

    return {
      chainId: this.config.id,
      data: {
        type: 'transfer',
        from: params.from,
        to: params.to,
        amount: params.amount.toString(),
        assetType: this.config.symbol,
        fee: feeEstimate.standard.amount.toString(),
        memo: params.memo,
        timestamp: Date.now(),
      },
    }
  }

  async signTransaction(
    unsignedTx: UnsignedTransaction,
    privateKey: Uint8Array,
  ): Promise<SignedTransaction> {
    const txData = unsignedTx.data as Record<string, unknown>

    // Serialize transaction data for signing
    // BioForest uses a specific ordering for transaction fields
    const signableData = JSON.stringify({
      type: txData.type,
      from: txData.from,
      to: txData.to,
      amount: txData.amount,
      assetType: txData.assetType,
      fee: txData.fee,
      timestamp: txData.timestamp,
      memo: txData.memo ?? '',
    })

    // Sign the transaction using Ed25519
    const signature = signMessage(signableData, privateKey)
    const signatureHex = bytesToHex(signature)

    return {
      chainId: unsignedTx.chainId,
      data: {
        ...txData,
        signature: signatureHex,
        publicKey: bytesToHex(privateKey.slice(32, 64)), // Extract public key from extended private key
      },
      signature: signatureHex,
    }
  }

  async broadcastTransaction(signedTx: SignedTransaction): Promise<TransactionHash> {
    if (!this.baseUrl) {
      throw new ChainServiceError(
        ChainErrorCodes.NETWORK_ERROR,
        'RPC URL not configured',
      )
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/wallet/${this.config.id}/transactions/broadcast`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transaction: signedTx.data }),
        },
      )

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { message?: string }
        throw new ChainServiceError(
          ChainErrorCodes.TRANSACTION_REJECTED,
          errorData.message ?? `Broadcast failed: ${response.status}`,
        )
      }

      const result = (await response.json()) as { data: { signature: string } }
      return result.data.signature
    } catch (error) {
      if (error instanceof ChainServiceError) throw error
      throw new ChainServiceError(
        ChainErrorCodes.NETWORK_ERROR,
        'Failed to broadcast transaction',
        undefined,
        error instanceof Error ? error : undefined,
      )
    }
  }

  async getTransactionStatus(hash: TransactionHash): Promise<TransactionStatus> {
    if (!this.baseUrl) {
      return {
        status: 'pending',
        confirmations: 0,
        requiredConfirmations: 1,
      }
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/wallet/${this.config.id}/transactions/query`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ signature: hash }),
        },
      )

      if (!response.ok) {
        return {
          status: 'pending',
          confirmations: 0,
          requiredConfirmations: 1,
        }
      }

      const result = (await response.json()) as {
        data: { transaction?: { height?: number } }
      }

      if (result.data.transaction?.height) {
        return {
          status: 'confirmed',
          confirmations: 1,
          requiredConfirmations: 1,
        }
      }

      return {
        status: 'pending',
        confirmations: 0,
        requiredConfirmations: 1,
      }
    } catch {
      return {
        status: 'pending',
        confirmations: 0,
        requiredConfirmations: 1,
      }
    }
  }

  async getTransaction(hash: TransactionHash): Promise<Transaction | null> {
    if (!this.baseUrl) {
      return null
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/wallet/${this.config.id}/transactions/query`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ signature: hash }),
        },
      )

      if (!response.ok) {
        return null
      }

      const result = (await response.json()) as {
        data: {
          transaction?: {
            signature: string
            senderId: string
            recipientId: string
            amount: string
            fee: string
            timestamp: number
            height?: number
          }
        }
      }

      const tx = result.data.transaction
      if (!tx) return null

      return {
        hash: tx.signature,
        from: tx.senderId,
        to: tx.recipientId,
        amount: BigInt(tx.amount),
        fee: BigInt(tx.fee),
        status: {
          status: tx.height ? 'confirmed' : 'pending',
          confirmations: tx.height ? 1 : 0,
          requiredConfirmations: 1,
        },
        timestamp: tx.timestamp,
        blockNumber: tx.height ? BigInt(tx.height) : undefined,
        type: 'transfer',
      }
    } catch {
      return null
    }
  }

  async getTransactionHistory(address: Address, limit = 20): Promise<Transaction[]> {
    if (!this.baseUrl) {
      return []
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/wallet/${this.config.id}/transactions/query`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address,
            pageSize: limit,
            page: 1,
          }),
        },
      )

      if (!response.ok) {
        return []
      }

      const result = (await response.json()) as {
        data: {
          transactions: Array<{
            signature: string
            senderId: string
            recipientId: string
            amount: string
            fee: string
            timestamp: number
            height?: number
          }>
        }
      }

      return result.data.transactions.map((tx) => ({
        hash: tx.signature,
        from: tx.senderId,
        to: tx.recipientId,
        amount: BigInt(tx.amount),
        fee: BigInt(tx.fee),
        status: {
          status: tx.height ? 'confirmed' : 'pending',
          confirmations: tx.height ? 1 : 0,
          requiredConfirmations: 1,
        } as const,
        timestamp: tx.timestamp,
        blockNumber: tx.height ? BigInt(tx.height) : undefined,
        type: 'transfer' as const,
      }))
    } catch {
      return []
    }
  }

  private formatAmount(raw: bigint): string {
    const decimals = this.config.decimals
    const divisor = BigInt(10 ** decimals)
    const integerPart = raw / divisor
    const fractionalPart = raw % divisor

    if (fractionalPart === 0n) {
      return integerPart.toString()
    }

    const fractionalStr = fractionalPart.toString().padStart(decimals, '0').replace(/0+$/, '')
    return `${integerPart}.${fractionalStr}`
  }
}
