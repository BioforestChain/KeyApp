# Layout 组件

> 源码: [`src/components/layout/`](https://github.com/BioforestChain/KeyApp/blob/main/src/components/layout/)

## 组件列表

| 组件 | 文件 | 说明 |
|------|------|------|
| `PageHeader` | `page-header.tsx` | 页面头部 |
| `TabBar` | `tab-bar.tsx` | 底部 Tab 栏 |
| `SwipeableTabs` | `swipeable-tabs.tsx` | 可滑动 Tab |
| `BottomSheet` | `bottom-sheet.tsx` | 底部弹窗 |
| `Modal` | `modal.tsx` | 模态框 |

---

## PageHeader

页面头部组件，支持返回、标题、操作按钮。

### Props

```typescript
interface PageHeaderProps {
  title?: string
  subtitle?: string
  onBack?: () => void
  backLabel?: string
  leftAction?: ReactNode
  rightAction?: ReactNode
  transparent?: boolean
  className?: string
}
```

### 渲染结构

```
┌─────────────────────────────────────────────┐
│ [←]  Title                        [Action] │
│      Subtitle                               │
└─────────────────────────────────────────────┘
```

### 使用示例

```tsx
<PageHeader
  title="发送"
  subtitle="ETH"
  onBack={() => pop()}
  rightAction={
    <Button variant="ghost" onClick={openScanner}>
      <IconScan />
    </Button>
  }
/>
```

---

## TabBar

底部导航 Tab 栏。

### Props

```typescript
interface TabBarProps {
  items: Array<{
    key: string
    label: string
    icon: ReactNode
    activeIcon?: ReactNode
    badge?: number
  }>
  activeKey: string
  onChange: (key: string) => void
  className?: string
}
```

### 渲染结构

```
┌─────────────────────────────────────────────┐
│  [🏠]      [💱]      [🌐]      [⚙️]       │
│  首页      资产      生态      设置         │
└─────────────────────────────────────────────┘
```

### 使用示例

```tsx
<TabBar
  items={[
    { key: 'home', label: '首页', icon: <IconHome /> },
    { key: 'assets', label: '资产', icon: <IconWallet /> },
    { key: 'ecosystem', label: '生态', icon: <IconApps /> },
    { key: 'settings', label: '设置', icon: <IconSettings />, badge: 1 },
  ]}
  activeKey={activeTab}
  onChange={setActiveTab}
/>
```

---

## SwipeableTabs

可左右滑动切换的 Tab 组件。

### Props

```typescript
interface SwipeableTabsProps {
  tabs: Array<{
    key: string
    label: string
    content: ReactNode
  }>
  activeKey: string
  onChange: (key: string) => void
  swipeable?: boolean
  animated?: boolean
  tabBarPosition?: 'top' | 'bottom'
  className?: string
}
```

### 功能

- 点击 Tab 切换
- 左右滑动切换
- 平滑动画
- 惰性渲染

### 使用示例

```tsx
<SwipeableTabs
  tabs={[
    { key: 'all', label: '全部', content: <AllTransactions /> },
    { key: 'send', label: '发送', content: <SendTransactions /> },
    { key: 'receive', label: '接收', content: <ReceiveTransactions /> },
  ]}
  activeKey={activeTab}
  onChange={setActiveTab}
  swipeable
/>
```

---

## BottomSheet

底部弹窗组件。

### Props

```typescript
interface BottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: ReactNode
  snapPoints?: number[]        // 吸附点 (百分比)
  defaultSnapPoint?: number
  dismissible?: boolean
  className?: string
}
```

### 功能

- 拖拽调整高度
- 多个吸附点
- 下滑关闭
- 背景遮罩

### 使用示例

```tsx
<BottomSheet
  open={isOpen}
  onOpenChange={setIsOpen}
  title="选择链"
  snapPoints={[0.5, 0.9]}
>
  <ChainList onSelect={handleSelect} />
</BottomSheet>
```

---

## Modal

模态对话框。

### Props

```typescript
interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  closable?: boolean
  className?: string
}
```

### 使用示例

```tsx
<Modal
  open={isOpen}
  onOpenChange={setIsOpen}
  title="确认删除"
  description="此操作不可撤销"
  footer={
    <>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>取消</Button>
      <Button variant="destructive" onClick={handleDelete}>删除</Button>
    </>
  }
>
  <p>确定要删除钱包 "My Wallet" 吗？</p>
</Modal>
```

---

## 页面布局模式

### 标准页面

```tsx
function StandardPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="页面标题" onBack={pop} />
      <main className="flex-1 overflow-auto p-4">
        {/* 内容 */}
      </main>
    </div>
  )
}
```

### Tab 页面

```tsx
function TabPage() {
  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 overflow-hidden">
        <SwipeableTabs tabs={tabs} {...tabProps} />
      </main>
      <TabBar items={items} {...tabBarProps} />
    </div>
  )
}
```

### Sheet 页面

```tsx
function SheetPage() {
  return (
    <BottomSheet open={open} onOpenChange={setOpen}>
      <PageHeader title="Sheet 标题" />
      <div className="p-4">
        {/* 内容 */}
      </div>
    </BottomSheet>
  )
}
```
