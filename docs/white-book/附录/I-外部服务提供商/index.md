# 附录 I：外部服务提供商

> bnqkl_wallet 后端 API 文档

---

## 概述

本文档描述 `walletapi.bfmeta.info` 后端提供的 API 接口。不同链类型有完全不同的 API 模式。

**参考实现**: `/Users/kzf/Dev/bioforestChain/legacy-apps/libs/wallet-base/services/wallet/`

---

## KeyApp 配置与 Provider（重要）

KeyApp 的链配置（`public/configs/*.json`）使用有序数组 `apis[]` 描述外部 Provider。

- 字段：`{ type, endpoint, config? }`
- 顺序：**从前到后**为优先级，前一个失败会自动 fallback 到下一个
- 破坏性变更：历史的 `api`（对象/字典）已废弃，统一使用 `apis[]`

常见 Provider 类型（示例）：

- EVM：`blockscout-v1` / `*-rpc` / `ethwallet-v1` / `bscwallet-v1`
- Tron：`tron-rpc` / `tron-rpc-pro` / `tronwallet-v1`
- Bitcoin：`mempool-v1` / `btcwallet-v1`

TronGrid Key：

- `tron-rpc-pro` 支持在 `config.apiKeyEnv` 指定环境变量（如 `VITE_TRONGRID_API_KEY`），用于注入请求头 `TRON-PRO-API-KEY`

---

## 链类型分类

| 类型 | 链 | API 路径前缀 | 特点 |
|-----|-----|-------------|------|
| **bioforest** | bfm, ccchain, pmchain | `/wallet/{chain}/` | 本地构建交易，支付密码 |
| **evm** | eth, bsc | `/wallet/eth/`, `/wallet/bsc/` | web3.js, ERC20/BEP20 |
| **bitcoin** | btc | `/wallet/btc/blockbook/` | UTXO 模型，blockbook 代理 |
| **tron** | tron | `/wallet/tron/` | tronweb, TRC20 |

---

## 目录结构

```
src/apis/
├── bnqkl_wallet/                # 本恩奇科技钱包后端
│   ├── index.ts                 # 统一导出
│   ├── client.ts                # 基础 HTTP 客户端
│   ├── bioforest/               # 生物链林系列 (bfm, ccchain, pmchain)
│   │   ├── index.ts
│   │   ├── api.ts               # API 方法
│   │   └── types.ts             # 类型定义
│   ├── evm/                     # EVM 兼容链 (eth, bsc)
│   │   ├── index.ts
│   │   ├── api.ts
│   │   └── types.ts
│   ├── bitcoin/                 # 比特币 (blockbook 代理)
│   │   ├── index.ts
│   │   ├── api.ts
│   │   └── types.ts
│   └── tron/                    # 波场
│       ├── index.ts
│       ├── api.ts
│       └── types.ts
└── index.ts                     # 全局导出
```

---

## 一、BioForest 链 (bioforest)

**路径前缀**: `/wallet/{chain}/`（chain = bfm, ccchain, pmchain）

**参考**: `bfmeta.service.ts`, `bioforest-chain.base.ts`

**特点**:
- 本地构建交易 (`bundleCore`)
- 支持支付密码 (`secondPublicKey`)
- 统一响应格式 `{ success, result }`

### API 端点

| 方法 | 路径 | 说明 |
|-----|------|------|
| POST | `/wallet/{chain}/address/balance` | 获取余额 |
| POST | `/wallet/{chain}/address/info` | 获取地址信息（含 secondPublicKey） |
| POST | `/wallet/{chain}/address/asset` | 获取地址资产 |
| GET | `/wallet/{chain}/lastblock` | 获取最新区块 |
| POST | `/wallet/{chain}/block/query` | 根据高度查区块 |
| GET | `/wallet/{chain}/blockAveFee` | 获取平均手续费 |
| POST | `/wallet/{chain}/transactions/broadcast` | 广播交易 |
| POST | `/wallet/{chain}/transactions/query` | 查询已上链交易 |
| POST | `/wallet/{chain}/pendingTr` | 查询未上链交易 |
| POST | `/wallet/{chain}/assets` | 获取代币列表 |
| POST | `/wallet/{chain}/asset/details` | 获取代币详情 |

