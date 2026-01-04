/**
 * Tron Transaction Service
 * 
 * Uses Tron HTTP API via PublicNode (tron-rpc.publicnode.com)
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
import { secp256k1 } from '@noble/curves/secp256k1.js'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js'
import type { 
  TronRawTransaction, 
  TronSignedTransaction,
  TronTransactionInfo,
  TronBlock,
} from './types'

/** Default Tron RPC endpoints */
const DEFAULT_RPC_URLS: Record<string, string> = {
  'tron': 'https://tron-rpc.publicnode.com',
  'tron-nile': 'https://nile.trongrid.io',
  'tron-shasta': 'https://api.shasta.trongrid.io',
}

export class TronTransactionService implements ITransactionService {
  readonly supportsTransactionHistory = false
  private readonly config: ChainConfig
  private readonly rpcUrl: string

  constructor(config: ChainConfig) {
    this.config = config
    this.rpcUrl = DEFAULT_RPC_URLS[config.id] ?? config.api?.url ?? DEFAULT_RPC_URLS['tron']!
  }

  private async api<T>(endpoint: string, body?: unknown): Promise<T> {
    const url = `${this.rpcUrl}${endpoint}`
    const init: RequestInit = body
      ? { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(body) 
        }
      : { method: 'GET' }

    const response = await fetch(url, init)
    if (!response.ok) {
      throw new ChainServiceError(
        ChainErrorCodes.NETWORK_ERROR,
        `Tron API error: ${response.status} ${response.statusText}`,
      )
    }

    return response.json() as Promise<T>
  }

  /** Convert base58 Tron address to hex format */
  private base58ToHex(address: string): string {
    const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
    let num = BigInt(0)
    for (const char of address) {
      const index = ALPHABET.indexOf(char)
      if (index === -1) throw new Error(`Invalid base58 character: ${char}`)
      num = num * 58n + BigInt(index)
    }
    // Convert to hex, remove checksum (last 4 bytes)
    const hex = num.toString(16).padStart(50, '0')
    return hex.slice(0, 42) // 21 bytes = 42 hex chars
  }

  async estimateFee(_params: TransferParams): Promise<FeeEstimate> {
    // TRX transfers typically cost bandwidth (free up to limit)
    // If bandwidth exhausted, burns TRX at 1000 SUN per bandwidth unit
    const feeAmount = Amount.fromRaw('0', this.config.decimals, this.config.symbol)
    
    const fee: Fee = {
      amount: feeAmount,
      estimatedTime: 3, // ~3 seconds
    }

    return {
      slow: fee,
      standard: fee,
      fast: fee,
    }
  }

  async buildTransaction(params: TransferParams): Promise<UnsignedTransaction> {
    // Convert addresses to hex format for API
    const ownerAddressHex = this.base58ToHex(params.from)
    const toAddressHex = this.base58ToHex(params.to)
    
    // Create transaction via Tron API
    const rawTx = await this.api<TronRawTransaction>('/wallet/createtransaction', {
      owner_address: ownerAddressHex,
      to_address: toAddressHex,
      amount: Number(params.amount.raw),
      visible: false,
    })

    if (!rawTx.txID) {
      throw new ChainServiceError(
        ChainErrorCodes.TX_BUILD_FAILED,
        'Failed to create Tron transaction',
      )
    }

    return {
      chainId: this.config.id,
      data: rawTx,
    }
  }

  async signTransaction(
    unsignedTx: UnsignedTransaction,
    privateKey: Uint8Array,
  ): Promise<SignedTransaction> {
    const rawTx = unsignedTx.data as TronRawTransaction

    // Sign the transaction ID (which is already a hash)
    const txIdBytes = hexToBytes(rawTx.txID)
    const sigBytes = secp256k1.sign(txIdBytes, privateKey, { prehash: false, format: 'recovered' })
    
    // Tron signature format: r (32) + s (32) + recovery (1)
    const signature = bytesToHex(sigBytes)

    const signedTx: TronSignedTransaction = {
      ...rawTx,
      signature: [signature],
    }

    return {
      chainId: this.config.id,
      data: signedTx,
      signature: signature,
    }
  }

  async broadcastTransaction(signedTx: SignedTransaction): Promise<TransactionHash> {
    const tx = signedTx.data as TronSignedTransaction

    const result = await this.api<{ result?: boolean; txid?: string; code?: string; message?: string }>(
      '/wallet/broadcasttransaction',
      tx,
    )

    if (!result.result) {
      const errorMsg = result.message 
        ? Buffer.from(result.message, 'hex').toString('utf8')
        : result.code ?? 'Unknown error'
      throw new ChainServiceError(ChainErrorCodes.TX_BROADCAST_FAILED, `Broadcast failed: ${errorMsg}`)
    }

    return tx.txID
  }

  async getTransactionStatus(hash: TransactionHash): Promise<TransactionStatus> {
    try {
      const info = await this.api<TronTransactionInfo | Record<string, never>>(
        '/wallet/gettransactioninfobyid',
        { value: hash },
      )

      // Empty object means transaction not found/pending
      if (!info || !('blockNumber' in info)) {
        return { status: 'pending', confirmations: 0, requiredConfirmations: 19 }
      }

      // Get current block for confirmation count
      const block = await this.api<TronBlock>('/wallet/getnowblock')
      const currentBlock = block.block_header.raw_data.number
      const confirmations = currentBlock - info.blockNumber

      return {
        status: confirmations >= 19 ? 'confirmed' : 'confirming',
        confirmations: Math.max(0, confirmations),
        requiredConfirmations: 19,
      }
    } catch {
      return { status: 'pending', confirmations: 0, requiredConfirmations: 19 }
    }
  }

  async getTransaction(hash: TransactionHash): Promise<Transaction | null> {
    try {
      const [tx, info] = await Promise.all([
        this.api<TronRawTransaction | Record<string, never>>('/wallet/gettransactionbyid', { value: hash }),
        this.api<TronTransactionInfo | Record<string, never>>('/wallet/gettransactioninfobyid', { value: hash }),
      ])

      if (!tx || !('txID' in tx)) return null

      const contract = tx.raw_data.contract[0]
      if (!contract || contract.type !== 'TransferContract') return null

      const { amount, owner_address, to_address } = contract.parameter.value
      const isConfirmed = 'blockNumber' in info

      return {
        hash: tx.txID,
        from: owner_address,
        to: to_address,
        amount: Amount.fromRaw(amount.toString(), this.config.decimals, this.config.symbol),
        fee: Amount.fromRaw(
          ((info as TronTransactionInfo).receipt?.net_usage ?? 0).toString(),
          this.config.decimals,
          this.config.symbol,
        ),
        status: {
          status: isConfirmed ? 'confirmed' : 'pending',
          confirmations: isConfirmed ? 19 : 0,
          requiredConfirmations: 19,
        },
        timestamp: tx.raw_data.timestamp,
        blockNumber: isConfirmed ? BigInt((info as TronTransactionInfo).blockNumber) : undefined,
        type: 'transfer',
      }
    } catch {
      return null
    }
  }

  async getTransactionHistory(_address: string, _limit = 20): Promise<Transaction[]> {
    // Tron HTTP API doesn't support transaction history queries
    // Would need TronGrid API or similar indexer service
    return []
  }
}
