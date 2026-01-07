# API Provider 状态与配置

> 记录各链 API Provider 的可用性状态、已知问题和配置建议。
> 
> 最后更新: 2026-01-07 (PR #176)

## Provider 状态概览

| 链 | Provider 类型 | 服务商/URL | 状态 | 余额 | 历史 | 说明 |
|---|---|---|---|---|---|---|
| **ETH** | `blockscout-v1` | `eth.blockscout.com` | ✅ 正常 | ✅ | ✅ | 推荐使用，完全免费且稳定 |
| **ETH** | `ethereum-rpc` | `ethereum-rpc.publicnode.com` | ⚠️ 部分 | ✅ | ❌ | RPC 仅支持余额查询，不支持交易历史 |
| **ETH** | `etherscan-v2` | `api.etherscan.io` | ✅ 正常 | ✅ | ✅ | 需要配置 `ETHERSCAN_API_KEY`（已配置） |
| **ETH** | `ethwallet-v1` | `walletapi.bfmeta.info` | ✅ 正常 | ✅ | ✅ | 自研 API，PR #174 已修复 Schema 问题 |
| **BNB** | `bsc-rpc` | `bsc-rpc.publicnode.com` | ⚠️ 部分 | ✅ | ❌ | RPC 仅支持余额查询 |
| **BSC** | `etherscan-v2` | `api.etherscan.io` | ❌ 需付费 | ❌ | ❌ | BSC 链在 Etherscan V2 中需要付费 Plan |
| **BSC** | `bscwallet-v1` | `walletapi.bfmeta.info` | ⚠️ 部分 | ✅ | ❌ | 交易历史查询返回 `NOTOK`，后端数据问题 |
| **Tron** | `tronwallet-v1` | `walletapi.bfmeta.info` | ✅ 正常 | ✅ | ✅ | PR #174 已修复 Schema 问题 |
| **BTC** | `btcwallet-v1` | `walletapi.bfmeta.info` | ✅ 正常 | ✅ | ✅ | PR #176 修复 Schema 解包问题 |
| **BTC** | `mempool-v1` | `mempool.space` | ✅ 正常 | ✅ | ✅ | 推荐使用的标准 BTC 数据源 |

## 已知问题与解决方案

### 1. BSC WalletAPI 交易历史缺失
- **现象**: `getTransactionHistory` 返回空数组，API 响应 `{"success":true,"result":{"status":"0","message":"NOTOK","result":[]}}`。
- **原因**: 即使是活跃地址也无法获取交易，可能是后端 BSC 模块数据同步问题或 BscScan V1 源失效。
- **建议**: 暂时依赖 RPC 查询余额，交易记录需等待后端修复。

### 2. Etherscan V2 鉴权（ETH 链已解决）
- **原现象**: 返回 `Missing/Invalid API Key`。
- **配置**: 需要在环境变量中设置 `ETHERSCAN_API_KEY`。
- **状态**: ETH 链已配置 API Key，正常可用。
- **注意**: BSC 链即使有 Key，普通免费 Plan 也不支持通过统一入口访问，需要使用独立的 BscScan API（V1 已弃用，需迁移到 V2）。

### 3. BTC WalletAPI (已修复)
- **原现象**: Schema 解析失败，数据返回空。
- **修复**: PR #176 添加 `{ success, result }` 包装解包逻辑。
- **状态**: 正常可用，支持余额查询和交易历史。

## 配置建议

### 环境变量
推荐配置以下 API Key 以获得最佳稳定性：

```bash
# .env.local
ETHERSCAN_API_KEY=your_key_here
TRONGRID_API_KEY=your_key_here
```

### 链配置 (default-chains.json)
对于 BTC，确保 Mempool 在前：

```json
"apis": [
  { "type": "mempool-v1", "endpoint": "https://mempool.space/api" },
  { "type": "btcwallet-v1", "endpoint": "https://walletapi.bfmeta.info/wallet/btc/blockbook" }
]
```
