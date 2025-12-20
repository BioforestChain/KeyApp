# 链服务

> 定义与区块链交互的标准接口规范

---

## 概述

链服务层提供与区块链网络交互的统一抽象接口，屏蔽不同链的协议差异。

---

## 服务列表

| 服务 | 说明 | 必需性 |
|-----|------|-------|
| [IIdentityService](./IIdentityService) | 地址派生、消息签名 | MUST |
| [IAssetService](./IAssetService) | 资产余额查询 | MUST |
| [ITransactionService](./ITransactionService) | 交易构建、签名、广播 | MUST |
| [IChainService](./IChainService) | 链信息查询 | MUST |
| [IStakingService](./IStakingService) | 质押操作 | MAY |
| INFTService | NFT 资产查询 | MAY |

## 实现规范

| 文档 | 说明 |
|-----|------|
| [实现规范](./实现规范/) | 各链适配器的具体实现要求（BioForest/EVM/Tron/Bitcoin） |

---

## 接口设计原则

1. **异步优先**：所有涉及网络/计算的方法 **MUST** 返回 Promise
2. **错误明确**：失败时 **MUST** 抛出带有错误码的异常
3. **可取消**：长时间操作 **SHOULD** 支持 AbortSignal
4. **类型安全**：参数和返回值 **MUST** 有明确类型定义

---

## 事件订阅规范

所有 `subscribe*` 方法 **MUST** 遵循：

1. 返回 `Unsubscribe` 函数用于取消订阅
2. 立即调用一次 callback 返回当前状态
3. 状态变化时调用 callback
4. 网络错误时通过 callback 第二个参数传递错误

### 重连策略

| 场景 | 策略 |
|-----|------|
| 网络断开 | 指数退避重连（1s, 2s, 4s, 8s, max 30s） |
| 服务端错误 | 延迟 5s 后重试 |
| 认证失败 | 不重试，通知上层 |

---

## 错误处理规范

### 错误结构

```
ChainServiceError {
  code: string              // 机器可读错误码
  message: string           // 人类可读错误信息
  details?: object          // 额外错误详情
  cause?: Error             // 原始错误
}
```

### 错误分类

| 类别 | 前缀 | 处理策略 |
|-----|------|---------|
| 网络错误 | NETWORK_ | 可重试 |
| 验证错误 | VALIDATION_ | 不可重试，需用户修改输入 |
| 业务错误 | BUSINESS_ | 根据具体情况 |
| 系统错误 | SYSTEM_ | 记录日志，提示用户联系支持 |
