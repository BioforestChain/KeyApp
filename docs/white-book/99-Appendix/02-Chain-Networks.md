# 链网络列表

> 支持的区块链网络及其配置信息

---

## 网络分类

### 按网络类型

| 类型 | 说明 | 示例 |
|------|------|------|
| **主网** | 生产环境，真实资产 | BFM Mainnet, Ethereum Mainnet |
| **测试网** | 开发测试，测试代币 | BFM Testnet, Sepolia |
| **开发网** | 本地开发环境 | Localhost, Hardhat Network |

### 按链架构

| 架构 | 特点 | 代表链 |
|------|------|--------|
| **EVM 兼容** | 支持以太坊虚拟机 | Ethereum, BSC, Polygon |
| **BFM 原生** | BioForest 原生架构 | BFM Chain |
| **UTXO 模型** | 比特币架构 | Bitcoin, Litecoin |
| **TVM** | Tron 虚拟机 | Tron |

---

## BFM 链网络

### BFM 主网

```json
{
  "chainId": "bfm-mainnet",
  "name": "BFM Mainnet",
  "type": "bfm",
  "rpc": {
    "primary": "https://rpc.bfmeta.io",
    "fallback": ["https://rpc2.bfmeta.io"]
  },
  "explorer": {
    "name": "BFM Explorer",
    "url": "https://explorer.bfmeta.io"
  },
  "nativeCurrency": {
    "name": "BioForest Meta",
    "symbol": "BFM",
    "decimals": 8
  },
  "features": {
    "staking": true,
    "nft": true,
    "smartContract": true
  }
}
```

### BFM 测试网

```json
{
  "chainId": "bfm-testnet",
  "name": "BFM Testnet",
  "type": "bfm",
  "testnet": true,
  "rpc": {
    "primary": "https://testnet-rpc.bfmeta.io"
  },
  "faucet": "https://faucet.bfmeta.io"
}
```

---

## EVM 兼容链

### Ethereum 主网

```json
{
  "chainId": "1",
  "name": "Ethereum Mainnet",
  "type": "evm",
  "rpc": {
    "primary": "https://eth.llamarpc.com",
    "fallback": [
      "https://rpc.ankr.com/eth",
      "https://cloudflare-eth.com"
    ]
  },
  "explorer": {
    "name": "Etherscan",
    "url": "https://etherscan.io"
  },
  "nativeCurrency": {
    "symbol": "ETH",
    "decimals": 18
  }
}
```

### BSC 主网

```json
{
  "chainId": "56",
  "name": "BNB Smart Chain",
  "type": "evm",
  "rpc": {
    "primary": "https://bsc-dataseed.binance.org"
  },
  "explorer": {
    "name": "BscScan",
    "url": "https://bscscan.com"
  },
  "nativeCurrency": {
    "symbol": "BNB",
    "decimals": 18
  }
}
```

### Polygon 主网

```json
{
  "chainId": "137",
  "name": "Polygon Mainnet",
  "type": "evm",
  "rpc": {
    "primary": "https://polygon-rpc.com"
  },
  "nativeCurrency": {
    "symbol": "MATIC",
    "decimals": 18
  }
}
```

---

## 测试网络

| 链 | 测试网 | Chain ID | Faucet |
|----|--------|----------|--------|
| Ethereum | Sepolia | 11155111 | sepoliafaucet.com |
| BSC | BSC Testnet | 97 | testnet.binance.org/faucet-smart |
| Tron | Nile | - | nileex.io/faucet |
| BFM | BFM Testnet | - | faucet.bfmeta.io |

---

## 链配置 Schema

```typescript
interface ChainConfig {
  // 基础信息
  chainId: string        // 唯一标识
  name: string           // 显示名称
  type: ChainType        // 链类型
  version: string        // 配置版本 (x.y)
  
  // 网络配置
  rpc: {
    primary: string      // 主 RPC 端点
    fallback?: string[]  // 备用端点
  }
  
  // 浏览器配置
  explorer?: {
    name: string
    url: string
    apiUrl?: string
  }
  
  // 原生代币
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  
  // 可选信息
  testnet?: boolean
  faucet?: string
  features?: {
    staking?: boolean
    nft?: boolean
    smartContract?: boolean
  }
}

type ChainType = 'bfm' | 'evm' | 'utxo' | 'solana' | 'tron'
```

---

## 订阅源格式

### 标准格式

```json
{
  "version": "1.0",
  "lastUpdate": "2024-01-15T00:00:00Z",
  "chains": [
    { /* ChainConfig */ }
  ]
}
```

### 默认订阅源

| 环境 | URL |
|------|-----|
| 生产 | https://config.bfmpay.io/chains.json |
| 测试 | https://config.bfmpay.io/chains-testnet.json |
| 内置 | src/config/default-chains.json |

---

## 添加自定义链

### 配置验证规则

```typescript
const chainConfigSchema = z.object({
  chainId: z.string().min(1),
  name: z.string().min(1).max(50),
  type: z.enum(['bfm', 'evm', 'utxo', 'solana', 'tron']),
  rpc: z.object({
    primary: z.string().url(),
    fallback: z.array(z.string().url()).optional()
  }),
  nativeCurrency: z.object({
    symbol: z.string().max(10),
    decimals: z.number().int().min(0).max(18)
  })
})
```

---

## RPC 切换策略

1. 首先尝试 primary RPC
2. 失败后依次尝试 fallback
3. 所有失败后标记链为离线
4. 后台定期重试恢复

---

## 相关文档

- [Driver Reference](../02-Driver-Ref/README.md) - 链适配器实现
- [State Machines](./03-State-Machines.md) - 网络状态机
