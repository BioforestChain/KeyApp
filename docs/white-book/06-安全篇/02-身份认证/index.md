# 第十九章：身份认证

> 定义用户身份验证机制

---

## 19.1 认证方式

| 方式 | 场景 | 安全级别 |
|-----|------|---------|
| 密码 | 首次解锁、敏感操作 | 高 |
| 指纹/面容 | 日常解锁、快捷支付 | 高 |
| PIN 码 | 快速解锁（可选） | 中 |

---

## 19.2 应用锁

### 状态管理

```typescript
// src/stores/auth.ts
interface AuthState {
  isLocked: boolean
  isPasswordLockEnabled: boolean
  isBiometricEnabled: boolean
  lastUnlockTime: number | null
  autoLockTimeout: number  // 分钟
}

export const authStore = new Store<AuthState>({
  isLocked: true,
  isPasswordLockEnabled: false,
  isBiometricEnabled: false,
  lastUnlockTime: null,
  autoLockTimeout: 5,
})

export const authActions = {
  lock: () => {
    authStore.setState((s) => ({ ...s, isLocked: true }))
  },
  
  unlock: () => {
    authStore.setState((s) => ({
      ...s,
      isLocked: false,
      lastUnlockTime: Date.now(),
    }))
  },
  
  enablePasswordLock: () => {
    authStore.setState((s) => ({ ...s, isPasswordLockEnabled: true }))
  },
  
  enableBiometric: () => {
    authStore.setState((s) => ({ ...s, isBiometricEnabled: true }))
  },
}
```

### 解锁流程

```typescript
// src/features/auth/use-unlock.ts
export function useUnlock() {
  const biometric = useBiometric()
  const { isPasswordLockEnabled, isBiometricEnabled } = useStore(authStore)
  
  const unlockWithPassword = async (password: string): Promise<boolean> => {
    // 验证密码（尝试解密助记词）
    try {
      const wallet = getCurrentWallet()
      await decryptMnemonic(wallet.encryptedMnemonic, password)
      authActions.unlock()
      return true
    } catch {
      return false
    }
  }
  
  const unlockWithBiometric = async (): Promise<boolean> => {
    if (!isBiometricEnabled) return false
    
    const result = await biometric.authenticate({
      reason: '解锁钱包',
    })
    
    if (result.success) {
      authActions.unlock()
      return true
    }
    
    return false
  }
  
  return {
    unlockWithPassword,
    unlockWithBiometric,
    canUseBiometric: isBiometricEnabled,
  }
}
```

---

## 19.3 自动锁定

### 监听用户活动

```typescript
// src/features/auth/auto-lock.ts
export function useAutoLock() {
  const { autoLockTimeout, isLocked } = useStore(authStore)
  
  useEffect(() => {
    if (isLocked) return
    
    let timer: NodeJS.Timeout
    
    const resetTimer = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        authActions.lock()
      }, autoLockTimeout * 60 * 1000)
    }
    
    // 监听用户活动
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll']
    events.forEach((event) => {
      document.addEventListener(event, resetTimer)
    })
    
    resetTimer()
    
    return () => {
      clearTimeout(timer)
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer)
      })
    }
  }, [autoLockTimeout, isLocked])
}
```

### 页面可见性锁定

```typescript
// 切换到后台时锁定
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // 可选：立即锁定或等待一段时间
      setTimeout(() => {
        if (document.hidden) {
          authActions.lock()
        }
      }, 30000)  // 30 秒后锁定
    }
  }
  
  document.addEventListener('visibilitychange', handleVisibilityChange)
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
}, [])
```

---

## 19.4 指纹支付

### 启用流程

```
用户进入设置
      ↓
开启"指纹支付"
      ↓
验证钱包密码
      ↓
验证指纹
      ↓
保存设置
```

### 实现

