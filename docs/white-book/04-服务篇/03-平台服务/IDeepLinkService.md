# IDeepLinkService 深度链接服务

> 处理外部应用发起的链接请求

---

## 职责

处理来自外部应用（如 DWEB 应用）的链接请求，实现跨应用交互。

---

## 接口定义

```
IDeepLinkService {
  // 注册链接处理器
  register(handler: DeepLinkHandler): Unsubscribe
  
  // 解析链接
  parse(url: string): DeepLinkData | null
  
  // 生成链接
  generate(data: DeepLinkData): string
  
  // 获取启动链接（如果有）
  getInitialLink(): string | null
}
```

---

## 数据结构

### DeepLinkData

```
DeepLinkData {
  action: DeepLinkAction
  params: Record<string, string>
}

DeepLinkAction =
  | 'transfer'              // 发起转账
  | 'authorize-address'     // 地址授权
  | 'authorize-signature'   // 签名授权
  | 'import'                // 导入钱包
  | 'connect'               // 连接请求
```

### DeepLinkHandler

```
type DeepLinkHandler = (data: DeepLinkData) => void
type Unsubscribe = () => void
```

---

## URL 格式

### 协议

```
bfmpay://{action}?{params}
```

### 转账链接

```
bfmpay://transfer?
  to={address}&
  amount={amount}&
  token={token_address}&
  chain={chain_id}&
  memo={memo}
```

**参数说明**：

| 参数 | 必需 | 说明 |
|-----|-----|------|
| to | Y | 收款地址 |
| amount | N | 金额（最小单位） |
| token | N | 代币地址（原生币为空） |
| chain | N | 链 ID |
| memo | N | 备注 |

### 地址授权链接

```
bfmpay://authorize/address?
  app={app_id}&
  callback={callback_url}&
  chain={chain_id}&
  nonce={nonce}
```

**参数说明**：

| 参数 | 必需 | 说明 |
|-----|-----|------|
| app | Y | 请求应用标识 |
| callback | Y | 授权结果回调 URL |
| chain | N | 指定链（空则用户选择） |
| nonce | Y | 一次性随机数 |

### 签名授权链接

```
bfmpay://authorize/signature?
  app={app_id}&
  callback={callback_url}&
  message={message}&
  type={sign_type}
```

**参数说明**：

| 参数 | 必需 | 说明 |
|-----|-----|------|
| app | Y | 请求应用标识 |
| callback | Y | 签名结果回调 URL |
| message | Y | 待签名消息（Base64） |
| type | N | 签名类型：personal/typed |

---

## 处理流程

### 接收链接

```
外部应用调用 DeepLink
        │
        ▼
应用被唤起（或已在前台）
        │
        ▼
parse() 解析链接
        │
        ├─ 解析失败 → 显示错误
        │
        ▼ 成功
调用注册的 handler
        │
        ▼
根据 action 导航到对应页面
```

### 授权流程

```
1. 收到授权链接
        │
        ▼
2. 跳转授权确认页面
        │
        ▼
3. 用户确认/拒绝
        │
        ├─ 拒绝 → callback 返回错误
        │
        ▼ 确认
4. 执行签名/获取地址
        │
        ▼
5. callback 返回结果
```

---

## 安全要求

### 授权请求验证

- **MUST** 显示请求来源（app 标识）
- **MUST** 显示请求内容（地址/签名消息）
- **MUST** 要求用户明确确认
- **SHOULD** 记录授权历史

### 回调 URL 验证

- **MUST** 验证 callback URL 格式
- **SHOULD** 检查 callback 域名白名单
- **MUST NOT** 在回调中包含敏感信息

### nonce 防重放

- **MUST** 验证 nonce 未被使用
- **MUST** 使用后标记 nonce 失效
- nonce 有效期建议 5 分钟

---

## 错误处理

| 错误 | 说明 | 回调内容 |
|-----|------|---------|
| INVALID_URL | URL 格式错误 | - |
| UNKNOWN_ACTION | 不支持的操作 | - |
| USER_REJECTED | 用户拒绝 | `error=rejected` |
| INVALID_CHAIN | 不支持的链 | `error=invalid_chain` |
| TIMEOUT | 操作超时 | `error=timeout` |

---

## 平台实现

### Web

- 使用 URL hash 路由
- 监听 `hashchange` 事件
- 初始链接从 `location.hash` 获取

### DWEB (Plaoc)

- 使用 Plaoc DeepLink API
- 监听 `plaoc.onDeepLink` 事件
- 支持应用间直接调用
