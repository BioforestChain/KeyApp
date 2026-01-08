# Wallet Store

> Source: [src/stores/wallet.ts](https://github.com/BioforestChain/KeyApp/blob/main/src/stores/wallet.ts) (788 行)

## 概览

`walletStore` 是应用最核心的状态管理，负责钱包、地址、代币的客户端状态。

---

## 状态结构

```typescript
interface WalletState {
  wallets: Wallet[];                    // 所有钱包
  currentWalletId: string | null;       // 当前选中的钱包
  selectedChain: ChainType;             // 当前选中的链
  chainPreferences: Record<string, ChainType>;  // 每个钱包的链偏好
  isLoading: boolean;
  isInitialized: boolean;
  migrationRequired: boolean;           // 需要数据迁移
}
```

---

## 核心类型

### Wallet

```typescript
interface Wallet {
  id: string;
  name: string;
  keyType?: 'mnemonic' | 'arbitrary';   // 密钥类型
  address: string;                       // 主地址
  chain: ChainType;                      // 主链
  chainAddresses: ChainAddress[];        // 多链地址
  encryptedMnemonic?: EncryptedData;     // 加密助记词
  encryptedWalletLock?: EncryptedData;   // 加密钱包锁
  createdAt: number;
  themeHue: number;                      // 主题色 (0-360)
  tokens: Token[];                       // @deprecated
}
```

### ChainAddress

```typescript
interface ChainAddress {
  chain: ChainType;
  address: string;
  publicKey: string;        // hex 编码
  tokens: Token[];          // 该链上的代币
}
```

### Token

```typescript
interface Token {
  id: string;
  symbol: string;
  name: string;
  balance: string;
  fiatValue: number;
  change24h: number;
  icon?: string;
  contractAddress?: string;
  decimals: number;
  chain: ChainType;
}
```

---

## Actions

### 初始化

```typescript
const walletActions = {
  // 从 IndexedDB 加载钱包
  initialize: async (): Promise<void>,
  
  // 重置状态
  reset: (): void,
}
```

### 钱包管理

```typescript
const walletActions = {
  // 创建钱包 (从助记词)
  createWallet: async (
    name: string,
    mnemonic: string,
    secret: string,
    chains: string[]
  ): Promise<Wallet>,
  
  // 导入钱包
  importWallet: async (
    name: string,
    mnemonic: string,
    secret: string,
    chains: string[]
  ): Promise<Wallet>,
  
  // 导入任意密钥 (BioForest)
  importArbitraryKey: async (
    name: string,
    arbitraryKey: string,
    secret: string,
    chains: string[]
  ): Promise<Wallet>,
  
  // 删除钱包
  deleteWallet: async (walletId: string): Promise<void>,
  
  // 重命名钱包
  renameWallet: async (walletId: string, newName: string): Promise<void>,
}
```

### 钱包选择

```typescript
const walletActions = {
  // 设置当前钱包
  setCurrentWallet: (walletId: string): void,
  
  // 设置当前链
  setSelectedChain: (chain: ChainType): void,
  
  // 设置钱包的链偏好
  setChainPreference: (walletId: string, chain: ChainType): void,
}
```

### 余额管理

```typescript
const walletActions = {
  // 刷新余额
  refreshBalance: async (walletId: string, chain: ChainType): Promise<void>,
  
  // 刷新所有链的余额
  refreshAllBalances: async (walletId: string): Promise<void>,
  
  // 更新代币余额
  updateTokenBalance: (
    walletId: string,
    chain: ChainType,
    tokenId: string,
    balance: string,
    fiatValue: number
  ): void,
}
```

### 链地址管理

```typescript
const walletActions = {
  // 添加链地址
  addChainAddress: async (
    walletId: string,
    chain: ChainType,
    secret: string
  ): Promise<ChainAddress>,
  
  // 移除链地址
  removeChainAddress: async (
    walletId: string,
    chain: ChainType
  ): Promise<void>,
  
  // 获取私钥
  getPrivateKey: async (
    walletId: string,
    chain: ChainType,
    secret: string
  ): Promise<Uint8Array>,
}
```

### 安全操作

```typescript
const walletActions = {
  // 验证密码
  verifySecret: async (secret: string): Promise<boolean>,
  
  // 获取助记词
  getMnemonic: async (walletId: string, secret: string): Promise<string>,
  
  // 更改密码
  changeSecret: async (
    oldSecret: string,
    newSecret: string
  ): Promise<void>,
}
```

---

## Selectors

```typescript
// 获取当前钱包
const getCurrentWallet = (state: WalletState): Wallet | null => {
  return state.wallets.find(w => w.id === state.currentWalletId) ?? null;
};

// 获取当前链地址
const getCurrentChainAddress = (state: WalletState): ChainAddress | null => {
  const wallet = getCurrentWallet(state);
  return wallet?.chainAddresses.find(ca => ca.chain === state.selectedChain) ?? null;
};

// 获取总余额 (法币)
const getTotalFiatBalance = (state: WalletState): number => {
  const wallet = getCurrentWallet(state);
  if (!wallet) return 0;
  
  return wallet.chainAddresses.reduce((total, ca) => {
    return total + ca.tokens.reduce((sum, t) => sum + t.fiatValue, 0);
  }, 0);
};
```

---

## 使用示例

```typescript
import { useStore } from '@tanstack/react-store';
import { walletStore, walletActions } from '@/stores';

function WalletOverview() {
  // 订阅必要的状态
  const currentWalletId = useStore(walletStore, s => s.currentWalletId);
  const wallets = useStore(walletStore, s => s.wallets);
  const selectedChain = useStore(walletStore, s => s.selectedChain);
  
  const currentWallet = wallets.find(w => w.id === currentWalletId);
  const chainAddress = currentWallet?.chainAddresses.find(
    ca => ca.chain === selectedChain
  );
  
  // 切换钱包
  const handleWalletChange = (walletId: string) => {
    walletActions.setCurrentWallet(walletId);
  };
  
  // 切换链
  const handleChainChange = (chain: string) => {
    walletActions.setSelectedChain(chain);
    if (currentWalletId) {
      walletActions.setChainPreference(currentWalletId, chain);
    }
  };
  
  // 刷新余额
  const handleRefresh = async () => {
    if (currentWalletId && selectedChain) {
      await walletActions.refreshBalance(currentWalletId, selectedChain);
    }
  };
}
```

---

## 持久化

Store 通过 `wallet-storage` 服务实现持久化：

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│ walletStore │────▶│ walletActions    │────▶│ IndexedDB   │
│  (内存)     │◀────│ (read/write)     │◀────│ (持久化)    │
└─────────────┘     └──────────────────┘     └─────────────┘
```

---

## 主题色派生

```typescript
// 基于助记词派生稳定的主题色
function deriveThemeHue(secret: string): number {
  let hash = 0;
  for (let i = 0; i < secret.length; i++) {
    const char = secret.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash) % 360;
}

// 使用
const themeHue = deriveThemeHue(mnemonic);
// 结果: 0-360 的色相值
```

---

## 相关文档

- [Wallet Storage Service](../../06-Service-Ref/02-Wallet/01-Storage.md)
- [Balance Query](../03-Queries/01-Balance-Query.md)
- [Chain Config Store](./02-ChainConfig-Store.md)
