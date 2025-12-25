# 错误处理篇

> 定义统一的错误处理架构和用户体验规范

---

## 错误分类体系

### 一级分类

| 类别 | 前缀 | 说明 | 用户可恢复 |
|-----|------|------|-----------|
| 网络错误 | NET_ | 网络连接问题 | 是（重试） |
| 链错误 | CHAIN_ | 区块链交互问题 | 部分 |
| 验证错误 | VALID_ | 输入验证失败 | 是（修正输入） |
| 认证错误 | AUTH_ | 身份认证问题 | 是（重新认证） |
| 存储错误 | STORE_ | 本地存储问题 | 部分 |
| 系统错误 | SYS_ | 系统级异常 | 否 |

---

## 错误码目录

### NET_ 网络错误

| 错误码 | 名称 | 用户消息 | 恢复方式 |
|-------|------|---------|---------|
| NET_001 | NetworkOffline | 网络已断开 | 检查网络后重试 |
| NET_002 | RequestTimeout | 请求超时 | 自动重试 |
| NET_003 | ServerUnavailable | 服务暂时不可用 | 稍后重试 |
| NET_004 | RateLimited | 请求过于频繁 | 等待后重试 |
| NET_005 | InvalidResponse | 服务器响应异常 | 重试或联系支持 |

### CHAIN_ 链错误

| 错误码 | 名称 | 用户消息 | 恢复方式 |
|-------|------|---------|---------|
| CHAIN_001 | InsufficientBalance | 余额不足 | 充值后重试 |
| CHAIN_002 | InsufficientGas | Gas 费不足 | 增加 Gas 或充值 |
| CHAIN_003 | NonceConflict | 交易序号冲突 | 重新获取 nonce |
| CHAIN_004 | TransactionRejected | 交易被拒绝 | 检查交易参数 |
| CHAIN_005 | ContractError | 合约执行失败 | 检查合约调用 |
| CHAIN_006 | ChainNotSupported | 不支持此链 | 切换到支持的链 |
| CHAIN_007 | NodeUnavailable | 节点不可用 | 自动切换备用节点 |
| CHAIN_008 | TransactionDropped | 交易已被丢弃 | 重新发起交易 |
| CHAIN_009 | GasPriceTooLow | Gas 价格过低 | 提高 Gas 价格 |
| CHAIN_010 | InvalidAddress | 地址格式无效 | 检查收款地址 |

### VALID_ 验证错误

| 错误码 | 名称 | 用户消息 | 恢复方式 |
|-------|------|---------|---------|
| VALID_001 | RequiredField | 请填写此字段 | 填写必填项 |
| VALID_002 | InvalidFormat | 格式不正确 | 按提示修正 |
| VALID_003 | AmountTooSmall | 金额过小 | 增加金额 |
| VALID_004 | AmountTooLarge | 金额超出限制 | 减少金额 |
| VALID_005 | InvalidMnemonic | 助记词无效 | 检查助记词 |
| VALID_006 | PatternMismatch | 两次图案不一致 | 重新绘制 |
| VALID_007 | PatternTooSimple | 图案连接点不足 | 连接更多点 |
| VALID_008 | InvalidQRCode | 无法识别二维码 | 重新扫描 |

### AUTH_ 认证错误

| 错误码 | 名称 | 用户消息 | 恢复方式 |
|-------|------|---------|---------|
| AUTH_001 | WrongPattern | 图案错误 | 重新绘制 |
| AUTH_002 | BiometricFailed | 生物识别失败 | 使用图案锁 |
| AUTH_003 | BiometricNotAvailable | 生物识别不可用 | 使用图案锁 |
| AUTH_004 | TooManyAttempts | 尝试次数过多 | 等待解锁 |
| AUTH_005 | SessionExpired | 会话已过期 | 重新认证 |
| AUTH_006 | AuthorizationDenied | 授权被拒绝 | 重新请求授权 |

### STORE_ 存储错误

