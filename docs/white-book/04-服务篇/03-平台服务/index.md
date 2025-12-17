# 第十三章：平台服务

> 定义跨平台能力的抽象接口

---

## 13.1 概述

BFM Pay 运行在多种环境（Web 浏览器、DWEB 容器），不同环境提供的平台能力不同。平台服务层提供统一抽象，屏蔽环境差异。

### 环境对比

| 能力 | Web 浏览器 | DWEB (Plaoc) |
|-----|-----------|--------------|
| 生物识别 | Web Authentication API | Plaoc Biometric API |
| 安全存储 | IndexedDB + 加密 | Plaoc Secure Storage |
| 剪贴板 | Clipboard API | Plaoc Clipboard |
| 分享 | Web Share API | Plaoc Share |
| 相机 | MediaDevices API | Plaoc Camera |
| 振动 | Vibration API | Plaoc Haptic |
| 深度链接 | URL handling | Plaoc DeepLink |

---

## 13.2 平台服务接口

### 服务总览

```
IPlatformServices {
  biometric: IBiometricService      // 生物识别
  storage: ISecureStorageService    // 安全存储
  clipboard: IClipboardService      // 剪贴板
  share: IShareService              // 分享
  camera: ICameraService            // 相机（二维码扫描）
  haptic: IHapticService            // 振动反馈
  deepLink: IDeepLinkService        // 深度链接
}
```

### 平台检测

```
IPlatformDetector {
  // 当前平台类型
  platform: 'web' | 'dweb' | 'ios' | 'android'
  
  // 检查能力是否可用
  isAvailable(capability: string): boolean
  
  // 获取平台服务实例
  getServices(): IPlatformServices
}
```

---

## 13.3 IBiometricService (生物识别)

### 职责

提供指纹/面部识别认证。

### 接口定义

```
IBiometricService {
  // 检查是否支持
  isSupported(): boolean
  
  // 检查是否已注册
  isEnrolled(): boolean
  
  // 获取支持的类型
  getAvailableTypes(): BiometricType[]
  
  // 认证
  authenticate(options: AuthOptions): Promise<AuthResult>
}
```

### 数据结构

```
BiometricType = 'fingerprint' | 'face' | 'iris'

AuthOptions {
  reason: string              // 显示给用户的认证原因
  fallbackEnabled: boolean    // 是否允许回退到密码
  timeout?: number            // 超时时间（秒）
}

AuthResult {
  success: boolean
  method: BiometricType | 'password'
  error?: BiometricError
}

BiometricError = 
  | 'NOT_SUPPORTED'           // 设备不支持
  | 'NOT_ENROLLED'            // 未设置生物识别
  | 'LOCKOUT'                 // 尝试次数过多
  | 'USER_CANCEL'             // 用户取消
  | 'SYSTEM_CANCEL'           // 系统取消
  | 'TIMEOUT'                 // 超时
```

### 行为规范

1. **MUST** 在调用 `authenticate` 前检查 `isSupported` 和 `isEnrolled`
2. **MUST** 提供清晰的 `reason` 说明为何需要认证
3. **SHOULD** 在生物识别失败时提供密码回退
4. **MUST** 正确处理用户取消和系统取消

---

## 13.4 ISecureStorageService (安全存储)

### 职责

安全地存储敏感数据（加密后存储）。

### 接口定义

```
ISecureStorageService {
  // 存储数据
  setItem(key: string, value: string): Promise<void>
  
  // 读取数据
  getItem(key: string): Promise<string | null>
  
  // 删除数据
  removeItem(key: string): Promise<void>
  
  // 检查是否存在
  hasItem(key: string): Promise<boolean>
  
  // 清空所有数据
  clear(): Promise<void>
}
```

### 安全要求

| 要求 | 说明 |
|-----|------|
| 加密存储 | 数据 **MUST** 加密后存储 |
| 密钥保护 | 加密密钥 **MUST** 不明文存储 |
| 访问控制 | **SHOULD** 仅当前应用可访问 |
| 内存清理 | 读取后 **SHOULD** 及时清理内存 |

### Web 实现策略

由于 Web 没有原生安全存储：
1. 使用用户密码派生加密密钥
2. 使用 AES-GCM 加密数据
3. 存储到 IndexedDB

### DWEB 实现策略

使用 Plaoc 提供的安全存储 API，利用系统级密钥保护。

---

## 13.5 IClipboardService (剪贴板)

### 接口定义

```
IClipboardService {
  // 复制文本
  writeText(text: string): Promise<void>
  
  // 读取文本
  readText(): Promise<string>
  
  // 检查是否支持
  isSupported(): boolean
}
```

### 行为规范

