# 第十三章：平台服务

> 定义平台能力抽象层

---

## 13.1 概述

平台服务提供与运行环境相关的能力抽象，支持 Web 和 DWEB 两种运行环境。

### 设计目标

- **编译时实现选择**：通过 Vite alias 实现 tree-shaking
- **统一 API**：上层代码无需关心运行环境
- **Mock 支持**：开发和测试时可使用 Mock 实现

### 服务列表

| 服务 | 说明 | Web 实现 | DWEB 实现 |
|-----|------|---------|----------|
| Biometric | 生物识别认证 | WebAuthn | @plaoc/plugins |
| Storage | 安全存储 | localStorage + AES | keyValuePlugin |
| Clipboard | 剪贴板 | Clipboard API | clipboardPlugin |
| Toast | 轻提示 | DOM 注入 | toastPlugin |
| Camera | 相机/扫码 | MediaDevices | barcodeScannerPlugin |
| Haptics | 触觉反馈 | Vibration API | hapticsPlugin |

---

## 13.2 目录结构

```
src/services/platform/
├── biometric/
│   ├── index.ts          # 统一导出
│   ├── types.ts          # 接口定义
│   ├── web.ts            # Web 实现
│   ├── dweb.ts           # DWEB 实现
│   └── mock.ts           # Mock 实现
│
├── storage/
│   ├── index.ts
│   ├── types.ts
│   ├── web.ts
│   ├── dweb.ts
│   └── mock.ts
│
├── clipboard/
│   └── ...
│
├── toast/
│   └── ...
│
└── index.ts              # 统一导出所有服务
```

---

## 13.3 生物识别服务

### 接口定义

```typescript
// src/services/platform/biometric/types.ts

export interface BiometricOptions {
  reason?: string           // 认证原因提示
  fallbackToPassword?: boolean  // 是否允许密码回退
}

export interface BiometricResult {
  success: boolean
  error?: string
}

export interface IBiometricService {
  // 检查是否可用
  isAvailable(): Promise<boolean>
  
  // 执行认证
  authenticate(options?: BiometricOptions): Promise<BiometricResult>
}
```

### Web 实现

```typescript
// src/services/platform/biometric/web.ts
export class BiometricService implements IBiometricService {
  async isAvailable(): Promise<boolean> {
    if (!window.PublicKeyCredential) return false
    
    return PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  }
  
  async authenticate(options?: BiometricOptions): Promise<BiometricResult> {
    try {
      // 使用 WebAuthn API
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          timeout: 60000,
          userVerification: 'required',
          rpId: window.location.hostname,
        },
      })
      
      return { success: !!credential }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}
```

### DWEB 实现

```typescript
// src/services/platform/biometric/dweb.ts
import { biometricsPlugin } from '@plaoc/plugins'

export class BiometricService implements IBiometricService {
  async isAvailable(): Promise<boolean> {
    const result = await biometricsPlugin.checkBiometricsType()
    return result.type !== 'none'
  }
  
  async authenticate(options?: BiometricOptions): Promise<BiometricResult> {
    try {
      const result = await biometricsPlugin.authenticate({
        reason: options?.reason ?? '请验证身份',
      })
      return { success: result.success }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}
```

---

## 13.4 安全存储服务

### 接口定义

```typescript
// src/services/platform/storage/types.ts

export interface ISecureStorageService {
  // 存储数据
  set(key: string, value: string): Promise<void>
  
  // 读取数据
  get(key: string): Promise<string | null>
  
  // 删除数据
  remove(key: string): Promise<void>
  
  // 清空所有
  clear(): Promise<void>
}
```

### Web 实现 (AES 加密)

```typescript
// src/services/platform/storage/web.ts
import { encrypt, decrypt } from '@/lib/crypto/aes'

export class SecureStorageService implements ISecureStorageService {
  private prefix = 'bfm_secure_'
  
  async set(key: string, value: string): Promise<void> {
    const encrypted = await encrypt(value, this.getEncryptionKey())
    localStorage.setItem(this.prefix + key, encrypted)
  }
  
  async get(key: string): Promise<string | null> {
    const encrypted = localStorage.getItem(this.prefix + key)
    if (!encrypted) return null
    
    return decrypt(encrypted, this.getEncryptionKey())
  }
  
  async remove(key: string): Promise<void> {
    localStorage.removeItem(this.prefix + key)
  }
  
  async clear(): Promise<void> {
    const keys = Object.keys(localStorage)
      .filter(k => k.startsWith(this.prefix))
    keys.forEach(k => localStorage.removeItem(k))
  }
  
  private getEncryptionKey(): string {
    // 使用设备指纹或固定密钥
    return 'device-specific-key'
  }
}
```

---

## 13.5 剪贴板服务

