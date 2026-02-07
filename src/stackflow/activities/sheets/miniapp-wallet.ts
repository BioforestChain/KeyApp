import { walletStore, type ChainAddress, type Wallet } from '@/stores'
import { chainConfigSelectors, chainConfigStore } from '@/stores/chain-config'

export interface MiniappWalletMatch {
  wallet: Wallet
  chainAddress: ChainAddress
}

const CHAIN_ALIAS_MAP: Record<string, string> = {
  'bfmeta-v2': 'bfmetav2',
  'bfmeta_v2': 'bfmetav2',
}

function normalizeChainId(chainId: string): string {
  return chainId.trim().toLowerCase()
}

function normalizeAddressForCompare(address: string): string {
  return address.trim()
}

function isHexLikeAddress(address: string): boolean {
  return address.startsWith('0x')
}

function isSameChainId(left: string, right: string): boolean {
  return normalizeChainId(left) === normalizeChainId(right)
}

function isSameAddress(left: string, right: string): boolean {
  const normalizedLeft = normalizeAddressForCompare(left)
  const normalizedRight = normalizeAddressForCompare(right)

  if (isHexLikeAddress(normalizedLeft) || isHexLikeAddress(normalizedRight)) {
    return normalizedLeft.toLowerCase() === normalizedRight.toLowerCase()
  }
  return normalizedLeft === normalizedRight
}

/**
 * 解析 miniapp 传入的 chainId，返回 KeyApp 内部规范 chainId。
 */
export function resolveMiniappChainId(chainId: string): string {
  const normalizedChainId = normalizeChainId(chainId)
  if (normalizedChainId.length === 0) return normalizedChainId

  const snapshot = chainConfigStore.state
  const config = chainConfigSelectors.getChainById(snapshot, normalizedChainId)
  if (config) {
    return config.id
  }

  return CHAIN_ALIAS_MAP[normalizedChainId] ?? normalizedChainId
}

/**
 * 按链和地址查找对应钱包。
 */
export function findMiniappWalletByAddress(chainId: string, address: string): MiniappWalletMatch | null {
  const resolvedChainId = resolveMiniappChainId(chainId)

  for (const wallet of walletStore.state.wallets) {
    const chainAddress = wallet.chainAddresses.find((candidate) => {
      return isSameChainId(candidate.chain, resolvedChainId) && isSameAddress(candidate.address, address)
    })
    if (chainAddress) {
      return {
        wallet,
        chainAddress,
      }
    }
  }

  return null
}

/**
 * 按链和地址查找对应钱包 ID。
 */
export function findMiniappWalletIdByAddress(chainId: string, address: string): string | null {
  return findMiniappWalletByAddress(chainId, address)?.wallet.id ?? null
}
