# 第十五章：组件体系

> 定义 shadcn/ui 基础上的组件分类和设计规范

---

## 15.1 组件分类

```
src/components/
├── ui/                 # 基础组件 (shadcn/ui)
├── common/             # 通用业务组件
├── wallet/             # 钱包相关组件
├── token/              # 代币相关组件
├── transaction/        # 交易相关组件
└── layout/             # 布局组件
```

### 分层原则

| 层级 | 职责 | 依赖 |
|-----|------|------|
| ui | 无业务逻辑的基础组件 | 无 |
| common | 可复用的业务组件 | ui |
| wallet/token/... | 领域特定组件 | ui, common |
| layout | 页面布局组件 | ui, common |

---

## 15.2 基础组件 (ui)

### shadcn/ui 组件

| 组件 | 用途 |
|-----|------|
| Button | 按钮，多种变体 |
| Input | 文本输入框 |
| Card | 卡片容器 |
| Dialog | 对话框 |
| Sheet | 底部/侧边抽屉 |
| Select | 下拉选择 |
| Switch | 开关 |
| Tabs | 标签页 |
| Skeleton | 骨架屏 |
| Avatar | 头像 |

### 自定义基础组件

```typescript
// src/components/ui/gradient-button.tsx
import { cva, type VariantProps } from 'class-variance-authority'

const gradientButtonVariants = cva(
  'inline-flex items-center justify-center rounded-full text-white font-medium',
  {
    variants: {
      variant: {
        blue: 'bg-gradient-to-b from-[#6de7fe] to-[#44b5f7]',
        purple: 'bg-gradient-to-b from-[#a694f8] to-[#8970ff]',
        red: 'bg-gradient-to-b from-[#f77fa2] to-[#ea4879]',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-base',
        lg: 'h-12 px-8 text-lg',
      },
    },
    defaultVariants: {
      variant: 'purple',
      size: 'md',
    },
  }
)

interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof gradientButtonVariants> {}

export function GradientButton({ variant, size, className, ...props }: GradientButtonProps) {
  return (
    <button
      className={cn(gradientButtonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
```

---

## 15.3 通用业务组件 (common)

### AddressDisplay

```typescript
// src/components/common/address-display.tsx
interface AddressDisplayProps {
  address: string
  shorten?: boolean
  copyable?: boolean
  showQR?: boolean
}

export function AddressDisplay({
  address,
  shorten = true,
  copyable = true,
  showQR = false,
}: AddressDisplayProps) {
  const displayAddress = shorten
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : address
  
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm">{displayAddress}</span>
      {copyable && <CopyButton text={address} />}
      {showQR && <QRButton address={address} />}
    </div>
  )
}
```

### AmountDisplay

```typescript
// src/components/common/amount-display.tsx
interface AmountDisplayProps {
  value: string | number | bigint
  symbol: string
  decimals?: number
  sign?: 'always' | 'never' | 'auto'
  color?: 'auto' | 'none'
}

export function AmountDisplay({
  value,
  symbol,
  decimals = 8,
  sign = 'never',
  color = 'none',
}: AmountDisplayProps) {
  const formatted = formatAmount(value, decimals)
  const isPositive = Number(value) > 0
  
  return (
    <span className={cn(
      'font-mono tabular-nums',
      color === 'auto' && isPositive && 'text-green-500',
      color === 'auto' && !isPositive && 'text-red-500',
    )}>
      {sign === 'always' && isPositive && '+'}
      {formatted} {symbol}
    </span>
  )
}
```

### IconCircle

```typescript
// src/components/common/icon-circle.tsx
interface IconCircleProps {
  icon: React.ComponentType<{ className?: string }>
  variant?: 'primary' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
}

export function IconCircle({ icon: Icon, variant = 'primary', size = 'md' }: IconCircleProps) {
  return (
    <div className={cn(
      'rounded-full flex items-center justify-center',
      size === 'sm' && 'size-10',
      size === 'md' && 'size-14',
      size === 'lg' && 'size-20',
      variant === 'primary' && 'bg-primary/10 text-primary',
      variant === 'success' && 'bg-green-500/10 text-green-500',
      variant === 'warning' && 'bg-yellow-500/10 text-yellow-500',
      variant === 'error' && 'bg-red-500/10 text-red-500',
    )}>
      <Icon className={cn(
        size === 'sm' && 'size-5',
        size === 'md' && 'size-7',
        size === 'lg' && 'size-10',
      )} />
    </div>
  )
}
```

