/**
 * Wallet-related method handlers
 */

import type { MethodHandler, BioAccount } from '../types'
import { BioErrorCodes } from '../types'
import { normalizeChainId } from '@biochain/bio-sdk'
import { HandlerContext } from './context'
import { enqueueMiniappSheet } from '../sheet-queue'
import { getChainProvider } from '@/services/chain-adapter/providers'
import { chainConfigService } from '@/services/chain-config/service'
import { chainConfigActions, chainConfigStore } from '@/stores/chain-config'
import { walletStore } from '@/stores/wallet'

// 兼容旧 API，逐步迁移到 HandlerContext
let _showWalletPicker: ((opts?: { chain?: string; exclude?: string }) => Promise<BioAccount | null>) | null = null
let _getConnectedAccounts: (() => BioAccount[]) | null = null

/** @deprecated 使用 HandlerContext.register 替代 */
export function setWalletPicker(picker: typeof _showWalletPicker): void {
  _showWalletPicker = picker
}

/** @deprecated 使用 HandlerContext.register 替代 */
export function setGetAccounts(getter: typeof _getConnectedAccounts): void {
  _getConnectedAccounts = getter
}

/** 获取钱包选择器 */
function getWalletPicker(appId: string) {
  const callbacks = HandlerContext.get(appId)
  return callbacks?.showWalletPicker ?? _showWalletPicker
}

/** 获取已连接账户函数 */
function getAccountsGetter(appId: string) {
  const callbacks = HandlerContext.get(appId)
  return callbacks?.getConnectedAccounts ?? _getConnectedAccounts
}

/** bio_connect - Internal handshake */
export const handleConnect: MethodHandler = async (_params, _context) => {
  return { connected: true }
}

/** bio_requestAccounts - Request wallet connection (shows UI) */
export const handleRequestAccounts: MethodHandler = async (params, context) => {
  const showWalletPicker = getWalletPicker(context.appId)
  if (!showWalletPicker) {
    throw Object.assign(new Error('Wallet picker not available'), { code: BioErrorCodes.INTERNAL_ERROR })
  }

  // 支持 chain 参数过滤钱包
  const opts = params as { chain?: string } | undefined

  const wallet = await enqueueMiniappSheet(context.appId, () =>
    showWalletPicker({
      chain: opts?.chain,
      app: { name: context.appName, icon: context.appIcon },
    }),
  )
  if (!wallet) {
    throw Object.assign(new Error('User rejected'), { code: BioErrorCodes.USER_REJECTED })
  }

  return [wallet]
}

/** bio_accounts - Get connected accounts (no UI) */
export const handleAccounts: MethodHandler = async (_params, context) => {
  const getConnectedAccounts = getAccountsGetter(context.appId)
  if (!getConnectedAccounts) {
    return []
  }
  return getConnectedAccounts()
}

/** bio_selectAccount - Select an account (shows picker) */
export const handleSelectAccount: MethodHandler = async (params, context) => {
  const showWalletPicker = getWalletPicker(context.appId)
  if (!showWalletPicker) {
    throw Object.assign(new Error('Wallet picker not available'), { code: BioErrorCodes.INTERNAL_ERROR })
  }

  const opts = params as { chain?: string } | undefined
  const wallet = await enqueueMiniappSheet(context.appId, () =>
    showWalletPicker({
      ...opts,
      app: { name: context.appName, icon: context.appIcon },
    }),
  )
  if (!wallet) {
    throw Object.assign(new Error('User rejected'), { code: BioErrorCodes.USER_REJECTED })
  }

  return wallet
}

