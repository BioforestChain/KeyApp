# IChainService 链信息服务

> 链状态和网络信息查询

---

## 职责

查询区块链网络的基本信息和运行状态。

---

## 接口定义

```
IChainService {
  // 获取链配置信息
  getChainInfo(): ChainInfo
  
  // 获取当前区块高度
  getBlockHeight(): bigint
  
  // 获取 Gas 价格
  getGasPrice(): GasPrice
  
  // 检查节点健康状态
  healthCheck(): HealthStatus
  
  // 获取链支持的代币列表
  getTokenList(): TokenInfo[]
}
```

---

## 数据结构

### ChainInfo

```
ChainInfo {
  chainId: string           // 链唯一标识
  name: string              // 显示名称
  shortName: string         // 简称
  
  nativeCurrency: {
    name: string            // "Ether"
    symbol: string          // "ETH"
    decimals: number        // 18
  }
  
  rpc: {
    primary: string         // 主 RPC 端点
    fallback: string[]      // 备用端点
  }
  
  explorer: {
    name: string            // "Etherscan"
    url: string             // "https://etherscan.io"
    txPath: string          // "/tx/{hash}"
    addressPath: string     // "/address/{address}"
  }
  
  blockTime: number         // 平均出块时间（秒）
  confirmations: number     // 建议确认数
  
  features: {
    eip1559: boolean        // 支持 EIP-1559
    staking: boolean        // 支持质押
    nft: boolean            // 支持 NFT
  }
}
```

### GasPrice

```
GasPrice {
  slow: bigint              // 慢速价格
  standard: bigint          // 标准价格
  fast: bigint              // 快速价格
  
  // EIP-1559 链额外字段
  baseFee?: bigint
  maxPriorityFee?: {
    slow: bigint
    standard: bigint
    fast: bigint
  }
  
  lastUpdated: number       // 更新时间戳
}
```

### HealthStatus

```
HealthStatus {
  isHealthy: boolean
  
  // 节点状态
  latency: number           // 响应延迟（ms）
  blockHeight: bigint       // 当前区块高度
  peerCount?: number        // 节点连接数
  isSyncing: boolean        // 是否同步中
  
  // 时间信息
  lastUpdated: number
  lastBlockTime: number     // 最新区块时间
}
```

---

## 方法详情

### getChainInfo

获取链的静态配置信息。

**行为规范**：
- **SHOULD** 缓存结果（配置不常变）
- **MUST** 包含浏览器链接模板

### getBlockHeight

获取当前最新区块高度。

**行为规范**：
- **MUST** 返回最新数据
- **SHOULD** 缓存 3-5 秒
- 用于判断交易确认数

### getGasPrice

获取当前 gas 价格建议。

**行为规范**：
- **MUST** 区分三个档位
- **SHOULD** 每 10-15 秒更新
- **MUST** 处理 EIP-1559 链

### healthCheck

检查节点连接状态。

**返回判断逻辑**：

```
isHealthy = 
  latency < 5000ms &&
  !isSyncing &&
  (now - lastBlockTime) < 5 * blockTime
```

---

## 节点健康判断

| 指标 | 健康阈值 | 不健康处理 |
|-----|---------|-----------|
| 延迟 | < 5s | 切换备用节点 |
| 同步状态 | 非同步中 | 等待同步完成 |
| 区块滞后 | < 5 个区块时间 | 切换节点 |

---

## 浏览器链接生成

```
// 交易链接
getTransactionUrl(hash: string): string {
  return explorer.url + explorer.txPath.replace('{hash}', hash)
}

// 地址链接
getAddressUrl(address: string): string {
  return explorer.url + explorer.addressPath.replace('{address}', address)
}
```

---

## 缓存策略

| 数据 | 缓存时间 | 说明 |
|-----|---------|------|
| chainInfo | 永久 | 配置不变 |
| blockHeight | 5s | 频繁变化 |
| gasPrice | 15s | 相对稳定 |
| healthStatus | 30s | 定期检查 |

---

## 错误码

| 错误码 | 说明 |
|-------|------|
| CHAIN_NOT_FOUND | 未知的链 ID |
| RPC_ERROR | RPC 调用失败 |
| NODE_SYNCING | 节点同步中 |
| ALL_NODES_DOWN | 所有节点不可用 |