---

## 15.4 钱包组件 (wallet)

### WalletCard

```typescript
// src/components/wallet/wallet-card.tsx
interface WalletCardProps {
  wallet: Wallet
  chainAddress: ChainAddress
  onTransfer?: () => void
  onMint?: () => void
  onReceive?: () => void
}

export function WalletCard({
  wallet,
  chainAddress,
  onTransfer,
  onMint,
  onReceive,
}: WalletCardProps) {
  return (
    <Card className="bg-gradient-to-br from-primary/20 to-primary/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={wallet.avatar} />
            <AvatarFallback>{wallet.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{wallet.name}</h3>
            <AddressDisplay address={chainAddress.address} copyable />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex justify-around">
          <ActionButton icon={IconSend} label="转账" onClick={onTransfer} />
          <ActionButton icon={IconCoins} label="铸造" onClick={onMint} />
          <ActionButton icon={IconQrcode} label="收款" onClick={onReceive} />
        </div>
      </CardContent>
    </Card>
  )
}
```

### ChainSelector

```typescript
// src/components/wallet/chain-selector.tsx
interface ChainSelectorProps {
  value: ChainId | null
  onChange: (chain: ChainId) => void
  chains: ChainConfig[]
}

export function ChainSelector({ value, onChange, chains }: ChainSelectorProps) {
  const [open, setOpen] = useState(false)
  const selectedChain = chains.find(c => c.id === value)
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          {selectedChain && <ChainIcon chain={selectedChain} className="size-5" />}
          <span>{selectedChain?.name ?? '选择链'}</span>
          <IconChevronDown className="size-4" />
        </Button>
      </SheetTrigger>
      
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>选择链</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-2 py-4">
          {chains.map(chain => (
            <button
              key={chain.id}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-lg',
                chain.id === value ? 'bg-primary/10' : 'hover:bg-muted'
              )}
              onClick={() => {
                onChange(chain.id)
                setOpen(false)
              }}
            >
              <ChainIcon chain={chain} className="size-8" />
              <div className="flex-1 text-left">
                <div className="font-medium">{chain.name}</div>
                <div className="text-sm text-muted-foreground">{chain.symbol}</div>
              </div>
              {chain.id === value && <IconCheck className="size-5 text-primary" />}
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

---

## 15.5 布局组件 (layout)

### AppLayout

```typescript
// src/components/layout/app-layout.tsx
interface AppLayoutProps {
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
}

export function AppLayout({ children, header, footer }: AppLayoutProps) {
  return (
    <div className="min-h-dvh flex flex-col bg-background">
      {header}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      {footer}
    </div>
  )
}
```

### BottomSheet

```typescript
// src/components/layout/bottom-sheet.tsx
interface BottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  title?: string
}

export function BottomSheet({ open, onOpenChange, children, title }: BottomSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl max-h-[85dvh]"
      >
        <div className="mx-auto my-3 h-1.5 w-12 rounded-full bg-muted" />
        {title && (
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
        )}
        <div className="overflow-auto">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

---

## 15.6 组件编码规范

### 正方形元素使用 aspect-square

```typescript
// ✅ 正确
<div className="w-10 aspect-square rounded-full" />

// ❌ 错误
<div className="w-10 h-10 rounded-full" />
```

### 统一使用基础组件

```typescript
// ✅ 使用基础组件
<AddressDisplay address={wallet.address} />
<AmountDisplay value={100} symbol="USDT" />

// ❌ 内联实现
<span>{address.slice(0, 6)}...{address.slice(-4)}</span>
```

### 图标按钮 padding 规范

```typescript
// ✅ 条件 padding
<Button className="px-4 has-[svg]:ps-3">
  <Icon />
  <span>按钮文字</span>
</Button>
```

---

## 本章小结

- 组件分为 ui、common、领域组件、layout 四层
- shadcn/ui 提供基础组件
- 业务组件封装常用模式
- 遵循编码规范保持一致性

---

## 下一章

继续阅读 [第十六章：表单系统](../02-表单系统/)，了解表单处理方案。
