/**
 * EVM Chain Service
 *
 * Provides chain info and gas price queries via public JSON-RPC endpoints.
 */

import type { ChainConfig } from '@/services/chain-config'
import type { IChainService, ChainInfo, GasPrice, HealthStatus } from '../types'
import { Amount } from '@/types/amount'
import { ChainServiceError, ChainErrorCodes } from '../types'

/** Default public RPC endpoints for EVM chains */
const DEFAULT_RPC_URLS: Record<string, string> = {
  ethereum: 'https://ethereum-rpc.publicnode.com',
  binance: 'https://bsc-rpc.publicnode.com',
}

interface JsonRpcResponse<T> {
  jsonrpc: string
  id: number
  result?: T
  error?: { code: number; message: string }
}

export class EvmChainService implements IChainService {
  private readonly config: ChainConfig
  private readonly rpcUrl: string

  constructor(config: ChainConfig) {
    this.config = config
    this.rpcUrl = DEFAULT_RPC_URLS[config.id] ?? config.api?.url ?? DEFAULT_RPC_URLS['ethereum']!
  }

  private async rpc<T>(method: string, params: unknown[] = []): Promise<T> {
    const response = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method,
        params,
        id: 1,
      }),
    })

    if (!response.ok) {
      throw new ChainServiceError(
        ChainErrorCodes.NETWORK_ERROR,
        `HTTP ${response.status}: ${response.statusText}`,
      )
    }

    const json = (await response.json()) as JsonRpcResponse<T>
    if (json.error) {
      throw new ChainServiceError(ChainErrorCodes.NETWORK_ERROR, json.error.message)
    }

    return json.result as T
  }

  getChainInfo(): ChainInfo {
    return {
      chainId: this.config.id,
      name: this.config.name,
      symbol: this.config.symbol,
      decimals: this.config.decimals,
      blockTime: 12, // ~12 seconds for Ethereum
      confirmations: 12,
      explorerUrl: this.config.explorer?.url,
    }
  }

  async getBlockHeight(): Promise<bigint> {
    try {
      const hexHeight = await this.rpc<string>('eth_blockNumber')
      return BigInt(hexHeight)
    } catch {
      return 0n
    }
  }

  async getGasPrice(): Promise<GasPrice> {
    try {
      const hexGasPrice = await this.rpc<string>('eth_gasPrice')
      const gasPrice = Amount.fromRaw(BigInt(hexGasPrice).toString(), 9, 'Gwei')

      return {
        slow: gasPrice,
        standard: gasPrice,
        fast: gasPrice,
        lastUpdated: Date.now(),
      }
    } catch {
      // Return default gas prices
      const defaultGas = Amount.fromRaw('20000000000', 9, 'Gwei') // 20 Gwei
      return {
        slow: defaultGas,
        standard: defaultGas,
        fast: defaultGas,
        lastUpdated: Date.now(),
      }
    }
  }

  async healthCheck(): Promise<HealthStatus> {
    const startTime = Date.now()
    try {
      const height = await this.getBlockHeight()
      return {
        isHealthy: true,
        latency: Date.now() - startTime,
        blockHeight: height,
        isSyncing: false,
        lastUpdated: Date.now(),
      }
    } catch {
      return {
        isHealthy: false,
        latency: Date.now() - startTime,
        blockHeight: 0n,
        isSyncing: false,
        lastUpdated: Date.now(),
      }
    }
  }
}