| 错误码 | 名称 | 用户消息 | 恢复方式 |
|-------|------|---------|---------|
| STORE_001 | StorageFull | 存储空间不足 | 清理空间 |
| STORE_002 | DataCorrupted | 数据已损坏 | 重新导入钱包 |
| STORE_003 | DecryptionFailed | 解密失败 | 检查图案 |
| STORE_004 | WalletNotFound | 钱包不存在 | 创建或导入 |
| STORE_005 | MigrationFailed | 数据迁移失败 | 联系支持 |

### SYS_ 系统错误

| 错误码 | 名称 | 用户消息 | 恢复方式 |
|-------|------|---------|---------|
| SYS_001 | UnknownError | 发生未知错误 | 重试或联系支持 |
| SYS_002 | CryptoNotSupported | 加密功能不可用 | 升级浏览器 |
| SYS_003 | OutOfMemory | 内存不足 | 关闭其他应用 |
| SYS_004 | FeatureNotSupported | 功能暂不支持 | 等待更新 |

---

## 错误数据结构

### AppError 基础结构

```
AppError {
  code: string           // 错误码 (如 "CHAIN_001")
  name: string           // 错误名称
  message: string        // 开发者消息（英文）
  userMessage: string    // 用户消息（多语言 key）
  severity: Severity     // 严重程度
  recoverable: boolean   // 是否可恢复
  retryable: boolean     // 是否可重试
  context?: object       // 上下文信息
  cause?: Error          // 原始错误
  timestamp: number      // 发生时间
}

Severity = 'info' | 'warning' | 'error' | 'critical'
```

### 错误上下文

```
ErrorContext {
  // 操作上下文
  operation: string      // 操作名称
  chainId?: string       // 链 ID
  address?: string       // 相关地址
  txHash?: string        // 交易哈希
  
  // 请求上下文
  requestId?: string     // 请求 ID
  endpoint?: string      // API 端点
  
  // 设备上下文
  platform: string       // 平台
  version: string        // 应用版本
}
```

---

## 错误处理层级

