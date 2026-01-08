# Hooks 完整列表

> 源码: [`src/hooks/`](https://github.com/BioforestChain/KeyApp/blob/main/src/hooks/)

## Hooks 统计

| 类别 | 数量 | 说明 |
|------|------|------|
| 转账相关 | 7 | useSend 系列 |
| 资产相关 | 2 | useAssets, usePriceService |
| 汇率相关 | 1 | useExchangeRate |
| 钱包相关 | 4 | 地址生成、主题、图标 |
| 安全相关 | 2 | 密码、助记词验证 |
| 工具类 | 3 | 卡片交互、遮罩、重复检测 |

---

## 核心 Hooks

### useSend

转账流程状态管理。

```typescript
interface UseSendOptions {
  initialAsset?: AssetInfo
  useMock?: boolean
  walletId?: string
  fromAddress?: string
  chainConfig?: ChainConfig
}

interface UseSendReturn {
  state: SendState
  setToAddress: (address: string) => void
  setAmount: (amount: Amount | null) => void
  setAsset: (asset: AssetInfo) => void
  goToConfirm: () => boolean
  goBack: () => void
  submit: (password: string) => Promise<SubmitResult>
  submitWithTwoStepSecret: (password: string, twoStepSecret: string) => Promise<SubmitResult>
  reset: () => void
  canProceed: boolean
}

interface SendState {
  step: 'input' | 'confirm' | 'sending' | 'result'
  toAddress: string
  amount: Amount | null
  asset: AssetInfo | null
  feeAmount: Amount | null
  feeSymbol: string
  feeLoading: boolean
  isSubmitting: boolean
  resultStatus: 'success' | 'failed' | null
  txHash: string | null
  addressError: string | null
  amountError: string | null
  errorMessage: string | null
}
```

**使用示例**:

```tsx
function SendActivity() {
  const { state, setToAddress, setAmount, goToConfirm, submit } = useSend({
    walletId,
    fromAddress,
    chainConfig,
  })

  return (
    <div>
      <AddressInput value={state.toAddress} onChange={setToAddress} error={state.addressError} />
      <AmountInput value={state.amount} onChange={setAmount} error={state.amountError} />
      <FeeDisplay fee={state.feeAmount} loading={state.feeLoading} />
      <Button onClick={goToConfirm} disabled={!canProceed}>确认</Button>
    </div>
  )
}
```

**支持的链**:

| 链类型 | 实现文件 |
|--------|----------|
| BioForest | `use-send.bioforest.ts` |
| EVM/Tron/Bitcoin | `use-send.web3.ts` |
| Mock | `use-send.mock.ts` |

---

### useAssets

资产状态管理。

```typescript
interface UseAssetsOptions {
  useMock?: boolean
}

interface UseAssetsReturn {
  state: AssetState
  allAssets: AssetInfo[]
  assetsByChain: Map<string, AssetInfo[]>
  refresh: () => Promise<void>
}
```

**使用示例**:

```tsx
function AssetsPage() {
  const { allAssets, refresh, state } = useAssets()
  
  return (
    <AssetList 
      assets={allAssets} 
      isLoading={state.isLoading}
      onRefresh={refresh}
    />
  )
}
```

---

### useExchangeRate

法币汇率查询。

```typescript
interface ExchangeRateState {
  data: ExchangeRateResponse | null
  isLoading: boolean
  error: string | null
  updatedAt: number | null
}

function useExchangeRate(
  baseCurrency: string,
  targetCurrencies: string[]
): ExchangeRateState
```

**特性**:
- 5 分钟缓存
- 模块级去重
- 自动规范化货币代码

**使用示例**:

```tsx
function AssetValue({ usdValue }: { usdValue: number }) {
  const { data } = useExchangeRate('USD', ['CNY'])
  const rate = data?.rates.CNY ?? 1
  return <span>¥{(usdValue * rate).toFixed(2)}</span>
}
```

---

### usePriceService

代币价格服务。

```typescript
interface UsePriceServiceReturn {
  getPrice: (symbol: string) => PriceData | undefined
  prices: Map<string, PriceData>
  isLoading: boolean
  error: string | null
}
```

---

### useSecurityPassword

BioForest 安全密码管理。

```typescript
interface UseSecurityPasswordReturn {
  hasSecurityPassword: boolean
  isLoading: boolean
  checkSecurityPassword: (address: string) => Promise<boolean>
  setSecurityPassword: (password: string, newPayPassword: string) => Promise<void>
}
```

---

### useMnemonicVerification

助记词验证。

```typescript
interface UseMnemonicVerificationReturn {
  verifyWords: (selected: string[]) => boolean
  getRandomIndices: (count: number) => number[]
  isComplete: boolean
}
```

---

### useMultiChainAddressGeneration

多链地址派生。

```typescript
interface UseMultiChainAddressGenerationReturn {
  addresses: Map<ChainType, string>
  isGenerating: boolean
  generate: (mnemonic: string, chains: ChainType[]) => Promise<void>
}
```

---

### useDuplicateDetection

钱包重复检测。

```typescript
interface UseDuplicateDetectionReturn {
  isDuplicate: boolean
  existingWallet: Wallet | null
  checkAddress: (address: string) => boolean
}
```

---

### useMpayDetection

mpay 数据检测。

```typescript
interface UseMpayDetectionReturn {
  hasData: boolean
  walletCount: number
  addressCount: number
  detect: () => Promise<void>
}
```

---

## UI Hooks

### useCardInteraction

3D 卡片交互 (触摸/陀螺仪)。

```typescript
interface UseCardInteractionOptions {
  gyroStrength?: number
  touchStrength?: number
  enableGyro?: boolean
}

interface UseCardInteractionReturn {
  pointerX: number      // -1 to 1
  pointerY: number      // -1 to 1
  isActive: boolean
  bindElement: (element: HTMLElement | null) => void
}
```

---

### useMonochromeMask

图片转单色遮罩 (用于钱包卡片水印)。

```typescript
function useMonochromeMask(
  imageUrl: string | undefined,
  options?: {
    size?: number
    invert?: boolean
    contrast?: number
    targetBrightness?: number
  }
): string | undefined  // 返回 data URL
```

---

### useWalletTheme

钱包主题色。

```typescript
interface UseWalletThemeReturn {
  themeHue: number
  setTheme: (hue: number) => void
}
```

---

### useChainIconUrls

链图标 URL 映射。

```typescript
function useChainIconUrls(): Map<string, string>
```

---

## 导航 Hooks

> 源码: [`src/stackflow/hooks/`](https://github.com/BioforestChain/KeyApp/blob/main/src/stackflow/hooks/)

### useNavigation

Stackflow 导航封装。

```typescript
interface UseNavigationReturn {
  push: (activity: string, params?: object) => void
  pop: () => void
  replace: (activity: string, params?: object) => void
  popToRoot: () => void
}
```

---

## 文件结构

```
src/hooks/
├── use-send.ts              # 主入口
├── use-send.types.ts        # 类型定义
├── use-send.constants.ts    # 常量
├── use-send.logic.ts        # 验证逻辑
├── use-send.bioforest.ts    # BioForest 实现
├── use-send.web3.ts         # Web3 实现
├── use-send.mock.ts         # Mock 实现
├── use-send.test.ts         # 测试
├── use-assets.ts
├── use-assets.test.ts
├── use-exchange-rate.ts
├── use-exchange-rate.test.ts
├── use-price-service.ts
├── use-security-password.ts
├── use-mnemonic-verification.ts
├── use-multi-chain-address-generation.ts
├── use-duplicate-detection.ts
├── use-mpay-detection.ts
├── use-transaction-history.ts
├── useCardInteraction.ts
├── useMonochromeMask.ts
├── useWalletTheme.ts
└── useChainIconUrls.ts
```