### 接口定义

```typescript
// src/services/platform/clipboard/types.ts

export interface IClipboardService {
  // 写入文本
  writeText(text: string): Promise<void>
  
  // 读取文本
  readText(): Promise<string>
}
```

### Web 实现

```typescript
// src/services/platform/clipboard/web.ts
export class ClipboardService implements IClipboardService {
  async writeText(text: string): Promise<void> {
    await navigator.clipboard.writeText(text)
  }
  
  async readText(): Promise<string> {
    return navigator.clipboard.readText()
  }
}
```

### DWEB 实现

```typescript
// src/services/platform/clipboard/dweb.ts
import { clipboardPlugin } from '@plaoc/plugins'

export class ClipboardService implements IClipboardService {
  async writeText(text: string): Promise<void> {
    await clipboardPlugin.write({ string: text })
  }
  
  async readText(): Promise<string> {
    const result = await clipboardPlugin.read()
    return result.value ?? ''
  }
}
```

---

## 13.6 编译时实现选择

### Vite 配置

```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      // 根据 SERVICE_IMPL 环境变量选择实现
      '#biometric-impl': `./src/services/platform/biometric/${
        process.env.SERVICE_IMPL || 'web'
      }.ts`,
      '#storage-impl': `./src/services/platform/storage/${
        process.env.SERVICE_IMPL || 'web'
      }.ts`,
      '#clipboard-impl': `./src/services/platform/clipboard/${
        process.env.SERVICE_IMPL || 'web'
      }.ts`,
    },
  },
})
```

### 服务入口

```typescript
// src/services/platform/biometric/index.ts
import type { IBiometricService } from './types'
import { BiometricService } from '#biometric-impl'

export type { IBiometricService, BiometricOptions, BiometricResult } from './types'
export { BiometricService }

// 单例
export const biometricService: IBiometricService = new BiometricService()
```

### 构建命令

```json
{
  "scripts": {
    "dev": "SERVICE_IMPL=web vite",
    "dev:mock": "SERVICE_IMPL=mock vite",
    "build:web": "SERVICE_IMPL=web vite build",
    "build:dweb": "SERVICE_IMPL=dweb vite build"
  }
}
```

---

## 13.7 React Hooks

```typescript
// src/services/platform/hooks.ts
import { biometricService } from './biometric'
import { clipboardService } from './clipboard'
import { toastService } from './toast'
import { hapticsService } from './haptics'

export function useBiometric() {
  return biometricService
}

export function useClipboard() {
  return clipboardService
}

export function useToast() {
  return toastService
}

export function useHaptics() {
  return hapticsService
}
```

### 使用示例

```typescript
function AddressDisplay({ address }: { address: string }) {
  const clipboard = useClipboard()
  const toast = useToast()
  const haptics = useHaptics()
  
  const handleCopy = async () => {
    await clipboard.writeText(address)
    await haptics.impact('light')
    toast.success('地址已复制')
  }
  
  return (
    <button onClick={handleCopy}>
      {shortenAddress(address)}
      <CopyIcon />
    </button>
  )
}
```

---

## 13.8 Mock 实现

```typescript
// src/services/platform/biometric/mock.ts

// 通过 window 暴露控制接口，供测试使用
declare global {
  interface Window {
    __MOCK_BIOMETRIC__?: {
      available: boolean
      shouldSucceed: boolean
    }
  }
}

export class BiometricService implements IBiometricService {
  async isAvailable(): Promise<boolean> {
    return window.__MOCK_BIOMETRIC__?.available ?? true
  }
  
  async authenticate(): Promise<BiometricResult> {
    const shouldSucceed = window.__MOCK_BIOMETRIC__?.shouldSucceed ?? true
    
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      success: shouldSucceed,
      error: shouldSucceed ? undefined : 'Mock: 认证失败',
    }
  }
}
```

### E2E 测试中使用

```typescript
// e2e/biometric.spec.ts
test('指纹认证成功', async ({ page }) => {
  // 设置 Mock 行为
  await page.evaluate(() => {
    window.__MOCK_BIOMETRIC__ = {
      available: true,
      shouldSucceed: true,
    }
  })
  
  // 执行测试...
})

test('指纹认证失败', async ({ page }) => {
  await page.evaluate(() => {
    window.__MOCK_BIOMETRIC__ = {
      available: true,
      shouldSucceed: false,
    }
  })
  
  // 执行测试...
})
```

---

## 本章小结

- 平台服务抽象 Web/DWEB 差异
- 编译时选择实现，支持 tree-shaking
- Mock 实现便于开发和测试
- React Hooks 提供便捷访问

---

## 下一章

继续阅读 [第十四章：事件系统](../04-事件系统/)，了解数据变化的订阅机制。
