/**
 * KeyMaterialProvider
 *
 * 从 mnemonic 派生基础密钥材料，供各 Strategy 使用
 * 避免重复计算，提高效率
 */

import { HDKey } from '@scure/bip32'
import { mnemonicToSeedSync } from '@scure/bip39'
import type { KeyMaterial } from './types'

const COIN_TYPES = {
  ethereum: 60,
  bitcoin: 0,
  tron: 195,
  bfmeta: 9999, // bioforest
} as const

export type CoinType = keyof typeof COIN_TYPES

export class KeyMaterialProvider {
  private hdKey: HDKey
  private cache = new Map<string, KeyMaterial>()

  constructor(mnemonic: string, password?: string) {
    const seed = mnemonicToSeedSync(mnemonic, password)
    this.hdKey = HDKey.fromMasterSeed(seed)
  }

  /**
   * 获取指定 coinType 和 accountIndex 的密钥材料
   * 使用 BIP44 路径：m/44'/coinType'/accountIndex'/0/0
   */
  getKeyMaterial(coinType: CoinType, accountIndex = 0): KeyMaterial {
    const cacheKey = `${coinType}:${accountIndex}`
    const cached = this.cache.get(cacheKey)
    if (cached) return cached

    const coinTypeNum = COIN_TYPES[coinType]
    const path = `m/44'/${coinTypeNum}'/${accountIndex}'/0/0`
    const childKey = this.hdKey.derive(path)

    if (!childKey.privateKey || !childKey.publicKey) {
      throw new Error(`Key derivation failed for path: ${path}`)
    }

    const material: KeyMaterial = {
      privateKey: childKey.privateKey,
      publicKey: childKey.publicKey,
    }

    this.cache.set(cacheKey, material)
    return material
  }

  /**
   * 获取 EVM 密钥材料（Ethereum/BSC/Polygon 等共用同一密钥）
   */
  getEvmKeyMaterial(accountIndex = 0): KeyMaterial {
    return this.getKeyMaterial('ethereum', accountIndex)
  }

  /**
   * 获取 Bitcoin 密钥材料 (BIP84 Native SegWit)
   * 使用路径: m/84'/0'/accountIndex'/0/0
   */
  getBitcoinKeyMaterial(accountIndex = 0): KeyMaterial {
    const cacheKey = `bitcoin-bip84:${accountIndex}`
    const cached = this.cache.get(cacheKey)
    if (cached) return cached

    // BIP84 for Native SegWit (bc1q...)
    const path = `m/84'/0'/${accountIndex}'/0/0`
    const childKey = this.hdKey.derive(path)

    if (!childKey.privateKey || !childKey.publicKey) {
      throw new Error(`Key derivation failed for path: ${path}`)
    }

    const material: KeyMaterial = {
      privateKey: childKey.privateKey,
      publicKey: childKey.publicKey,
    }

    this.cache.set(cacheKey, material)
    return material
  }

  /**
   * 获取 Tron 密钥材料
   */
  getTronKeyMaterial(accountIndex = 0): KeyMaterial {
    return this.getKeyMaterial('tron', accountIndex)
  }

  /**
   * 获取 BioForest 密钥材料
   */
  getBioforestKeyMaterial(accountIndex = 0): KeyMaterial {
    return this.getKeyMaterial('bfmeta', accountIndex)
  }
}
