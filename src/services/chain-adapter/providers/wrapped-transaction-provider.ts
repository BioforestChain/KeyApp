/**
 * Wrapped Transaction Provider
 * 
 * 包装现有的 ITransactionService 和 IAssetService，适配 ApiProvider 接口。
 */

import type { 
  ApiProvider, 
  Balance, 
  Transaction, 
  TransactionStatus,
  FeeEstimate, 
  TransferParams,
  UnsignedTransaction,
  SignedTransaction,
  Fee,
} from './types'
import type { 
  ITransactionService, 
  IAssetService,
  FeeEstimate as AdapterFeeEstimate,
  TransactionStatus as AdapterTransactionStatus,
  Transaction as AdapterTransaction,
} from '../types'

export class WrappedTransactionProvider implements ApiProvider {
  readonly type: string
  readonly endpoint = ''

  constructor(
    type: string,
    private readonly transactionService: ITransactionService,
    private readonly assetService: IAssetService,
  ) {
    this.type = type
  }

  async getNativeBalance(address: string): Promise<Balance> {
    return this.assetService.getNativeBalance(address)
  }

  async getTransactionHistory(address: string, limit?: number): Promise<Transaction[]> {
    const txs = await this.transactionService.getTransactionHistory(address, limit)
    return txs.map(tx => this.convertTransaction(tx))
  }

  async getTransaction(hash: string): Promise<Transaction | null> {
    const tx = await this.transactionService.getTransaction(hash)
    return tx ? this.convertTransaction(tx) : null
  }

  async getTransactionStatus(hash: string): Promise<TransactionStatus> {
    const status = await this.transactionService.getTransactionStatus(hash)
    return this.convertTransactionStatus(status)
  }

  async estimateFee(params: TransferParams): Promise<FeeEstimate> {
    const estimate = await this.transactionService.estimateFee(params)
    return this.convertFeeEstimate(estimate)
  }

  async buildTransaction(params: TransferParams): Promise<UnsignedTransaction> {
    return this.transactionService.buildTransaction(params)
  }

  async signTransaction(unsignedTx: UnsignedTransaction, privateKey: Uint8Array): Promise<SignedTransaction> {
    const signed = await this.transactionService.signTransaction(unsignedTx, privateKey)
    return {
      chainId: signed.chainId,
      data: signed.data,
      signature: typeof signed.signature === 'string' ? signed.signature : '',
    }
  }

  async broadcastTransaction(signedTx: SignedTransaction): Promise<string> {
    return this.transactionService.broadcastTransaction(signedTx)
  }

  private convertTransaction(tx: AdapterTransaction): Transaction {
    return {
      hash: tx.hash,
      from: tx.from,
      to: tx.to ?? '',
      value: tx.value,
      symbol: tx.symbol,
      timestamp: tx.timestamp,
      status: tx.status,
      blockNumber: tx.blockNumber,
    }
  }

  private convertTransactionStatus(status: AdapterTransactionStatus): TransactionStatus {
    let mappedStatus: TransactionStatus['status']
    switch (status.status) {
      case 'pending':
        mappedStatus = 'pending'
        break
      case 'confirmed':
        mappedStatus = 'confirmed'
        break
      case 'failed':
        mappedStatus = 'failed'
        break
      default:
        mappedStatus = 'pending'
    }

    return {
      status: mappedStatus,
      confirmations: status.confirmations,
      requiredConfirmations: status.requiredConfirmations,
    }
  }

  private convertFeeEstimate(estimate: AdapterFeeEstimate): FeeEstimate {
    const toFee = (amount: AdapterFeeEstimate['standard'], estimatedTime: number): Fee => ({
      amount: amount.amount,
      estimatedTime,
    })

    return {
      slow: toFee(estimate.slow, 600), // 10 min
      standard: toFee(estimate.standard, 180), // 3 min
      fast: toFee(estimate.fast, 30), // 30 sec
    }
  }
}
