# Change: Bioforest 原生币转账落地

## Why
当前转账 UI 仍为 mock，无法与 BioforestTransactionService 真实交互，无法验证 mpay 的原有转账流程在新架构下是否可用。

## What Changes
- 将转账 UI 与 BioforestTransactionService 打通，支持 BFM/原生币真实转账。
- 增加密码确认流程以解密密钥并完成签名。
- 拉取真实余额与网络手续费并用于校验与展示。

## Impact
- Affected specs: wallet-transfer
- Affected code: src/hooks/use-send.ts, src/pages/send/index.tsx, src/services/chain-adapter/bioforest/*
