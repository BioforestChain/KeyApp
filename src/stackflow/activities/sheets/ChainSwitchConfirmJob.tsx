/**
 * ChainSwitchConfirmJob - 链切换确认弹窗
 * 当 DApp 请求 wallet_switchEthereumChain 时显示
 */

import type { ActivityComponentType } from '@stackflow/react'
import { BottomSheet } from '@/components/layout/bottom-sheet'
import { useTranslation } from 'react-i18next'
import { IconArrowRight, IconAlertTriangle } from '@tabler/icons-react'
import { ChainIcon } from '@/components/wallet/chain-icon'
import { MiniappSheetHeader } from '@/components/ecosystem'
import { useFlow } from '../../stackflow'
import { ActivityParamsProvider, useActivityParams } from '../../hooks'
import { parseHexChainId, getKeyAppChainId, CHAIN_DISPLAY_NAMES } from '@biochain/bio-sdk'
import type { ChainType } from '@/stores'

type ChainSwitchConfirmJobParams = {
  /** 当前链 ID (hex, e.g., '0x38') */
  fromChainId: string
  /** 目标链 ID (hex, e.g., '0x1') */
  toChainId: string
  /** 请求来源小程序名称 */
  appName?: string
  /** 请求来源小程序图标 */
  appIcon?: string
}

/** 获取链的显示名称 */
function getChainDisplayName(hexChainId: string): string {
  const keyAppId = getKeyAppChainId(hexChainId)
  if (keyAppId && CHAIN_DISPLAY_NAMES[keyAppId]) {
    return CHAIN_DISPLAY_NAMES[keyAppId]
  }
  // Fallback: 显示 decimal chainId
  try {
    const decimal = parseHexChainId(hexChainId)
    return `Chain ${decimal}`
  } catch {
    return hexChainId
  }
}

/** 获取 KeyApp 链类型 */
function getChainType(hexChainId: string): ChainType | null {
  const keyAppId = getKeyAppChainId(hexChainId)
  return keyAppId as ChainType | null
}

function ChainSwitchConfirmJobContent() {
  const { t } = useTranslation('common')
  const { pop } = useFlow()
  const { fromChainId, toChainId, appName, appIcon } = useActivityParams<ChainSwitchConfirmJobParams>()

  const fromChainName = getChainDisplayName(fromChainId)
  const toChainName = getChainDisplayName(toChainId)
  const fromChainType = getChainType(fromChainId)
  const toChainType = getChainType(toChainId)

  const handleConfirm = () => {
    const event = new CustomEvent('chain-switch-confirm', {
      detail: { approved: true, toChainId },
    })
    window.dispatchEvent(event)
    pop()
  }

  const handleCancel = () => {
    const event = new CustomEvent('chain-switch-confirm', {
      detail: { approved: false },
    })
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

        {/* App Info */}
        <MiniappSheetHeader
          title={t('switchNetwork', '切换网络')}
          description={`${appName || t('unknownDApp', '未知 DApp')} ${t('requestsNetworkSwitch', '请求切换网络')}`}
          appName={appName}
          appIcon={appIcon}
        />

        {/* Chain Switch Visual */}
        <div className="flex items-center justify-center gap-4 px-6 py-8">
          {/* From Chain */}
          <div className="flex flex-col items-center gap-2">
            {fromChainType ? (
              <ChainIcon chain={fromChainType} size="lg" />
            ) : (
              <div className="bg-muted flex size-12 items-center justify-center rounded-full">
                <IconAlertTriangle className="text-muted-foreground size-6" />
              </div>
            )}
            <span className="text-muted-foreground text-sm">{fromChainName}</span>
          </div>

          {/* Arrow */}
          <IconArrowRight className="text-primary size-8" />

          {/* To Chain */}
          <div className="flex flex-col items-center gap-2">
            {toChainType ? (
              <ChainIcon chain={toChainType} size="lg" />
            ) : (
              <div className="bg-muted flex size-12 items-center justify-center rounded-full">
                <IconAlertTriangle className="text-muted-foreground size-6" />
              </div>
            )}
            <span className="font-medium">{toChainName}</span>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-warning/10 border-warning/20 mx-4 mb-4 rounded-lg border p-3">
          <p className="text-warning text-sm">
            {t('chainSwitchWarning', '切换网络后，您的交易将在新网络上进行。请确保您了解此操作的影响。')}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 p-4">
          <button
            onClick={handleCancel}
            className="bg-muted hover:bg-muted/80 flex-1 rounded-xl py-3 font-medium transition-colors"
          >
            {t('cancel', '取消')}
          </button>
          <button
            onClick={handleConfirm}
            className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1 rounded-xl py-3 font-medium transition-colors"
          >
            {t('confirm', '确认')}
          </button>
        </div>

        {/* Safe area */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </BottomSheet>
  )
}

export const ChainSwitchConfirmJob: ActivityComponentType<ChainSwitchConfirmJobParams> = ({ params }) => {
  return (
    <ActivityParamsProvider params={params}>
      <ChainSwitchConfirmJobContent />
    </ActivityParamsProvider>
  )
}
