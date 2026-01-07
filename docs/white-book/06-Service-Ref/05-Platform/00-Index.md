# Platform Services 索引

> Source: [src/services/{biometric,camera,haptics,clipboard,storage,toast}/](https://github.com/BioforestChain/KeyApp/tree/main/src/services)

## 概览

Platform Services 提供跨平台的原生能力抽象，支持 Web、DWeb (原生壳) 和 Mock 三种运行时。

---

## 服务列表

| 服务 | 目录 | 职责 |
|------|------|------|
| [Biometric](./01-Biometric.md) | `biometric/` | 生物识别认证 |
| [Camera](./02-Camera.md) | `camera/` | 相机/扫码 |
| [Haptics](./03-Haptics.md) | `haptics/` | 触觉反馈 |
| [Clipboard](./04-Clipboard.md) | `clipboard/` | 剪贴板 |
| [Toast](./05-Toast.md) | `toast/` | Toast 通知 |
| [SecureStorage](./06-SecureStorage.md) | `storage/` | 安全存储 |

---

## 多平台适配模式

每个平台服务都遵循相同的文件结构：

```
service/
├── types.ts      # 接口定义
├── mock.ts       # Mock 实现 (开发/测试)
├── web.ts        # Web 标准实现
├── dweb.ts       # DWeb/原生实现
└── index.ts      # 平台检测 + 导出
```

### index.ts 模板

```typescript
import { isDweb } from '@aspect/detect';
import type { IService } from './types';
import { MockService } from './mock';
import { WebService } from './web';
import { DwebService } from './dweb';

function createService(): IService {
  // DWeb 环境 (原生壳)
  if (isDweb()) {
    return new DwebService();
  }
  
  // 开发环境使用 Mock
  if (import.meta.env.DEV) {
    return new MockService();
  }
  
  // 生产 Web 环境
  return new WebService();
}

export const service = createService();
```

---

## Biometric Service

```typescript
interface IBiometricService {
  // 检查可用性
  isAvailable(): Promise<boolean>;
  
  // 获取支持的类型
  getSupportedTypes(): Promise<BiometricType[]>;
  
  // 认证
  authenticate(options?: AuthOptions): Promise<AuthResult>;
}

type BiometricType = 'fingerprint' | 'face' | 'iris';

interface AuthResult {
  success: boolean;
  error?: string;
}
```

**使用场景**: 转账确认、查看助记词、解锁钱包

---

## Camera Service

```typescript
interface ICameraService {
  // 检查权限
  checkPermission(): Promise<PermissionStatus>;
  
  // 请求权限
  requestPermission(): Promise<PermissionStatus>;
  
  // 扫描二维码
  scanQRCode(): Promise<ScanResult>;
  
  // 拍照
  takePhoto(): Promise<PhotoResult>;
}

interface ScanResult {
  text: string;
  format: 'qr' | 'barcode';
}
```

**使用场景**: 扫描转账地址、WalletConnect 连接

---

## Haptics Service

```typescript
interface IHapticsService {
  // 轻触反馈
  impact(style?: 'light' | 'medium' | 'heavy'): void;
  
  // 通知反馈
  notification(type: 'success' | 'warning' | 'error'): void;
  
  // 选择反馈
  selection(): void;
}
```

**使用场景**: 按钮点击、操作成功/失败、列表选择

---

## Clipboard Service

```typescript
interface IClipboardService {
  // 写入文本
  writeText(text: string): Promise<void>;
  
  // 读取文本
  readText(): Promise<string>;
}
```

**使用场景**: 复制地址、复制交易哈希

---

## Storage Service

```typescript
interface IStorageService {
  // 获取
  get<T>(key: string): Promise<T | null>;
  
  // 设置
  set<T>(key: string, value: T): Promise<void>;
  
  // 删除
  remove(key: string): Promise<void>;
  
  // 清空
  clear(): Promise<void>;
  
  // 获取所有键
  keys(): Promise<string[]>;
}
```

**实现差异**:
- Web: localStorage / IndexedDB
- DWeb: 原生 SQLite / MMKV

---

## Toast Service

```typescript
interface IToastService {
  // 显示 Toast
  show(message: string, options?: ToastOptions): void;
  
  // 成功
  success(message: string): void;
  
  // 错误
  error(message: string): void;
  
  // 隐藏
  hide(): void;
}

interface ToastOptions {
  duration?: number;
  position?: 'top' | 'center' | 'bottom';
}
```

---

## 平台检测

```typescript
// @aspect/detect
export function isDweb(): boolean {
  return typeof window !== 'undefined' && 
         'bioforestChain' in window;
}

export function isWeb(): boolean {
  return typeof window !== 'undefined' && 
         !isDweb();
}

export function isServer(): boolean {
  return typeof window === 'undefined';
}
```

---

## Mock DevTools

开发环境提供可视化的 Mock 控制面板：

```typescript
// src/services/mock-devtools/
// 
// 功能:
// - 模拟生物识别成功/失败
// - 模拟扫码结果
// - 模拟网络延迟
// - 查看 Storage 内容
```

---

## 相关文档

- [Biometric 详解](./01-Biometric.md)
- [Camera 详解](./02-Camera.md)
- [Onboarding Components](../../03-UI-Ref/04-Domain/03-Onboarding-Security.md)
