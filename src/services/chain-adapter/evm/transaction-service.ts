/**
 * EVM Transaction Service
 * 
 * Handles transaction building, signing, and broadcasting for EVM chains.
 * Uses standard Ethereum JSON-RPC API (compatible with PublicNode, Infura, etc.)
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
} from '../types'
import { Amount } from '@/types/amount'
import { ChainServiceError, ChainErrorCodes } from '../types'
import { secp256k1 } from '@noble/curves/secp256k1.js'
import { keccak_256 } from '@noble/hashes/sha3.js'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js'

/** EVM Chain IDs */
const EVM_CHAIN_IDS: Record<string, number> = {
  'ethereum': 1,
  'ethereum-sepolia': 11155111,
  'binance': 56,
  'bsc-testnet': 97,
}

/** Default RPC endpoints (PublicNode - free, no API key required) */
const DEFAULT_RPC_URLS: Record<string, string> = {
  'ethereum': 'https://ethereum-rpc.publicnode.com',
  'ethereum-sepolia': 'https://ethereum-sepolia-rpc.publicnode.com',
  'binance': 'https://bsc-rpc.publicnode.com',
  'bsc-testnet': 'https://bsc-testnet-rpc.publicnode.com',
}

export class EvmTransactionService implements ITransactionService {
  private readonly config: ChainConfig
  private readonly rpcUrl: string
  private readonly evmChainId: number

  constructor(config: ChainConfig) {
    this.config = config
    this.rpcUrl = config.api?.url ?? DEFAULT_RPC_URLS[config.id] ?? 'https://ethereum-rpc.publicnode.com'
    this.evmChainId = EVM_CHAIN_IDS[config.id] ?? 1
  }

