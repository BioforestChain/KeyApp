# Migration 组件

> 源码: [`src/components/migration/`](https://github.com/BioforestChain/KeyApp/blob/main/src/components/migration/)

## 组件列表

| 组件 | 文件 | 说明 |
|------|------|------|
| `MigrationProgressStep` | `MigrationProgressStep.tsx` | 迁移进度 |
| `MigrationCompleteStep` | `MigrationCompleteStep.tsx` | 迁移完成 |
| `WhatsNewSheet` | `WhatsNewSheet.tsx` | 新功能介绍 |

---

## MigrationProgressStep

mpay 数据迁移进度显示。

### Props

```typescript
interface MigrationProgressStepProps {
  progress: MigrationProgress
  onCancel?: () => void
  className?: string
}

interface MigrationProgress {
  step: 'detecting' | 'verifying' | 'reading' | 'transforming' | 'importing' | 'importing_contacts' | 'complete'
  percent: number
  currentWallet?: string
  totalWallets?: number
  processedWallets?: number
}
```

### 步骤显示

| Step | 描述 |
|------|------|
| `detecting` | 检测 mpay 数据... |
| `verifying` | 验证密码... |
| `reading` | 读取钱包数据... |
| `transforming` | 转换数据格式... |
| `importing` | 导入钱包 (1/3)... |
| `importing_contacts` | 导入联系人... |
| `complete` | 迁移完成 |

### 渲染结构

```
┌─────────────────────────────────────────────┐
│            数据迁移中                       │
│                                             │
│    ████████████░░░░░░░░░░░  60%            │
│                                             │
│    导入钱包 (2/3)                           │
│    正在处理: My Wallet                      │
│                                             │
│            [取消]                           │
└─────────────────────────────────────────────┘
```

---

## MigrationCompleteStep

迁移完成页面。

### Props

```typescript
interface MigrationCompleteStepProps {
  walletCount: number
  addressCount: number
  contactCount: number
  onContinue: () => void
  className?: string
}
```

### 渲染结构

```
┌─────────────────────────────────────────────┐
│              [✓]                            │
│          迁移完成                           │
│                                             │
│    已导入:                                  │
│    • 3 个钱包                               │
│    • 12 个地址                              │
│    • 5 个联系人                             │
│                                             │
│          [开始使用]                         │
└─────────────────────────────────────────────┘
```

---

## WhatsNewSheet

新版本功能介绍底部弹窗。

### Props

```typescript
interface WhatsNewSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  version: string
  features: Array<{
    icon: ReactNode
    title: string
    description: string
  }>
  onDismiss: () => void
}
```

### 渲染结构

```
┌─────────────────────────────────────────────┐
│ 🎉 KeyApp 2.0 新功能                       │
│                                             │
│ 🔒 全新安全架构                             │
│    采用最新加密标准保护您的资产             │
│                                             │
│ 🌐 多链支持                                 │
│    支持以太坊、比特币、波场等主流链         │
│                                             │
│ 📱 MiniApp 生态                             │
│    发现和使用去中心化应用                   │
│                                             │
│           [开始体验]                        │
└─────────────────────────────────────────────┘
```

---

## 迁移流程

```tsx
function MigrationActivity() {
  const [step, setStep] = useState<'detect' | 'password' | 'progress' | 'complete'>('detect')
  const [progress, setProgress] = useState<MigrationProgress | null>(null)
  
  return (
    <div>
      {step === 'detect' && (
        <MigrationDetectStep onDetected={() => setStep('password')} />
      )}
      
      {step === 'password' && (
        <PasswordInput onSubmit={(pwd) => startMigration(pwd)} />
      )}
      
      {step === 'progress' && progress && (
        <MigrationProgressStep
          progress={progress}
          onCancel={cancelMigration}
        />
      )}
      
      {step === 'complete' && (
        <MigrationCompleteStep
          walletCount={3}
          addressCount={12}
          contactCount={5}
          onContinue={() => navigate('Home')}
        />
      )}
    </div>
  )
}
```
