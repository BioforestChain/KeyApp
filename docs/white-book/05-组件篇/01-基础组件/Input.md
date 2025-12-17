# Input 输入框

> 接收用户文本输入

---

## 功能描述

用于接收用户键盘输入的文本框组件。

---

## 属性规范

| 属性 | 类型 | 必需 | 默认值 | 说明 |
|-----|------|-----|-------|------|
| value | string | Y | - | 当前值 |
| onChange | (value) => void | Y | - | 值变更回调 |
| placeholder | string | N | - | 占位提示文本 |
| type | enum | N | 'text' | 输入类型 |
| disabled | boolean | N | false | 禁用状态 |
| readOnly | boolean | N | false | 只读状态 |
| error | string | N | - | 错误信息 |
| maxLength | number | N | - | 最大长度 |
| prefix | node | N | - | 前缀元素 |
| suffix | node | N | - | 后缀元素 |
| clearable | boolean | N | false | 显示清除按钮 |

### type 类型

| 值 | 说明 | 键盘类型 |
|---|------|---------|
| text | 普通文本 | 默认键盘 |
| password | 密码 | 默认键盘 |
| number | 数字 | 数字键盘 |
| decimal | 小数 | 带小数点的数字键盘 |
| tel | 电话 | 电话键盘 |
| email | 邮箱 | 带 @ 的键盘 |

---

## 状态机

```
                    focus
    ┌─────────┐  ──────────►  ┌─────────┐
    │  Idle   │               │ Focused │
    └─────────┘  ◄──────────  └─────────┘
         │           blur          │
         │                         │ input
         │                         ▼
         │                    ┌─────────┐
         │                    │  Dirty  │
         │                    └─────────┘
         │                         │
         │                         │ validate
         │                         ▼
         │    ┌─────────────────────────────────┐
         │    │                                 │
         │    ▼                                 ▼
         │ ┌─────────┐                    ┌─────────┐
         │ │  Valid  │                    │ Invalid │
         │ └─────────┘                    └─────────┘
         │
         │ disabled=true
         ▼
    ┌─────────┐
    │Disabled │
    └─────────┘
```

---

## 行为规范

### 必须 (MUST)

1. focus 时显示焦点指示器（边框颜色变化）
2. 有 error 时显示错误样式（红色边框）
3. 有 error 时在输入框下方显示错误信息
4. disabled 时阻止所有交互
5. 有关联的 label

### 建议 (SHOULD)

1. type="password" 时提供显示/隐藏切换按钮
2. clearable=true 且有内容时显示清除按钮
3. 支持 prefix/suffix 自定义元素
4. 超出 maxLength 时阻止继续输入

### 可选 (MAY)

1. 显示字符计数（当前/最大）
2. 支持自动完成建议

---

## 可访问性

| 要求 | 说明 |
|-----|------|
| label | 必须有关联的 label |
| aria-invalid | error 时设为 true |
| aria-describedby | 关联错误信息元素 |
| aria-disabled | disabled 时设为 true |

---

## 布局规范

```
┌─────────────────────────────────────┐
│ Label                        [必填] │  ← 标签行
├─────────────────────────────────────┤
│ [前缀] 输入内容...        [后缀/清除] │  ← 输入框
├─────────────────────────────────────┤
│ ⚠ 错误信息                          │  ← 错误提示（可选）
└─────────────────────────────────────┘
```

---

## 设计标注

### 尺寸规格

| 部分 | 规格 |
|-----|------|
| 高度 | 44px |
| 内边距 | 12px 16px |
| 字号 | 16px |
| 圆角 | 8px |
| 边框 | 1px |

### 颜色规格

| 状态 | 边框色 | 背景色 |
|-----|-------|-------|
| default | --color-border | --color-background |
| focused | --color-primary | --color-background |
| error | --color-destructive | --color-destructive/5 |
| disabled | --color-border | --color-muted |

---

## 变体

### TextArea 多行文本

继承 Input 所有属性，额外支持：

| 属性 | 类型 | 说明 |
|-----|------|------|
| rows | number | 显示行数 |
| autoResize | boolean | 是否自动调整高度 |
| maxRows | number | 最大行数 |

### SearchInput 搜索框

继承 Input 所有属性，额外支持：

| 属性 | 类型 | 说明 |
|-----|------|------|
| onSearch | (value) => void | 搜索回调 |
| loading | boolean | 搜索中状态 |

视觉特征：
- 前缀为搜索图标
- 圆角更大（pill 形状）
