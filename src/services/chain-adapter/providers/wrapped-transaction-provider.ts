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

  /** 检查底层服务是否支持交易历史查询 */
  get supportsTransactionHistory(): boolean {
    const service = this.transactionService as { supportsTransactionHistory?: boolean }
    return service.supportsTransactionHistory !== false
  }

  async getNativeBalance(address: string): Promise<Balance> {
    return this.assetService.getNativeBalance(address)
  }

  async getTransactionHistory(address: string, limit?: number): Promise<Transaction[]> {
    const txs = await this.transactionService.getTransactionHistory(address, limit)
    return txs.map(tx => this.convertTransaction(tx, address))
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

  private convertTransaction(tx: AdapterTransaction, addressForDirection?: string): Transaction {
    const direction: Transaction['direction'] = addressForDirection
      ? (tx.from.toLowerCase() === addressForDirection.toLowerCase() ? 'out' : tx.to.toLowerCase() === addressForDirection.toLowerCase() ? 'in' : 'self')
      : 'self'

    const action: Transaction['action'] = this.deriveAction(tx)

    return {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      timestamp: tx.timestamp,
      status: tx.status.status === 'confirmed' ? 'confirmed' : tx.status.status === 'failed' ? 'failed' : 'pending',
      blockNumber: tx.blockNumber,
      action,
      direction,
      assets: [
        {
          assetType: 'native',
          value: tx.amount.toRawString(),
          symbol: tx.amount.symbol ?? '',
          decimals: tx.amount.decimals,
        },
      ],
      contract: tx.type === 'contract-call' || action === 'contract' ? { address: tx.to } : undefined,
      fee: {
        value: tx.fee.toRawString(),
        symbol: tx.fee.symbol ?? '',
        decimals: tx.fee.decimals,
      },
    }
  }

  private deriveAction(tx: AdapterTransaction): Transaction['action'] {
    const rawType = tx.rawType
    if (rawType) {
      // 安全
      if (rawType.includes('BSE-01')) return 'signature'

      // 权益操作
      if (rawType.includes('AST-02')) return 'transfer'
      if (rawType.includes('AST-03')) return 'destroyAsset'
      if (rawType.includes('AST-04')) return 'gift'
      if (rawType.includes('AST-05')) return 'grab'
      if (rawType.includes('AST-06')) return 'trust'
      if (rawType.includes('AST-07')) return 'signFor'
      if (rawType.includes('AST-08')) return 'emigrate'
      if (rawType.includes('AST-09')) return 'immigrate'
      if (rawType.includes('AST-10') || rawType.includes('AST-11')) return 'exchange'
      if (rawType.includes('AST-12')) return 'stake'
      if (rawType.includes('AST-13')) return 'unstake'
      if (rawType.includes('AST-00')) return 'issueAsset'
      if (rawType.includes('AST-01')) return 'increaseAsset'

      // NFT
      if (rawType.includes('ETY-02') || rawType.includes('ETY-04')) return 'issueEntity'
      if (rawType.includes('ETY-03')) return 'destroyEntity'
      if (rawType.includes('ETY-00') || rawType.includes('ETY-01')) return 'issueAsset'

      // 任意资产
      if (rawType.includes('ANY-00')) return 'transfer'
      if (rawType.includes('ANY-01')) return 'gift'
      if (rawType.includes('ANY-02')) return 'grab'
      if (
        rawType.includes('ANY-03') ||
        rawType.includes('ANY-04') ||
        rawType.includes('ANY-05') ||
        rawType.includes('ANY-06') ||
        rawType.includes('ANY-07') ||
        rawType.includes('ANY-08')
      ) {
        return 'exchange'
      }

      // 位名
      if (rawType.includes('LNS-')) return 'locationName'

      // DApp
      if (rawType.includes('WOD-')) return 'dapp'

      // 凭证
      if (rawType.includes('CRT-')) return 'certificate'

      // 数据存证
      if (rawType.includes('EXT-00')) return 'mark'
    }

    if (tx.type === 'stake') return 'stake'
    if (tx.type === 'unstake') return 'unstake'
    if (tx.type === 'contract-call') return 'contract'
    return 'transfer'
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
