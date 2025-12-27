# 公共 RPC 与测试网络接入指南

> 本文档介绍如何接入公共 RPC 节点进行开发和测试。

## 概述

我们使用 **PublicNode** 作为统一的公共 RPC 提供商，它提供：

- **免费**：无需 API Key，无请求限制
- **全链支持**：Ethereum、BSC、Tron、Bitcoin 等
- **主网+测试网**：同一提供商，API 一致

## 公共 API 端点汇总

### 主网

| 链 | RPC 端点 | 协议 | 说明 |
|---|---------|------|------|
| Ethereum | `https://ethereum-rpc.publicnode.com` | JSON-RPC | PublicNode |
| BSC | `https://bsc-rpc.publicnode.com` | JSON-RPC | PublicNode |
| Tron | `https://tron-rpc.publicnode.com` | Tron HTTP API | PublicNode |
| Bitcoin | `https://mempool.space/api` | REST API | mempool.space |

### 测试网

| 链 | RPC 端点 | 协议 | 说明 |
|---|---------|------|------|
| Ethereum Sepolia | `https://ethereum-sepolia-rpc.publicnode.com` | JSON-RPC | PublicNode |
| BSC Testnet | `https://bsc-testnet-rpc.publicnode.com` | JSON-RPC | PublicNode |
| Tron Nile | `https://nile.trongrid.io` | Tron HTTP API | TronGrid |
| Bitcoin Testnet | `https://mempool.space/testnet/api` | REST API | mempool.space |
| Bitcoin Signet | `https://mempool.space/signet/api` | REST API | mempool.space |

### Bitcoin 为什么使用 mempool.space？

PublicNode 提供标准 Bitcoin Core JSON-RPC，但存在以下限制：

1. **地址查询慢**：`scantxoutset` 需要扫描整个 UTXO 集，约需 60 秒
2. **无交易历史**：标准 RPC 不支持按地址查询交易记录
3. **部分方法禁用**：`getaddressinfo` 等方法被限制

mempool.space 提供专为钱包优化的 REST API：

| 功能 | mempool.space | PublicNode |
|------|--------------|------------|
| 余额查询 | < 1秒 | ~60秒 |
| UTXO 列表 | ✅ 支持 | ✅ 支持（慢）|
| 交易历史 | ✅ 支持 | ❌ 不支持 |
| 广播交易 | ✅ 支持 | ✅ 支持 |

## 测试网络详情

### Ethereum Sepolia

Sepolia 是 Ethereum 官方推荐的测试网络。

| 配置项 | 值 |
|-------|-----|
| 网络名称 | Sepolia Testnet |
| Chain ID | 11155111 |
| 货币符号 | SepoliaETH |
| RPC 端点 | `https://ethereum-sepolia-rpc.publicnode.com` |
| 区块浏览器 | https://sepolia.etherscan.io |
| 水龙头 | https://sepoliafaucet.com |

```typescript
// chain-config 配置示例
{
  id: 'ethereum-sepolia',
  version: '1.0',
  type: 'evm',
  name: 'Ethereum Sepolia',
  symbol: 'SepoliaETH',
  decimals: 18,
  api: {
    url: 'https://rpc.sepolia.org',
    path: 'eth'
  },
  explorer: {
    url: 'https://sepolia.etherscan.io',
    queryTx: 'https://sepolia.etherscan.io/tx/:hash',
    queryAddress: 'https://sepolia.etherscan.io/address/:address'
  }
}
```

#### BSC Testnet

| 配置项 | 值 |
|-------|-----|
| 网络名称 | BSC Testnet |
| Chain ID | 97 |
| 货币符号 | tBNB |
| RPC 端点 | `https://data-seed-prebsc-1-s1.binance.org:8545` |
| 备用 RPC | `https://bsc-testnet-rpc.publicnode.com` |
| 区块浏览器 | https://testnet.bscscan.com |
| 水龙头 | https://testnet.binance.org/faucet-smart |

### Bitcoin

#### Bitcoin Testnet4

Bitcoin Testnet4 是最新的测试网络，替代了经常被攻击的 Testnet3。

| 配置项 | 值 |
|-------|-----|
| 网络名称 | Bitcoin Testnet4 |
| 地址前缀 | tb1 (Bech32) / m/n (Legacy) |
| RPC 端点 | 需要自建节点或使用 Blockstream API |
| 区块浏览器 | https://mempool.space/testnet4 |
| 水龙头 | https://testnet4.anyone.eu.org |

#### Bitcoin Signet

Signet 是一个受控的测试网络，区块由授权签名者产生，更稳定。

| 配置项 | 值 |
|-------|-----|
| 网络名称 | Bitcoin Signet |
| 地址前缀 | tb1 (Bech32) |
| RPC 端点 | `https://mempool.space/signet/api` |
| 区块浏览器 | https://mempool.space/signet |
| 水龙头 | https://signetfaucet.com |

### Tron

#### Tron Nile Testnet

Nile 是 Tron 官方维护的测试网络。

| 配置项 | 值 |
|-------|-----|
| 网络名称 | Tron Nile Testnet |
| 地址前缀 | T |
| Full Node | `https://nile.trongrid.io` |
| Solidity Node | `https://nile.trongrid.io` |
| Event Server | `https://event.nileex.io` |
| 区块浏览器 | https://nile.tronscan.org |
| 水龙头 | https://nileex.io/join/getJoinPage |

