import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigation, useFlow } from '@/stackflow';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  IconCamera as Camera,
  IconX as X,
  IconAperture as ImageIcon,
  IconBulb as Flashlight,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { useCamera } from '@/services/hooks';
import { parseQRContent, type ParsedQRContent } from '@/lib/qr-parser';
import { QRScanner, createQRScanner } from '@/lib/qr-scanner';

type ScannerState = 'idle' | 'requesting' | 'scanning' | 'denied' | 'error' | 'success';

interface ScannerPageProps {
  /** Callback when QR code is scanned */
  onScan?: ((content: string, parsed: ParsedQRContent) => void) | undefined;
  /** Custom class name */
  className?: string | undefined;
}

/** 扫描帧率 (ms) */
const SCAN_INTERVAL = 150;

export function ScannerPage({ onScan, className }: ScannerPageProps) {
  const { t } = useTranslation('scanner');
  const { t: tCommon } = useTranslation('common');
  const { navigate, goBack } = useNavigation();
  const { push } = useFlow();
  const cameraService = useCamera();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scannerRef = useRef<QRScanner | null>(null);
  const scanningRef = useRef(false);
  const lastScannedRef = useRef<string | null>(null);
  const onScanRef = useRef(onScan);

  const [state, setState] = useState<ScannerState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [flashEnabled, setFlashEnabled] = useState(false);

  // 保持 onScan 回调的最新引用
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  // Handle successful scan（使用 ref 避免依赖变化）
  const handleScanSuccess = useCallback(
    (content: string) => {
      // 防止重复触发
      if (content === lastScannedRef.current) return;

      lastScannedRef.current = content;
      setState('success');
      scanningRef.current = false;

      // 震动反馈
      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }

      const parsed = parseQRContent(content);

      if (onScanRef.current) {
        onScanRef.current(content, parsed);
      } else {
        // 默认行为：根据解析结果导航
        switch (parsed.type) {
          case 'address':
          case 'payment':
            navigate({
              to: '/send',
              search: {
                address: parsed.address,
                chain: parsed.chain,
                amount: parsed.type === 'payment' ? parsed.amount : undefined,
              },
            });
            break;
          
          case 'deeplink':
            // 深度链接：直接导航到目标路径
            navigate({
              to: parsed.path,
              search: parsed.params,
            });
            break;
          
          case 'contact':
            // 联系人名片：打开添加确认
            push('ContactAddConfirmJob', {
              name: parsed.name,
              addresses: JSON.stringify(parsed.addresses),
              memo: parsed.memo,
              avatar: parsed.avatar,
            });
            break;
          
          case 'unknown':
            // 未知内容：尝试作为地址处理，跳转到发送页面
            navigate({
              to: '/send',
              search: { address: parsed.content },
            });
            break;
        }
      }
    },
    [navigate, push],
  );

  // Scan loop - 帧扫描循环（使用 Web Worker 异步扫描）
  const startScanLoop = useCallback(() => {
    if (scanningRef.current) return;
    scanningRef.current = true;

    // 创建复用的 canvas
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }

    const scan = async () => {
      if (!scanningRef.current || !videoRef.current || !scannerRef.current) return;

      try {
        const result = await scannerRef.current.scanFromVideo(videoRef.current, canvasRef.current ?? undefined);
        if (result) {
          handleScanSuccess(result.content);
          return; // 停止扫描
        }
      } catch (err) {
        console.error('[Scanner] Scan error:', err);
      }

      // 继续下一帧
      if (scanningRef.current) {
        setTimeout(scan, SCAN_INTERVAL);
      }
    };

    scan();
  }, [handleScanSuccess]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    scanningRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Check and request camera permission
  const initCamera = useCallback(async () => {
    // 先停止现有的流
    stopCamera();
    
    setState('requesting');
    lastScannedRef.current = null;

    try {
      const hasPermission = await cameraService.checkPermission();
      if (!hasPermission) {
        const granted = await cameraService.requestPermission();
        if (!granted) {
          setState('denied');
          return;
        }
      }

      // Start camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        // 视频播放后启动扫描
        startScanLoop();
      }

      setState('scanning');
    } catch (err) {
      console.error('Camera error:', err);
      setState('error');
      setError(err instanceof Error ? err.message : 'Camera initialization failed');
    }
  }, [cameraService, startScanLoop, stopCamera]);

  // 初始化 QR Scanner 和相机（只在挂载时执行一次）
  useEffect(() => {
    scannerRef.current = createQRScanner({ useWorker: true });
    initCamera();
    
    return () => {
      stopCamera();
      scannerRef.current?.destroy();
      scannerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在挂载时执行
  }, []);

  // Handle back navigation
  const handleBack = useCallback(() => {
    stopCamera();
    goBack();
  }, [stopCamera, goBack]);

  // Handle gallery import
  const handleGalleryImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        // 加载图片到 Canvas
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.onload = async () => {
          URL.revokeObjectURL(url);
          
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx || !scannerRef.current) {
            setError(t('noQrFound'));
            setState('error');
            return;
          }
          
          ctx.drawImage(img, 0, 0);
          const result = await scannerRef.current.scanFromCanvas(canvas);
          
          if (result) {
            handleScanSuccess(result.content);
          } else {
            setError(t('noQrFound'));
            setState('error');
          }
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(url);
          setError(t('noQrFound'));
          setState('error');
        };
        
        img.src = url;
      } catch {
        setError(t('noQrFound'));
        setState('error');
      }
    };
    input.click();
  }, [handleScanSuccess, t]);

  // Toggle flash
  const toggleFlash = useCallback(async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track) {
        try {
          await track.applyConstraints({
            // @ts-expect-error - torch is not in standard types
            advanced: [{ torch: !flashEnabled }],
          });
          setFlashEnabled(!flashEnabled);
        } catch {
          // Flash not supported
        }
      }
    }
  }, [flashEnabled]);

  return (
    <div className={cn('relative flex h-screen flex-col bg-black', className)}>
      {/* Header */}
      <div className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between p-4">
        <Button variant="ghost" size="icon" data-testid="back-button" onClick={handleBack} className="text-white" aria-label={tCommon('a11y.back')}>
          <X className="size-6" />
        </Button>
        <h1 data-testid="page-title" className="text-lg font-medium text-white">{t('title')}</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFlash}
          className={cn('text-white', flashEnabled && 'text-yellow-400')}
          aria-label={flashEnabled ? t('flashOff') : t('flashOn')}
        >
          <Flashlight className="size-6" />
        </Button>
      </div>

      {/* Camera viewfinder */}
      <div className="relative flex-1">
        {(state === 'scanning' || state === 'success') && (
          <video ref={videoRef} className="absolute inset-0 size-full object-cover" playsInline muted />
        )}

        {/* Scan overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Corner markers */}
          <div className="relative size-64">
            <div
              className={cn(
                'absolute top-0 left-0 size-8 border-t-4 border-l-4',
                state === 'success' ? 'border-green-500' : 'border-primary',
              )}
            />
            <div
              className={cn(
                'absolute top-0 right-0 size-8 border-t-4 border-r-4',
                state === 'success' ? 'border-green-500' : 'border-primary',
              )}
            />
            <div
              className={cn(
                'absolute bottom-0 left-0 size-8 border-b-4 border-l-4',
                state === 'success' ? 'border-green-500' : 'border-primary',
              )}
            />
            <div
              className={cn(
                'absolute right-0 bottom-0 size-8 border-r-4 border-b-4',
                state === 'success' ? 'border-green-500' : 'border-primary',
              )}
            />

            {/* Scan line animation */}
            {state === 'scanning' && <div className="animate-scan bg-primary absolute right-2 left-2 h-0.5" />}
          </div>
        </div>

        {/* Status messages */}
        <div className="absolute inset-x-0 bottom-32 text-center">
          {state === 'idle' && <p className="text-white/80">{t('initializing')}</p>}
          {state === 'requesting' && <p className="text-white/80">{t('requestingPermission')}</p>}
          {state === 'scanning' && <p className="text-white/80">{t('scanPrompt')}</p>}
          {state === 'success' && (
            <div className="space-y-2">
              <p className="text-green-400">{t('scanSuccess')}</p>
            </div>
          )}
          {state === 'denied' && (
            <div className="space-y-2">
              <p className="text-red-400">{t('permissionDenied')}</p>
              <Button variant="outline" data-testid="retry-button" onClick={initCamera}>
                {t('retry')}
              </Button>
            </div>
          )}
          {state === 'error' && (
            <div className="space-y-2">
              <p className="text-red-400">{error || t('error')}</p>
              <Button variant="outline" data-testid="retry-button" onClick={initCamera}>
                {t('retry')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute inset-x-0 bottom-0 flex justify-center gap-8 pb-8">
        <Button
          variant="ghost"
          size="lg"
          data-testid="gallery-button"
          onClick={handleGalleryImport}
          className="flex flex-col items-center text-white"
        >
          <ImageIcon className="mb-1 size-6" />
          <span className="text-xs">{t('gallery')}</span>
        </Button>
        <div className="flex size-16 items-center justify-center rounded-full bg-white/20">
          <Camera className="size-8 text-white" />
        </div>
        <div className="w-16" /> {/* Spacer for symmetry */}
      </div>
    </div>
  );
}

export default ScannerPage;