1. **MUST** 在复制成功后提供用户反馈（Toast）
2. **SHOULD** 在复制敏感数据时提示用户
3. **MAY** 在一定时间后自动清除剪贴板中的敏感数据

---

## 13.6 IShareService (分享)

### 接口定义

```
IShareService {
  // 检查是否支持
  isSupported(): boolean
  
  // 分享
  share(data: ShareData): Promise<ShareResult>
}
```

### 数据结构

```
ShareData {
  title?: string
  text?: string
  url?: string
  files?: File[]
}

ShareResult {
  success: boolean
  target?: string           // 分享到的应用（如果可获取）
}
```

### 使用场景

| 场景 | ShareData |
|-----|-----------|
| 分享收款地址 | `{ text: address }` |
| 分享收款二维码 | `{ files: [qrImage] }` |
| 分享交易链接 | `{ title: 'Transaction', url: explorerUrl }` |

---

## 13.7 ICameraService (相机)

### 接口定义

```
ICameraService {
  // 检查是否支持
  isSupported(): boolean
  
  // 请求权限
  requestPermission(): Promise<PermissionStatus>
  
  // 扫描二维码
  scanQRCode(): Promise<ScanResult>
  
  // 拍照
  takePhoto(options?: PhotoOptions): Promise<Photo>
}
```

### 数据结构

```
PermissionStatus = 'granted' | 'denied' | 'prompt'

ScanResult {
  success: boolean
  data?: string             // 二维码内容
  format?: 'QR_CODE' | 'DATA_MATRIX' | ...
  error?: 'PERMISSION_DENIED' | 'CANCELLED' | 'NO_CAMERA'
}

PhotoOptions {
  quality?: number          // 0-1
  width?: number
  height?: number
}

Photo {
  dataUri: string           // base64 data URI
  width: number
  height: number
}
```

### 二维码扫描场景

| 场景 | 识别内容 | 后续动作 |
|-----|---------|---------|
| 扫描收款码 | 地址或支付 URI | 填入转账表单 |
| 扫描授权码 | DWEB 授权请求 | 跳转授权页面 |
| 扫描导入 | 加密的助记词 | 进入导入流程 |

---

## 13.8 IHapticService (振动反馈)

### 接口定义

```
IHapticService {
  // 检查是否支持
  isSupported(): boolean
  
  // 触发振动
  vibrate(type: HapticType): void
}
```

### 振动类型

```
HapticType =
  | 'light'                 // 轻触，按钮点击
  | 'medium'                // 中等，操作确认
  | 'heavy'                 // 重击，错误警告
  | 'success'               // 成功模式
  | 'warning'               // 警告模式
  | 'error'                 // 错误模式
```

### 使用场景

| 场景 | 类型 |
|-----|------|
| 按钮点击 | light |
| 发送成功 | success |
| 余额不足 | error |
| 危险操作确认 | warning |

---

## 13.9 IDeepLinkService (深度链接)

### 职责

处理外部应用发起的链接请求。

### 接口定义

```
IDeepLinkService {
  // 注册链接处理器
  register(handler: DeepLinkHandler): Unsubscribe
  
  // 解析链接
  parse(url: string): DeepLinkData | null
  
  // 生成链接
  generate(data: DeepLinkData): string
}
```

### 数据结构

```
DeepLinkHandler = (data: DeepLinkData) => void

DeepLinkData {
  action: DeepLinkAction
  params: Record<string, string>
}

DeepLinkAction =
  | 'transfer'              // 发起转账
  | 'authorize-address'     // 地址授权
  | 'authorize-signature'   // 签名授权
  | 'import-wallet'         // 导入钱包
```

### URL 格式

```
bfmpay://transfer?to=0x1234...&amount=100&token=BFM
bfmpay://authorize/address?callback=https://...&nonce=abc
bfmpay://authorize/signature?message=...&callback=...
```

---

## 13.10 平台服务工厂

### 策略模式

根据运行环境选择不同实现：

```
function createPlatformServices(): IPlatformServices {
  if (isDWEB()) {
    return createDWEBServices()
  } else {
    return createWebServices()
  }
}
```

### 功能降级

当某能力不可用时：

| 能力 | 降级策略 |
|-----|---------|
| 生物识别 | 仅使用密码认证 |
| 安全存储 | 使用加密的 IndexedDB |
| 相机 | 隐藏扫码按钮，提供手动输入 |
| 分享 | 提供复制功能替代 |
| 振动 | 静默失败 |

---

## 本章小结

- 平台服务抽象屏蔽 Web/DWEB 环境差异
- 每个服务有明确的接口定义和行为规范
- 使用策略模式根据环境选择实现
- 不可用时优雅降级

---

## 下一章

继续阅读 [第十四章：事件系统](../04-事件系统/)。
