# 第十一章：服务架构

> 定义服务分层和 Adapter 模式

---

## 11.1 设计原则

### 核心理念

钱包应用的本质是**数字资产的管理界面**，其核心流程：

```
用户意图 → 密钥签名 → 链上执行 → 状态同步 → 界面反馈
```

### 设计目标

| 目标 | 说明 |
|-----|------|
| **模块化** | 功能按领域划分，适配器可选择性实现 |
| **强类型安全** | 编译时验证，重构时自动追踪 |
| **链特性保留** | 不抹杀链的独特能力 |
| **平台无关** | Web/DWEB 使用相同的业务逻辑 |

---

## 11.2 架构分层

```
┌──────────────────────────────────────────────────────────────┐
│                      UI Layer (React)                         │
│               Stackflow + Query + Store                       │
├──────────────────────────────────────────────────────────────┤
│                    Service Hooks                              │
│              useAssetService() / useTransfer()                │
├──────────────────────────────────────────────────────────────┤
│                   Adapter Registry                            │
│              按 ChainId 注册/获取 Adapter                      │
├──────────────────────────────────────────────────────────────┤
│                    Chain Adapter                              │
│         通过 getter 暴露各 Service (null = 不支持)             │
├──────────────────────────────────────────────────────────────┤
│                  Service Modules                              │
│    IAssetService | ITransactionService | IStakingService      │
├──────────────────────────────────────────────────────────────┤
│                   Provider Layer                              │
│          viem | tronweb | @noble/* | REST APIs               │
└──────────────────────────────────────────────────────────────┘
```

---

## 11.3 Chain Adapter 模式

### 接口定义

```typescript
// src/services/adapter/types.ts
export interface IChainAdapter {
  readonly metadata: AdapterMetadata
  
  // 核心服务
  readonly identity: IIdentityService | null
  readonly asset: IAssetService | null
  readonly transaction: ITransactionService | null
  readonly chain: IChainService | null
  
  // 可选扩展
  readonly staking: IStakingService | null
  readonly nft: INFTService | null
  readonly defi: IDeFiService | null
  
  // 生命周期
  initialize(): Promise<void>
  destroy(): Promise<void>
  healthCheck(): Promise<{ healthy: boolean; latency?: number }>
}
```

### 类型安全的服务获取

```typescript
// ✅ 强类型：编译器知道返回类型
const assetService: IAssetService | null = adapter.asset

// ✅ 类型收窄：if 检查后类型安全
if (assetService) {
  const balance = await assetService.getNativeBalance({ address })
}

// ❌ 弱类型（避免）
service as unknown as IAssetService  // 危险的类型断言
```

### 基类实现

```typescript
// src/services/adapter/base-adapter.ts
export abstract class BaseAdapter implements IChainAdapter {
  abstract readonly metadata: AdapterMetadata
  
  // 默认都返回 null（不支持）
  get identity(): IIdentityService | null { return null }
  get asset(): IAssetService | null { return null }
  get transaction(): ITransactionService | null { return null }
  get chain(): IChainService | null { return null }
  get staking(): IStakingService | null { return null }
  get nft(): INFTService | null { return null }
  get defi(): IDeFiService | null { return null }
  
  abstract initialize(): Promise<void>
  abstract destroy(): Promise<void>
  abstract healthCheck(): Promise<{ healthy: boolean; latency?: number }>
}
```

---

## 11.4 Adapter Registry

### 注册表设计

