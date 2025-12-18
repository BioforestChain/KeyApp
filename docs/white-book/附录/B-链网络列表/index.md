# 附录 B：链网络列表

本附录列出 BFM Pay 支持的区块链网络及其配置信息。

---

## 一、网络分类

### 1.1 按网络类型

| 类型 | 说明 | 示例 |
|-----|------|------|
| **主网** | 生产环境，真实资产 | BFM Mainnet, Ethereum Mainnet |
| **测试网** | 开发测试，测试代币 | BFM Testnet, Sepolia |
| **开发网** | 本地开发环境 | Localhost, Hardhat Network |

### 1.2 按链架构

| 架构 | 特点 | 代表链 |
|-----|------|--------|
| **EVM 兼容** | 支持以太坊虚拟机 | Ethereum, BSC, Polygon |
| **BFM 原生** | BioForest 原生架构 | BFM Chain |
| **UTXO 模型** | 比特币架构 | Bitcoin, Litecoin |
| **其他** | 独立架构 | Solana, Tron |

---

## 二、BFM 链网络

### 2.1 BFM 主网

```json
{
  "chainId": "bfm-mainnet",
  "name": "BFM Mainnet",
  "type": "bfm",
  "version": "1.0",
  "rpc": {
    "primary": "https://rpc.bfmeta.io",
    "fallback": ["https://rpc2.bfmeta.io"]
  },
  "explorer": {
    "name": "BFM Explorer",
    "url": "https://explorer.bfmeta.io",
    "apiUrl": "https://api.explorer.bfmeta.io"
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

### 2.2 BFM 测试网

```json
{
  "chainId": "bfm-testnet",
  "name": "BFM Testnet",
  "type": "bfm",
  "version": "1.0",
  "rpc": {
    "primary": "https://testnet-rpc.bfmeta.io"
  },
  "explorer": {
    "name": "BFM Testnet Explorer",
    "url": "https://testnet.explorer.bfmeta.io"
  },
  "nativeCurrency": {
    "name": "Test BFM",
    "symbol": "tBFM",
    "decimals": 8
  },
  "faucet": "https://faucet.bfmeta.io"
}
```

---

## 三、EVM 兼容链

### 3.1 以太坊主网

```json
{
  "chainId": "1",
  "name": "Ethereum Mainnet",
  "type": "evm",
  "version": "1.0",
  "rpc": {
    "primary": "https://eth.llamarpc.com",
    "fallback": [
      "https://rpc.ankr.com/eth",
      "https://cloudflare-eth.com"
    ]
  },
  "explorer": {
    "name": "Etherscan",
    "url": "https://etherscan.io",
    "apiUrl": "https://api.etherscan.io"
  },
  "nativeCurrency": {
    "name": "Ether",
    "symbol": "ETH",
    "decimals": 18
  }
}
```

### 3.2 BSC 主网

```json
{
  "chainId": "56",
  "name": "BNB Smart Chain",
  "type": "evm",
  "version": "1.0",
  "rpc": {
    "primary": "https://bsc-dataseed.binance.org",
    "fallback": [
      "https://bsc-dataseed1.defibit.io",
      "https://bsc-dataseed1.ninicoin.io"
    ]
  },
  "explorer": {
    "name": "BscScan",
    "url": "https://bscscan.com",
    "apiUrl": "https://api.bscscan.com"
  },
  "nativeCurrency": {
    "name": "BNB",
    "symbol": "BNB",
    "decimals": 18
  }
}
```

### 3.3 Polygon 主网

```json
{
  "chainId": "137",
  "name": "Polygon Mainnet",
  "type": "evm",
  "version": "1.0",
  "rpc": {
    "primary": "https://polygon-rpc.com",
    "fallback": ["https://rpc.ankr.com/polygon"]
  },
  "explorer": {
    "name": "Polygonscan",
    "url": "https://polygonscan.com"
  },
  "nativeCurrency": {
    "name": "MATIC",
    "symbol": "MATIC",
    "decimals": 18
  }
}
```

---

## 四、测试网络

### 4.1 Sepolia (以太坊测试网)

```json
{
  "chainId": "11155111",
  "name": "Sepolia Testnet",
  "type": "evm",
  "version": "1.0",
  "testnet": true,
  "rpc": {
    "primary": "https://rpc.sepolia.org"
  },
  "explorer": {
    "name": "Sepolia Etherscan",
    "url": "https://sepolia.etherscan.io"
  },
  "nativeCurrency": {
    "name": "Sepolia ETH",
    "symbol": "ETH",
    "decimals": 18
  },
  "faucet": "https://sepoliafaucet.com"
}
```

### 4.2 BSC 测试网

```json
{
  "chainId": "97",
  "name": "BSC Testnet",
  "type": "evm",
  "version": "1.0",
  "testnet": true,
  "rpc": {
    "primary": "https://data-seed-prebsc-1-s1.binance.org:8545"
  },
  "explorer": {
    "name": "BSC Testnet Explorer",
    "url": "https://testnet.bscscan.com"
  },
  "nativeCurrency": {
    "name": "Test BNB",
    "symbol": "tBNB",
    "decimals": 18
  },
  "faucet": "https://testnet.binance.org/faucet-smart"
}
```

---

## 五、链配置 Schema

### 5.1 配置结构

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
  testnet?: boolean      // 是否测试网
  faucet?: string        // 水龙头地址
  features?: {           // 支持的功能
    staking?: boolean
    nft?: boolean
    smartContract?: boolean
  }
  
  // 用户设置
  enabled?: boolean      // 是否启用
  custom?: boolean       // 是否自定义添加
}

type ChainType = 'bfm' | 'evm' | 'utxo' | 'solana' | 'tron'
```

### 5.2 版本控制

| 版本 | 变更说明 |
|-----|---------|
| 1.0 | 初始版本，基础字段 |
| 1.1 | 添加 features 字段 |
| 1.2 | 添加 fallback RPC 支持 |
| 2.0 | 架构重构 (保留) |

---

## 六、订阅源格式

### 6.1 标准订阅格式

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

### 6.2 默认订阅源

- **生产环境**: `https://config.bfmpay.io/chains.json`
- **测试环境**: `https://config.bfmpay.io/chains-testnet.json`
- **内置默认**: `src/config/default-chains.json`

---

## 七、添加自定义链

### 7.1 通过 UI 添加

1. 进入 **设置 → 链网络管理**
2. 点击 **添加自定义链**
3. 填写链配置 JSON
4. 验证并保存

### 7.2 配置验证规则

```typescript
const chainConfigSchema = z.object({
  chainId: z.string().min(1),
  name: z.string().min(1).max(50),
  type: z.enum(['bfm', 'evm', 'utxo', 'solana', 'tron']),
  version: z.string().regex(/^\d+\.\d+$/),
  rpc: z.object({
    primary: z.string().url(),
    fallback: z.array(z.string().url()).optional()
  }),
  nativeCurrency: z.object({
    name: z.string(),
    symbol: z.string().max(10),
    decimals: z.number().int().min(0).max(18)
  })
})
```

---

## 八、常见问题

### Q1: 如何判断链是否在线？

```typescript
async function checkChainStatus(rpcUrl: string): Promise<boolean> {
  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      })
    })
    return response.ok
  } catch {
    return false
  }
}
```

### Q2: RPC 切换策略？

1. 首先尝试 primary RPC
2. 失败后依次尝试 fallback
3. 所有失败后标记链为离线
4. 后台定期重试恢复

### Q3: 如何处理链分叉？

- 监听链重组事件
- 交易确认数达标后才视为最终确认
- 不同链的确认数要求不同
