/**
 * MiniappWindow - 小程序窗口容器
 *
 * 全局 Popover 组件，用于显示小程序内容
 * 支持 FLIP 动画进行启动/关闭变换
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import { useStore } from '@tanstack/react-store'
import { cn } from '@/lib/utils'
import {
  miniappRuntimeStore,
  miniappRuntimeSelectors,
  registerWindowRef,
  playLaunchAnimation,
  playCloseAnimation,
  closeApp,
  activateApp,
  subscribe,
} from '@/services/miniapp-runtime'
import type { MiniappRuntimeEvent } from '@/services/miniapp-runtime'
import { MiniappSplashScreen } from './miniapp-splash-screen'
import { MiniappCapsule } from './miniapp-capsule'
import styles from './miniapp-window.module.css'

export interface MiniappWindowProps {
  className?: string
}

export function MiniappWindow({ className }: MiniappWindowProps) {
  const windowRef = useRef<HTMLDivElement>(null)
  const iframeContainerRef = useRef<HTMLDivElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showSplash, setShowSplash] = useState(false)

  // 获取当前激活的应用
  const activeApp = useStore(miniappRuntimeStore, miniappRuntimeSelectors.getActiveApp)
  const hasRunningApps = useStore(miniappRuntimeStore, miniappRuntimeSelectors.hasRunningApps)

  // 注册窗口 ref
  useEffect(() => {
    if (windowRef.current) {
      registerWindowRef(windowRef.current)
    }
  }, [])

  // 挂载 iframe 到容器
  useEffect(() => {
    if (!activeApp?.iframeRef || !iframeContainerRef.current) return

    const container = iframeContainerRef.current
    const iframe = activeApp.iframeRef

    // 如果 iframe 不在容器中，移动过来
    if (iframe.parentElement !== container) {
      container.appendChild(iframe)
    }

    return () => {
      // 组件卸载时不移除 iframe，由 runtime service 管理
    }
  }, [activeApp?.iframeRef])

  // 监听运行时事件
  useEffect(() => {
    const unsubscribe = subscribe((event: MiniappRuntimeEvent) => {
      switch (event.type) {
        case 'app:launch':
          setIsAnimating(true)
          setShowSplash(true)
          // 播放启动动画，完成后激活应用
          playLaunchAnimation(event.appId, () => {
            setIsAnimating(false)
            activateApp(event.appId)
          })
          break

        case 'app:close':
          // 关闭动画由调用方处理
          break

        case 'app:state-change':
          if (event.state === 'active') {
            setShowSplash(false)
          }
          break
      }
    })

    return unsubscribe
  }, [])

  // 处理关闭
  const handleClose = useCallback(() => {
    if (!activeApp) return

    setIsAnimating(true)
    const animation = playCloseAnimation(activeApp.appId, () => {
      setIsAnimating(false)
      closeApp(activeApp.appId)
    })
    
    // 如果动画无法播放，直接关闭
    if (!animation) {
      setIsAnimating(false)
      closeApp(activeApp.appId)
    }
  }, [activeApp])

  // 处理启动屏关闭
  const handleSplashClose = useCallback(() => {
    setShowSplash(false)
  }, [])

  // 如果没有运行中的应用，不渲染
  if (!hasRunningApps) {
    return null
  }

  return (
    <div
      ref={windowRef}
      className={cn(
        styles.window,
        isAnimating && styles.animating,
        className
      )}
      data-testid="miniapp-window"
      data-app-id={activeApp?.appId}
    >
      {/* 启动屏幕 */}
      {activeApp && showSplash && (
        <MiniappSplashScreen
          app={{
            name: activeApp.manifest.name,
            icon: activeApp.manifest.icon,
            themeColor: activeApp.manifest.themeColorFrom ?? 280,
          }}
          visible={showSplash}
          onClose={handleSplashClose}
        />
      )}

      {/* iframe 容器 */}
      <div
        ref={iframeContainerRef}
        className={styles.iframeContainer}
        style={{ opacity: showSplash ? 0 : 1 }}
      />

      {/* 胶囊容器层 - 确保在 iframe 之上可点击 */}
      <div className={styles.capsuleLayer}>
        <MiniappCapsule
          visible={true}
          onAction={() => {
            // TODO: 显示更多操作菜单
            console.log('[MiniappWindow] Action button clicked')
          }}
          onClose={handleClose}
        />
      </div>
    </div>
  )
}

export default MiniappWindow
