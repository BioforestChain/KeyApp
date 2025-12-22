import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigation } from '@/stackflow';
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
import { scanQRFromVideo, scanQRFromFile, parseQRContent, type ParsedQRContent } from '@/lib/qr-parser';

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
  const cameraService = useCamera();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef(false);

  const [state, setState] = useState<ScannerState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  // Handle successful scan
  const handleScanSuccess = useCallback(
    (content: string) => {
      // 防止重复触发
      if (content === lastScanned) return;

      setLastScanned(content);
      setState('success');
      scanningRef.current = false;

      // 震动反馈
      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }

      const parsed = parseQRContent(content);

      if (onScan) {
        onScan(content, parsed);
      } else {
        // 默认行为：根据解析结果导航
        if (parsed.type === 'address' || parsed.type === 'payment') {
          navigate({
            to: '/send',
            search: {
              address: parsed.address,
              chain: parsed.chain,
              amount: parsed.type === 'payment' ? parsed.amount : undefined,
            },
          });
        }
      }
    },
    [lastScanned, onScan, navigate],
  );

  // Scan loop - 帧扫描循环
  const startScanLoop = useCallback(() => {
    if (scanningRef.current) return;
    scanningRef.current = true;

    // 创建复用的 canvas
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }

    const scan = () => {
      if (!scanningRef.current || !videoRef.current) return;

      const result = scanQRFromVideo(videoRef.current, canvasRef.current ?? undefined);
      if (result) {
        handleScanSuccess(result);
        return; // 停止扫描
      }

      // 继续下一帧
      setTimeout(scan, SCAN_INTERVAL);
    };

    scan();
  }, [handleScanSuccess]);

  // Check and request camera permission
  const initCamera = useCallback(async () => {
    setState('requesting');
    setLastScanned(null);

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
  }, [cameraService, startScanLoop]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    scanningRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initCamera();
    return () => {
      stopCamera();
    };
  }, [initCamera, stopCamera]);

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

      const result = await scanQRFromFile(file);
      if (result) {
        handleScanSuccess(result);
      } else {
        // 无法识别 QR 码
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
              <Button variant="outline" onClick={initCamera}>
                {t('retry')}
              </Button>
            </div>
          )}
          {state === 'error' && (
            <div className="space-y-2">
              <p className="text-red-400">{error || t('error')}</p>
              <Button variant="outline" onClick={initCamera}>
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
