/**
 * AccountPickerJob - 账户选择器
 * 用于小程序请求用户选择钱包账户
 */

import { useMemo } from 'react'
import type { ActivityComponentType } from '@stackflow/react'
import { BottomSheet } from '@/components/layout/bottom-sheet'
import { useTranslation } from 'react-i18next'
import { useStore } from '@tanstack/react-store'
import { cn } from '@/lib/utils'
import { IconWallet, IconCheck } from '@tabler/icons-react'
import { walletStore, walletSelectors, type Wallet, type ChainAddress } from '@/stores'
import { useFlow } from '../../stackflow'
import { ActivityParamsProvider, useActivityParams } from '../../hooks'

type AccountPickerJobParams = {
  /** 限定链类型 */
  chain?: string
  /** 请求来源小程序名称 */
  appName?: string
}

function truncateAddress(address: string, startChars = 8, endChars = 6): string {
  if (address.length <= startChars + endChars + 3) return address
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

interface WalletWithChainAddress {
  wallet: Wallet
  chainAddress: ChainAddress | null
  isAvailable: boolean
}

function AccountPickerJobContent() {
  const { t } = useTranslation('common')
  const { pop } = useFlow()
  const { chain, appName } = useActivityParams<AccountPickerJobParams>()

  const walletState = useStore(walletStore)
  const currentWallet = walletSelectors.getCurrentWallet(walletState)

  const walletsWithAddresses = useMemo((): WalletWithChainAddress[] => {
    return walletState.wallets.map((wallet) => {
      const chainAddress = chain
        ? wallet.chainAddresses.find((ca) => ca.chain === chain) ?? null
        : wallet.chainAddresses[0] ?? null

      return {
        wallet,
        chainAddress,
        isAvailable: chainAddress !== null,
      }
    })
  }, [walletState.wallets, chain])

  const handleSelect = (wallet: Wallet, chainAddress: ChainAddress) => {
    const event = new CustomEvent('account-picker-select', {
      detail: {
        address: chainAddress.address,
        chain: chainAddress.chain,
        name: wallet.name,
      },
    })
    window.dispatchEvent(event)
    pop()
  }

  const handleCancel = () => {
    const event = new CustomEvent('account-picker-cancel')
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

        {/* Title */}
        <div className="border-border border-b px-4 pb-4">
          <h2 className="text-center text-lg font-semibold">
            {t('selectAccount', '选择账户')}
          </h2>
          {appName && (
            <p className="text-muted-foreground mt-1 text-center text-sm">
              {appName} {t('requestsAccess', '请求访问')}
            </p>
          )}
        </div>

        {/* Wallet List */}
        <div className="max-h-[50vh] overflow-y-auto">
          {walletsWithAddresses.filter(w => w.isAvailable).length === 0 ? (
            <div className="text-muted-foreground py-12 text-center text-sm">
              {chain 
                ? t('noWalletsForChain', '暂无支持 {{chain}} 的钱包', { chain })
                : t('noWallets', '暂无钱包')}
            </div>
          ) : (
            <div className="divide-border divide-y">
              {walletsWithAddresses
                .filter(({ isAvailable }) => isAvailable)
                .map(({ wallet, chainAddress }) => {
                const isCurrent = wallet.id === currentWallet?.id
                const displayAddress = chainAddress!.address

                return (
                  <button
                    key={wallet.id}
                    onClick={() => chainAddress && handleSelect(wallet, chainAddress)}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-3 transition-colors',
                      'hover:bg-muted/50 active:bg-muted'
                    )}
                  >
                    {/* Avatar */}
                    <div
                      className="flex size-10 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: `hsl(${wallet.themeHue}, 70%, 90%)` }}
                    >
                      <IconWallet
                        className="size-5"
                        style={{ color: `hsl(${wallet.themeHue}, 70%, 40%)` }}
                      />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{wallet.name}</p>
                        {isCurrent && (
                          <span className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-xs">
                            {t('current', '当前')}
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground truncate font-mono text-sm">
                        {truncateAddress(displayAddress)}
                      </p>
                    </div>

                    {/* Check icon for current */}
                    {isCurrent && (
                      <IconCheck className="text-primary size-5 shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
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

export const AccountPickerJob: ActivityComponentType<AccountPickerJobParams> = ({ params }) => {
  return (
    <ActivityParamsProvider params={params}>
      <AccountPickerJobContent />
    </ActivityParamsProvider>
  )
}
