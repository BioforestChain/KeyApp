/**
 * mpay 数据转换器
 *
 * 将 mpay 数据格式转换为 KeyApp 格式
 */

import type { Wallet, ChainAddress, Token, ChainType } from '@/stores/wallet'
import type { EncryptedData } from '@/lib/crypto'
import { encrypt } from '@/lib/crypto'
import type {
  MpayMainWallet,
  MpayChainAddressInfo,
  MpayAddressAsset,
  MpayAddressBookEntry,
} from './types'
import type { Contact } from '@/stores/address-book'
import { decryptMpayData } from './mpay-crypto'

function deriveThemeHue(secret: string): number {
  let hash = 0
  for (let i = 0; i < secret.length; i++) {
    const char = secret.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash) % 360
}

/**
 * mpay 链名到 KeyApp ChainType 的映射
 */
const CHAIN_NAME_MAP: Record<string, ChainType> = {
  // BioForest chains
  BFMeta: 'bfmeta',
  Malibu: 'malibu',
  PMChain: 'pmchain',
  // External chains
  Ethereum: 'ethereum',
  Tron: 'tron',
  BTC: 'bitcoin',
  BSC: 'binance',
}

/**
 * 转换 mpay 链名为 KeyApp ChainType
 */
function mapChainName(mpayChain: string): ChainType | null {
  return CHAIN_NAME_MAP[mpayChain] ?? null
}

/**
 * 转换 mpay 资产为 KeyApp Token
 */
function transformAsset(asset: MpayAddressAsset, chain: ChainType): Token {
  const token: Token = {
    id: `${chain}-${asset.assetType}`,
    symbol: asset.assetType,
    name: asset.assetType,
    balance: asset.amount ?? '0',
    fiatValue: 0, // 需要重新获取
    change24h: 0,
    decimals: asset.decimals,
    chain,
  }
  // 可选属性只在有值时赋值
  if (asset.logoUrl) {
    token.icon = asset.logoUrl
  }
  if (asset.contractAddress) {
    token.contractAddress = asset.contractAddress
  }
  return token
}

/**
 * 转换 mpay ChainAddressInfo 为 KeyApp ChainAddress
 */
function transformChainAddress(
  mpayAddress: MpayChainAddressInfo
): ChainAddress | null {
  const chain = mapChainName(mpayAddress.chain)
  if (!chain) {
    
    return null
  }

  return {
    chain,
    address: mpayAddress.address,
    tokens: mpayAddress.assets.map((asset) => transformAsset(asset, chain)),
  }
}

/**
 * 从链列表中确定第一个可映射的链
 *
 * @param chainList mpay 地址簿条目的链列表
 * @returns 第一个可映射的 ChainType，如果没有可映射的链则返回 undefined
 */
function determineChainFromList(chainList?: string[]): ChainType | undefined {
  if (!chainList || chainList.length === 0) {
    return undefined
  }

  for (const mpayChain of chainList) {
    const chain = mapChainName(mpayChain)
    if (chain) {
      return chain
    }
  }

  return undefined
}

/**
 * 转换 mpay 地址簿条目为 KeyApp Contact
 *
 * @param entry mpay 地址簿条目
 * @returns KeyApp 联系人
 */
export function transformAddressBookEntry(entry: MpayAddressBookEntry): Contact {
  const now = Date.now()
  const chain = determineChainFromList(entry.chainList) ?? 'ethereum'

  const contact: Contact = {
    id: entry.addressBookId,
    name: entry.name,
    addresses: [
      {
        id: crypto.randomUUID(),
        address: entry.address,
        label: chain.toUpperCase(),
        isDefault: true,
      },
    ],
    createdAt: now,
    updatedAt: now,
  }

  if (entry.remarks) {
    contact.memo = entry.remarks
  }

  return contact
}

/**
 * 转换结果
 */
export interface TransformResult {
  /** 转换后的钱包列表 */
  wallets: Wallet[]
  /** 跳过的地址（不支持的链） */
  skippedAddresses: Array<{
    address: string
    chain: string
    reason: string
  }>
  /** 转换统计 */
  stats: {
    totalWallets: number
    totalAddresses: number
    skippedAddresses: number
  }
}

/**
 * 转换 mpay 钱包数据为 KeyApp 格式
 *
 * @param mpayWallets mpay 主钱包列表
 * @param mpayAddresses mpay 地址列表
 * @param password 用户密码（用于解密和重新加密）
 * @returns 转换后的钱包数据
 */
export async function transformMpayData(
  mpayWallets: MpayMainWallet[],
  mpayAddresses: MpayChainAddressInfo[],
  password: string
): Promise<TransformResult> {
  const wallets: Wallet[] = []
  const skippedAddresses: TransformResult['skippedAddresses'] = []

  // 按 mainWalletId 分组地址
  const addressesByWallet = new Map<string, MpayChainAddressInfo[]>()
  for (const addr of mpayAddresses) {
    const list = addressesByWallet.get(addr.mainWalletId) ?? []
    list.push(addr)
    addressesByWallet.set(addr.mainWalletId, list)
  }

  for (const mpayWallet of mpayWallets) {
    try {
      // 解密助记词
      const mnemonic = await decryptMpayData(password, mpayWallet.importPhrase)

      // 用 KeyApp 格式重新加密
      const encryptedMnemonic: EncryptedData = await encrypt(mnemonic, password)

      // 获取该钱包的所有地址
      const walletAddresses = addressesByWallet.get(mpayWallet.mainWalletId) ?? []

      // 转换地址
      const chainAddresses: ChainAddress[] = []
      for (const mpayAddr of walletAddresses) {
        const converted = transformChainAddress(mpayAddr)
        if (converted) {
          chainAddresses.push(converted)
        } else {
          skippedAddresses.push({
            address: mpayAddr.address,
            chain: mpayAddr.chain,
            reason: `不支持的链类型: ${mpayAddr.chain}`,
          })
        }
      }

      // 确定主地址和主链
      // 优先使用 BFMeta，其次 Ethereum，最后使用第一个可用地址
      const primaryChain: ChainType =
        chainAddresses.find((ca) => ca.chain === 'bfmeta')?.chain ??
        chainAddresses.find((ca) => ca.chain === 'ethereum')?.chain ??
        chainAddresses[0]?.chain ??
        'ethereum'

      const primaryAddress =
        chainAddresses.find((ca) => ca.chain === primaryChain)?.address ?? ''

      // 创建 KeyApp 钱包
      const wallet: Wallet = {
        id: mpayWallet.mainWalletId,
        name: mpayWallet.name,
        address: primaryAddress,
        chain: primaryChain,
        chainAddresses,
        encryptedMnemonic,
        createdAt: mpayWallet.createTimestamp,
        themeHue: deriveThemeHue(mpayWallet.mainWalletId),
        tokens: [], // deprecated, use chainAddresses[].tokens
      }

      wallets.push(wallet)
    } catch (error) {
      
      // 继续处理其他钱包
    }
  }

  return {
    wallets,
    skippedAddresses,
    stats: {
      totalWallets: mpayWallets.length,
      totalAddresses: mpayAddresses.length,
      skippedAddresses: skippedAddresses.length,
    },
  }
}

export { mapChainName, transformChainAddress, transformAsset, determineChainFromList }
