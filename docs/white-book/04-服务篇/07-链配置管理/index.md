# 链配置管理服务

> 定义多链配置的获取、存储和管理规范

---

## 概述

链配置管理服务负责管理应用支持的区块链网络配置。支持三种配置来源：内置默认、订阅源、手动添加。

---

## 配置来源

### 优先级规则

当多个来源存在相同 `id` 的配置时，按以下优先级合并：

```
手动添加 (manual) > 订阅源 (subscription) > 内置默认 (default)
```

### 来源说明

| 来源 | 说明 | 可删除 |
|-----|------|--------|
| default | 内置于应用的默认配置 | 否 |
| subscription | 从订阅 URL 获取的配置 | 切换订阅源时清除 |
| manual | 用户手动添加的配置 | 是 |

---

## 订阅源管理

### 订阅 URL 规范

- **MUST** 支持 `default` 作为特殊值，表示仅使用内置配置
- **MUST** 验证 URL 使用 `http://` 或 `https://` 协议
- **SHOULD** 支持 ETag 进行条件请求，避免重复下载

### 订阅刷新机制

| 触发条件 | 行为 |
|---------|------|
| 应用启动 | 检查 lastUpdated，超过刷新间隔则刷新 |
| 用户手动刷新 | 强制刷新，忽略 ETag |
| 切换订阅 URL | 清除旧订阅数据，获取新数据 |

### 刷新流程

```
1. 检查当前订阅 URL
   │
   ├─ URL = "default" → 跳过，使用内置配置
   │
   └─ URL 有效 → 发起 HTTP GET 请求
         │
         ├─ 带 If-None-Match: {etag}（如有）
         │
         ├─ 响应 304 → 使用缓存数据
         │
         ├─ 响应 200 → 解析并存储新配置
         │
         └─ 错误 → 使用缓存数据 + 显示错误提示
```

### 订阅响应格式

```json
{
  "version": "1.0",
  "lastUpdate": "2024-01-15T00:00:00Z",
  "chains": [
    { /* ChainConfig */ },
    { /* ChainConfig */ }
  ]
}
```

或直接返回配置数组：

```json
[
  { /* ChainConfig */ },
  { /* ChainConfig */ }
]
```

---

## 链配置结构

### ChainConfig Schema

```typescript
interface ChainConfig {
  // 必需字段
  id: string              // 唯一标识，格式: /^[a-z0-9-]+$/
  version: string         // 配置版本，格式: "major.minor"
  type: ChainConfigType   // 链类型
  name: string            // 显示名称
  symbol: string          // 原生代币符号
  decimals: number        // 原生代币精度

  // 可选字段
  icon?: string           // 图标 URL
  prefix?: string         // 地址前缀（bioforest 链使用）
  rpcUrl?: string         // RPC 端点
  explorerUrl?: string    // 区块浏览器 URL

  // 运行时字段（不存储在配置源中）
  enabled: boolean        // 用户是否启用
  source: ChainConfigSource // 配置来源
}

type ChainConfigType = 'bioforest' | 'evm' | 'bip39' | 'custom'
type ChainConfigSource = 'default' | 'subscription' | 'manual'
```

### 版本兼容性

| 版本 major | 说明 |
|-----------|------|
| 1 | 当前支持的版本 |
| 2+ | 未来扩展，需要应用升级 |

当配置的 major 版本高于应用支持的版本时：
- **MUST** 显示警告提示
- **MUST** 禁用该链的启用开关
- **SHOULD** 提示用户升级应用

---

## 链类型说明

### bioforest

BioForest 生态链，使用 Ed25519 密钥派生：

| 字段 | 说明 |
|-----|------|
| prefix | 地址前缀，默认 "b" |
| decimals | 通常为 8 |

**支持的链**: BFMeta, CCChain, PMChain, BFChainV2, BTGMeta, BIWMeta, ETHMeta, Malibu

### evm

EVM 兼容链，使用 BIP44 派生（coin type 60）：

| 字段 | 说明 |
|-----|------|
| rpcUrl | RPC 端点（必需用于交易） |
| explorerUrl | 区块浏览器 URL |
| chainId | EVM chain ID（可从 RPC 获取） |

**支持的链**: Ethereum, BSC, Polygon 等

### bip39

其他使用 BIP39/BIP44 的链：

| 链 | Coin Type | 说明 |
|---|-----------|------|
| Bitcoin | 0 | UTXO 模型 |
| Tron | 195 | 账户模型 |

### custom

未知类型，用于向前兼容。应用 **MAY** 显示但 **MUST NOT** 执行交易操作。

---

## 用户操作

### 启用/禁用链

- 用户可以启用或禁用任何链
- 禁用的链 **MUST NOT** 出现在链选择器中
- 禁用状态存储在本地偏好设置中

### 手动添加链

1. 用户输入 JSON 格式的链配置
2. 支持单个对象或数组
3. 验证 JSON 格式和必需字段
4. 如果 `id` 已存在，提示用户确认替换

### 删除手动链

- 仅 `source: manual` 的链可以删除
- 删除后恢复到订阅源或默认配置（如有）

---

## 存储规范

### IndexedDB 结构

| Store | Key | 内容 |
|-------|-----|------|
| chain_configs | `{source}:{id}` | 链配置记录 |
| chain_preferences | `enabledMap` | 启用状态映射 |
| chain_preferences | `subscriptionMeta` | 订阅元数据 |

### 数据迁移

当应用升级需要修改存储结构时：
- **MUST** 提供向后兼容的读取逻辑
- **SHOULD** 在首次启动时执行迁移

---

## 错误处理

| 错误场景 | 处理方式 |
|---------|---------|
| 订阅 URL 无效 | 拒绝保存，提示格式错误 |
| 订阅请求超时 | 使用缓存数据，显示警告 |
| 订阅响应解析失败 | 使用缓存数据，记录错误日志 |
| 手动 JSON 格式错误 | 拒绝添加，提示具体错误 |

---

## 接口定义

```typescript
// 初始化服务，加载所有配置
initialize(): Promise<ChainConfigSnapshot>

// 设置订阅 URL
setSubscriptionUrl(url: string): Promise<ChainConfigSnapshot>

// 刷新订阅
refreshSubscription(): Promise<{ result: FetchSubscriptionResult; snapshot: ChainConfigSnapshot }>

// 添加手动配置
addManualConfig(input: string | object): Promise<ChainConfigSnapshot>

// 设置链启用状态
setChainEnabled(id: string, enabled: boolean): Promise<ChainConfigSnapshot>

// 获取启用的链列表
getEnabledChains(snapshot: ChainConfigSnapshot): ChainConfig[]

// 根据 ID 获取链配置
getChainById(snapshot: ChainConfigSnapshot, id: string): ChainConfig | null
```

---

## 与其他服务的关系

```
┌─────────────────────┐
│  ChainConfigService │
└──────────┬──────────┘
           │ 提供链配置
           ▼
┌─────────────────────┐
│  AdapterRegistry    │ ← 根据 type 选择适配器
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌─────────┐ ┌─────────┐
│BFMAdapter│ │EVMAdapter│
└─────────┘ └─────────┘
```

---

## 安全考虑

- **MUST NOT** 在日志中输出完整的 rpcUrl（可能含 API Key）
- **SHOULD** 验证 rpcUrl 指向可信域名
- **MAY** 提供 RPC 端点健康检查

---

## 参考

- [附录 B: 链网络列表](../../附录/B-链网络列表/) - 预置链配置详情
