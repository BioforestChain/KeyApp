/**
 * Chain Derivation Types
 *
 * 链地址派生模块的类型定义
 */

import type { ChainConfig, ChainKind } from '@/services/chain-config'

export interface ChainAddress {
  chainId: string
  address: string
}

export interface KeyMaterial {
  privateKey: Uint8Array
  publicKey: Uint8Array
}

export interface DerivationParams {
  keyMaterial: KeyMaterial
  config: ChainConfig
  accountIndex: number
}

export interface DerivationStrategy {
  chainKind: ChainKind
  supports(config: ChainConfig): boolean
  derive(params: DerivationParams): ChainAddress
}

export interface BuildWalletChainAddressesParams {
  mnemonic: string
  accountIndex?: number
  selectedChainIds: string[]
  chainConfigs: ChainConfig[]
}
