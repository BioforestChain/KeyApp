/**
 * MiniappSheetHeader - 统一的小程序 Sheet 页头组件
 *
 * 用于 WalletPickerJob、ChainSwitchConfirmJob、SigningConfirmJob 等场景
 */

import { MiniappIcon } from './miniapp-icon'

export type MiniappSheetHeaderProps = {
  /** Sheet 标题 */
  title: string
  /** 描述文本 (可选) */
  description?: string
  /** 来源小程序名称 */
  appName?: string
  /** 来源小程序图标 URL */
  appIcon?: string
}

export function MiniappSheetHeader({ title, description, appName, appIcon }: MiniappSheetHeaderProps) {
  return (
    <div className="border-border border-b px-4 pb-4">
      <div className="mx-auto mb-3 flex w-fit justify-center">
        <MiniappIcon src={appIcon} name={appName || 'App'} size="lg" shadow="sm" />
      </div>
      <h2 className="text-center text-lg font-semibold">{title}</h2>
      {description && <p className="text-muted-foreground mt-1 text-center text-sm">{description}</p>}
    </div>
  )
}
