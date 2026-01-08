# Primitives 完整索引

> Source: [src/components/ui/](https://github.com/BioforestChain/KeyApp/tree/main/src/components/ui)

## 概览

基于 shadcn/ui 构建的基础组件库，共 **18 个** 组件。

---

## 组件列表

### 按钮与交互

| 组件 | 文件 | 描述 |
|------|------|------|
| Button | `button.tsx` | 基础按钮 |
| Checkbox | `checkbox.tsx` | 复选框 |
| DropdownMenu | `dropdown-menu.tsx` | 下拉菜单 |

### 表单输入

| 组件 | 文件 | 描述 |
|------|------|------|
| Input | `input.tsx` | 文本输入 |
| InputGroup | `input-group.tsx` | 输入组 |
| Textarea | `textarea.tsx` | 多行文本 |
| Select | `select.tsx` | 选择器 |
| Combobox | `combobox.tsx` | 组合框 (搜索+选择) |
| Label | `label.tsx` | 标签 |
| Field | `field.tsx` | 表单字段容器 |

### 展示

| 组件 | 文件 | 描述 |
|------|------|------|
| Card | `card.tsx` | 卡片 |
| Badge | `badge.tsx` | 徽章 |
| Avatar | `avatar.tsx` | 头像 |
| Separator | `separator.tsx` | 分隔线 |
| Progress | `progress.tsx` | 进度条 |
| MarqueeText | `marquee-text.tsx` | 跑马灯文本 |

### 弹窗与反馈

| 组件 | 文件 | 描述 |
|------|------|------|
| Sheet | `sheet.tsx` | 底部弹窗 |
| AlertDialog | `alert-dialog.tsx` | 警告对话框 |

---

## Button

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}
```

**变体**:
- `default`: 主按钮 (填充)
- `destructive`: 危险操作 (红色)
- `outline`: 轮廓
- `secondary`: 次要
- `ghost`: 幽灵 (透明背景)
- `link`: 链接样式

---

## Input

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // 继承原生 input 属性
}
```

**特性**:
- 支持所有原生 input 类型
- 自动 focus 样式
- 错误状态通过 `aria-invalid` 控制

---

## Card

```typescript
// 组合使用
<Card>
  <CardHeader>
    <CardTitle>标题</CardTitle>
    <CardDescription>描述</CardDescription>
  </CardHeader>
  <CardContent>内容</CardContent>
  <CardFooter>底部</CardFooter>
</Card>
```

---

## Sheet (底部弹窗)

```typescript
interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

// 使用
<Sheet open={isOpen} onOpenChange={setIsOpen}>
  <SheetTrigger asChild>
    <Button>打开</Button>
  </SheetTrigger>
  <SheetContent side="bottom">
    <SheetHeader>
      <SheetTitle>标题</SheetTitle>
    </SheetHeader>
    {/* 内容 */}
  </SheetContent>
</Sheet>
```

**Side 选项**: `top` | `bottom` | `left` | `right`

---

## AlertDialog

```typescript
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">删除</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>确认删除？</AlertDialogTitle>
      <AlertDialogDescription>
        此操作无法撤销。
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>取消</AlertDialogCancel>
      <AlertDialogAction>确认</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## Badge

```typescript
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

// 使用
<Badge variant="secondary">待处理</Badge>
<Badge variant="destructive">失败</Badge>
```

---

## Avatar

```typescript
<Avatar>
  <AvatarImage src="https://..." alt="用户头像" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

---

## Progress

```typescript
interface ProgressProps {
  value?: number;      // 0-100
  max?: number;
  className?: string;
}

<Progress value={66} />
```

---

## Select

```typescript
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="选择..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="eth">Ethereum</SelectItem>
    <SelectItem value="bsc">BSC</SelectItem>
    <SelectItem value="polygon">Polygon</SelectItem>
  </SelectContent>
</Select>
```

---

## Combobox

```typescript
<Combobox
  options={[
    { value: 'eth', label: 'Ethereum' },
    { value: 'bsc', label: 'BSC' },
  ]}
  value={selected}
  onValueChange={setSelected}
  placeholder="搜索链..."
/>
```

---

## MarqueeText

超长文本自动滚动。

```typescript
<MarqueeText>
  0x1234567890abcdef1234567890abcdef12345678
</MarqueeText>
```

---

## 样式定制

所有组件支持通过 `className` 和 CSS 变量定制：

```tsx
// 使用 cn() 合并样式
import { cn } from '@/lib/utils';

<Button className={cn(
  'my-custom-class',
  isActive && 'bg-primary'
)}>
  按钮
</Button>
```

---

## 相关文档

- [Button](./Button.md) - 按钮组件
- [Card](./Card.md) - 卡片组件
- [Input](./Input.md) - 输入组件
- [Dialog](./Dialog.md) - 对话框组件
- [Design System](../01-Foundation/01-Colors.md)
