/**
 * MiniappSheetHeader - 统一的小程序 Sheet 页头组件
 *
 * 用于 WalletPickerJob、ChainSwitchConfirmJob、SigningConfirmJob 等场景
 * 
 * 布局规则：
 * - 有 walletInfo 时：左右布局（miniapp 左侧，wallet 右侧）
 * - 无 walletInfo 时：miniapp 信息居中
 */

import { MiniappIcon } from './miniapp-icon'
import { ChainBadge } from '@/components/wallet/chain-icon'

/** 钱包信息（右侧显示） */
export type WalletInfo = {
  /** 钱包名称 */
  name: string
  /** 钱包地址 */
  address: string
  /** 链 ID */
  chainId: string
}

export type MiniappSheetHeaderProps = {
  /** Sheet 标题 */
  title: string
  /** 描述文本 (可选) */
  description?: string
  /** 来源小程序名称 */
  appName?: string
  /** 来源小程序图标 URL */
  appIcon?: string
  /** 请求的链 ID (可选，传入时显示 ChainBadge，当有 walletInfo 时会被忽略) */
  chainId?: string
  /** 钱包信息 (可选，传入时在右侧显示钱包名+地址+链) */
  walletInfo?: WalletInfo
}

/** 格式化地址为短格式 */
function formatAddress(address: string): string {
  if (address.length <= 14) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function MiniappSheetHeader({ title, description, appName, appIcon, chainId, walletInfo }: MiniappSheetHeaderProps) {
  // 有钱包信息时使用左右布局
  if (walletInfo) {
    return (
      <div className="border-border border-b px-4 pb-3">
        <div className="flex items-center justify-between gap-3">
          {/* 左侧：Miniapp 信息 */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <MiniappIcon src={appIcon} name={appName || 'App'} size="sm" shadow="sm" />
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold">{title}</h2>
              {description && <p className="text-muted-foreground truncate text-xs">{description}</p>}
            </div>
          </div>

          {/* 右侧：钱包信息 */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-right">
              <p className="text-sm font-medium">{walletInfo.name}</p>
              <p className="text-muted-foreground text-xs font-mono">{formatAddress(walletInfo.address)}</p>
            </div>
            <ChainBadge chainId={walletInfo.chainId} />
          </div>
        </div>
      </div>
    )
  }

  // 无钱包信息时使用原有布局
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
