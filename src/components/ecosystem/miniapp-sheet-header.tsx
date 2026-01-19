/**
 * MiniappSheetHeader - 统一的小程序 Sheet 页头组件
 *
 * 用于 WalletPickerJob、ChainSwitchConfirmJob、SigningConfirmJob 等场景
 */

import { MiniappIcon } from './miniapp-icon'
import { ChainBadge } from '@/components/wallet/chain-icon'

export type MiniappSheetHeaderProps = {
  /** Sheet 标题 */
  title: string
  /** 描述文本 (可选) */
  description?: string
  /** 来源小程序名称 */
  appName?: string
  /** 来源小程序图标 URL */
  appIcon?: string
  /** 请求的链 ID (可选，传入时显示 ChainBadge) */
  chainId?: string
}

export function MiniappSheetHeader({ title, description, appName, appIcon, chainId }: MiniappSheetHeaderProps) {
  return (
    <div className="border-border border-b px-4 pb-3">
      <div className="flex items-center gap-3">
        {/* 左侧：App 图标 */}
        <MiniappIcon src={appIcon} name={appName || 'App'} size="md" shadow="sm" />

        {/* 中间：标题和描述 */}
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold">{title}</h2>
          {description && <p className="text-muted-foreground truncate text-sm">{description}</p>}
        </div>

        {/* 右侧：ChainBadge (可选) */}
        {chainId && <ChainBadge chainId={chainId} />}
      </div>
    </div>
  )
}
