/**
 * derive-wallet-chain-addresses.ts
 *
 * 统一入口：通过 chain-adapter 派生钱包的所有链地址
 * 这是业务代码调用派生的唯一入口，确保"单一真相"
 */

import { getChainProvider } from './providers'
import type { ChainConfig } from '@/services/chain-config'

export interface DerivedChainAddress {
  chainId: string
  address: string
  publicKey?: string
}

export interface DeriveWalletChainAddressesParams {
  mnemonic: string
  chainConfigs: readonly ChainConfig[]
  selectedChainIds: string[]
  accountIndex?: number
}

/**
 * 从 mnemonic 派生钱包的所有链地址
 *
 * @param params.mnemonic - 助记词
 * @param params.chainConfigs - 链配置列表
 * @param params.selectedChainIds - 用户选中的链 ID 列表
 * @param params.accountIndex - 账户索引（默认 0）
 * @returns 派生的链地址数组
 * @throws 如果任何链不支持派生，将抛出错误
 */
export async function deriveWalletChainAddresses(
  params: DeriveWalletChainAddressesParams,
): Promise<DerivedChainAddress[]> {
  const { mnemonic, chainConfigs, selectedChainIds, accountIndex = 0 } = params

  // 构建 chainId -> config 映射
  const configMap = new Map(chainConfigs.map((c) => [c.id, c]))

  // 将 mnemonic 编码为 Uint8Array（chain-adapter 的约定）
  const seed = new TextEncoder().encode(mnemonic)

  const results: DerivedChainAddress[] = []

  for (const chainId of selectedChainIds) {
    const config = configMap.get(chainId)
    if (!config) {
      console.warn(`[deriveWalletChainAddresses] Chain config not found: ${chainId}`)
      continue
    }

    const provider = getChainProvider(chainId)

    if (!provider.supportsDeriveAddress) {
      throw new Error(`Chain "${chainId}" (${config.chainKind}) does not support address derivation`)
    }

    const deriveAddress = provider.deriveAddress
    if (!deriveAddress) {
      throw new Error(`Chain "${chainId}" deriveAddress method not available`)
    }

    const address = await deriveAddress(seed, accountIndex)

    results.push({
      chainId,
      address,
    })
  }

  return results
}


