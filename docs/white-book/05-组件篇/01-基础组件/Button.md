# Button 按钮

> 触发动作的交互元素

---

## 功能描述

用户点击后触发特定动作的交互元素。

---

## 属性规范

| 属性 | 类型 | 必需 | 默认值 | 说明 |
|-----|------|-----|-------|------|
| label | string | Y | - | 按钮文本 |
| variant | enum | N | 'primary' | 视觉变体 |
| size | enum | N | 'md' | 尺寸 |
| disabled | boolean | N | false | 禁用状态 |
| loading | boolean | N | false | 加载状态 |
| icon | Icon | N | - | 前置图标 |
| iconPosition | enum | N | 'left' | 图标位置：left, right |
| fullWidth | boolean | N | false | 是否占满宽度 |

### variant 变体

| 值 | 说明 | 使用场景 |
|---|------|---------|
| primary | 主要操作，强调色背景 | 确认、提交 |
| secondary | 次要操作，边框样式 | 取消、返回 |
| destructive | 危险操作，红色系 | 删除、退出 |
| ghost | 无边框，仅文字 | 链接、辅助操作 |
| gradient | 渐变背景 | 品牌强调 |

### size 尺寸

| 值 | 高度 | 使用场景 |
|---|------|---------|
| sm | 32px | 列表项、紧凑布局 |
| md | 44px | 默认，大多数场景 |
| lg | 52px | 页面主操作 |

---

## 状态机

```
                    ┌─────────────┐
                    │             │
         ┌──────────▼──────────┐  │
         │        Idle         │──┘
         └──────────┬──────────┘
                    │
       ┌────────────┼────────────┐
       │            │            │
       ▼            ▼            ▼
  ┌─────────┐  ┌─────────┐  ┌─────────┐
  │ Pressed │  │ Loading │  │Disabled │
  └────┬────┘  └─────────┘  └─────────┘
       │
       ▼
  ┌─────────┐
  │  Idle   │
  └─────────┘
```

### 状态说明

| 状态 | 触发条件 | 视觉表现 |
|-----|---------|---------|
| Idle | 默认状态 | 正常显示 |
| Pressed | 用户按下 | 背景变深/缩放 |
| Loading | loading=true | 显示加载指示器，禁用交互 |
| Disabled | disabled=true | 降低透明度，禁用交互 |

---

## 行为规范

### 必须 (MUST)

1. 按下时显示视觉反馈（颜色变化或缩放 0.98）
2. disabled 状态时阻止所有交互事件
3. loading 状态时显示加载指示器并禁用交互
4. 有明确的 accessible name

### 建议 (SHOULD)

1. 支持键盘 Enter/Space 触发
2. loading 时保持按钮宽度不变
3. 有图标时，图标与文字间距一致

### 可选 (MAY)

1. 支持长按操作
2. 支持触觉反馈（振动）

---

## 可访问性

| 要求 | 说明 |
|-----|------|
| role | button |
| aria-label | 无文本时必须提供 |
| aria-disabled | disabled 时设为 true |
| aria-busy | loading 时设为 true |
| 焦点指示器 | 聚焦时显示明显边框 |

---

## 使用示例

### 主要操作

```
[确认转账] ← primary, lg, fullWidth
```

### 次要操作

```
[取消]  [确认] ← secondary + primary
```

### 图标按钮

```
[← 返回] ← ghost + icon
```

### 加载状态

```
[○ 发送中...] ← loading=true
```

---

## 设计标注

### 尺寸规格

| 尺寸 | 高度 | 水平内边距 | 字号 | 圆角 |
|-----|------|-----------|-----|------|
| sm | 32px | 12px | 14px | 6px |
| md | 44px | 16px | 16px | 8px |
| lg | 52px | 24px | 18px | 10px |

### 颜色规格

| 变体 | 背景色 | 文字色 | 按压态 |
|-----|-------|-------|-------|
| primary | --color-primary | white | 加深 10% |
| secondary | transparent | --color-foreground | --color-muted |
| destructive | --color-destructive | white | 加深 10% |
| ghost | transparent | --color-foreground | --color-muted |
