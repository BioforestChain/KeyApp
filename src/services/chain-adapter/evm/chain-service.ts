/**
 * EVM Chain Service
 *
 * Provides chain info and gas price queries via public JSON-RPC endpoints.
 */

import { chainConfigService } from '@/services/chain-config/service'
import type { IChainService, ChainInfo, GasPrice, HealthStatus } from '../types'
import { Amount } from '@/types/amount'
import { ChainServiceError, ChainErrorCodes } from '../types'

interface JsonRpcResponse<T> {
  jsonrpc: string
  id: number
  result?: T
  error?: { code: number; message: string }
}

export class EvmChainService implements IChainService {
  private readonly chainId: string

  constructor(chainId: string) {
    this.chainId = chainId
  }

  private get rpcUrl(): string {
    return chainConfigService.getRpcUrl(this.chainId)
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
    const config = chainConfigService.getConfig(this.chainId)
    return {
      chainId: this.chainId,
      name: config?.name ?? this.chainId,
      symbol: config?.symbol ?? '',
      decimals: config?.decimals ?? 18,
      blockTime: 12,
      confirmations: 12,
      explorerUrl: config?.explorer?.url,
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
      const defaultGas = Amount.fromRaw('20000000000', 9, 'Gwei')
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
