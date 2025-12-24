/**
 * BioForest chain API client
 */

import { ApiClient, type ApiClientConfig } from '../client'
import type {
  AddressAssets,
  AddressInfo,
  BlockInfo,
  BroadcastResult,
  GetBalanceParams,
  PendingTransaction,
  QueryPendingParams,
  QueryTokenDetailParams,
  QueryTokenParams,
  QueryTransactionsParams,
  TokenDetailResult,
  TokenListResult,
  TransactionListResult,
} from './types'

export interface BnqklWalletBioforestApiConfig extends Omit<ApiClientConfig, 'baseUrl'> {
  baseUrl?: string
  chainPath: string
}

const DEFAULT_BASE_URL = 'https://walletapi.bfmeta.info'

export class BnqklWalletBioforestApi {
  private client: ApiClient
  private chainPath: string

  constructor(config: BnqklWalletBioforestApiConfig) {
    this.chainPath = config.chainPath
    const clientConfig: ApiClientConfig = {
      baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
    }
    if (config.timeout !== undefined) {
      clientConfig.timeout = config.timeout
    }
    if (config.fetch !== undefined) {
      clientConfig.fetch = config.fetch
    }
    this.client = new ApiClient(clientConfig)
  }

  private path(endpoint: string): string {
    return `/wallet/${this.chainPath}${endpoint}`
  }

  async getLastBlock(): Promise<BlockInfo> {
    return this.client.get<BlockInfo>(this.path('/lastblock'))
  }

  async getBlockByHeight(height: number): Promise<{ blocks: BlockInfo[] }> {
    return this.client.post<{ blocks: BlockInfo[] }>(this.path('/block/query'), { height })
  }

  async getBalance(params: GetBalanceParams): Promise<{ amount: string }> {
    return this.client.post<{ amount: string }>(this.path('/address/balance'), params)
  }

  async getAddressInfo(address: string): Promise<AddressInfo | null> {
    return this.client.post<AddressInfo | null>(this.path('/address/info'), { address })
  }

  async getAddressAssets(address: string): Promise<AddressAssets | null> {
    return this.client.post<AddressAssets | null>(this.path('/address/assets'), { address })
  }

  async getBlockAverageFee(): Promise<{ aveFee: string }> {
    return this.client.get<{ aveFee: string }>(this.path('/blockAveFee'))
  }

  async broadcastTransaction(transaction: unknown): Promise<BroadcastResult> {
    return this.client.post<BroadcastResult>(this.path('/transactions/broadcast'), transaction)
  }

  async queryTransactions(params: QueryTransactionsParams): Promise<TransactionListResult> {
    return this.client.post<TransactionListResult>(this.path('/transactions/query'), params)
  }

  async queryPendingTransactions(params: QueryPendingParams): Promise<PendingTransaction[]> {
    return this.client.post<PendingTransaction[]>(this.path('/pendingTr'), params)
  }

  async queryTokenList(params: QueryTokenParams): Promise<TokenListResult> {
    return this.client.post<TokenListResult>(this.path('/assets'), params)
  }

  async queryTokenDetail(params: QueryTokenDetailParams): Promise<TokenDetailResult> {
    return this.client.post<TokenDetailResult>(this.path('/asset/details'), params)
  }
}

export function createBnqklWalletBioforestApi(config: BnqklWalletBioforestApiConfig): BnqklWalletBioforestApi {
  return new BnqklWalletBioforestApi(config)
}
