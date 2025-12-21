# Change: Bioforest 交易历史接入

## Why
交易历史目前依赖 mock 数据，无法展示真实 Bioforest 交易记录，也无法验证 mpay 迁移后的历史查询链路。

## What Changes
- 在 TransactionService 中接入 BioforestTransactionService.getTransactionHistory。
- 基于 chain-config + wallet 地址，拉取真实记录并映射到 UI 结构。
- 历史筛选支持启用中的 Bioforest 链。

## Impact
- Affected specs: transaction-history
- Affected code: src/services/transaction/web.ts, src/pages/history/index.tsx, src/pages/history/detail.tsx