```typescript
// chain-config 配置示例
{
  id: 'tron-nile',
  version: '1.0',
  type: 'bip39',
  name: 'Tron Nile Testnet',
  symbol: 'TRX',
  decimals: 6,
  api: {
    url: 'https://nile.trongrid.io',
    path: 'tron'
  },
  explorer: {
    url: 'https://nile.tronscan.org',
    queryTx: 'https://nile.tronscan.org/#/transaction/:hash',
    queryAddress: 'https://nile.tronscan.org/#/address/:address'
  }
}
```

#### Tron Shasta Testnet

Shasta 是另一个常用的 Tron 测试网络。

| 配置项 | 值 |
|-------|-----|
| 网络名称 | Tron Shasta Testnet |
| Full Node | `https://api.shasta.trongrid.io` |
| 区块浏览器 | https://shasta.tronscan.org |
| 水龙头 | https://www.trongrid.io/faucet |

## 配置测试网络

### 方式一：环境变量切换

```bash
# .env.development
VITE_NETWORK_MODE=testnet

# .env.production
VITE_NETWORK_MODE=mainnet
```

### 方式二：运行时配置

```typescript
// src/services/chain-config/testnet-configs.ts
import type { ChainConfig } from './types'

export const TESTNET_CONFIGS: ChainConfig[] = [
  {
    id: 'ethereum-sepolia',
    version: '1.0',
    type: 'evm',
    name: 'Ethereum Sepolia',
    symbol: 'SepoliaETH',
    decimals: 18,
    api: { url: 'https://rpc.sepolia.org', path: 'eth' },
    explorer: { url: 'https://sepolia.etherscan.io' },
    enabled: true,
    source: 'default',
  },
  {
    id: 'bsc-testnet',
    version: '1.0',
    type: 'evm',
    name: 'BSC Testnet',
    symbol: 'tBNB',
    decimals: 18,
    api: { url: 'https://bsc-testnet-rpc.publicnode.com', path: 'bnb' },
    explorer: { url: 'https://testnet.bscscan.com' },
    enabled: true,
    source: 'default',
  },
  {
    id: 'tron-nile',
    version: '1.0',
    type: 'bip39',
    name: 'Tron Nile',
    symbol: 'TRX',
    decimals: 6,
    api: { url: 'https://nile.trongrid.io', path: 'tron' },
    explorer: { url: 'https://nile.tronscan.org' },
    enabled: true,
    source: 'default',
  },
]
```

### 方式三：通过订阅 URL

创建一个测试网络的链配置订阅文件：

```json
// https://example.com/testnet-chains.json
[
  {
    "id": "ethereum-sepolia",
    "version": "1.0",
    "type": "evm",
    "name": "Ethereum Sepolia",
    "symbol": "SepoliaETH",
    "decimals": 18,
    "api": { "url": "https://rpc.sepolia.org", "path": "eth" }
  }
]
```

## 测试水龙头使用

### 获取测试代币的步骤

1. **生成测试钱包地址**
   - 使用应用的钱包创建功能
   - 或使用 `deriveAddressesForChains` 派生地址

2. **访问水龙头网站**
   - 输入钱包地址
   - 完成人机验证
   - 等待测试代币到账

3. **验证余额**
   ```typescript
   const adapter = registry.getAdapter('ethereum-sepolia')
   const balance = await adapter.asset.getNativeBalance(address)
   console.log(`Balance: ${balance.amount.toFormatted()} ${balance.symbol}`)
   ```

### 自动化获取测试代币

对于 CI/CD 环境，可以使用以下方式：

```typescript
// scripts/faucet.ts
async function requestTestTokens(chain: string, address: string) {
  switch (chain) {
    case 'ethereum-sepolia':
      // Alchemy Sepolia faucet API (需要 API key)
      await fetch('https://api.alchemy.com/v2/faucet', {
        method: 'POST',
        body: JSON.stringify({ network: 'sepolia', address }),
      })
      break
    case 'tron-nile':
      // Tron Nile faucet (每日限额)
      await fetch('https://nileex.io/api/v1/faucet', {
        method: 'POST',
        body: JSON.stringify({ address, amount: 1000 }),
      })
      break
  }
}
```

## 测试网络使用注意事项

1. **测试代币无价值**
   - 测试网代币仅用于测试，不具有真实价值
   - 不要在测试网地址存入主网代币

2. **网络不稳定**
   - 测试网可能偶尔重置或中断
   - 建议准备多个测试网备选

3. **水龙头限制**
   - 大多数水龙头有每日/每地址限额
   - 建议提前储备足够的测试代币

4. **地址格式一致**
   - EVM 测试网地址与主网格式相同
   - Bitcoin 测试网使用 `tb1` 前缀
   - Tron 测试网使用 `T` 前缀（与主网相同）

## 开发模式集成

将测试网络集成到开发模式：

```typescript
// src/hooks/use-send.ts
const { useMock = import.meta.env.DEV } = options

// 开发模式下自动使用测试网配置
const chainConfig = useMemo(() => {
  if (import.meta.env.DEV && import.meta.env.VITE_USE_TESTNET) {
    return getTestnetConfig(originalConfig.id)
  }
  return originalConfig
}, [originalConfig])
```

## 相关资源

- [Ethereum Sepolia 文档](https://ethereum.org/en/developers/docs/networks/#sepolia)
- [BSC Testnet 文档](https://docs.bnbchain.org/docs/bsc-testnet/)
- [Bitcoin Signet](https://en.bitcoin.it/wiki/Signet)
- [Tron Nile 文档](https://developers.tron.network/docs/testnet)