```typescript
// src/services/registry.ts
class AdapterRegistry {
  private adapters = new Map<ChainId, IChainAdapter>()
  
  // 注册适配器
  register(adapter: IChainAdapter): void {
    const { chainId } = adapter.metadata
    if (this.adapters.has(chainId)) {
      throw new Error(`Adapter for ${chainId} already registered`)
    }
    this.adapters.set(chainId, adapter)
  }
  
  // 获取适配器
  get(chainId: ChainId): IChainAdapter | undefined {
    return this.adapters.get(chainId)
  }
  
  // 获取特定服务
  getService<K extends ServiceKey>(
    chainId: ChainId,
    serviceKey: K
  ): ServiceType<K> | null {
    const adapter = this.get(chainId)
    if (!adapter) return null
    return adapter[serviceKey] as ServiceType<K> | null
  }
  
  // 查找支持特定服务的所有链
  findChainsWithService(serviceKey: ServiceKey): ChainId[] {
    const result: ChainId[] = []
    for (const [chainId, adapter] of this.adapters) {
      if (adapter[serviceKey] !== null) {
        result.push(chainId)
      }
    }
    return result
  }
}

export const adapterRegistry = new AdapterRegistry()
```

### 初始化注册

```typescript
// src/services/init.ts
import { adapterRegistry } from './registry'
import { EvmAdapter } from './adapters/evm'
import { TronAdapter } from './adapters/tron'
import { BioforestAdapter } from './adapters/bioforest'

export async function initializeServices() {
  // 注册 EVM 链
  adapterRegistry.register(new EvmAdapter({
    chainId: ChainId('ethereum'),
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/...',
  }))
  
  adapterRegistry.register(new EvmAdapter({
    chainId: ChainId('bsc'),
    rpcUrl: 'https://bsc-dataseed.binance.org/',
  }))
  
  // 注册 Tron
  adapterRegistry.register(new TronAdapter({
    chainId: ChainId('tron'),
    fullHost: 'https://api.trongrid.io',
  }))
  
  // 注册 BioForest 链
  adapterRegistry.register(new BioforestAdapter({
    chainId: ChainId('bfmeta'),
    apiUrl: 'https://api.bfmeta.org',
  }))
  
  // 初始化所有适配器
  await Promise.all(
    Array.from(adapterRegistry.getAll()).map(
      adapter => adapter.initialize()
    )
  )
}
```

---

## 11.5 具体 Adapter 实现

### EVM Adapter

```typescript
// src/services/adapters/evm/evm-adapter.ts
import { createPublicClient, http } from 'viem'
import { BaseAdapter } from '../../adapter/base-adapter'

export class EvmAdapter extends BaseAdapter {
  readonly metadata: AdapterMetadata
  private publicClient: PublicClient
  
  // 服务实例（惰性初始化）
  private _identity?: EvmIdentityService
  private _asset?: EvmAssetService
  private _transaction?: EvmTransactionService
  
  constructor(private config: EvmAdapterConfig) {
    super()
    this.metadata = {
      id: `evm-${config.chainId}`,
      chainId: config.chainId,
      name: config.name ?? 'EVM Chain',
      version: '1.0.0',
    }
    this.publicClient = createPublicClient({
      transport: http(config.rpcUrl),
    })
  }
  
  // 服务 Getters
  override get identity(): EvmIdentityService {
    return this._identity ??= new EvmIdentityService()
  }
  
  override get asset(): EvmAssetService {
    return this._asset ??= new EvmAssetService(this.publicClient)
  }
  
  override get transaction(): EvmTransactionService {
    return this._transaction ??= new EvmTransactionService(this.publicClient)
  }
  
  // EVM 支持 DeFi
  override get defi(): EvmDeFiService {
    return new EvmDeFiService(this.publicClient)
  }
  
  async initialize(): Promise<void> {
    await this.publicClient.getBlockNumber()
  }
  
  async destroy(): Promise<void> {
    // 清理资源
  }
  
  async healthCheck() {
    const start = Date.now()
    try {
      await this.publicClient.getBlockNumber()
      return { healthy: true, latency: Date.now() - start }
    } catch {
      return { healthy: false }
    }
  }
}
```

### BioForest Adapter

