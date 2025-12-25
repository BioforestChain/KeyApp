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
import { parseQRContent, type ParsedQRContent } from '@/lib/qr-parser'
import { QRScanner, createQRScanner } from '@/lib/qr-scanner'
import { useFlow } from '../../stackflow'
import { ActivityParamsProvider, useActivityParams } from '../../hooks'

/** 验证器类型 */
export type ScanValidator = (content: string, parsed: ParsedQRContent) => true | string

/** 预设验证器 */
export const scanValidators = {
  ethereumAddress: (_content: string, parsed: ParsedQRContent): true | string => {
    if (parsed.type === 'address' && parsed.chain === 'ethereum') return true
    if (parsed.type === 'payment' && parsed.chain === 'ethereum') return true
    if (parsed.type === 'unknown' && /^0x[a-fA-F0-9]{40}$/.test(parsed.content)) return true
    return 'invalidEthereumAddress'
  },
  
  bitcoinAddress: (_content: string, parsed: ParsedQRContent): true | string => {
    if (parsed.type === 'address' && parsed.chain === 'bitcoin') return true
    if (parsed.type === 'payment' && parsed.chain === 'bitcoin') return true
    return 'invalidBitcoinAddress'
  },
  
  tronAddress: (_content: string, parsed: ParsedQRContent): true | string => {
    if (parsed.type === 'address' && parsed.chain === 'tron') return true
    if (parsed.type === 'payment' && parsed.chain === 'tron') return true
    if (parsed.type === 'unknown' && /^T[a-zA-HJ-NP-Z1-9]{33}$/.test(parsed.content)) return true
    return 'invalidTronAddress'
  },
  
  anyAddress: (_content: string, parsed: ParsedQRContent): true | string => {
    if (parsed.type === 'address') return true
    if (parsed.type === 'payment') return true
    if (parsed.type === 'unknown' && parsed.content.length >= 26 && parsed.content.length <= 64) return true
    return 'invalidAddress'
  },
  
  any: (): true => true,
}

/** 根据链类型获取验证器 */
export function getValidatorForChain(chainType?: string): ScanValidator {
  switch (chainType?.toLowerCase()) {
    case 'ethereum':
    case 'eth':
      return scanValidators.ethereumAddress
    case 'bitcoin':
    case 'btc':
      return scanValidators.bitcoinAddress
    case 'tron':
    case 'trx':
      return scanValidators.tronAddress
    default:
      return scanValidators.anyAddress
  }
}

/** 扫描结果事件 */
export interface ScannerResultEvent {
  content: string
  parsed: ParsedQRContent
}

/** 设置扫描结果回调 */
let scannerResultCallback: ((result: ScannerResultEvent) => void) | null = null

export function setScannerResultCallback(callback: ((result: ScannerResultEvent) => void) | null) {
  scannerResultCallback = callback
}

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
      
      // 触发回调
      scannerResultCallback?.({ content, parsed })
      
      // 关闭
      setTimeout(() => pop(), 300)
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
        console.error('[ScannerJob] Scan error:', err)
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
    try {
      const hasPermission = await cameraService.checkPermission()
      if (!hasPermission) {
        const granted = await cameraService.requestPermission()
        if (!granted) {
          setMessage({ type: 'error', text: t('permissionDenied') })
          return
        }
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraReady(true)
        startScanLoop()
      }
    } catch (err) {
      console.error('[ScannerJob] Camera error:', err)
      setMessage({ type: 'error', text: t('error') })
    }
  }, [cameraService, startScanLoop, t])
  
  // 初始化
  useEffect(() => {
    scannerRef.current = createQRScanner({ useWorker: true })
    initCamera()
    
    return () => {
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
      <div className="bg-background h-[85vh] rounded-t-2xl">
        {/* Header */}
        <div className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-white hover:bg-white/20"
          >
            <X className="size-6" />
          </Button>
          <h2 className="text-lg font-medium text-white">
            {title ?? t('title')}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFlash}
            className={cn('text-white hover:bg-white/20', flashEnabled && 'text-yellow-400')}
          >
            <Flashlight className="size-6" />
          </Button>
        </div>
        
        {/* Camera View */}
        <div className="relative size-full overflow-hidden rounded-t-2xl bg-black">
          {cameraReady && (
            <video
              ref={videoRef}
              className="absolute inset-0 size-full object-cover"
              playsInline
              muted
            />
          )}
          
          {/* Scan overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative size-64">
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
          <div className="absolute inset-x-0 bottom-32 px-4 text-center">
            {message ? (
              <div className={cn(
                'inline-block rounded-lg px-4 py-2',
                message.type === 'error' && 'bg-red-500/80 text-white',
                message.type === 'success' && 'bg-green-500/80 text-white',
                message.type === 'info' && 'bg-black/50 text-white',
              )}>
                {message.text}
              </div>
            ) : (
              <p className="text-white/80">
                {hint ?? t('scanPrompt')}
              </p>
            )}
          </div>
          
          {/* Bottom controls */}
          <div className="absolute inset-x-0 bottom-0 flex justify-center pb-8">
            <Button
              variant="ghost"
              size="lg"
              onClick={handleGalleryImport}
              className="flex flex-col items-center text-white hover:bg-white/20"
            >
              <ImageIcon className="mb-1 size-6" />
              <span className="text-xs">{t('gallery')}</span>
            </Button>
          </div>
        </div>
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
