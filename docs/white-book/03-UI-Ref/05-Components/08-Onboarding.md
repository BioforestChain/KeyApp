# Onboarding 组件

> 源码: [`src/components/onboarding/`](https://github.com/BioforestChain/KeyApp/blob/main/src/components/onboarding/)

## 组件列表

| 组件 | 文件 | 说明 |
|------|------|------|
| `ArbitraryKeyInput` | `arbitrary-key-input.tsx` | 私钥输入 |
| `BackupTipsSheet` | `backup-tips-sheet.tsx` | 备份提示 |
| `ChainAddressPreview` | `chain-address-preview.tsx` | 链地址预览 |
| `ChainSelector` | `chain-selector.tsx` | 链选择器 |
| `CollisionConfirmDialog` | `collision-confirm-dialog.tsx` | 冲突确认 |
| `CreateWalletSuccess` | `create-wallet-success.tsx` | 创建成功 |
| `ImportWalletSuccess` | `import-wallet-success.tsx` | 导入成功 |
| `KeyTypeSelector` | `key-type-selector.tsx` | 密钥类型选择 |

---

## ArbitraryKeyInput

私钥输入组件，支持多种格式。

### Props

```typescript
interface ArbitraryKeyInputProps {
  value: string
  onChange: (value: string) => void
  keyType: 'mnemonic' | 'privateKey' | 'keystore'
  error?: string
  placeholder?: string
  className?: string
}
```

### 支持格式

| 类型 | 格式 | 示例 |
|------|------|------|
| `mnemonic` | 12/24 单词 | apple banana ... |
| `privateKey` | Hex 字符串 | 0x... 或 纯 hex |
| `keystore` | JSON | { "version": 3, ... } |

---

## BackupTipsSheet

备份提示底部弹窗。

### Props

```typescript
interface BackupTipsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  onSkip?: () => void
}
```

### 内容

- 为什么要备份
- 如何安全保存
- 不备份的风险

```
┌─────────────────────────────────────────────┐
│ ⚠️ 请备份您的助记词                        │
│                                             │
│ • 助记词是恢复钱包的唯一方式                │
│ • 请写在纸上，不要截图                      │
│ • 不要分享给任何人                          │
│                                             │
│ [我已了解，开始备份]                        │
│ [稍后备份]                                  │
└─────────────────────────────────────────────┘
```

---

## ChainAddressPreview

导入钱包时的链地址预览。

### Props

```typescript
interface ChainAddressPreviewProps {
  addresses: Array<{
    chain: ChainType
    chainName: string
    address: string
    balance?: string
  }>
  selectedChains?: ChainType[]
  onSelectionChange?: (chains: ChainType[]) => void
  className?: string
}
```

### 渲染结构

```
┌─────────────────────────────────────────────┐
│ [✓] Ethereum                                │
│     0x742d35Cc6634C0532925a3b844...         │
│     余额: 1.5 ETH                           │
│─────────────────────────────────────────────│
│ [✓] Bitcoin                                 │
│     bc1qxy2kgdygjrsqtzq2n0yrf...            │
│     余额: 0.05 BTC                          │
│─────────────────────────────────────────────│
│ [ ] Tron                                    │
│     TRonAddress...                          │
└─────────────────────────────────────────────┘
```

---

## ChainSelector

链选择器，多选/单选模式。

### Props

```typescript
interface ChainSelectorProps {
  chains: ChainConfig[]
  value: string | string[]
  onChange: (value: string | string[]) => void
  multiple?: boolean
  disabled?: string[]
  className?: string
}
```

### 使用示例

```tsx
// 多选模式
<ChainSelector
  chains={availableChains}
  value={selectedChains}
  onChange={setSelectedChains}
  multiple
/>

// 单选模式
<ChainSelector
  chains={availableChains}
  value={selectedChain}
  onChange={setSelectedChain}
/>
```

---

## CollisionConfirmDialog

钱包地址冲突确认对话框。

### Props

```typescript
interface CollisionConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingWallet: Wallet
  onMerge: () => void
  onCancel: () => void
}
```

### 场景

导入钱包时发现地址已存在：

```
┌─────────────────────────────────────────────┐
│ ⚠️ 钱包已存在                               │
│                                             │
│ 该地址已属于钱包 "My Wallet"                │
│                                             │
│ • 合并: 将链地址添加到现有钱包              │
│ • 取消: 放弃导入                            │
│                                             │
│ [合并] [取消]                               │
└─────────────────────────────────────────────┘
```

---

## CreateWalletSuccess

钱包创建成功页面。

### Props

```typescript
interface CreateWalletSuccessProps {
  walletName: string
  address: string
  chain: ChainType
  onContinue: () => void
  onBackup?: () => void
  className?: string
}
```

### 渲染结构

```
┌─────────────────────────────────────────────┐
│              [✓]                            │
│         钱包创建成功                        │
│                                             │
│         My Wallet                           │
│      0x742d35Cc6634...                      │
│                                             │
│ [备份助记词]                                │
│ [开始使用]                                  │
└─────────────────────────────────────────────┘
```

---

## KeyTypeSelector

密钥导入类型选择。

### Props

```typescript
interface KeyTypeSelectorProps {
  value: 'mnemonic' | 'privateKey' | 'keystore'
  onChange: (type: 'mnemonic' | 'privateKey' | 'keystore') => void
  className?: string
}
```

### 渲染结构

```
┌─────────────────────────────────────────────┐
│ 选择导入方式                                │
│                                             │
│ [●] 助记词 (12/24 个单词)                   │
│ [ ] 私钥 (Hex 格式)                         │
│ [ ] Keystore (JSON 文件)                    │
└─────────────────────────────────────────────┘
```

---

## 导入流程组件组合

```tsx
function OnboardingRecoverActivity() {
  const [step, setStep] = useState(0)
  
  return (
    <div>
      {step === 0 && (
        <KeyTypeSelector value={keyType} onChange={setKeyType} />
      )}
      
      {step === 1 && (
        <ArbitraryKeyInput
          value={keyInput}
          onChange={setKeyInput}
          keyType={keyType}
        />
      )}
      
      {step === 2 && (
        <ChainAddressPreview
          addresses={derivedAddresses}
          selectedChains={selectedChains}
          onSelectionChange={setSelectedChains}
        />
      )}
      
      {step === 3 && (
        <ImportWalletSuccess {...successProps} />
      )}
    </div>
  )
}
```