```typescript
// src/services/adapters/bioforest/bioforest-adapter.ts
export class BioforestAdapter extends BaseAdapter {
  readonly metadata: AdapterMetadata
  
  constructor(private config: BioforestAdapterConfig) {
    super()
    this.metadata = {
      id: `bioforest-${config.chainId}`,
      chainId: config.chainId,
      name: config.name ?? 'BioForest Chain',
      version: '1.0.0',
    }
  }
  
  override get identity(): BioforestIdentityService {
    return new BioforestIdentityService()
  }
  
  override get asset(): BioforestAssetService {
    return new BioforestAssetService(this.config.apiUrl)
  }
  
  override get transaction(): BioforestTransactionService {
    return new BioforestTransactionService(this.config.apiUrl)
  }
  
  // BioForest 支持质押
  override get staking(): BioforestStakingService {
    return new BioforestStakingService(this.config.apiUrl)
  }
  
  async initialize(): Promise<void> {
    // 检查 API 连通性
  }
  
  async destroy(): Promise<void> {}
  
  async healthCheck() {
    return { healthy: true }
  }
}
```

---

## 11.6 Service Hooks

### 类型安全的 Hooks

```typescript
// src/services/hooks.ts
import { useMemo } from 'react'
import { useStore } from '@tanstack/react-store'
import { walletStore } from '@/stores/wallet'
import { adapterRegistry } from './registry'

// 获取当前链的服务
export function useService<K extends ServiceKey>(serviceKey: K) {
  const chainId = useStore(walletStore, (s) => s.selectedChain)
  
  return useMemo(() => {
    if (!chainId) return null
    return adapterRegistry.getService(chainId, serviceKey)
  }, [chainId, serviceKey])
}

// 检查服务是否可用
export function useServiceAvailable(serviceKey: ServiceKey): boolean {
  const service = useService(serviceKey)
  return service !== null
}

// 获取资产服务
export function useAssetService() {
  return useService('asset')
}

// 获取交易服务
export function useTransactionService() {
  return useService('transaction')
}
```

### 服务门控组件

```typescript
// src/components/common/service-gate.tsx
interface ServiceGateProps {
  requires: ServiceKey[]
  children: ReactNode
  fallback?: ReactNode
}

export function ServiceGate({ requires, children, fallback }: ServiceGateProps) {
  const chainId = useStore(walletStore, (s) => s.selectedChain)
  
  const available = useMemo(() => {
    if (!chainId) return false
    return requires.every(key => 
      adapterRegistry.getService(chainId, key) !== null
    )
  }, [chainId, requires])
  
  if (!available) {
    return <>{fallback ?? <UnavailableMessage />}</>
  }
  
  return <>{children}</>
}

// 使用示例
<ServiceGate requires={['staking']} fallback={<NotSupported />}>
  <StakingPanel />
</ServiceGate>
```

---

## 11.7 目录结构

```
src/services/
├── types/                      # 类型定义
│   ├── core.ts                 # ChainId, Address 等
│   ├── asset.ts                # 资产相关类型
│   ├── transaction.ts          # 交易相关类型
│   └── index.ts
│
├── adapter/                    # Adapter 核心
│   ├── types.ts                # IChainAdapter 接口
│   ├── base-adapter.ts         # 基类
│   └── index.ts
│
├── adapters/                   # 具体实现
│   ├── evm/
│   │   ├── evm-adapter.ts
│   │   └── services/
│   ├── tron/
│   │   └── tron-adapter.ts
│   └── bioforest/
│       └── bioforest-adapter.ts
│
├── platform/                   # 平台服务
│   ├── biometric/
│   ├── storage/
│   └── clipboard/
│
├── registry.ts                 # 适配器注册表
├── hooks.ts                    # React Hooks
└── index.ts
```

---

## 本章小结

- Adapter 模式统一多链交互接口
- 服务通过 getter 暴露，null 表示不支持
- Registry 管理所有适配器实例
- Service Hooks 提供类型安全的访问方式
- ServiceGate 组件实现服务门控

---

## 下一章

继续阅读 [第十二章：链服务接口](../02-链服务接口/)，了解具体的服务接口定义。
