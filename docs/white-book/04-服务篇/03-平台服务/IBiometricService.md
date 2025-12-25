# IBiometricService 生物识别服务

> 指纹/面部识别认证

---

## 职责

提供生物识别认证能力，用于应用解锁和交易确认。

---

## 接口定义

```
IBiometricService {
  // 检查设备是否支持生物识别
  isSupported(): boolean
  
  // 检查用户是否已注册生物识别
  isEnrolled(): boolean
  
  // 获取可用的生物识别类型
  getAvailableTypes(): BiometricType[]
  
  // 执行认证
  authenticate(options: AuthOptions): AuthResult
}
```

---

## 数据结构

### BiometricType

```
BiometricType = 'fingerprint' | 'face' | 'iris'
```

### AuthOptions

```
AuthOptions {
  reason: string              // 显示给用户的认证原因
  title?: string              // 弹窗标题
  fallbackEnabled: boolean    // 是否允许回退到图案锁
  timeout?: number            // 超时时间（秒），默认 30
}
```

### AuthResult

```
AuthResult {
  success: boolean
  method?: BiometricType | 'pattern'
  error?: BiometricError
}

BiometricError = 
  | 'NOT_SUPPORTED'           // 设备不支持
  | 'NOT_ENROLLED'            // 用户未设置
  | 'LOCKOUT'                 // 尝试次数过多
  | 'LOCKOUT_PERMANENT'       // 永久锁定
  | 'USER_CANCEL'             // 用户取消
  | 'SYSTEM_CANCEL'           // 系统取消
  | 'TIMEOUT'                 // 超时
  | 'FALLBACK'                // 用户选择图案锁
```

---

## 使用流程

### 启用生物识别

```
1. 检查 isSupported()
        │
        ├─ false → 隐藏生物识别选项
        │
        ▼ true
2. 检查 isEnrolled()
        │
        ├─ false → 引导用户到系统设置
        │
        ▼ true
3. 执行 authenticate() 验证身份
        │
        ├─ 失败 → 提示错误
        │
        ▼ 成功
4. 存储"已启用生物识别"标记
```

### 解锁应用

```
1. 检查用户是否启用了生物识别
        │
        ├─ 否 → 显示图案锁
        │
        ▼ 是
2. 自动弹出 authenticate()
        │
        ├─ 成功 → 解锁
        │
        ├─ 用户取消 → 显示图案锁
        │
        ▼ 错误
3. 根据错误类型处理
```

---

## 错误处理

| 错误 | 用户提示 | 后续操作 |
|-----|---------|---------|
| NOT_SUPPORTED | "您的设备不支持生物识别" | 隐藏选项 |
| NOT_ENROLLED | "请先在系统设置中注册指纹/面容" | 跳转设置 |
| LOCKOUT | "尝试次数过多，请稍后重试" | 等待解锁 |
| LOCKOUT_PERMANENT | "生物识别已锁定，请使用图案锁" | 仅图案锁 |
| USER_CANCEL | - | 显示图案锁 |
| TIMEOUT | "认证超时" | 允许重试 |

---

## reason 文案规范

| 场景 | reason |
|-----|--------|
| 解锁应用 | "验证身份以解锁 BFM Pay" |
| 确认转账 | "验证身份以确认转账" |
| 查看助记词 | "验证身份以查看助记词" |
| 启用生物识别 | "验证身份以启用生物识别" |

---

## 安全要求

| 要求 | 说明 |
|-----|------|
| 不存储生物特征 | 仅使用系统 API |
| 有图案锁回退 | 生物识别失败时可用图案锁 |
| 超时限制 | 最长等待 30 秒 |
| 失败次数限制 | 遵循系统策略 |

---

## 平台实现

### Web (WebAuthn)

- 使用 `PublicKeyCredential` API
- 创建凭证时绑定到域名
- **限制**：需要 HTTPS

### DWEB (Plaoc)

- 使用 `plaoc.biometric` API
- 直接调用系统生物识别
- 支持指纹和面容
