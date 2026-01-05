/**
 * buildWalletChainAddresses
 *
 * 单一入口：从 mnemonic + 选中的 chainIds + chainConfigs 派生所有地址
 * 纯函数、离线可用、deterministic
 */

import type { ChainConfig } from '@/services/chain-config'
import type { ChainAddress, BuildWalletChainAddressesParams } from './types'
import { KeyMaterialProvider } from './key-material-provider'
import { EvmStrategy, BitcoinStrategy, TronStrategy, BioforestStrategy } from './strategies'

const evmStrategy = new EvmStrategy()
const bitcoinStrategy = new BitcoinStrategy()
const tronStrategy = new TronStrategy()
const bioforestStrategy = new BioforestStrategy()

/**
 * 从 mnemonic 派生钱包的所有链地址
 *
 * @param params.mnemonic - 助记词
 * @param params.accountIndex - 账户索引（默认 0）
 * @param params.selectedChainIds - 用户选中的链 ID 列表
 * @param params.chainConfigs - 链配置列表
 * @returns 去重、稳定排序的 ChainAddress 数组
 */
export function buildWalletChainAddresses(params: BuildWalletChainAddressesParams): ChainAddress[] {
  const { mnemonic, accountIndex = 0, selectedChainIds, chainConfigs } = params

  const selectedConfigsMap = new Map<string, ChainConfig>()
  for (const config of chainConfigs) {
    if (selectedChainIds.includes(config.id)) {
      selectedConfigsMap.set(config.id, config)
    }
  }

  if (selectedConfigsMap.size === 0) {
    return []
  }

  const keyProvider = new KeyMaterialProvider(mnemonic)
  const addressByChainId = new Map<string, string>()

  // 按 chainKind 分组处理
  const evmConfigs: ChainConfig[] = []
  const bitcoinConfigs: ChainConfig[] = []
  const tronConfigs: ChainConfig[] = []
  const bioforestConfigs: ChainConfig[] = []

  for (const config of selectedConfigsMap.values()) {
    switch (config.chainKind) {
      case 'evm':
        evmConfigs.push(config)
        break
      case 'bitcoin':
        bitcoinConfigs.push(config)
        break
      case 'tron':
        tronConfigs.push(config)
        break
      case 'bioforest':
        bioforestConfigs.push(config)
        break
    }
  }

  // EVM：所有 EVM 链共享同一地址
  if (evmConfigs.length > 0) {
    const keyMaterial = keyProvider.getEvmKeyMaterial(accountIndex)
    const firstConfig = evmConfigs[0]!
    const result = evmStrategy.derive({ keyMaterial, config: firstConfig, accountIndex })
    for (const config of evmConfigs) {
      addressByChainId.set(config.id, result.address)
    }
  }

  // Bitcoin
  if (bitcoinConfigs.length > 0) {
    const keyMaterial = keyProvider.getBitcoinKeyMaterial(accountIndex)
    for (const config of bitcoinConfigs) {
      const result = bitcoinStrategy.derive({ keyMaterial, config, accountIndex })
      addressByChainId.set(config.id, result.address)
    }
  }

  // Tron
  if (tronConfigs.length > 0) {
    const keyMaterial = keyProvider.getTronKeyMaterial(accountIndex)
    for (const config of tronConfigs) {
      const result = tronStrategy.derive({ keyMaterial, config, accountIndex })
      addressByChainId.set(config.id, result.address)
    }
  }

  // BioForest：使用特殊派生方式（不使用 BIP44）
  if (bioforestConfigs.length > 0) {
    for (const config of bioforestConfigs) {
      const result = bioforestStrategy.deriveBioforest({ mnemonic, config, accountIndex })
      addressByChainId.set(config.id, result.address)
    }
  }

  // 按 selectedChainIds 的顺序输出，保证 deterministic
  const results: ChainAddress[] = []
  for (const chainId of selectedChainIds) {
    const address = addressByChainId.get(chainId)
    if (address) {
      results.push({ chainId, address })
    }
  }

  return results
}
