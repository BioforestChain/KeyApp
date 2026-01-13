/**
 * ScannerJob - 扫码 BottomSheet
 * 
 * 使用 Stackflow Job 模式实现，支持：
 * - 持续扫描模式（直到验证通过或手动关闭）
 * - 可配置验证器（支持地址类型过滤）
 * - 通过事件回调返回结果
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { ActivityComponentType } from '@stackflow/react'
import { BottomSheet } from '@/components/layout/bottom-sheet'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  IconX as X,
  IconAperture as ImageIcon,
  IconBulb as Flashlight,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { useCamera } from '@/services/hooks'
import { parseQRContent } from '@/lib/qr-parser'
import { QRScanner, createQRScanner } from '@/lib/qr-scanner'
import { useFlow } from '../../stackflow'
import { ActivityParamsProvider, useActivityParams } from '../../hooks'
import { getValidatorForChain, getScannerResultCallback } from './scanner-validators'

// Re-export validators
export { scanValidators, getValidatorForChain, setScannerResultCallback } from './scanner-validators'
export type { ScanValidator, ScannerResultEvent } from './scanner-validators'

/** Job 参数 */
export type ScannerJobParams = {
  /** 链类型（用于验证） */
  chainType?: string
  /** 标题 */
  title?: string
  /** 提示文字 */
  hint?: string
}

const SCAN_INTERVAL = 150

