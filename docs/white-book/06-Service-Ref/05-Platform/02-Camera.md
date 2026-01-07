# Camera Service

> Source: [src/services/camera/](https://github.com/BioforestChain/KeyApp/tree/main/src/services/camera)

## 概览

相机服务提供二维码扫描和拍照能力。

---

## 文件结构

```
camera/
├── types.ts      # 接口定义
├── mock.ts       # Mock 实现
├── web.ts        # Web 实现 (MediaDevices API)
├── dweb.ts       # DWeb 原生实现
└── index.ts      # 平台检测 + 导出
```

---

## 接口定义

```typescript
// types.ts

type PermissionStatus = 'granted' | 'denied' | 'prompt';

interface ScanResult {
  text: string;
  format: 'qr' | 'barcode' | 'unknown';
  raw?: Uint8Array;
}

interface PhotoResult {
  dataUrl: string;        // base64 data URL
  width: number;
  height: number;
  mimeType: string;
}

interface ScanOptions {
  camera?: 'front' | 'back';
  formats?: ('qr' | 'barcode')[];
  timeout?: number;
}

interface ICameraService {
  // 权限管理
  checkPermission(): Promise<PermissionStatus>;
  requestPermission(): Promise<PermissionStatus>;
  
  // 扫描
  scanQRCode(options?: ScanOptions): Promise<ScanResult>;
  
  // 拍照
  takePhoto(): Promise<PhotoResult>;
  
  // 停止
  stopScan(): void;
}
```

---

## Web 实现

```typescript
// web.ts

class WebCameraService implements ICameraService {
  private stream: MediaStream | null = null;
  private scanning = false;
  
  async checkPermission(): Promise<PermissionStatus> {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      return result.state as PermissionStatus;
    } catch {
      return 'prompt';
    }
  }
  
  async requestPermission(): Promise<PermissionStatus> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      return 'granted';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        return 'denied';
      }
      return 'prompt';
    }
  }
  
  async scanQRCode(options?: ScanOptions): Promise<ScanResult> {
    this.scanning = true;
    
    // 获取视频流
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: options?.camera === 'front' ? 'user' : 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });
    
    // 创建视频元素
    const video = document.createElement('video');
    video.srcObject = this.stream;
    await video.play();
    
    // 使用 BarcodeDetector API (如果可用)
    if ('BarcodeDetector' in window) {
      return this.scanWithBarcodeDetector(video, options);
    }
    
    // 降级到 jsQR 库
    return this.scanWithJsQR(video, options);
  }
  
  private async scanWithBarcodeDetector(
    video: HTMLVideoElement,
    options?: ScanOptions
  ): Promise<ScanResult> {
    const detector = new (window as any).BarcodeDetector({
      formats: options?.formats ?? ['qr_code'],
    });
    
    const timeout = options?.timeout ?? 30000;
    const startTime = Date.now();
    
    while (this.scanning && Date.now() - startTime < timeout) {
      const barcodes = await detector.detect(video);
      
      if (barcodes.length > 0) {
        this.stopScan();
        return {
          text: barcodes[0].rawValue,
          format: barcodes[0].format === 'qr_code' ? 'qr' : 'barcode',
        };
      }
      
      await new Promise(r => setTimeout(r, 100));
    }
    
    throw new Error('Scan timeout');
  }
  
  async takePhoto(): Promise<PhotoResult> {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
    });
    
    const video = document.createElement('video');
    video.srcObject = stream;
    await video.play();
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0);
    
    stream.getTracks().forEach(track => track.stop());
    
    return {
      dataUrl: canvas.toDataURL('image/jpeg', 0.8),
      width: canvas.width,
      height: canvas.height,
      mimeType: 'image/jpeg',
    };
  }
  
  stopScan(): void {
    this.scanning = false;
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
}
```

---

## DWeb 实现

```typescript
// dweb.ts

class DwebCameraService implements ICameraService {
  private get native() {
    return window.bioforestChain?.camera;
  }
  
  async checkPermission(): Promise<PermissionStatus> {
    return this.native?.checkPermission() ?? 'denied';
  }
  
  async requestPermission(): Promise<PermissionStatus> {
    return this.native?.requestPermission() ?? 'denied';
  }
  
  async scanQRCode(options?: ScanOptions): Promise<ScanResult> {
    const result = await this.native?.scanQRCode({
      camera: options?.camera ?? 'back',
      formats: options?.formats ?? ['qr'],
    });
    
    if (!result) {
      throw new Error('Scan failed');
    }
    
    return {
      text: result.text,
      format: result.format,
    };
  }
  
  async takePhoto(): Promise<PhotoResult> {
    const result = await this.native?.takePhoto();
    
    if (!result) {
      throw new Error('Photo capture failed');
    }
    
    return result;
  }
  
  stopScan(): void {
    this.native?.stopScan();
  }
}
```

---

## Mock 实现

```typescript
// mock.ts

class MockCameraService implements ICameraService {
  private mockPermission: PermissionStatus = 'granted';
  private mockScanResult: string = 'ethereum:0x1234567890abcdef';
  
  async checkPermission(): Promise<PermissionStatus> {
    return this.mockPermission;
  }
  
  async requestPermission(): Promise<PermissionStatus> {
    return this.mockPermission;
  }
  
  async scanQRCode(): Promise<ScanResult> {
    // 模拟扫描延迟
    await new Promise(r => setTimeout(r, 2000));
    
    return {
      text: this.mockScanResult,
      format: 'qr',
    };
  }
  
  async takePhoto(): Promise<PhotoResult> {
    // 返回占位图
    return {
      dataUrl: 'data:image/png;base64,iVBORw0KGgo...',
      width: 640,
      height: 480,
      mimeType: 'image/png',
    };
  }
  
  stopScan(): void {}
  
  // Mock 控制
  setMockPermission(status: PermissionStatus): void {
    this.mockPermission = status;
  }
  
  setMockScanResult(result: string): void {
    this.mockScanResult = result;
  }
}
```

---

## 使用场景

### 扫描转账地址

```typescript
async function scanAddress(): Promise<string | null> {
  // 检查权限
  const permission = await cameraService.checkPermission();
  
  if (permission === 'denied') {
    toast.error('请在设置中允许相机权限');
    return null;
  }
  
  if (permission === 'prompt') {
    const result = await cameraService.requestPermission();
    if (result !== 'granted') {
      return null;
    }
  }
  
  try {
    const result = await cameraService.scanQRCode({
      camera: 'back',
      formats: ['qr'],
      timeout: 30000,
    });
    
    // 解析扫描结果
    return parseAddressFromQR(result.text);
  } catch (error) {
    toast.error('扫描失败，请重试');
    return null;
  }
}
```

### 解析 QR 码内容

```typescript
function parseAddressFromQR(text: string): string | null {
  // EIP-681: ethereum:0x1234...
  if (text.startsWith('ethereum:')) {
    return text.slice(9).split(/[?@]/)[0];
  }
  
  // BIP-21: bitcoin:bc1q1234...
  if (text.startsWith('bitcoin:')) {
    return text.slice(8).split('?')[0];
  }
  
  // Tron: tron:T1234...
  if (text.startsWith('tron:')) {
    return text.slice(5).split('?')[0];
  }
  
  // 纯地址
  if (isValidAddress(text)) {
    return text;
  }
  
  return null;
}
```

---

## 扫描器组件集成

```tsx
// ScannerJob.tsx

function ScannerJob() {
  const { pop } = useFlow();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleScan = async () => {
    setScanning(true);
    setError(null);
    
    try {
      const result = await cameraService.scanQRCode();
      const address = parseAddressFromQR(result.text);
      
      if (address) {
        pop({ address });
      } else {
        setError('无法识别的二维码');
      }
    } catch (err) {
      setError('扫描失败');
    } finally {
      setScanning(false);
    }
  };
  
  useEffect(() => {
    handleScan();
    return () => cameraService.stopScan();
  }, []);
  
  return (
    <Sheet>
      <SheetContent>
        <div className="relative aspect-square">
          <video id="scanner-video" className="w-full h-full object-cover" />
          <div className="absolute inset-0 border-2 border-white/50" />
        </div>
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </SheetContent>
    </Sheet>
  );
}
```

---

## 相关文档

- [Platform Services 概览](./00-Index.md)
- [Scanner Job](../../12-Shell-Guide/02-Sheets/00-Index.md)
- [Transfer Components](../../03-UI-Ref/04-Domain/02-Transaction-Transfer.md)