/** bio_pickWallet - Pick another wallet address */
export const handlePickWallet: MethodHandler = async (params, context) => {
  const showWalletPicker = getWalletPicker(context.appId)
  if (!showWalletPicker) {
    throw Object.assign(new Error('Wallet picker not available'), { code: BioErrorCodes.INTERNAL_ERROR })
  }

  const opts = params as { chain?: string; exclude?: string } | undefined
  const account = await enqueueMiniappSheet(context.appId, () =>
    showWalletPicker({
      ...opts,
      app: { name: context.appName, icon: context.appIcon },
    }),
  )
  if (!account) {
    throw Object.assign(new Error('User rejected'), { code: BioErrorCodes.USER_REJECTED })
  }

  return account
}

/** bio_chainId - Get current chain ID */
export const handleChainId: MethodHandler = async (_params, _context) => {
  return walletStore.state.selectedChain
}

/** bio_getBalance - Get balance */
export const handleGetBalance: MethodHandler = async (params, _context) => {
  const opts = params as
    | {
        address?: string
        chain?: string
        asset?: string
        assets?: Array<{ assetType?: string; contractAddress?: string }>
      }
    | undefined
  if (!opts?.address || !opts?.chain) {
    throw Object.assign(new Error('Missing address or chain'), { code: BioErrorCodes.INVALID_PARAMS })
  }

  const resolvedChain = normalizeChainId(opts.chain)
  const wantedAsset = opts.asset?.trim().toUpperCase()
  const wantedAssets = Array.isArray(opts.assets) ? opts.assets : []

  if (!chainConfigStore.state.snapshot) {
    await chainConfigActions.initialize()
  }

  const provider = getChainProvider(resolvedChain)

  const buildBatchFallback = () => {
    const defaultDecimals = chainConfigService.getDecimals(resolvedChain)
    const fallback: Record<
      string,
      {
        assetType: string
        decimals: number
        balance: string
        contracts?: string
        contractAddress?: string
      }
    > = {}

    for (const item of wantedAssets) {
      const requestedAssetType = item.assetType?.trim().toUpperCase()
      if (!requestedAssetType) continue
      fallback[requestedAssetType] = {
        assetType: requestedAssetType,
        decimals: defaultDecimals,
        balance: '0',
        ...(item.contractAddress
          ? { contracts: item.contractAddress, contractAddress: item.contractAddress }
          : {}),
      }
    }
    return fallback
  }

  try {
    if (wantedAssets.length > 0) {
      const balances = await provider.allBalances.fetch({ address: opts.address })
      const defaultDecimals = chainConfigService.getDecimals(resolvedChain)

      const result: Record<
        string,
        {
          assetType: string
          decimals: number
          balance: string
          contracts?: string
          contractAddress?: string
        }
      > = {}

      for (const item of wantedAssets) {
        const requestedAssetType = item.assetType?.trim().toUpperCase()
        if (!requestedAssetType) continue
        const requestedContract = item.contractAddress?.trim().toLowerCase()

        const matched = balances.find((balanceItem) => {
          if (requestedContract) {
            return (balanceItem.contractAddress?.toLowerCase() ?? '') === requestedContract
          }
          return balanceItem.symbol.toUpperCase() === requestedAssetType
        })

        result[requestedAssetType] = {
          assetType: requestedAssetType,
          decimals: matched?.decimals ?? defaultDecimals,
          balance: matched?.amount.toRawString() ?? '0',
          ...(item.contractAddress
            ? { contracts: item.contractAddress, contractAddress: item.contractAddress }
            : {}),
        }
      }
      return result
    }

    if (wantedAsset) {
      const balances = await provider.allBalances.fetch({ address: opts.address })
      const matched = balances.find((item) => item.symbol.toUpperCase() === wantedAsset)
      const raw = matched?.amount.toRawString() ?? '0'
      return raw
    }

    // 使用 ChainProvider 的 nativeBalance fetcher
    const balance = await provider.nativeBalance.fetch({ address: opts.address })
    const raw = balance?.amount.toRawString() ?? '0'
    return raw
  } catch {
    if (wantedAssets.length > 0) {
      return buildBatchFallback()
    }
    return '0'
  }
}
