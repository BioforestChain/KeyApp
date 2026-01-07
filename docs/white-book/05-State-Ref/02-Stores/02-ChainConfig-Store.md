# ChainConfig Store

> Source: [src/stores/chain-config.ts](https://github.com/BioforestChain/KeyApp/blob/main/src/stores/chain-config.ts)

## 概览

`chainConfigStore` 管理区块链网络配置，支持内置链和自定义链。

---

## 状态结构

```typescript
interface ChainConfigState {
  snapshot: ChainConfigSnapshot | null;
  isLoading: boolean;
  error: string | null;
  migrationRequired: boolean;
}

interface ChainConfigSnapshot {
  configs: ChainConfig[];
  enabledChains: string[];
  subscription: ChainConfigSubscription | null;
  warnings: ChainConfigWarning[];
}
```

---

## ChainConfig 类型

```typescript
interface ChainConfig {
  id: string;                    // 唯一标识 (如 'ethereum', 'bsc')
  name: string;                  // 显示名称
  symbol: string;                // 原生代币符号
  decimals: number;              // 小数位数
  chainKind: ChainKind;          // 链类型
  
  // 网络配置
  rpcUrl?: string;
  explorerUrl?: string;
  
  // 图标
  icon?: string;
  
  // BioForest 特有
  prefix?: string;               // 地址前缀
  
  // 状态
  isEnabled: boolean;
  isCustom: boolean;
}

type ChainKind = 'bioforest' | 'evm' | 'bitcoin' | 'tron' | 'custom';
```

---

## Actions

### 初始化

```typescript
const chainConfigActions = {
  initialize: async (): Promise<void> => {
    const currentState = chainConfigStore.state;
    if (currentState.isLoading || currentState.snapshot) return;
    
    await runAndUpdate(async () => initializeService());
  },
}
```

### 订阅管理

```typescript
const chainConfigActions = {
  // 设置远程订阅 URL
  setSubscriptionUrl: async (url: string): Promise<void> => {
    const snapshot = await setSubscriptionUrl(url);
    
    if (url !== 'default') {
      // 刷新订阅内容
      const { result, snapshot: refreshedSnapshot } = await refreshSubscription();
      // 处理结果...
    }
  },
  
  // 刷新订阅
  refreshSubscription: async (): Promise<void>,
}
```

### 链管理

```typescript
const chainConfigActions = {
  // 启用/禁用链
  setChainEnabled: async (chainId: string, enabled: boolean): Promise<void> => {
    const snapshot = await setChainEnabled(chainId, enabled);
    chainConfigStore.setState(s => ({ ...s, snapshot }));
  },
  
  // 添加自定义链
  addManualConfig: async (config: ChainConfig): Promise<void> => {
    const snapshot = await addManualConfig(config);
    chainConfigStore.setState(s => ({ ...s, snapshot }));
  },
}
```

---

## Selectors

```typescript
// 获取所有启用的链
function getEnabledChains(state: ChainConfigState): ChainConfig[] {
  if (!state.snapshot) return [];
  return state.snapshot.configs.filter(c => 
    state.snapshot.enabledChains.includes(c.id)
  );
}

// 按 ID 获取链配置
function getChainById(state: ChainConfigState, chainId: string): ChainConfig | null {
  return state.snapshot?.configs.find(c => c.id === chainId) ?? null;
}

// 按类型分组
function getChainsByKind(state: ChainConfigState): Map<ChainKind, ChainConfig[]> {
  const grouped = new Map<ChainKind, ChainConfig[]>();
  state.snapshot?.configs.forEach(config => {
    const kind = config.chainKind;
    if (!grouped.has(kind)) grouped.set(kind, []);
    grouped.get(kind)!.push(config);
  });
  return grouped;
}
```

---

## 内置链配置

```typescript
const BUILTIN_CHAINS: ChainConfig[] = [
  // BioForest
  {
    id: 'bioforest-mainnet',
    name: 'BioForest Mainnet',
    symbol: 'BFM',
    decimals: 8,
    chainKind: 'bioforest',
    prefix: 'b',
    isEnabled: true,
    isCustom: false,
  },
  
  // EVM
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    chainKind: 'evm',
    rpcUrl: 'https://eth.llamarpc.com',
    explorerUrl: 'https://etherscan.io',
    isEnabled: true,
    isCustom: false,
  },
  {
    id: 'bsc',
    name: 'BNB Smart Chain',
    symbol: 'BNB',
    decimals: 18,
    chainKind: 'evm',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    isEnabled: true,
    isCustom: false,
  },
  
  // Bitcoin
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 8,
    chainKind: 'bitcoin',
    explorerUrl: 'https://mempool.space',
    isEnabled: true,
    isCustom: false,
  },
  
  // Tron
  {
    id: 'tron',
    name: 'Tron',
    symbol: 'TRX',
    decimals: 6,
    chainKind: 'tron',
    explorerUrl: 'https://tronscan.org',
    isEnabled: true,
    isCustom: false,
  },
];
```

---

## 订阅机制

支持从远程 URL 同步链配置:

```typescript
interface ChainConfigSubscription {
  url: string;
  lastUpdated: number;
  autoRefresh: boolean;
  refreshInterval: number;  // 毫秒
}

// 订阅 URL 格式
// https://example.com/chain-config.json
// 返回 ChainConfig[] 数组
```

---

## 使用示例

### 获取链列表

```tsx
import { useStore } from '@tanstack/react-store';
import { chainConfigStore, chainConfigActions } from '@/stores';

function ChainList() {
  const snapshot = useStore(chainConfigStore, s => s.snapshot);
  const enabledChains = snapshot?.configs.filter(c => 
    snapshot.enabledChains.includes(c.id)
  ) ?? [];
  
  return (
    <ul>
      {enabledChains.map(chain => (
        <li key={chain.id}>
          <ChainIcon chainId={chain.id} />
          {chain.name}
        </li>
      ))}
    </ul>
  );
}
```

### 切换链启用状态

```tsx
function ChainToggle({ chainId }: Props) {
  const snapshot = useStore(chainConfigStore, s => s.snapshot);
  const isEnabled = snapshot?.enabledChains.includes(chainId) ?? false;
  
  const handleToggle = async () => {
    await chainConfigActions.setChainEnabled(chainId, !isEnabled);
  };
  
  return (
    <Switch checked={isEnabled} onCheckedChange={handleToggle} />
  );
}
```

---

## 数据持久化

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│chainConfigStore │────▶│chainConfigService│────▶│ IndexedDB   │
│    (内存)       │◀────│  (read/write)    │◀────│ (持久化)    │
└─────────────────┘     └──────────────────┘     └─────────────┘
```

---

## 相关文档

- [Chain Config Service](../../06-Service-Ref/03-Chain/07-Config.md)
- [Chain Adapter](../../06-Service-Ref/03-Chain/01-Adapter.md)
- [Wallet Store](./01-Wallet-Store.md)
