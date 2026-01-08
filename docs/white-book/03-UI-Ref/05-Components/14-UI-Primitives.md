# UI 基础组件 (shadcn/ui)

> 源码: [`src/components/ui/`](https://github.com/BioforestChain/KeyApp/blob/main/src/components/ui/)

## 组件列表

基于 shadcn/ui 的基础组件库：

| 组件 | 文件 | 说明 |
|------|------|------|
| `Button` | `button.tsx` | 按钮 |
| `Input` | `input.tsx` | 输入框 |
| `InputGroup` | `input-group.tsx` | 输入组 |
| `Textarea` | `textarea.tsx` | 文本域 |
| `Select` | `select.tsx` | 下拉选择 |
| `Checkbox` | `checkbox.tsx` | 复选框 |
| `Label` | `label.tsx` | 标签 |
| `Field` | `field.tsx` | 表单字段 |
| `Card` | `card.tsx` | 卡片 |
| `Badge` | `badge.tsx` | 徽章 |
| `Avatar` | `avatar.tsx` | 头像 |
| `Progress` | `progress.tsx` | 进度条 |
| `Separator` | `separator.tsx` | 分割线 |
| `Sheet` | `sheet.tsx` | 底部弹窗 |
| `AlertDialog` | `alert-dialog.tsx` | 警告对话框 |
| `DropdownMenu` | `dropdown-menu.tsx` | 下拉菜单 |
| `Combobox` | `combobox.tsx` | 组合框 |
| `MarqueeText` | `marquee-text.tsx` | 跑马灯文字 |

---

## Button

按钮组件。

### Variants

| Variant | 说明 |
|---------|------|
| `default` | 主要按钮 |
| `secondary` | 次要按钮 |
| `outline` | 边框按钮 |
| `ghost` | 幽灵按钮 |
| `link` | 链接按钮 |
| `destructive` | 危险按钮 |

### Sizes

| Size | 说明 |
|------|------|
| `sm` | 小尺寸 |
| `default` | 默认 |
| `lg` | 大尺寸 |
| `icon` | 图标按钮 |

```tsx
<Button variant="default" size="lg">主要按钮</Button>
<Button variant="outline">次要按钮</Button>
<Button variant="ghost" size="icon"><IconSettings /></Button>
<Button variant="destructive">删除</Button>
```

---

## Input

输入框组件。

```tsx
<Input placeholder="请输入" />
<Input type="password" />
<Input disabled />
<Input error="输入有误" />
```

---

## InputGroup

输入组，支持前后缀。

```tsx
<InputGroup>
  <InputGroup.Prefix>$</InputGroup.Prefix>
  <Input type="number" />
  <InputGroup.Suffix>USD</InputGroup.Suffix>
</InputGroup>
```

---

## Card

卡片容器。

```tsx
<Card>
  <Card.Header>
    <Card.Title>标题</Card.Title>
    <Card.Description>描述</Card.Description>
  </Card.Header>
  <Card.Content>内容</Card.Content>
  <Card.Footer>底部</Card.Footer>
</Card>
```

---

## Badge

徽章组件。

```tsx
<Badge>默认</Badge>
<Badge variant="secondary">次要</Badge>
<Badge variant="outline">边框</Badge>
<Badge variant="destructive">危险</Badge>
```

---

## Avatar

头像组件。

```tsx
<Avatar>
  <Avatar.Image src="/avatar.png" />
  <Avatar.Fallback>JD</Avatar.Fallback>
</Avatar>
```

---

## Progress

进度条。

```tsx
<Progress value={60} />
<Progress value={60} max={100} />
```

---

## Sheet

底部弹窗 (基于 Radix)。

```tsx
<Sheet>
  <Sheet.Trigger asChild>
    <Button>打开</Button>
  </Sheet.Trigger>
  <Sheet.Content>
    <Sheet.Header>
      <Sheet.Title>标题</Sheet.Title>
    </Sheet.Header>
    <div>内容</div>
  </Sheet.Content>
</Sheet>
```

---

## AlertDialog

警告对话框。

```tsx
<AlertDialog>
  <AlertDialog.Trigger asChild>
    <Button variant="destructive">删除</Button>
  </AlertDialog.Trigger>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>确认删除?</AlertDialog.Title>
      <AlertDialog.Description>此操作不可撤销</AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>取消</AlertDialog.Cancel>
      <AlertDialog.Action>确认</AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog>
```

---

## DropdownMenu

下拉菜单。

```tsx
<DropdownMenu>
  <DropdownMenu.Trigger asChild>
    <Button variant="ghost"><IconMore /></Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item>编辑</DropdownMenu.Item>
    <DropdownMenu.Item>复制</DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item className="text-destructive">删除</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu>
```

---

## MarqueeText

超长文本跑马灯。

```tsx
<MarqueeText>
  这是一段很长很长很长很长很长的文字
</MarqueeText>
```

---

## 主题变量

所有组件使用 CSS 变量实现主题：

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --muted: 240 4.8% 95.9%;
  --accent: 240 4.8% 95.9%;
  --destructive: 0 84.2% 60.2%;
  --border: 240 5.9% 90%;
  --ring: 240 5.9% 10%;
  --radius: 0.5rem;
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  /* ... */
}
```
