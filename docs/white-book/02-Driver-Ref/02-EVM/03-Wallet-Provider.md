# EVM Wallet Provider (ethwallet / bscwallet)

> **Code Source**:
> - `src/services/chain-adapter/providers/ethwallet-provider.effect.ts`
> - `src/services/chain-adapter/providers/bscwallet-provider.effect.ts`

## Overview

`ethwallet-v1` 与 `bscwallet-v1` 是基于 walletapi 的 EVM Indexer Provider。
它们负责：

- **交易列表**：原生交易 + 代币交易混合输出
- **余额/资产**：依赖交易列表变化触发刷新，减少无效请求
- **缓存策略**：使用 `httpFetchCached` 的 TTL 策略避免重复请求

## API Endpoints (walletapi)

### Ethereum (`ethwallet-v1`)

- 交易列表（原生）：`/wallet/eth/trans/normal/history`
- 交易列表（ERC20）：`/wallet/eth/trans/erc20/history`
- 余额（原生）：`/wallet/eth/balance`
- 余额（代币）：`/wallet/eth/account/balance/v2`
- 代币列表：`/wallet/eth/contract/tokens`

### BSC (`bscwallet-v1`)

- 交易列表（原生）：`/wallet/bsc/trans/normal/history`
- 交易列表（BEP20）：`/wallet/bsc/trans/bep20/history`
- 余额（原生）：`/wallet/bsc/balance`
- 余额（代币）：`/wallet/bsc/account/balance/v2`
- 代币列表：`/wallet/bsc/contract/tokens`

## Behavior Notes

1. **交易列表混合**  
   原生/代币交易各自独立轮询，每个 contract 变化都会触发合并输出，避免等待全量返回。

2. **余额刷新策略**  
   余额请求仅在交易列表发生变化时触发；通过 TTL 复用缓存减少重复请求。

3. **异常处理**  
   `success: true + message: NOTOK` 会触发错误路径，避免缓存无效结果；  
   `No transactions found` 视为正常空结果。

## Configuration

在 `public/configs/default-chains.json` 中配置：

```json
{
  "type": "ethwallet-v1",
  "endpoint": "https://walletapi.bfmeta.info/wallet/eth"
}
```

或：

```json
{
  "type": "bscwallet-v1",
  "endpoint": "https://walletapi.bfmeta.info/wallet/bsc"
}
```