### 处理架构

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer                              │
│            显示用户友好的错误消息                          │
├─────────────────────────────────────────────────────────┤
│                Application Layer                         │
│          决定重试/降级/上报策略                            │
├─────────────────────────────────────────────────────────┤
│                  Service Layer                           │
│            转换为 AppError，添加上下文                     │
├─────────────────────────────────────────────────────────┤
│                 Provider Layer                           │
│              捕获原始错误                                 │
└─────────────────────────────────────────────────────────┘
```

### 各层职责

| 层级 | 职责 | 输出 |
|-----|------|------|
| Provider | 捕获原始异常 | 原始 Error |
| Service | 转换、分类、添加上下文 | AppError |
| Application | 决定处理策略 | 处理决策 |
| UI | 展示给用户 | 用户界面 |

---

## 错误恢复策略

### 自动重试

```
RetryConfig {
  maxAttempts: number    // 最大重试次数
  baseDelay: number      // 基础延迟 (ms)
  maxDelay: number       // 最大延迟 (ms)
  backoffFactor: number  // 退避系数
  retryableErrors: string[]  // 可重试的错误码
}
```

**默认配置：**

| 参数 | 值 |
|-----|---|
| maxAttempts | 3 |
| baseDelay | 1000ms |
| maxDelay | 30000ms |
| backoffFactor | 2 |

**可重试错误码：**
- NET_002 (RequestTimeout)
- NET_003 (ServerUnavailable)
- CHAIN_007 (NodeUnavailable)

### 降级策略

| 错误 | 降级方案 |
|-----|---------|
| 主节点不可用 | 切换备用节点 |
| 实时数据不可用 | 显示缓存数据 |
| 生物识别失败 | 回退图案锁认证 |
| WebSocket 断开 | 降级轮询 |

### 用户干预

需要用户干预的情况：

| 情况 | 用户操作 |
|-----|---------|
| 余额不足 | 充值 |
| 图案错误 | 重新绘制 |
| 授权被拒 | 重新授权 |
| 数据损坏 | 重新导入钱包 |

---

## 错误 UI 规范

### Toast 提示（轻量级）

适用：可自动恢复的临时错误

```
┌─────────────────────────────────────┐
│ ⚠️ 网络连接不稳定，正在重试...        │
└─────────────────────────────────────┘
```

**规范：**
- 自动消失（3-5 秒）
- 不阻塞用户操作
- 简短消息

### 内联错误（表单级）

适用：验证错误

```
┌─────────────────────────────────────┐
│ 收款地址                             │
│ ┌─────────────────────────────────┐ │
│ │ 0xinvalid...                    │ │
│ └─────────────────────────────────┘ │
│ ❌ 地址格式无效                      │
└─────────────────────────────────────┘
```

**规范：**
- 紧邻出错字段
- 红色文字 + 图标
- 具体说明错误原因

### 对话框（阻塞级）

适用：需要用户决策的错误

```
┌─────────────────────────────────────┐
│              交易失败                │
├─────────────────────────────────────┤
│                                     │
│  Gas 价格过低，交易未被确认。         │
│                                     │
│  建议操作：                          │
│  • 提高 Gas 价格重新发送             │
│  • 取消此交易                        │
│                                     │
├─────────────────────────────────────┤
│  [取消]              [重新发送]      │
└─────────────────────────────────────┘
```

**规范：**
- 清晰的错误说明
- 提供解决方案
- 明确的操作按钮

### 全屏错误页（严重级）

适用：系统级错误、无法恢复的错误

```
┌─────────────────────────────────────┐
│                                     │
│              😵                     │
│                                     │
│        出了点问题                    │
│                                     │
│   应用遇到了意外错误。               │
│   我们已记录此问题。                 │
│                                     │
│   错误代码: SYS_001                 │
│                                     │
│        [重新启动]                   │
│        [联系支持]                   │
│                                     │
└─────────────────────────────────────┘
```

---

## 错误日志规范

### 日志级别

| 级别 | 用途 | 上报 |
|-----|------|------|
| DEBUG | 调试信息 | 否 |
| INFO | 一般信息 | 否 |
| WARN | 警告，已处理 | 可选 |
| ERROR | 错误，需关注 | 是 |
| FATAL | 严重错误 | 立即上报 |

### 日志结构

```
ErrorLog {
  level: LogLevel
  error: AppError
  context: ErrorContext
  stack?: string
  userAgent: string
  timestamp: number
}
```

### 敏感信息过滤

**MUST NOT** 记录以下信息：
- 助记词
- 私钥
- 图案锁
- 完整地址（仅记录前 6 + 后 4 位）

---

## 错误上报规范

### 上报条件

| 错误级别 | 上报 | 时机 |
|---------|------|------|
| info/warning | 否 | - |
| error (可恢复) | 聚合上报 | 每 5 分钟 |
| error (不可恢复) | 即时上报 | 立即 |
| fatal | 即时上报 | 立即 |

### 上报数据

```
ErrorReport {
  errors: ErrorLog[]
  sessionId: string
  deviceInfo: DeviceInfo
  appVersion: string
}
```

### 用户隐私

- **MUST** 脱敏后再上报
- **MUST** 允许用户关闭错误上报
- **SHOULD** 上报前显示上报内容

---

## 测试要求

### 错误场景覆盖

| 场景 | 测试点 |
|-----|-------|
| 网络断开 | 显示离线提示 |
| 请求超时 | 自动重试 |
| 余额不足 | 禁用发送 + 提示 |
| 图案错误 | 显示错误动画 + 清空 |
| 节点不可用 | 自动切换 |

### 错误恢复测试

- 重试后成功
- 降级后可用
- 用户干预后恢复

---

## 本章小结

- 统一的错误码体系，便于追踪和处理
- 分层处理：捕获 → 转换 → 决策 → 展示
- 自动恢复优先，必要时引导用户
- 错误 UI 分级：Toast → 内联 → 对话框 → 全屏
- 完善的日志和上报机制