---

## 二、EVM 兼容链 (evm)

**路径前缀**: `/wallet/eth/`, `/wallet/bsc/`

**参考**: `ethereum.service.ts`, `binance.service.ts`

**特点**:
- 使用 web3.js 签名
- 支持 ERC20/BEP20 合约
- EIP-1559 (maxFeePerGas, maxPriorityFeePerGas)

### API 端点 (以 ETH 为例)

| 方法 | 路径 | 说明 |
|-----|------|------|
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

KeyApp Provider 对应关系：

- `ethwallet-v1` 以 `/wallet/eth/*` 为前缀
- `bscwallet-v1` 以 `/wallet/bsc/*` 为前缀

---

## 三、比特币 (bitcoin)

**路径前缀**: `/wallet/btc/blockbook/`（代理到 blockbook API）

**参考**: `bitcoin.service.ts`

**特点**:
- UTXO 模型
- 代理 blockbook API
- 本地 PSBT 签名

### API 端点

| 方法 | 路径 | 说明 |
|-----|------|------|
| GET | `/wallet/btc/blockbook` + `/api/v2/address/{address}` | 地址信息 |
| GET | `/wallet/btc/blockbook` + `/api/v2/utxo/{address}` | 获取 UTXO |
| GET | `/wallet/btc/blockbook` + `/api/v2/tx/{txid}` | 交易详情 |
| GET | `/wallet/btc/blockbook` + `/api/v2/sendtx/{hex}` | 广播交易 |
| GET | `/wallet/btc/blockbook` + `/api/v2/estimatefee/{blocks}` | 费率估算 |

**注意**: Bitcoin API 使用代理模式，通过 POST 发送 `{ url, method }` 参数。

KeyApp Provider 对应关系：

- `btcwallet-v1` 对应 `/wallet/btc/blockbook`（代理 blockbook）

---

## 四、波场 (tron)

**路径前缀**: `/wallet/tron/`

**参考**: `tron.service.ts`

**特点**:
- 使用 tronweb
- 地址有 hex/base58 转换
- TRC20 合约

### API 端点

| 方法 | 路径 | 说明 |
|-----|------|------|
| GET | `/wallet/tron/balance` | 获取 TRX 余额 |
| POST | `/wallet/tron/balance/trc20` | 获取 TRC20 余额 |
| GET | `/wallet/tron/account` | 账户信息 |
| GET | `/wallet/tron/account/resource` | 账户资源（带宽/能量） |
| POST | `/wallet/tron/trans/create` | 创建 TRX 交易 |
| POST | `/wallet/tron/trans/contract` | 创建 TRC20 交易 |
| POST | `/wallet/tron/trans/broadcast` | 广播 TRX 交易 |
| POST | `/wallet/tron/trans/trc20/broadcast` | 广播 TRC20 交易 |
| POST | `/wallet/tron/trans/common/history` | TRX 交易历史 |
| POST | `/wallet/tron/trans/trc20/history` | TRC20 交易历史 |
| POST | `/wallet/tron/trans/pending` | pending 交易 |
| POST | `/wallet/tron/trans/receipt` | 交易回执 |
| POST | `/wallet/tron/contract/tokens` | 代币列表 |
| POST | `/wallet/tron/contract/token/detail` | 代币详情 |
| POST | `/wallet/tron/account/balance/v2` | 批量查余额 |

KeyApp Provider 对应关系：

- `tronwallet-v1` 以 `/wallet/tron/*` 为前缀

---

## 响应格式

### BioForest 链

```typescript
interface ApiResponse<T> {
  success: boolean
  result?: T
  message?: string
}
```

### EVM / Tron

直接返回数据，错误通过 HTTP 状态码处理。

### Bitcoin (blockbook)

直接返回 blockbook 原始格式：

```typescript
interface BlockbookAddress {
  address: string
  balance: string
  txs: number
  transactions?: Transaction[]
}
```

---

## 下一步

1. 审阅此文档
2. 确认设计方案
3. 开始实现 `src/apis/bnqkl_wallet/` 模块