function ScannerJobContent() {
  const { t } = useTranslation('scanner')
  const { pop } = useFlow()
  const cameraService = useCamera()
  const { chainType, title, hint } = useActivityParams<ScannerJobParams>()
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scannerRef = useRef<QRScanner | null>(null)
  const scanningRef = useRef(false)
  const mountedRef = useRef(false)
  const initializingRef = useRef(false)
  
  const [cameraReady, setCameraReady] = useState(false)
  const [flashEnabled, setFlashEnabled] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success' | 'info'; text: string } | null>(null)
  const [lastScanned, setLastScanned] = useState<string | null>(null)
  
  const validator = getValidatorForChain(chainType)
  
  // 处理扫描结果
  const handleScanResult = useCallback((content: string) => {
    if (content === lastScanned) return
    setLastScanned(content)
    
    const parsed = parseQRContent(content)
    const result = validator(content, parsed)
    
    if (result === true) {
      setMessage({ type: 'success', text: t('scanSuccess') })
      
      if ('vibrate' in navigator) {
        navigator.vibrate(100)
      }
      
      // 停止扫描
      scanningRef.current = false
      
      // 保存回调引用
      const callback = getScannerResultCallback()
      
      // 先关闭 sheet
      setTimeout(() => {
        pop()
        // pop 完成后再触发回调
        setTimeout(() => {
          callback?.({ content, parsed })
        }, 100)
      }, 300)
    } else {
      setMessage({ type: 'error', text: t(result, { defaultValue: result }) })
      
      setTimeout(() => {
        setMessage(null)
        setLastScanned(null)
      }, 3000)
    }
  }, [lastScanned, validator, t, pop])
  
  // 扫描循环
  const startScanLoop = useCallback(() => {
    if (scanningRef.current) return
    scanningRef.current = true
    
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas')
    }
    
    const scan = async () => {
      if (!scanningRef.current || !videoRef.current || !scannerRef.current) return
      
      try {
        const result = await scannerRef.current.scanFromVideo(videoRef.current, canvasRef.current ?? undefined)
        if (result) {
          handleScanResult(result.content)
        }
      } catch (err) {
        
      }
      
      if (scanningRef.current) {
        setTimeout(scan, SCAN_INTERVAL)
      }
    }
    
    scan()
  }, [handleScanResult])
  
  // 停止相机
  const stopCamera = useCallback(() => {
    scanningRef.current = false
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setCameraReady(false)
  }, [])
  
  // 初始化相机
  const initCamera = useCallback(async () => {
    // 防止重复初始化
    if (initializingRef.current) return
    initializingRef.current = true
    
    // 检查是否支持 mediaDevices
    if (!navigator.mediaDevices?.getUserMedia) {
      
      setMessage({ type: 'error', text: t('error') })
      initializingRef.current = false
      return
    }
    
    try {
      // 先尝试检查权限（某些浏览器可能不支持）
      try {
        const hasPermission = await cameraService.checkPermission()
        if (!hasPermission) {
          const granted = await cameraService.requestPermission()
          if (!granted) {
            setMessage({ type: 'error', text: t('permissionDenied') })
            initializingRef.current = false
            return
          }
        }
      } catch (permErr) {
        // 权限检查失败，继续尝试直接获取相机
        
      }
      
      // 如果组件已卸载，停止
      if (!mountedRef.current) {
        initializingRef.current = false
        return
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      
      // 再次检查组件是否已卸载
      if (!mountedRef.current) {
        stream.getTracks().forEach(track => track.stop())
        initializingRef.current = false
        return
      }
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        try {
          await videoRef.current.play()
          // 播放成功后再次检查
          if (mountedRef.current) {
            setCameraReady(true)
            startScanLoop()
          }
        } catch (playErr) {
          // AbortError 表示 play() 被打断，这在 StrictMode 下是正常的
          if (playErr instanceof DOMException && playErr.name === 'AbortError') {
            
          } else {
            throw playErr
          }
        }
      }
    } catch (err) {
      
      if (!mountedRef.current) {
        initializingRef.current = false
        return
      }
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setMessage({ type: 'error', text: t('permissionDenied') })
        } else if (err.name === 'NotFoundError') {
          setMessage({ type: 'error', text: t('noCameraFound', { defaultValue: t('error') }) })
        } else if (err.name === 'AbortError') {
          // AbortError 不显示错误，会在下次挂载时重试
        } else {
          setMessage({ type: 'error', text: t('error') })
        }
      } else {
        setMessage({ type: 'error', text: t('error') })
      }
    } finally {
      initializingRef.current = false
    }
  }, [cameraService, startScanLoop, t])
  
  // 初始化
  useEffect(() => {
    mountedRef.current = true
    scannerRef.current = createQRScanner({ useWorker: true })
    initCamera()
    
    return () => {
      mountedRef.current = false
      stopCamera()
      scannerRef.current?.destroy()
      scannerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  // 从相册导入
  const handleGalleryImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file || !scannerRef.current) return
      
      try {
        const img = new Image()
        const url = URL.createObjectURL(file)
        
        img.onload = async () => {
          URL.revokeObjectURL(url)
          
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          if (!ctx || !scannerRef.current) {
            setMessage({ type: 'error', text: t('noQrFound') })
            return
          }
          
          ctx.drawImage(img, 0, 0)
          const result = await scannerRef.current.scanFromCanvas(canvas)
          
          if (result) {
            handleScanResult(result.content)
          } else {
            setMessage({ type: 'error', text: t('noQrFound') })
          }
        }
        
        img.onerror = () => {
          URL.revokeObjectURL(url)
          setMessage({ type: 'error', text: t('noQrFound') })
        }
        
        img.src = url
      } catch {
        setMessage({ type: 'error', text: t('noQrFound') })
      }
    }
    input.click()
  }, [handleScanResult, t])
  
  // 切换闪光灯
  const toggleFlash = useCallback(async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0]
      if (track) {
        try {
          await track.applyConstraints({
            // @ts-expect-error - torch is not in standard types
            advanced: [{ torch: !flashEnabled }],
          })
          setFlashEnabled(!flashEnabled)
        } catch {
          // Flash not supported
        }
      }
    }
  }, [flashEnabled])
  
  const handleClose = useCallback(() => {
    stopCamera()
    pop()
  }, [stopCamera, pop])
  
  return (
    <BottomSheet>
      <div className="flex h-[80vh] flex-col overflow-hidden rounded-t-2xl bg-black">
        {/* Handle */}
        <div className="flex justify-center py-2">
          <div className="h-1 w-10 rounded-full bg-white/30" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-white hover:bg-white/20"
            data-testid="scanner-close-button"
          >
            <X className="size-6" />
          </Button>
          <h2 className="text-lg font-medium text-white" data-testid="scanner-title">
            {title ?? t('title')}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFlash}
            className={cn('text-white hover:bg-white/20', flashEnabled && 'text-yellow-400')}
            data-testid="scanner-flash-button"
          >
            <Flashlight className="size-6" />
          </Button>
        </div>
        
        {/* Camera View */}
        <div className="relative flex-1">
          <video
            ref={videoRef}
            className={cn(
              'absolute inset-0 size-full object-cover',
              !cameraReady && 'hidden'
            )}
            playsInline
            muted
            data-testid="scanner-video"
          />
          
          {/* Loading state */}
          {!cameraReady && !message && (
            <div className="flex size-full items-center justify-center">
              <p className="text-white/60">{t('initializing')}</p>
            </div>
          )}
          
          {/* Scan overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative size-64" data-testid="scanner-viewfinder">
              <div className={cn(
                'absolute top-0 left-0 size-8 border-t-4 border-l-4',
                message?.type === 'success' ? 'border-green-500' : 'border-primary',
              )} />
              <div className={cn(
                'absolute top-0 right-0 size-8 border-t-4 border-r-4',
                message?.type === 'success' ? 'border-green-500' : 'border-primary',
              )} />
              <div className={cn(
                'absolute bottom-0 left-0 size-8 border-b-4 border-l-4',
                message?.type === 'success' ? 'border-green-500' : 'border-primary',
              )} />
              <div className={cn(
                'absolute right-0 bottom-0 size-8 border-r-4 border-b-4',
                message?.type === 'success' ? 'border-green-500' : 'border-primary',
              )} />
              
              {cameraReady && !message && (
                <div className="animate-scan bg-primary absolute right-2 left-2 h-0.5" />
              )}
            </div>
          </div>
          
          {/* Message area */}
          <div className="absolute inset-x-0 bottom-24 px-4 text-center">
            {message ? (
              <div 
                className={cn(
                  'inline-block rounded-lg px-4 py-2',
                  message.type === 'error' && 'bg-red-500/80 text-white',
                  message.type === 'success' && 'bg-green-500/80 text-white',
                  message.type === 'info' && 'bg-black/50 text-white',
                )}
                data-testid="scanner-message"
              >
                {message.text}
              </div>
            ) : cameraReady ? (
              <p className="text-white/80" data-testid="scanner-hint">
                {hint ?? (chainType ? t('scanPromptChain', { chain: chainType }) : t('scanPrompt'))}
              </p>
            ) : null}
          </div>
        </div>
        
        {/* Bottom controls */}
        <div className="flex justify-center gap-8 bg-black/50 py-6">
          <Button
            variant="ghost"
            size="lg"
            onClick={handleGalleryImport}
            className="flex flex-col items-center text-white hover:bg-white/20"
            data-testid="scanner-gallery-button"
          >
            <ImageIcon className="mb-1 size-6" />
            <span className="text-xs">{t('gallery')}</span>
          </Button>
        </div>
        
        {/* Safe area */}
        <div className="h-[env(safe-area-inset-bottom)] bg-black" />
      </div>
    </BottomSheet>
  )
}

export const ScannerJob: ActivityComponentType<ScannerJobParams> = ({ params }) => {
  return (
    <ActivityParamsProvider params={params}>
      <ScannerJobContent />
    </ActivityParamsProvider>
  )
}