```typescript
// src/features/auth/biometric-pay.ts
export function useBiometricPay() {
  const biometric = useBiometric()
  const { isBiometricEnabled } = useStore(authStore)
  
  const enableBiometricPay = async (password: string): Promise<boolean> => {
    // 1. 验证密码
    const isValid = await verifyPassword(password)
    if (!isValid) return false
    
    // 2. 检查生物识别可用性
    const available = await biometric.isAvailable()
    if (!available) return false
    
    // 3. 验证指纹
    const result = await biometric.authenticate({
      reason: '验证指纹以启用指纹支付',
    })
    
    if (result.success) {
      authActions.enableBiometric()
      return true
    }
    
    return false
  }
  
  const authenticateForPay = async (): Promise<boolean> => {
    if (!isBiometricEnabled) return false
    
    const result = await biometric.authenticate({
      reason: '确认交易',
      fallbackToPassword: true,
    })
    
    return result.success
  }
  
  return {
    enableBiometricPay,
    authenticateForPay,
    isBiometricEnabled,
  }
}
```

---

## 19.5 转账确认

### 确认流程

```typescript
// src/features/transfer/use-transfer-confirm.ts
export function useTransferConfirm() {
  const { isBiometricEnabled } = useStore(authStore)
  const biometricPay = useBiometricPay()
  
  const confirmTransfer = async (
    transfer: TransferParams,
    onPasswordRequired: () => Promise<string | null>
  ): Promise<boolean> => {
    // 1. 尝试指纹验证
    if (isBiometricEnabled) {
      const success = await biometricPay.authenticateForPay()
      if (success) return true
    }
    
    // 2. 回退到密码验证
    const password = await onPasswordRequired()
    if (!password) return false
    
    // 3. 验证密码
    return verifyPassword(password)
  }
  
  return { confirmTransfer }
}
```

### UI 组件

```typescript
// src/components/security/password-confirm-sheet.tsx
interface PasswordConfirmSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (password: string) => void
  title?: string
}

export function PasswordConfirmSheet({
  open,
  onOpenChange,
  onConfirm,
  title = '请输入密码',
}: PasswordConfirmSheetProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  
  const handleConfirm = async () => {
    const isValid = await verifyPassword(password)
    if (isValid) {
      onConfirm(password)
      setPassword('')
      setError('')
    } else {
      setError('密码错误')
    }
  }
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        
        <div className="py-4 space-y-4">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          
          <Button onClick={handleConfirm} className="w-full">
            确认
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

---

## 19.6 安全设置页面

```typescript
// src/pages/settings/security.tsx
export function SecuritySettingsPage() {
  const { isPasswordLockEnabled, isBiometricEnabled, autoLockTimeout } = useStore(authStore)
  const biometric = useBiometric()
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  
  useEffect(() => {
    biometric.isAvailable().then(setBiometricAvailable)
  }, [])
  
  return (
    <div className="space-y-6">
      <SettingItem
        label="密码锁"
        description="每次打开 App 需要输入密码"
      >
        <Switch
          checked={isPasswordLockEnabled}
          onCheckedChange={handlePasswordLockChange}
        />
      </SettingItem>
      
      {biometricAvailable && (
        <SettingItem
          label="指纹/面容解锁"
          description="使用生物识别解锁 App"
          disabled={!isPasswordLockEnabled}
        >
          <Switch
            checked={isBiometricEnabled}
            onCheckedChange={handleBiometricChange}
            disabled={!isPasswordLockEnabled}
          />
        </SettingItem>
      )}
      
      <SettingItem
        label="自动锁定"
        description="无操作后自动锁定"
      >
        <Select value={autoLockTimeout} onValueChange={handleTimeoutChange}>
          <SelectItem value={1}>1 分钟</SelectItem>
          <SelectItem value={5}>5 分钟</SelectItem>
          <SelectItem value={15}>15 分钟</SelectItem>
          <SelectItem value={30}>30 分钟</SelectItem>
        </Select>
      </SettingItem>
    </div>
  )
}
```

---

## 本章小结

- 支持密码和生物识别两种认证方式
- 自动锁定保护用户资产
- 指纹支付提升转账体验
- 分层安全：日常操作用指纹，敏感操作要密码

---

## 下一章

继续阅读 [第二十章：DWEB 授权](../03-DWEB授权/)，了解 DApp 授权流程。
