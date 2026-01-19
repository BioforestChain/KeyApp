/**
 * WalletPickerJob - 钱包选择器
 * 用于小程序请求用户选择钱包
 */

import { useMemo } from 'react'
import type { ActivityComponentType } from '@stackflow/react'
import { BottomSheet } from '@/components/layout/bottom-sheet'
import { useTranslation } from 'react-i18next'
import { useStore } from '@tanstack/react-store'
import { walletStore, walletSelectors, type Wallet, type ChainAddress } from '@/stores'
import { useFlow } from '../../stackflow'
import { ActivityParamsProvider, useActivityParams } from '../../hooks'
import { WalletList, type WalletListItem } from '@/components/wallet/wallet-list'
import { MiniappSheetHeader } from '@/components/ecosystem'
import { getKeyAppChainId, normalizeChainId } from '@biochain/bio-sdk'
import { useChainConfigs } from '@/stores/chain-config'
import { chainConfigService } from '@/services/chain-config'

type WalletPickerJobParams = {
  /** 限定链类型 (支持: KeyApp 内部 ID, EVM hex chainId, API 名称如 BSC) */
  chain?: string
  /** 排除的地址（不显示在列表中） */
  exclude?: string
  /** 请求来源小程序名称 */
  appName?: string
  /** 请求来源小程序图标 */
  appIcon?: string
}

/**
 * 将任意链标识符转换为 KeyApp 内部 ID
 * 支持:
 * - EVM hex chainId: '0x38' -> 'binance'
 * - API 名称: 'BSC', 'ETH', 'BFMCHAIN' -> 'binance', 'ethereum', 'bfmeta'
 * - 已有的 KeyApp ID: 'binance' -> 'binance'
 */
function resolveChainId(chain: string | undefined): string | undefined {
  if (!chain) return undefined

  // Try EVM hex chainId first (e.g., '0x38')
  if (chain.startsWith('0x')) {
    const keyAppId = getKeyAppChainId(chain)
    if (keyAppId) return keyAppId
  }

  // Try API name normalization (e.g., 'BSC' -> 'binance', 'BFMCHAIN' -> 'bfmeta')
  const normalized = normalizeChainId(chain)

  // Check if it's a known chain (using chainConfigService)
  if (chainConfigService.getConfig(normalized)) {
    return normalized
  }

  // Return as-is (might be already a KeyApp ID like 'binance')
  return normalized
}

// Utility function for chain display names (currently unused - using direct chain IDs)
// function __getChainDisplayName(chainId: string): string { return CHAIN_DISPLAY_NAMES[chainId] || chainId }

function WalletPickerJobContent() {
  const { t } = useTranslation('common')
  const { pop } = useFlow()
  const { chain: rawChain, exclude, appName, appIcon } = useActivityParams<WalletPickerJobParams>()
  const chainConfigs = useChainConfigs()

  // Resolve chain to KeyApp internal ID
  const chain = useMemo(() => resolveChainId(rawChain), [rawChain])

  // 获取链配置（用于显示名称和图标）
  const chainConfig = useMemo(
    () => chain ? chainConfigs.find(c => c.id === chain) : null,
    [chain, chainConfigs]
  )
  const chainDisplayName = chainConfig?.name ?? CHAIN_DISPLAY_NAMES[chain ?? ''] ?? chain

  const walletState = useStore(walletStore)
  const currentWallet = walletSelectors.getCurrentWallet(walletState)

  // 转换钱包数据为 WalletListItem 格式，并过滤排除的地址
  const walletItems = useMemo((): WalletListItem[] => {
    const excludeLower = exclude?.toLowerCase()
    const items: WalletListItem[] = []

    for (const wallet of walletState.wallets) {
      const chainAddress = chain
        ? wallet.chainAddresses.find((ca) => ca.chain === chain)
        : wallet.chainAddresses[0]

      if (!chainAddress) continue

      // 过滤排除的地址
      if (excludeLower && chainAddress.address.toLowerCase() === excludeLower) {
        continue
      }

      items.push({
        id: wallet.id,
        name: wallet.name,
        address: chainAddress.address,
        themeHue: wallet.themeHue,
        chainIconUrl: chainConfig?.icon,
      })
    }

    return items
  }, [walletState.wallets, chain, exclude])

  // 保存钱包到链地址的映射
  const walletChainMap = useMemo(() => {
    const map = new Map<string, { wallet: Wallet; chainAddress: ChainAddress }>()
    walletState.wallets.forEach((wallet) => {
      const chainAddress = chain
        ? wallet.chainAddresses.find((ca) => ca.chain === chain)
        : wallet.chainAddresses[0]
      if (chainAddress) {
        map.set(wallet.id, { wallet, chainAddress })
      }
    })
    return map
  }, [walletState.wallets, chain])

  const handleSelect = (walletId: string) => {
    const data = walletChainMap.get(walletId)
    if (!data) return

    const event = new CustomEvent('wallet-picker-select', {
      detail: {
        address: data.chainAddress.address,
        chain: data.chainAddress.chain,
        name: data.wallet.name,
        publicKey: data.chainAddress.publicKey,
      },
    })
    window.dispatchEvent(event)
    pop()
  }

  const handleCancel = () => {
    const event = new CustomEvent('wallet-picker-cancel')
    window.dispatchEvent(event)
    pop()
  }

  return (
    <BottomSheet>
      <div className="bg-background rounded-t-2xl">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="bg-muted h-1 w-10 rounded-full" />
        </div>

        {/* Title with App Icon */}
        <MiniappSheetHeader
          title={chain ? t('selectChainWallet', '选择 {{chain}} 钱包', { chain: chainDisplayName }) : t('selectWallet', '选择钱包')}
          description={`${appName || t('unknownDApp', '未知 DApp')} ${t('requestsAccess', '请求访问')}`}
          appName={appName}
          appIcon={appIcon}
          chainId={chain}
        />

        {/* Wallet List */}
        <div className="max-h-[50vh] overflow-y-auto p-4">
          {walletItems.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center text-sm">
              {chain
                ? t('noWalletsForChain', '暂无支持 {{chain}} 的钱包', { chain })
                : t('noWallets', '暂无钱包')}
            </div>
          ) : (
            <WalletList
              wallets={walletItems}
              currentWalletId={currentWallet?.id}
              onSelect={handleSelect}
              showAddButton={false}
            />
          )}
        </div>

        {/* Cancel button */}
        <div className="border-border border-t p-4">
          <button
            onClick={handleCancel}
            className="bg-muted hover:bg-muted/80 w-full rounded-xl py-3 font-medium transition-colors"
          >
            {t('cancel', '取消')}
          </button>
        </div>

        {/* Safe area */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </BottomSheet>
  )
}

export const WalletPickerJob: ActivityComponentType<WalletPickerJobParams> = ({ params }) => {
  return (
    <ActivityParamsProvider params={params}>
      <WalletPickerJobContent />
    </ActivityParamsProvider>
  )
}
