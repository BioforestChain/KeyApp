# 第十六章：表单系统

> 定义 TanStack Form 的使用方案

---

## 16.1 概述

BFM Pay 使用 TanStack Form 处理表单，配合 Zod 进行验证。

### 为什么选择 TanStack Form

| 特性 | TanStack Form | React Hook Form |
|-----|--------------|-----------------|
| 类型安全 | ✅ 完整 | ⚠️ 需要额外配置 |
| 验证器适配 | ✅ 多种适配器 | ⚠️ 需要 resolver |
| 异步验证 | ✅ 原生支持 | ⚠️ 需要配置 |
| 与 TanStack 生态 | ✅ 统一 API | ❌ 独立 API |

---

## 16.2 基础用法

### 创建表单

```typescript
// src/features/transfer/transfer-form.tsx
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'

const transferSchema = z.object({
  toAddress: z.string().min(1, '请输入收款地址'),
  amount: z.string().min(1, '请输入金额'),
  memo: z.string().max(24, '备注最多24字符').optional(),
})

export function TransferForm() {
  const form = useForm({
    defaultValues: {
      toAddress: '',
      amount: '',
      memo: '',
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: transferSchema,
    },
    onSubmit: async ({ value }) => {
      await transfer(value)
    },
  })
  
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      {/* 表单字段 */}
    </form>
  )
}
```

### 字段渲染

```typescript
<form.Field name="toAddress">
  {(field) => (
    <div className="space-y-2">
      <Label htmlFor={field.name}>收款地址</Label>
      <Input
        id={field.name}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        placeholder="输入或粘贴地址"
      />
      {field.state.meta.errors.length > 0 && (
        <p className="text-sm text-destructive">
          {field.state.meta.errors.join(', ')}
        </p>
      )}
    </div>
  )}
</form.Field>
```

---

## 16.3 异步验证

### 地址格式验证

```typescript
<form.Field
  name="toAddress"
  validators={{
    // 同步验证：非空
    onChange: z.string().min(1, '请输入地址'),
    
    // 异步验证：地址格式
    onChangeAsync: async ({ value }) => {
      if (!value) return undefined
      
      const isValid = await chainService.isValidAddress(value, chainId)
      return isValid ? undefined : '地址格式不正确'
    },
    onChangeAsyncDebounceMs: 500,
  }}
>
  {(field) => (
    <div className="space-y-2">
      <Input
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      {field.state.meta.isValidating && (
        <p className="text-sm text-muted-foreground">验证中...</p>
      )}
      {field.state.meta.errors.length > 0 && (
        <p className="text-sm text-destructive">
          {field.state.meta.errors[0]}
        </p>
      )}
    </div>
  )}
</form.Field>
```

### 余额验证

```typescript
<form.Field
  name="amount"
  validators={{
    onChange: z.string().min(1, '请输入金额'),
    onChangeAsync: async ({ value }) => {
      const amount = parseFloat(value)
      if (isNaN(amount) || amount <= 0) {
        return '请输入有效金额'
      }
      
      const balance = await getBalance(address, chainId)
      if (amount > parseFloat(balance.formatted)) {
        return '余额不足'
      }
      
      return undefined
    },
    onChangeAsyncDebounceMs: 300,
  }}
>
  {(field) => (/* ... */)}
</form.Field>
```

---

## 16.4 表单状态订阅

### 提交按钮状态

```typescript
<form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
  {([canSubmit, isSubmitting]) => (
    <Button type="submit" disabled={!canSubmit || isSubmitting}>
      {isSubmitting ? '发送中...' : '确认发送'}
    </Button>
  )}
</form.Subscribe>
```

### 表单级错误

```typescript
<form.Subscribe selector={(s) => s.errors}>
  {(errors) => (
    errors.length > 0 && (
      <Alert variant="destructive">
        {errors.join(', ')}
      </Alert>
    )
  )}
</form.Subscribe>
```

---

## 16.5 复杂表单场景

### 多步骤表单

```typescript
// 钱包创建表单
export function CreateWalletForm() {
  const [step, setStep] = useState<'password' | 'mnemonic' | 'verify'>('password')
  
  const form = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
      mnemonic: [] as string[],
      verifyWords: {} as Record<number, string>,
    },
    onSubmit: async ({ value }) => {
      await createWallet(value)
    },
  })
  
  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
      {step === 'password' && (
        <PasswordStep form={form} onNext={() => setStep('mnemonic')} />
      )}
      {step === 'mnemonic' && (
        <MnemonicStep form={form} onNext={() => setStep('verify')} onBack={() => setStep('password')} />
      )}
      {step === 'verify' && (
        <VerifyStep form={form} onBack={() => setStep('mnemonic')} />
      )}
    </form>
  )
}
```

### 动态字段

```typescript
// 助记词输入
<form.Field name="mnemonic" mode="array">
  {(field) => (
    <div className="grid grid-cols-3 gap-2">
      {field.state.value.map((_, index) => (
        <form.Field key={index} name={`mnemonic[${index}]`}>
          {(wordField) => (
            <Input
              value={wordField.state.value}
              onChange={(e) => wordField.handleChange(e.target.value)}
              placeholder={`${index + 1}`}
            />
          )}
        </form.Field>
      ))}
    </div>
  )}
</form.Field>
```

---

## 16.6 表单组件封装

### FormField 组件

```typescript
// src/components/common/form-field.tsx
interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

export function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-sm text-destructive -mt-0.5">{error}</p>
      )}
    </div>
  )
}
```

### 使用封装组件

```typescript
<form.Field name="toAddress">
  {(field) => (
    <FormField
      label="收款地址"
      error={field.state.meta.errors[0]}
      required
    >
      <Input
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
      />
    </FormField>
  )}
</form.Field>
```

---

## 16.7 与 Mutation 集成

```typescript
export function TransferForm() {
  const transfer = useTransfer()
  
  const form = useForm({
    defaultValues: { toAddress: '', amount: '' },
    onSubmit: async ({ value }) => {
      await transfer.mutateAsync({
        to: value.toAddress,
        amount: value.amount,
        chain: currentChain,
      })
    },
  })
  
  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
      {/* 字段 */}
      
      {transfer.isError && (
        <Alert variant="destructive">
          {transfer.error.message}
        </Alert>
      )}
      
      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            disabled={!canSubmit || isSubmitting || transfer.isPending}
          >
            {transfer.isPending ? '发送中...' : '确认发送'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
```

---

## 本章小结

- TanStack Form 提供类型安全的表单管理
- 支持同步和异步验证
- 多步骤表单使用状态控制步骤
- 封装 FormField 组件统一样式
- 与 TanStack Query Mutation 配合处理提交

---

## 下一章

继续阅读 [第十七章：组件开发规范](../03-组件开发规范/)，了解 Storybook 驱动的开发流程。
