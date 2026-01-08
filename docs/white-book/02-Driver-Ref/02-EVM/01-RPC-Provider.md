# 01. EVM RPC Provider

Code: `src/services/chain-adapter/providers/evm-rpc-provider.ts`

基于标准 JSON-RPC 规范实现的通用驱动。

## 支持能力
*   ✅ `getNativeBalance`: 使用 `eth_getBalance`
*   ✅ `getBlockHeight`: 使用 `eth_blockNumber`
*   ❌ `getTransactionHistory`: 标准 RPC 不支持高效的历史查询 (需要 Indexer)

## 典型配置
```json
{
  "type": "ethereum-rpc",
  "endpoint": "https://ethereum-rpc.publicnode.com"
}
```

## 实现细节
该 Provider 主要作为 **Fallback** 使用。当 Etherscan 或 Indexer 不可用时，它能保证用户至少能看到余额，虽然看不到交易记录。
