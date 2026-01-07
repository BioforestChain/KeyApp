# Transfer 组件

> 源码: [`src/components/transfer/`](https://github.com/BioforestChain/KeyApp/blob/main/src/components/transfer/)

## 组件列表

| 组件 | 文件 | 说明 |
|------|------|------|
| `AddressInput` | `address-input.tsx` | 地址输入框 |
| `AmountInput` | `amount-input.tsx` | 金额输入框 |
| `SendResult` | `send-result.tsx` | 发送结果页 |

---

## AddressInput

转账地址输入组件，支持联系人建议、二维码扫描、粘贴。

### Props

```typescript
interface AddressInputProps {
  value: string
  onChange: (value: string) => void
  chainType?: ChainType
  error?: string
  placeholder?: string
  onScan?: () => void
  onSelectContact?: () => void
  suggestions?: ContactSuggestion[]
  onSelectSuggestion?: (suggestion: ContactSuggestion) => void
  className?: string
}
```

### 功能

- **联系人建议**: 输入时自动匹配地址簿
- **二维码扫描**: 点击扫描按钮
- **粘贴**: 一键粘贴剪贴板
- **地址验证**: 实时校验地址格式

### 渲染结构

```
┌─────────────────────────────────────────────┐
│ 接收地址                                    │
│ ┌─────────────────────────────────────────┐ │
│ │ 0x742d35Cc6634...            [📋] [📷] │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ 💁 Alice  0x742d...                     │ │
│ │ 👨 Bob    0x8ba1...                     │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### 使用示例

```tsx
const [address, setAddress] = useState('')
const { data: suggestions } = useContactSuggestions(address)

<AddressInput
  value={address}
  onChange={setAddress}
  chainType="evm"
  error={addressError}
  onScan={() => openScanner()}
  suggestions={suggestions}
  onSelectSuggestion={(s) => {
    setAddress(s.matchedAddress.address)
    setContactName(s.contact.name)
  }}
/>
```

---

## AmountInput

金额输入组件，支持最大值、法币换算。

### Props

```typescript
interface AmountInputProps {
  value: string
  onChange: (value: string) => void
  symbol: string
  decimals: number
  maxAmount?: Amount
  balance?: Amount
  priceUsd?: number
  currency?: string
  exchangeRate?: number
  error?: string
  onMax?: () => void
  className?: string
}
```

### 功能

- **最大值**: 点击 MAX 填入最大可用
- **法币换算**: 实时显示法币价值
- **余额显示**: 显示可用余额
- **精度限制**: 限制小数位数

### 渲染结构

```
┌─────────────────────────────────────────────┐
│ 金额                                        │
│ ┌─────────────────────────────────────────┐ │
│ │ 1.5                    ETH       [MAX]  │ │
│ └─────────────────────────────────────────┘ │
│ ≈ $3,750                 可用: 2.5 ETH     │
└─────────────────────────────────────────────┘
```

### 使用示例

```tsx
const [amount, setAmount] = useState('')

<AmountInput
  value={amount}
  onChange={setAmount}
  symbol="ETH"
  decimals={18}
  balance={balance}
  maxAmount={maxAmount}
  priceUsd={2500}
  currency="USD"
  onMax={() => setAmount(maxAmount.toDisplay())}
  error={amountError}
/>
```

---

## SendResult

发送结果展示页，支持成功/失败/等待确认状态。

### Props

```typescript
interface SendResultProps {
  status: 'pending' | 'success' | 'failed'
  txHash?: string
  amount: string
  symbol: string
  recipient: string
  recipientName?: string
  explorerUrl?: string
  errorMessage?: string
  onDone?: () => void
  onRetry?: () => void
  className?: string
}
```

### 状态展示

| 状态 | 图标 | 标题 |
|------|------|------|
| `pending` | 🔄 | 交易已提交 |
| `success` | ✓ | 发送成功 |
| `failed` | ✗ | 发送失败 |

### 渲染结构 (成功)

```
┌─────────────────────────────────────────────┐
│              [✓]                            │
│           发送成功                          │
│                                             │
│           1.5 ETH                           │
│              ↓                              │
│           Alice                             │
│        0x742d...6634                        │
│                                             │
│     [查看交易详情]                          │
│                                             │
│          [完成]                             │
└─────────────────────────────────────────────┘
```

### 使用示例

```tsx
<SendResult
  status={txStatus}
  txHash={txHash}
  amount="1.5"
  symbol="ETH"
  recipient="0x742d..."
  recipientName="Alice"
  explorerUrl={`https://etherscan.io/tx/${txHash}`}
  onDone={() => navigate('Home')}
  onRetry={() => retry()}
/>
```

---

## 转账流程组件组合

```tsx
function SendActivity() {
  return (
    <div>
      {/* Step 1: 输入地址 */}
      <AddressInput {...addressProps} />
      
      {/* Step 2: 输入金额 */}
      <AmountInput {...amountProps} />
      
      {/* Step 3: 手续费 */}
      <FeeDisplay {...feeProps} />
      
      {/* Step 4: 确认按钮 */}
      <GradientButton onClick={confirm}>
        确认发送
      </GradientButton>
    </div>
  )
}

function SendConfirmSheet() {
  return (
    <Sheet>
      <TransactionDetails from={from} to={to} amount={amount} fee={fee} />
      <Button onClick={send}>确认</Button>
    </Sheet>
  )
}

function SendResultActivity() {
  return <SendResult {...resultProps} />
}
```