  /** Make a JSON-RPC call */
  private async rpc<T>(method: string, params: unknown[] = []): Promise<T> {
    const response = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method,
        params,
      }),
    })

    if (!response.ok) {
      throw new ChainServiceError(
        ChainErrorCodes.NETWORK_ERROR,
        `HTTP ${response.status}: ${response.statusText}`,
      )
    }

    const json = await response.json() as { result?: T; error?: { code: number; message: string } }
    if (json.error) {
      throw new ChainServiceError(
        ChainErrorCodes.NETWORK_ERROR,
        json.error.message,
        { code: json.error.code },
      )
    }

    return json.result as T
  }

  async estimateFee(_params: TransferParams): Promise<FeeEstimate> {
    // Get current gas price from network
    const gasPriceHex = await this.rpc<string>('eth_gasPrice')
    const gasPrice = BigInt(gasPriceHex)
    
    // Estimate gas (21000 for simple ETH transfer)
    const gasLimit = 21000n
    const baseFee = gasLimit * gasPrice

    // Calculate slow/standard/fast with multipliers
    const slow = Amount.fromRaw((baseFee * 80n / 100n).toString(), this.config.decimals, this.config.symbol)
    const standard = Amount.fromRaw(baseFee.toString(), this.config.decimals, this.config.symbol)
    const fast = Amount.fromRaw((baseFee * 120n / 100n).toString(), this.config.decimals, this.config.symbol)

    return {
      slow: { amount: slow, estimatedTime: 60 },
      standard: { amount: standard, estimatedTime: 15 },
      fast: { amount: fast, estimatedTime: 5 },
    }
  }

  async buildTransaction(params: TransferParams): Promise<UnsignedTransaction> {
    // Get nonce for the sender
    const nonceHex = await this.rpc<string>('eth_getTransactionCount', [params.from, 'pending'])
    const nonce = parseInt(nonceHex, 16)

    // Get current gas price
    const gasPriceHex = await this.rpc<string>('eth_gasPrice')

    return {
      chainId: this.config.id,
      data: {
        nonce,
        gasPrice: gasPriceHex,
        gasLimit: '0x5208', // 21000 in hex
        to: params.to,
        value: '0x' + params.amount.raw.toString(16),
        data: '0x',
        chainId: this.evmChainId,
      },
    }
  }

  async signTransaction(
    unsignedTx: UnsignedTransaction,
    privateKey: Uint8Array,
  ): Promise<SignedTransaction> {
    const txData = unsignedTx.data as {
      nonce: number
      gasPrice: string
      gasLimit: string
      to: string
      value: string
      data: string
      chainId: number
    }

    // RLP encode the transaction for signing (EIP-155)
    const rawTx = this.rlpEncode([
      this.toRlpHex(txData.nonce),
      txData.gasPrice,
      txData.gasLimit,
      txData.to.toLowerCase(),
      txData.value,
      txData.data,
      this.toRlpHex(txData.chainId),
      '0x',
      '0x',
    ])

    // Hash and sign (use recovered format to get recovery bit)
    const msgHash = keccak_256(hexToBytes(rawTx.slice(2)))
    const sigBytes = secp256k1.sign(msgHash, privateKey, { prehash: false, format: 'recovered' })
    
    // Parse signature: recovered format is 65 bytes (r[32] + s[32] + recovery[1])
    const r = BigInt('0x' + bytesToHex(sigBytes.slice(0, 32)))
    const s = BigInt('0x' + bytesToHex(sigBytes.slice(32, 64)))
    const recovery = sigBytes[64]!
    
    // Calculate v value (EIP-155)
    const v = txData.chainId * 2 + 35 + recovery

    // Get r and s as hex strings
    const rHex = r.toString(16).padStart(64, '0')
    const sHex = s.toString(16).padStart(64, '0')

    // RLP encode signed transaction
    const signedRaw = this.rlpEncode([
      this.toRlpHex(txData.nonce),
      txData.gasPrice,
      txData.gasLimit,
      txData.to.toLowerCase(),
      txData.value,
      txData.data,
      this.toRlpHex(v),
      '0x' + rHex,
      '0x' + sHex,
    ])

    return {
      chainId: this.config.id,
      data: signedRaw,
      signature: '0x' + rHex + sHex,
    }
  }

  async broadcastTransaction(signedTx: SignedTransaction): Promise<TransactionHash> {
    const rawTx = signedTx.data as string
    const txHash = await this.rpc<string>('eth_sendRawTransaction', [rawTx])
    return txHash
  }

  /** Convert number to RLP hex format */
  private toRlpHex(n: number): string {
    if (n === 0) return '0x'
    return '0x' + n.toString(16)
  }

  /** Simple RLP encoding for transaction */
  private rlpEncode(items: string[]): string {
    const encoded = items.map(item => {
      if (item === '0x' || item === '') {
        return new Uint8Array([0x80])
      }
      const bytes = hexToBytes(item.startsWith('0x') ? item.slice(2) : item)
      if (bytes.length === 1 && bytes[0]! < 0x80) {
        return bytes
      }
      if (bytes.length <= 55) {
        return new Uint8Array([0x80 + bytes.length, ...bytes])
      }
      const lenBytes = this.numberToBytes(bytes.length)
      return new Uint8Array([0xb7 + lenBytes.length, ...lenBytes, ...bytes])
    })

    const totalLen = encoded.reduce((sum, e) => sum + e.length, 0)
    let prefix: Uint8Array
    if (totalLen <= 55) {
      prefix = new Uint8Array([0xc0 + totalLen])
    } else {
      const lenBytes = this.numberToBytes(totalLen)
      prefix = new Uint8Array([0xf7 + lenBytes.length, ...lenBytes])
    }

    const result = new Uint8Array(prefix.length + totalLen)
    result.set(prefix)
    let offset = prefix.length
    for (const e of encoded) {
      result.set(e, offset)
      offset += e.length
    }
    return '0x' + bytesToHex(result)
  }

  private numberToBytes(n: number): Uint8Array {
    const hex = n.toString(16)
    const padded = hex.length % 2 ? '0' + hex : hex
    return hexToBytes(padded)
  }

  async getTransactionStatus(hash: TransactionHash): Promise<TransactionStatus> {
    try {
      const receipt = await this.rpc<{
        status: string
        blockNumber: string
      } | null>('eth_getTransactionReceipt', [hash])

      if (!receipt) {
        return { status: 'pending', confirmations: 0, requiredConfirmations: 12 }
      }

      const currentBlock = await this.rpc<string>('eth_blockNumber')
      const confirmations = parseInt(currentBlock, 16) - parseInt(receipt.blockNumber, 16)

      return {
        status: confirmations >= 12 ? 'confirmed' : 'confirming',
        confirmations: Math.max(0, confirmations),
        requiredConfirmations: 12,
      }
    } catch {
      return { status: 'pending', confirmations: 0, requiredConfirmations: 12 }
    }
  }

  async getTransaction(hash: TransactionHash): Promise<Transaction | null> {
    try {
      const [tx, receipt] = await Promise.all([
        this.rpc<{
          hash: string
          from: string
          to: string
          value: string
          gasPrice: string
          blockNumber: string | null
        } | null>('eth_getTransactionByHash', [hash]),
        this.rpc<{
          status: string
          gasUsed: string
          blockNumber: string
        } | null>('eth_getTransactionReceipt', [hash]),
      ])

      if (!tx) return null

      const block = tx.blockNumber 
        ? await this.rpc<{ timestamp: string }>('eth_getBlockByNumber', [tx.blockNumber, false])
        : null

      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to ?? '',
        amount: Amount.fromRaw(BigInt(tx.value).toString(), this.config.decimals, this.config.symbol),
        fee: receipt
          ? Amount.fromRaw(
              (BigInt(receipt.gasUsed) * BigInt(tx.gasPrice)).toString(),
              this.config.decimals,
              this.config.symbol,
            )
          : Amount.fromRaw('0', this.config.decimals, this.config.symbol),
        status: {
          status: receipt?.status === '0x1' ? 'confirmed' : receipt ? 'failed' : 'pending',
          confirmations: receipt ? 12 : 0,
          requiredConfirmations: 12,
        },
        timestamp: block ? parseInt(block.timestamp, 16) * 1000 : Date.now(),
        blockNumber: tx.blockNumber ? BigInt(tx.blockNumber) : undefined,
        type: 'transfer',
      }
    } catch {
      return null
    }
  }

  async getTransactionHistory(_address: string, _limit = 20): Promise<Transaction[]> {
    // Note: Standard JSON-RPC doesn't support transaction history queries
    // This would require an indexer service like Etherscan API
    // For now, return empty array - can be extended with Etherscan/BlockScout API
    return []
  }
}
