# 外部服务提供商

> 源码: [`src/apis/`](https://github.com/BioforestChain/KeyApp/blob/main/src/apis/)

---

## 概述

本文档描述 `walletapi.bfmeta.info` 后端提供的 API 接口。不同链类型有完全不同的 API 模式。

---

## KeyApp Provider 配置

KeyApp 的链配置（`public/configs/*.json`）使用有序数组 `apis[]` 描述外部 Provider。

```typescript
interface ApiConfig {
  type: string      // Provider 类型
  endpoint: string  // API 端点
  config?: {
    apiKeyEnv?: string  // 环境变量名 (如 VITE_TRONGRID_API_KEY)
  }
}
```

**优先级**: 数组顺序从前到后，前一个失败会自动 fallback 到下一个

### 常见 Provider 类型

| 链类型 | Provider | 说明 |
|--------|----------|------|
| EVM | `ethwallet-v1` | ETH 钱包 API |
| EVM | `bscwallet-v1` | BSC 钱包 API |
| EVM | `blockscout-v1` | Blockscout 浏览器 |
| Tron | `tronwallet-v1` | Tron 钱包 API |
| Tron | `tron-rpc-pro` | TronGrid (需 API Key) |
| Bitcoin | `btcwallet-v1` | BTC 钱包 API (代理 blockbook) |
| BioForest | - | 直接连接 |

---

## 链类型分类

| 类型 | 链 | API 路径前缀 | 特点 |
|------|-----|-------------|------|
| **bioforest** | bfm, ccchain, pmchain | `/wallet/{chain}/` | 本地构建交易，支付密码 |
| **evm** | eth, bsc | `/wallet/eth/`, `/wallet/bsc/` | web3.js, ERC20/BEP20 |
| **bitcoin** | btc | `/wallet/btc/blockbook/` | UTXO 模型，blockbook 代理 |
| **tron** | tron | `/wallet/tron/` | tronweb, TRC20 |

---

## BioForest 链 API

**路径前缀**: `/wallet/{chain}/` (chain = bfm, ccchain, pmchain)

**特点**:
- 本地构建交易 (`bundleCore`)
- 支持支付密码 (`secondPublicKey`)
- 统一响应格式 `{ success, result }`

### API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/wallet/{chain}/address/balance` | 获取余额 |
| POST | `/wallet/{chain}/address/info` | 获取地址信息 (含 secondPublicKey) |
| POST | `/wallet/{chain}/address/asset` | 获取地址资产 |
| GET | `/wallet/{chain}/lastblock` | 获取最新区块 |
| POST | `/wallet/{chain}/block/query` | 根据高度查区块 |
| GET | `/wallet/{chain}/blockAveFee` | 获取平均手续费 |
| POST | `/wallet/{chain}/transactions/broadcast` | 广播交易 |
| POST | `/wallet/{chain}/transactions/query` | 查询已上链交易 |
| POST | `/wallet/{chain}/pendingTr` | 查询未上链交易 |
| POST | `/wallet/{chain}/assets` | 获取代币列表 |
| POST | `/wallet/{chain}/asset/details` | 获取代币详情 |

### 响应格式

```typescript
interface ApiResponse<T> {
  success: boolean
  result?: T
  message?: string
}
```

---

## EVM 兼容链 API

**路径前缀**: `/wallet/eth/`, `/wallet/bsc/`

**特点**:
- 使用 web3.js 签名
- 支持 ERC20/BEP20 合约
- EIP-1559 (maxFeePerGas, maxPriorityFeePerGas)

### API 端点 (以 ETH 为例)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/wallet/eth/balance` | 获取 ETH 余额 |
| POST | `/wallet/eth/balance/erc20` | 获取 ERC20 余额 |
| GET | `/wallet/eth/trans/count` | 获取 nonce |
| GET | `/wallet/eth/gasPrice` | 获取 gasPrice |
| GET | `/wallet/eth/baseGas` | 获取 gasLimit |
| POST | `/wallet/eth/trans/prep` | 交易预备信息 |
| POST | `/wallet/eth/trans/erc20/data` | 获取合约 data |
| POST | `/wallet/eth/trans/send` | 广播交易 |
| GET | `/wallet/eth/trans/query` | 查询交易 |
| POST | `/wallet/eth/trans/normal/history` | 普通交易历史 |
| POST | `/wallet/eth/trans/erc20/history` | ERC20 交易历史 |
| POST | `/wallet/eth/trans/pending` | 查询 pending 交易 |
| POST | `/wallet/eth/contract/tokens` | 代币列表 |
| POST | `/wallet/eth/contract/token/detail` | 代币详情 |
| POST | `/wallet/eth/account/balance/v2` | 批量查余额 |
| GET | `/wallet/eth/getChainId` | 获取 chainId |

### 关键约定

- `/wallet/{eth|bsc}/balance` 为 **GET** 请求，使用查询参数 `address`。
- `/wallet/{eth|bsc}/trans/erc20/history` 与 `/wallet/bsc/trans/bep20/history` **必须**携带 `contractaddress`，否则可能返回 `success:false`。
- 交易历史返回结构为 `{ success, result: { status, message, result: [] } }`，当 `status !== "1"` 或 `message === "NOTOK"` 视为上游失败，需要触发 fallback 并禁止缓存。
- `/wallet/{eth|bsc}/account/balance/v2` 返回 `{ success, result: [...] }`。

---

## 比特币 API

**路径前缀**: `/wallet/btc/blockbook/` (代理到 blockbook API)

**特点**:
- UTXO 模型
- 代理 blockbook API（POST 方式转发）
- 本地 PSBT 签名

### API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v2/address/{address}` | 地址信息 |
| GET | `/api/v2/utxo/{address}` | 获取 UTXO |
| GET | `/api/v2/tx/{txid}` | 交易详情 |
| GET | `/api/v2/sendtx/{hex}` | 广播交易 |
| GET | `/api/v2/estimatefee/{blocks}` | 费率估算 |

**注意**: Bitcoin API 使用代理模式，通过 POST 发送 `{ url, method }` 参数。

---

## 波场 API

**路径前缀**: `/wallet/tron/`

**特点**:
- 使用 tronweb
- 地址有 hex/base58 转换
- TRC20 合约
- **参考实现**: `/Users/kzf/Dev/bioforestChain/legacy-apps/libs/wallet-base/services/wallet/tron/tron.service.ts`

### API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/wallet/tron/balance` | 获取 TRX 余额 |
| POST | `/wallet/tron/balance/trc20` | 获取 TRC20 余额 |
| GET | `/wallet/tron/account` | 账户信息 |
| GET | `/wallet/tron/account/resource` | 账户资源 (带宽/能量) |
| POST | `/wallet/tron/trans/create` | 创建 TRX 交易 |
| POST | `/wallet/tron/trans/contract` | 创建 TRC20 交易 |
| POST | `/wallet/tron/trans/broadcast` | 广播 TRX 交易 |
| POST | `/wallet/tron/trans/trc20/broadcast` | 广播 TRC20 交易 |
| POST | `/wallet/tron/trans/common/history` | TRX 交易历史 |
| POST | `/wallet/tron/trans/trc20/history` | TRC20 交易历史（需要 `contract_address`） |
| POST | `/wallet/tron/trans/pending` | pending 交易 |
| POST | `/wallet/tron/trans/receipt` | 交易回执 |
| POST | `/wallet/tron/contract/tokens` | 代币列表 |
| POST | `/wallet/tron/contract/token/detail` | 代币详情 |
| POST | `/wallet/tron/account/balance/v2` | 批量查余额（`contracts` 必填数组） |

### 请求/响应约定 (TronWallet)

- **地址格式**:
  - `trans/*/history`, `trans/pending`: `address` 使用 Hex(`41...`)
  - `account/balance/v2`: `address` 使用 Base58 (T-address)
- **/wallet/tron/balance**
  - HTTP 方法: `GET` (query 参数 `address`)
  - 响应常见为字符串或数字 (TRX in SUN)
  - 兼容返回 `{ success, result }` 结构
- **/wallet/tron/account/balance/v2**
  - `contracts` 必填，必须是数组；省略会返回 `success:false` / 400
  - 返回 TRC20 余额列表 (数组或 `{ success, result }`)
- **/wallet/tron/trans/trc20/history**
  - 需要 `contract_address`，否则返回 `success:false` / PARAMETER ERROR
- **/wallet/tron/contract/tokens**
  - 返回 `{ success, result }` 包裹结构
  - `result.data[].address` 为 Hex 地址，使用前需转 Base58

### TronGrid API Key

`tron-rpc-pro` 支持在 `config.apiKeyEnv` 指定环境变量：

```json
{
  "type": "tron-rpc-pro",
  "endpoint": "https://api.trongrid.io",
  "config": {
    "apiKeyEnv": "VITE_TRONGRID_API_KEY"
  }
}
```

注入请求头: `TRON-PRO-API-KEY: {apiKey}`

---

## 相关文档

- [Driver Reference](../02-Driver-Ref/README.md) - 链适配器实现
- [Chain Networks](./02-Chain-Networks.md) - 链网络配置
