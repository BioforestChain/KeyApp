/**
 * Bitcoin Transaction Service
 * 
 * Handles UTXO selection, transaction building, signing, and broadcasting.
 * Uses mempool.space API for UTXO queries and transaction broadcast.
 */

import type { ChainConfig } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config'
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
import type { BitcoinUtxo, BitcoinTransaction, BitcoinUnsignedTx, BitcoinFeeEstimates } from './types'

/** mempool.space API 默认端点 (fallback) */
const DEFAULT_API_URL = 'https://mempool.space/api'

export class BitcoinTransactionService implements ITransactionService {
  private readonly config: ChainConfig
  private readonly apiUrl: string

  constructor(config: ChainConfig) {
    this.config = config
    // 使用 mempool-* API 配置
    this.apiUrl = chainConfigService.getMempoolApi(config.id) ?? DEFAULT_API_URL
  }

  private async api<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`
    const response = await fetch(url, options)
    
    if (!response.ok) {
      throw new ChainServiceError(
        ChainErrorCodes.NETWORK_ERROR,
        `Bitcoin API error: ${response.status}`,
      )
    }

    const text = await response.text()
    try {
      return JSON.parse(text) as T
    } catch {
      return text as T
    }
  }

  async estimateFee(_params: TransferParams): Promise<FeeEstimate> {
    try {
      const fees = await this.api<BitcoinFeeEstimates>('/v1/fees/recommended')
      
      // Estimate for typical P2WPKH transaction (~140 vB for 1-in-2-out)
      const typicalVsize = 140
      
      const slow: Fee = {
        amount: Amount.fromRaw((fees.hourFee * typicalVsize).toString(), this.config.decimals, this.config.symbol),
        estimatedTime: 3600, // 1 hour
      }
      
      const standard: Fee = {
        amount: Amount.fromRaw((fees.halfHourFee * typicalVsize).toString(), this.config.decimals, this.config.symbol),
        estimatedTime: 1800, // 30 minutes
      }
      
      const fast: Fee = {
        amount: Amount.fromRaw((fees.fastestFee * typicalVsize).toString(), this.config.decimals, this.config.symbol),
        estimatedTime: 600, // 10 minutes
      }

      return { slow, standard, fast }
    } catch {
      // Default fee estimate
      const defaultFee: Fee = {
        amount: Amount.fromRaw('2000', this.config.decimals, this.config.symbol),
        estimatedTime: 1800,
      }
      return { slow: defaultFee, standard: defaultFee, fast: defaultFee }
    }
  }

  async buildTransaction(params: TransferParams): Promise<UnsignedTransaction> {
    // Get UTXOs for the sender
    const utxos = await this.api<BitcoinUtxo[]>(`/address/${params.from}/utxo`)
    
    if (utxos.length === 0) {
      throw new ChainServiceError(ChainErrorCodes.INSUFFICIENT_BALANCE, 'No UTXOs available')
    }

    // Get fee rate
    const fees = await this.api<BitcoinFeeEstimates>('/v1/fees/recommended')
    const feeRate = fees.halfHourFee // sat/vB

    // Simple UTXO selection: use all available UTXOs
    const totalInput = utxos.reduce((sum, u) => sum + u.value, 0)
    const sendAmount = Number(params.amount.raw)
    
    // Estimate transaction size (simplified)
    const estimatedVsize = 10 + utxos.length * 68 + 2 * 31 // header + inputs + outputs
    const fee = feeRate * estimatedVsize

    if (totalInput < sendAmount + fee) {
      throw new ChainServiceError(
        ChainErrorCodes.INSUFFICIENT_BALANCE,
        `Insufficient balance: need ${sendAmount + fee}, have ${totalInput}`,
      )
    }

    const change = totalInput - sendAmount - fee

    const txData: BitcoinUnsignedTx = {
      inputs: utxos.map(u => ({
        txid: u.txid,
        vout: u.vout,
        value: u.value,
        scriptPubKey: '', // Would need to fetch from previous tx
      })),
      outputs: [
        { address: params.to, value: sendAmount },
      ],
      fee,
      changeAddress: params.from,
    }

    // Add change output if significant
    if (change > 546) { // Dust threshold
      txData.outputs.push({ address: params.from, value: change })
    }

    return {
      chainId: this.config.id,
      data: txData,
    }
  }

  async signTransaction(
    _unsignedTx: UnsignedTransaction,
    _privateKey: Uint8Array,
  ): Promise<SignedTransaction> {
    // Bitcoin transaction signing is complex - requires:
    // 1. Serializing the transaction for signing
    // 2. Creating sighash for each input
    // 3. Signing each input with the private key
    // 4. Building the final transaction with signatures
    
    // For now, throw an error - full implementation would require
    // a proper Bitcoin transaction library
    throw new ChainServiceError(
      ChainErrorCodes.CHAIN_NOT_SUPPORTED,
      'Bitcoin transaction signing requires specialized library (bitcoinjs-lib or similar)',
    )
  }

  async broadcastTransaction(signedTx: SignedTransaction): Promise<TransactionHash> {
    const txHex = signedTx.data as string

    const txid = await this.api<string>('/tx', {
      method: 'POST',
      body: txHex,
    })

    return txid
  }

  async getTransactionStatus(hash: TransactionHash): Promise<TransactionStatus> {
    try {
      const tx = await this.api<BitcoinTransaction>(`/tx/${hash}`)
      
      if (!tx.status.confirmed) {
        return { status: 'pending', confirmations: 0, requiredConfirmations: 6 }
      }

      // Get current block height for confirmation count
      const currentHeight = await this.api<number>('/blocks/tip/height')
      const confirmations = currentHeight - (tx.status.block_height ?? currentHeight) + 1

      return {
        status: confirmations >= 6 ? 'confirmed' : 'confirming',
        confirmations: Math.max(0, confirmations),
        requiredConfirmations: 6,
      }
    } catch {
      return { status: 'pending', confirmations: 0, requiredConfirmations: 6 }
    }
  }

  async getTransaction(hash: TransactionHash): Promise<Transaction | null> {
    try {
      const tx = await this.api<BitcoinTransaction>(`/tx/${hash}`)
      
      // Simplify: assume first input is sender, first output is recipient
      const from = tx.vin[0]?.prevout?.scriptpubkey_address ?? ''
      const to = tx.vout[0]?.scriptpubkey_address ?? ''
      const amount = tx.vout[0]?.value ?? 0

      return {
        hash: tx.txid,
        from,
        to,
        amount: Amount.fromRaw(amount.toString(), this.config.decimals, this.config.symbol),
        fee: Amount.fromRaw(tx.fee.toString(), this.config.decimals, this.config.symbol),
        status: {
          status: tx.status.confirmed ? 'confirmed' : 'pending',
          confirmations: tx.status.confirmed ? 6 : 0,
          requiredConfirmations: 6,
        },
        timestamp: (tx.status.block_time ?? Math.floor(Date.now() / 1000)) * 1000,
        blockNumber: tx.status.block_height ? BigInt(tx.status.block_height) : undefined,
        type: 'transfer',
      }
    } catch {
      return null
    }
  }

  async getTransactionHistory(address: string, limit = 20): Promise<Transaction[]> {
    try {
      const txs = await this.api<BitcoinTransaction[]>(`/address/${address}/txs`)
      
      return txs.slice(0, limit).map(tx => {
        const isOutgoing = tx.vin.some(v => v.prevout?.scriptpubkey_address === address)
        const from = isOutgoing ? address : (tx.vin[0]?.prevout?.scriptpubkey_address ?? '')
        const to = isOutgoing 
          ? (tx.vout.find(v => v.scriptpubkey_address !== address)?.scriptpubkey_address ?? '')
          : address
        const amount = isOutgoing
          ? tx.vout.filter(v => v.scriptpubkey_address !== address).reduce((s, v) => s + v.value, 0)
          : tx.vout.filter(v => v.scriptpubkey_address === address).reduce((s, v) => s + v.value, 0)

        return {
          hash: tx.txid,
          from,
          to,
          amount: Amount.fromRaw(amount.toString(), this.config.decimals, this.config.symbol),
          fee: Amount.fromRaw(tx.fee.toString(), this.config.decimals, this.config.symbol),
          status: {
            status: tx.status.confirmed ? 'confirmed' as const : 'pending' as const,
            confirmations: tx.status.confirmed ? 6 : 0,
            requiredConfirmations: 6,
          },
          timestamp: (tx.status.block_time ?? Math.floor(Date.now() / 1000)) * 1000,
          blockNumber: tx.status.block_height ? BigInt(tx.status.block_height) : undefined,
          type: 'transfer' as const,
        }
      })
    } catch {
      return []
    }
  }
}
