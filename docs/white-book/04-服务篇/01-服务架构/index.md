# 第十一章：服务架构

> 定义应用与区块链交互的架构模式

---

## 11.1 架构概述

BFM Pay 需要支持多条区块链，每条链有不同的协议和 API。服务层的职责是提供**统一的抽象接口**，屏蔽底层差异。

### 核心问题

| 问题 | 解决方案 |
|-----|---------|
| 链协议差异（EVM vs UTXO vs BFM） | 适配器模式 |
| 能力差异（有的链支持质押，有的不支持） | 可选接口 |
| 运行环境差异（Web vs DWEB） | 平台服务抽象 |
| 类型安全 | 强类型接口定义 |

---

## 11.2 分层架构

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer                              │
│               (页面、组件、用户交互)                       │
├─────────────────────────────────────────────────────────┤
│                  Application Layer                       │
│            (用例、业务逻辑、状态管理)                      │
├─────────────────────────────────────────────────────────┤
│                   Service Layer                          │  ← 本章重点
│        (统一接口、适配器注册、服务发现)                    │
├─────────────────────────────────────────────────────────┤
│                  Adapter Layer                           │
│      (EVM Adapter, BFM Adapter, Bitcoin Adapter...)     │
├─────────────────────────────────────────────────────────┤
│                  Provider Layer                          │
│              (RPC Client, REST API, SDK)                │
└─────────────────────────────────────────────────────────┘
```

### 层级职责

| 层级 | 职责 | 依赖方向 |
|-----|------|---------|
| UI Layer | 渲染界面、响应用户操作 | 向下 |
| Application Layer | 协调业务逻辑 | 向下 |
| Service Layer | 提供统一接口、管理适配器 | 向下 |
| Adapter Layer | 实现特定链的接口 | 向下 |
| Provider Layer | 与链节点/API 通信 | 外部 |

---

## 11.3 适配器模式

### 核心概念

```
┌─────────────────┐
│  IChainAdapter  │  ← 统一接口
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌───────┐
│  EVM  │ │  BFM  │  ← 具体实现
│Adapter│ │Adapter│
└───────┘ └───────┘
```

### 适配器接口

```
IChainAdapter {
  // 链标识
  chainId: string
  chainType: 'evm' | 'bfm' | 'utxo' | 'solana'
  
  // 必需服务
  identity: IIdentityService
  asset: IAssetService
  transaction: ITransactionService
  chain: IChainService
  
  // 可选服务（不支持时返回 null）
  staking: IStakingService | null
  nft: INFTService | null
  
  // 生命周期
  initialize(): Promise<void>
  dispose(): void
}
```

### 服务可选性

适配器 **MUST** 实现所有必需服务，**MAY** 实现可选服务：

| 服务 | EVM | BFM | Bitcoin |
|-----|-----|-----|---------|
| identity | ✓ | ✓ | ✓ |
| asset | ✓ | ✓ | ✓ |
| transaction | ✓ | ✓ | ✓ |
| chain | ✓ | ✓ | ✓ |
| staking | ✗ | ✓ | ✗ |
| nft | ✓ | ✗ | ✗ |

---

## 11.4 注册中心

### 职责

- 注册适配器
- 根据 chainId 查找适配器
- 管理适配器生命周期

### 接口定义

```
IAdapterRegistry {
  // 注册适配器工厂
  register(chainType: string, factory: AdapterFactory): void
  
  // 获取适配器（不存在则创建）
  getAdapter(chainId: string): IChainAdapter
  
  // 检查是否支持
  isSupported(chainId: string): boolean
  
  // 列出所有支持的链
  listSupported(): ChainInfo[]
  
  // 清理
  disposeAll(): void
}

type AdapterFactory = (chainConfig: ChainConfig) => IChainAdapter
```

### 使用模式

```
// 伪代码示例
registry = getAdapterRegistry()

// 获取 BFM 主网适配器
adapter = registry.getAdapter('bfm-mainnet')

// 使用服务
balance = await adapter.asset.getNativeBalance(address)

// 检查可选服务
if (adapter.staking != null) {
  stakingInfo = await adapter.staking.getStakingInfo(address)
}
```

---

## 11.5 服务发现

### 能力查询

应用层在使用服务前 **SHOULD** 检查能力：

```
// 检查链是否支持质押
function canStake(chainId: string): boolean {
  adapter = registry.getAdapter(chainId)
  return adapter.staking != null
}

// 根据能力显示/隐藏 UI
if (canStake(currentChain)) {
  showStakingButton()
}
```

### 功能降级

当可选功能不可用时，应用层 **MUST** 优雅降级：

| 场景 | 处理方式 |
|-----|---------|
| 质押服务不可用 | 隐藏质押入口 |
| NFT 服务不可用 | 隐藏 NFT 标签页 |
| 网络暂时不可用 | 显示缓存数据 + 提示 |

---

## 11.6 依赖注入

### 原则

- 服务通过接口引用，不直接依赖具体实现
- 适配器通过注册中心获取，不硬编码
- 测试时可替换为 Mock 实现

### 依赖图

```
┌─────────────┐     ┌─────────────────┐
│  TransferUseCase  │ ────► │ ITransactionService │
└─────────────┘     └─────────────────┘
       │                      ▲
       │                      │ implements
       ▼                      │
┌─────────────────┐    ┌─────────────────┐
│ IAdapterRegistry │ ──► │ EvmTxService    │
└─────────────────┘    └─────────────────┘
```

---

## 11.7 错误处理策略

### 错误传播

```
Provider Layer
      │ RpcError
      ▼
Adapter Layer
      │ → 转换为 ChainServiceError
      ▼
Service Layer
      │ → 添加上下文信息
      ▼
Application Layer
      │ → 决定重试/展示/上报
      ▼
UI Layer
      │ → 显示用户友好的错误信息
```

### 重试策略

| 错误类型 | 策略 |
|---------|-----|
| 网络超时 | 自动重试，最多 3 次，指数退避 |
| 节点限流 | 切换备用节点 |
| 交易 nonce 冲突 | 重新获取 nonce 后重试 |
| 余额不足 | 不重试，提示用户 |

---

## 11.8 缓存策略

### 缓存层级

| 层级 | 数据 | 有效期 |
|-----|------|-------|
| 内存缓存 | 链信息、代币元数据 | 应用生命周期 |
| 本地存储 | 交易历史、用户设置 | 持久化 |
| 无缓存 | 余额、nonce | 实时查询 |

### 缓存失效

| 事件 | 失效范围 |
|-----|---------|
| 发送交易成功 | 当前地址的余额 |
| 区块确认 | pending 交易状态 |
| 用户切换链 | 当前链的所有缓存 |

---

## 本章小结

- 服务层采用适配器模式支持多链
- 注册中心管理适配器的创建和查找
- 服务分为必需和可选两类
- 应用层通过能力查询实现功能降级
- 错误处理和缓存策略明确定义

---

## 下一章

继续阅读 [第十二章：链服务接口](../02-链服务/)。
