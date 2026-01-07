# Biometric Service

> Source: [src/services/biometric/](https://github.com/BioforestChain/KeyApp/tree/main/src/services/biometric)

## 概览

生物识别服务提供指纹、Face ID 等生物认证能力。

---

## 文件结构

```
biometric/
├── types.ts      # 接口定义
├── mock.ts       # Mock 实现
├── web.ts        # Web 实现 (WebAuthn)
├── dweb.ts       # DWeb 原生实现
└── index.ts      # 平台检测 + 导出
```

---

## 接口定义

```typescript
// types.ts

type BiometricType = 'fingerprint' | 'face' | 'iris';

interface AuthOptions {
  reason?: string;           // 认证原因提示
  fallbackToPassword?: boolean;
  timeout?: number;          // 超时 (毫秒)
}

interface AuthResult {
  success: boolean;
  error?: BiometricError;
}

enum BiometricError {
  NOT_AVAILABLE = 'NOT_AVAILABLE',
  NOT_ENROLLED = 'NOT_ENROLLED',
  USER_CANCEL = 'USER_CANCEL',
  LOCKOUT = 'LOCKOUT',
  TIMEOUT = 'TIMEOUT',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
}

interface IBiometricService {
  // 检查是否可用
  isAvailable(): Promise<boolean>;
  
  // 获取支持的类型
  getSupportedTypes(): Promise<BiometricType[]>;
  
  // 执行认证
  authenticate(options?: AuthOptions): Promise<AuthResult>;
}
```

---

## Web 实现 (WebAuthn)

```typescript
// web.ts

class WebBiometricService implements IBiometricService {
  async isAvailable(): Promise<boolean> {
    if (!window.PublicKeyCredential) return false;
    
    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  }
  
  async getSupportedTypes(): Promise<BiometricType[]> {
    const available = await this.isAvailable();
    if (!available) return [];
    
    // Web API 不区分具体类型
    return ['fingerprint', 'face'];
  }
  
  async authenticate(options?: AuthOptions): Promise<AuthResult> {
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          timeout: options?.timeout ?? 60000,
          userVerification: 'required',
          rpId: window.location.hostname,
        },
      });
      
      return { success: !!credential };
    } catch (error) {
      return {
        success: false,
        error: this.mapError(error),
      };
    }
  }
  
  private mapError(error: unknown): BiometricError {
    if (error instanceof DOMException) {
      switch (error.name) {
        case 'NotAllowedError':
          return BiometricError.USER_CANCEL;
        case 'NotSupportedError':
          return BiometricError.NOT_AVAILABLE;
        default:
          return BiometricError.SYSTEM_ERROR;
      }
    }
    return BiometricError.SYSTEM_ERROR;
  }
}
```

---

## DWeb 实现 (原生)

```typescript
// dweb.ts

class DwebBiometricService implements IBiometricService {
  private get native() {
    return window.bioforestChain?.biometric;
  }
  
  async isAvailable(): Promise<boolean> {
    return this.native?.isAvailable() ?? false;
  }
  
  async getSupportedTypes(): Promise<BiometricType[]> {
    return this.native?.getSupportedTypes() ?? [];
  }
  
  async authenticate(options?: AuthOptions): Promise<AuthResult> {
    try {
      const result = await this.native?.authenticate({
        reason: options?.reason ?? '验证身份',
        fallbackToPassword: options?.fallbackToPassword ?? true,
      });
      
      return {
        success: result?.success ?? false,
        error: result?.error,
      };
    } catch (error) {
      return {
        success: false,
        error: BiometricError.SYSTEM_ERROR,
      };
    }
  }
}
```

---

## Mock 实现 (开发)

```typescript
// mock.ts

class MockBiometricService implements IBiometricService {
  private mockEnabled = true;
  private mockTypes: BiometricType[] = ['fingerprint', 'face'];
  
  async isAvailable(): Promise<boolean> {
    return this.mockEnabled;
  }
  
  async getSupportedTypes(): Promise<BiometricType[]> {
    return this.mockTypes;
  }
  
  async authenticate(options?: AuthOptions): Promise<AuthResult> {
    // 模拟 1 秒延迟
    await new Promise(r => setTimeout(r, 1000));
    
    // 开发环境默认成功
    return { success: true };
  }
  
  // Mock 控制方法
  setMockEnabled(enabled: boolean): void {
    this.mockEnabled = enabled;
  }
  
  setMockTypes(types: BiometricType[]): void {
    this.mockTypes = types;
  }
  
  setMockResult(success: boolean, error?: BiometricError): void {
    // 设置下次认证结果
  }
}
```

---

## 平台检测

```typescript
// index.ts

import { isDweb } from '@aspect/detect';
import type { IBiometricService } from './types';
import { MockBiometricService } from './mock';
import { WebBiometricService } from './web';
import { DwebBiometricService } from './dweb';

function createService(): IBiometricService {
  if (isDweb()) {
    return new DwebBiometricService();
  }
  
  if (import.meta.env.DEV) {
    return new MockBiometricService();
  }
  
  return new WebBiometricService();
}

export const biometricService = createService();
export * from './types';
```

---

## 使用场景

### 转账确认

```typescript
async function confirmTransfer(transfer: TransferParams): Promise<boolean> {
  // 检查是否可用
  const available = await biometricService.isAvailable();
  
  if (available) {
    const result = await biometricService.authenticate({
      reason: `确认转账 ${transfer.amount} ${transfer.symbol}`,
    });
    
    if (result.success) {
      return true;
    }
    
    // 降级到密码
    if (result.error === BiometricError.USER_CANCEL) {
      return showPasswordDialog();
    }
  }
  
  // 不可用时使用密码
  return showPasswordDialog();
}
```

### 查看助记词

```typescript
async function viewMnemonic(): Promise<string | null> {
  const result = await biometricService.authenticate({
    reason: '查看助记词需要验证身份',
    fallbackToPassword: true,
  });
  
  if (!result.success) {
    toast.error('身份验证失败');
    return null;
  }
  
  return walletActions.getMnemonic(walletId, secret);
}
```

---

## 错误处理

```typescript
function handleBiometricError(error: BiometricError): void {
  switch (error) {
    case BiometricError.NOT_AVAILABLE:
      toast.info('此设备不支持生物识别');
      break;
    case BiometricError.NOT_ENROLLED:
      toast.info('请先在系统设置中录入生物信息');
      break;
    case BiometricError.USER_CANCEL:
      // 用户取消，不显示错误
      break;
    case BiometricError.LOCKOUT:
      toast.error('生物识别已锁定，请稍后再试');
      break;
    case BiometricError.TIMEOUT:
      toast.error('验证超时，请重试');
      break;
    default:
      toast.error('验证失败，请重试');
  }
}
```

---

## 相关文档

- [Platform Services 概览](./00-Index.md)
- [Security Components](../../03-UI-Ref/04-Domain/03-Onboarding-Security.md)
- [Transfer Confirm Flow](../../12-Shell-Guide/02-Sheets/00-Index.md)
