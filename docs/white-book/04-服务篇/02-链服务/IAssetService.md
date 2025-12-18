# IAssetService 资产服务

> 资产余额查询

---

## 职责

查询用户资产余额和代币信息，支持实时订阅。

---

## 接口定义

```
IAssetService {
  // 获取原生代币余额
  getNativeBalance(address: Address): Balance
  
  // 获取代币余额
  getTokenBalance(address: Address, tokenAddress: Address): Balance
  
  // 获取所有代币余额
  getTokenBalances(address: Address): Balance[]
  
  // 获取代币元数据
  getTokenMetadata(tokenAddress: Address): TokenMetadata
  
  // 订阅余额变化
  subscribeBalance(address: Address, callback: (balance: Balance) => void): Unsubscribe
}
```

---

## 数据结构

### Balance

```
Balance {
  raw: bigint           // 原始值（最小单位）
  formatted: string     // 格式化值（人类可读）
  symbol: string        // 代币符号
  decimals: number      // 小数位数
}
```

**示例**：

| raw | decimals | formatted |
|-----|---------|-----------|
| 1000000000000000000 | 18 | "1.0" |
| 50000000 | 8 | "0.5" |

### TokenMetadata

```
TokenMetadata {
  address: Address      // 合约地址（原生为空）
  name: string          // 代币全名
  symbol: string        // 代币符号
  decimals: number      // 小数位数
  logoUri?: string      // 图标 URL
  standard: TokenStandard
}

TokenStandard = 'native' | 'ERC20' | 'TRC20' | 'BFM-TOKEN' | 'SPL'
```

---

## 方法详情

### getNativeBalance

获取原生代币（如 ETH、BFM）余额。

**参数**：

| 参数 | 类型 | 必需 | 说明 |
|-----|------|-----|------|
| address | Address | Y | 查询地址 |

**返回**：`Balance`

**行为规范**：
- **MUST** 返回最新链上数据
- **SHOULD** 支持请求缓存（staleTime: 10s）
- **MUST** 处理地址不存在的情况（返回 0）

---

### getTokenBalances

批量获取地址持有的所有代币余额。

**参数**：

| 参数 | 类型 | 必需 | 说明 |
|-----|------|-----|------|
| address | Address | Y | 查询地址 |

**返回**：`Balance[]`

**行为规范**：
- **SHOULD** 使用批量 RPC 调用优化性能
- **MAY** 使用索引服务加速查询
- **MUST** 包含原生代币

---

### subscribeBalance

订阅余额实时变化。

**参数**：

| 参数 | 类型 | 必需 | 说明 |
|-----|------|-----|------|
| address | Address | Y | 订阅地址 |
| callback | function | Y | 变化回调 |

**返回**：`Unsubscribe` - 取消订阅函数

**行为规范**：
- **MUST** 立即回调一次当前余额
- **MUST** 区块更新时检查余额变化
- **SHOULD** 使用 WebSocket 实时推送
- **MAY** 使用轮询作为降级方案

---

## 缓存策略

| 数据类型 | 缓存时间 | 失效条件 |
|---------|---------|---------|
| 原生余额 | 10s | 发送交易后 |
| 代币余额 | 30s | 发送交易后 |
| 代币元数据 | 24h | 几乎不变 |

---

## 错误码

| 错误码 | 说明 | 处理建议 |
|-------|------|---------|
| ADDRESS_NOT_FOUND | 地址在链上不存在 | 返回余额 0 |
| TOKEN_NOT_FOUND | 代币合约不存在 | 提示用户检查地址 |
| NETWORK_ERROR | 网络请求失败 | 显示缓存数据 + 重试 |
| RATE_LIMIT | 请求频率限制 | 降低请求频率 |

---

## 性能要求

| 指标 | 目标值 |
|-----|-------|
| 单次查询延迟 | < 500ms |
| 批量查询延迟 | < 2s（100个代币） |
| 订阅更新延迟 | < 5s（新区块后） |
