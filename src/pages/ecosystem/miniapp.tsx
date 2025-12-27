/**
 * MiniApp Container Page
 *
 * Runs a miniapp in an iframe with Bio SDK integration
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getAppById, getBridge, initBioProvider } from '@/services/ecosystem'
import type { MiniappManifest } from '@/services/ecosystem'
import { IconX, IconDots } from '@tabler/icons-react'

interface MiniappPageProps {
  appId: string
  onClose?: () => void
}

export function MiniappPage({ appId, onClose }: MiniappPageProps) {
  const { t } = useTranslation('common')
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [app, setApp] = useState<MiniappManifest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const manifest = getAppById(appId)
    if (!manifest) {
      setError('小程序不存在')
      setLoading(false)
      return
    }
    setApp(manifest)
  }, [appId, t])

  useEffect(() => {
    // Initialize provider on mount
    initBioProvider()
  }, [])

  const handleIframeLoad = useCallback(() => {
    if (!iframeRef.current || !app) return

    // Attach bridge to iframe
    const bridge = getBridge()
    bridge.attach(iframeRef.current, app.id, app.permissions ?? [])

    setLoading(false)

    // Emit connect event
    bridge.emit('connect', { chainId: 'bfmeta' })
  }, [app])

  useEffect(() => {
    return () => {
      // Detach bridge on unmount
      getBridge().detach()
    }
  }, [])

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <p className="text-destructive mb-4">{error}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          {t('back', '返回')}
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-muted transition-colors"
          aria-label={t('close', '关闭')}
        >
          <IconX className="size-5" stroke={1.5} />
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="font-semibold truncate">{app?.name ?? '加载中...'}</h1>
          {app?.author && (
            <p className="text-xs text-muted-foreground truncate">{app.author}</p>
          )}
        </div>

        <button
          className="p-1.5 rounded-full hover:bg-muted transition-colors"
          aria-label={t('more', '更多')}
        >
          <IconDots className="size-5" stroke={1.5} />
        </button>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 top-14 flex items-center justify-center bg-background z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">加载中...</p>
          </div>
        </div>
      )}

      {/* Iframe container */}
      {app && (
        <iframe
          ref={iframeRef}
          src={app.url}
          className="flex-1 w-full border-0"
          sandbox="allow-scripts allow-forms allow-same-origin"
          onLoad={handleIframeLoad}
          title={app.name}
        />
      )}
    </div>
  )
}

export default MiniappPage
