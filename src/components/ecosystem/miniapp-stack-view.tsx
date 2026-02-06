/**
 * MiniappStackView - 层叠视图容器
 *
 * 显示所有运行中的应用列表
 * 采用类似 iOS 通知中心的一条条 item
 */

import { useCallback, useEffect, useMemo } from 'react'
import { IconX } from '@tabler/icons-react'
import { useStore } from '@tanstack/react-store'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import {
  miniappRuntimeStore,
  miniappRuntimeSelectors,
  activateApp,
  closeApp,
  closeStackView,
} from '@/services/miniapp-runtime'
import type { MiniappInstance } from '@/services/miniapp-runtime'
import { MiniappIcon } from './miniapp-icon'
import styles from './miniapp-stack-view.module.css'

export interface MiniappStackViewProps {
  /** 是否可见 */
  visible?: boolean
  /** 关闭回调（退出层叠视图） */
  onClose?: () => void
  /** 自定义类名 */
  className?: string
}

export function MiniappStackView({
  visible = false,
  onClose,
  className,
}: MiniappStackViewProps) {
  const { t } = useTranslation(['ecosystem', 'common'])

  // 获取所有运行中的应用
  const apps = useStore(miniappRuntimeStore, miniappRuntimeSelectors.getApps) as MiniappInstance[]
  const focusedAppId = useStore(miniappRuntimeStore, miniappRuntimeSelectors.getFocusedAppId)

  const sortedApps = useMemo(() => {
    return [...apps].sort((left, right) => right.lastActiveAt - left.lastActiveAt)
  }, [apps])

  // 当应用列表变化时，如果没有应用了就关闭视图
  useEffect(() => {
    if (visible && apps.length === 0) {
      onClose?.()
      closeStackView()
    }
  }, [visible, apps.length, onClose])

  // 处理卡片点击 - 激活应用并退出层叠视图
  const handleCardTap = useCallback((appId: string) => {
    activateApp(appId)
    closeStackView()
    onClose?.()
  }, [onClose])

  // 处理关闭应用
  const handleCloseApp = useCallback((appId: string) => {
    closeApp(appId)
  }, [])

  if (!visible || apps.length === 0) {
    return null
  }

  return (
    <div
      className={cn(styles.container, className)}
      data-testid="miniapp-stack-view"
    >
      {/* 背景遮罩 */}
      <div
        className={styles.backdrop}
        onClick={() => {
          closeStackView()
          onClose?.()
        }}
      />

      {/* 标题 */}
      <div className={styles.title}>
        <span>{t('stack.runningApps')}</span>
        <span className={styles.count}>{apps.length}</span>
      </div>

      {/* Item 列表区域 */}
      <div className={styles.listWrapper}>
        <ItemGroup className="h-full overflow-y-auto px-4 pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[color-mix(in_srgb,currentColor,transparent)]">
          {sortedApps.map((app) => {
            const isFocused = app.appId === focusedAppId

            return (
              <Item
                key={app.appId}
                variant="muted"
                role="button"
                tabIndex={0}
                aria-label={app.manifest.name}
                data-testid={`stack-item-${app.appId}`}
                data-app-id={app.appId}
                onClick={() => handleCardTap(app.appId)}
                onKeyDown={(event) => {
                  if (event.target !== event.currentTarget) {
                    return
                  }

                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    handleCardTap(app.appId)
                  }
                }}
                className={cn(
                  'w-full items-center gap-3 border border-white/10 bg-black/35 text-white backdrop-blur-md',
                  isFocused && 'border-primary/60 ring-primary/35 ring-1'
                )}
              >
                <ItemMedia>
                  <MiniappIcon src={app.manifest.icon} name={app.manifest.name} size="sm" shadow="sm" />
                </ItemMedia>

                <ItemContent>
                  <ItemTitle className="w-full text-white">{app.manifest.name}</ItemTitle>
                  <ItemDescription className="w-full text-white/70">{app.manifest.description}</ItemDescription>
                </ItemContent>

                <ItemActions>
                  {isFocused && <span className="bg-primary size-2 rounded-full" aria-hidden={true} />}
                  <button
                    type="button"
                    className="text-white/70 hover:text-white inline-flex size-8 items-center justify-center rounded-md"
                    data-testid={`stack-close-${app.appId}`}
                    aria-label={`${t('common:close')} ${app.manifest.name}`}
                    onClick={(event) => {
                      event.stopPropagation()
                      handleCloseApp(app.appId)
                    }}
                  >
                    <IconX className="size-4" stroke={1.8} />
                  </button>
                </ItemActions>
              </Item>
            )
          })}
        </ItemGroup>
      </div>

      {/* 操作提示 */}
      <div className={styles.hints}>
        <span>{t('stack.hints')}</span>
      </div>
    </div>
  )
}

export default MiniappStackView
