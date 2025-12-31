/**
 * WalletPickerJob - 钱包选择器
 * 用于小程序请求用户选择钱包
 */

import { useMemo } from 'react'
import type { ActivityComponentType } from '@stackflow/react'
import { BottomSheet } from '@/components/layout/bottom-sheet'
import { useTranslation } from 'react-i18next'
import { useStore } from '@tanstack/react-store'
import { IconApps } from '@tabler/icons-react'
import { walletStore, walletSelectors, type Wallet, type ChainAddress } from '@/stores'
import { useFlow } from '../../stackflow'
import { ActivityParamsProvider, useActivityParams } from '../../hooks'
import { WalletList, type WalletListItem } from '@/components/wallet/wallet-list'
import { MiniappIcon } from '@/components/ecosystem'

type WalletPickerJobParams = {
  /** 限定链类型 */
  chain?: string
  /** 排除的地址（不显示在列表中） */
  exclude?: string
  /** 请求来源小程序名称 */
  appName?: string
  /** 请求来源小程序图标 */
  appIcon?: string
}

function WalletPickerJobContent() {
  const { t } = useTranslation('common')
  const { pop } = useFlow()
  const { chain, exclude, appName, appIcon } = useActivityParams<WalletPickerJobParams>()

  const walletState = useStore(walletStore)
  const currentWallet = walletSelectors.getCurrentWallet(walletState)

  // 转换钱包数据为 WalletListItem 格式，并过滤排除的地址
  const walletItems = useMemo((): WalletListItem[] => {
    const excludeLower = exclude?.toLowerCase()
    return walletState.wallets
      .map((wallet) => {
        const chainAddress = chain
          ? wallet.chainAddresses.find((ca) => ca.chain === chain)
          : wallet.chainAddresses[0]

        if (!chainAddress) return null

        // 过滤排除的地址
        if (excludeLower && chainAddress.address.toLowerCase() === excludeLower) {
          return null
        }

        return {
          id: wallet.id,
          name: wallet.name,
          address: chainAddress.address,
          themeHue: wallet.themeHue,
          chainIconUrl: undefined, // TODO: 从链配置获取图标
        }
      })
      .filter((item): item is WalletListItem => item !== null)
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
        <div className="border-border border-b px-4 pb-4">
          {(appName || appIcon) && (
            <div className="mx-auto mb-3">
              <MiniappIcon
                src={appIcon}
                name={appName}
                size="lg"
                shadow="sm"
              />
            </div>
          )}
          <h2 className="text-center text-lg font-semibold">
            {t('selectWallet', '选择钱包')}
          </h2>
          <p className="text-muted-foreground mt-1 text-center text-sm">
            {appName || t('unknownDApp', '未知 DApp')} {t('requestsAccess', '请求访问')}
          </p>
        </div>

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
