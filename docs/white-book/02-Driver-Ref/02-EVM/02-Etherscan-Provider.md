# 02. Etherscan Provider

Code: `src/services/chain-adapter/providers/etherscan-provider.ts`

适配 Etherscan V2 API 及其兼容实现 (如 Blockscout)。

## 支持能力
*   ✅ `getNativeBalance`
*   ✅ `getTransactionHistory`: 聚合 `txlist` (原生) 和 `tokentx` (ERC20)
*   ✅ `getTokenBalances`: (部分支持)

## 聚合逻辑
Etherscan 将原生交易和代币交易分开返回。驱动层负责将它们聚合：
1.  并行请求 `txlist` 和 `tokentx`。
2.  按 `hash` 进行分组。
3.  如果一个 `hash` 同时存在于两者，合并为一个 `Transaction` 对象，并在 `assets` 数组中包含原生资产和代币资产。
4.  按时间戳降序排列。

## API Key 管理
支持轮询多个 API Key，并自动处理限流 (429) 错误。
