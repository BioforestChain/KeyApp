/**
 * BioForest Transaction Service
 * 
 * Implements full transaction creation, signing, and broadcasting
 * using Ed25519 signatures compatible with BioForest chain.
 */

import type { ChainConfig } from '@/services/chain-config'
import { Amount } from '@/types/amount'
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

    const createFee = (amount: Amount, time: number): Fee => ({
      amount,
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
        amount: params.amount.toRawString(),
        assetType: this.config.symbol,
        fee: feeEstimate.standard.amount.toRawString(),
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

      const json = (await response.json()) as { success: boolean; result?: unknown; error?: { message?: string } }
      if (!json.success) {
        throw new ChainServiceError(
          ChainErrorCodes.TRANSACTION_REJECTED,
          json.error?.message ?? 'Broadcast failed',
        )
      }
      // Return the signature from the signed transaction (already have it)
      return signedTx.signature
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

      const json = (await response.json()) as {
        success: boolean
        result?: { trs?: Array<{ height?: number }> }
      }

      if (json.success && json.result?.trs?.[0]?.height) {
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

      const json = (await response.json()) as {
        success: boolean
        result?: {
          trs?: Array<{
            height: number
            transaction: {
              signature: string
              senderId: string
              recipientId?: string
              fee: string
              timestamp: number
              asset?: {
                transferAsset?: {
                  amount: string
                }
              }
            }
          }>
        }
      }

      if (!json.success || !json.result?.trs?.[0]) return null
      const item = json.result.trs[0]
      const tx = item.transaction

      const { decimals, symbol } = this.config

      const amountRaw = tx.asset?.transferAsset?.amount ?? '0'

      return {
        hash: tx.signature,
        from: tx.senderId,
        to: tx.recipientId ?? '',
        amount: Amount.fromRaw(amountRaw, decimals, symbol),
        fee: Amount.fromRaw(tx.fee, decimals, symbol),
        status: {
          status: 'confirmed',
          confirmations: 1,
          requiredConfirmations: 1,
        },
        timestamp: tx.timestamp * 1000, // Convert to milliseconds
        blockNumber: BigInt(item.height),
        type: 'transfer',
      }
    } catch {
      return null
    }
  }

  async getTransactionHistory(address: Address, limit = 20): Promise<Transaction[]> {
    if (!this.baseUrl) {
      console.warn('[TransactionService] No baseUrl configured for chain:', this.config.id)
      return []
    }

    try {
      // First get the latest block height
      const lastBlockUrl = `${this.baseUrl}/wallet/${this.config.id}/lastblock`
      const blockResponse = await fetch(lastBlockUrl)
      if (!blockResponse.ok) {
        console.warn('[TransactionService] Failed to get lastblock:', blockResponse.status)
        return []
      }
      const lastBlockJson = (await blockResponse.json()) as { success: boolean; result: { height: number; timestamp: number } }
      if (!lastBlockJson.success) {
        console.warn('[TransactionService] lastblock API returned success=false')
        return []
      }
      const maxHeight = lastBlockJson.result.height

      // Query transactions using the correct API format
      const queryUrl = `${this.baseUrl}/wallet/${this.config.id}/transactions/query`
      const response = await fetch(queryUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxHeight,
          address, // Query all transactions for this address
          page: 1,
          pageSize: limit,
          sort: -1, // Newest first
        }),
      })

      if (!response.ok) {
        console.warn('[TransactionService] API error:', response.status, response.statusText, 'for', queryUrl)
        return []
      }

      // BioForest API response format: { success: boolean, result: { trs: TransactionDetail[], count: number } }
      const json = (await response.json()) as {
        success: boolean
        result: {
          trs?: Array<{
            height: number
            signature: string // Block signature
            tIndex: number
            transaction: {
              signature: string // Transaction ID
              senderId: string
              recipientId?: string
              fee: string
              timestamp: number
              type: string
              asset?: {
                transferAsset?: {
                  amount: string
                  assetType: string
                }
              }
            }
          }>
          count?: number
        }
      }

      if (!json.success) {
        console.warn('[TransactionService] API returned success=false')
        return []
      }

      const transactions = json.result?.trs ?? []

      if (transactions.length === 0) {
        console.debug('[TransactionService] No transactions found for', address, 'on', this.config.id)
        return []
      }

      const { decimals, symbol } = this.config

      return transactions
        .filter((item) => {
          // Filter for transfer transactions
          const txType = item.transaction.type
          return txType.includes('AST-01') || txType.includes('AST-02') // TRANSFER_ASSET types
        })
        .map((item) => {
          const tx = item.transaction
          const transferAsset = tx.asset?.transferAsset

          // Amount comes from transferAsset if available
          const amountRaw = transferAsset?.amount ?? '0'
          const assetSymbol = transferAsset?.assetType ?? symbol

          return {
            hash: tx.signature,
            from: tx.senderId,
            to: tx.recipientId ?? '',
            amount: Amount.fromRaw(amountRaw, decimals, assetSymbol),
            fee: Amount.fromRaw(tx.fee, decimals, symbol),
            status: {
              status: 'confirmed' as const,
              confirmations: 1,
              requiredConfirmations: 1,
            },
            timestamp: tx.timestamp * 1000, // Convert to milliseconds
            blockNumber: BigInt(item.height),
            type: 'transfer' as const,
          }
        })
    } catch (error) {
      console.error('[TransactionService] Failed to fetch history:', error)
      return []
    }
  }
}
