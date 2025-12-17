# 第十五章：组件规范

> 定义 UI 组件的行为契约和状态机

---

## 15.1 组件分类

### 分层架构

```
┌─────────────────────────────────────┐
│         Page Components             │  ← 页面组合层
├─────────────────────────────────────┤
│       Domain Components             │  ← 业务领域组件
│   (Wallet, Token, Transaction)      │
├─────────────────────────────────────┤
│       Common Components             │  ← 通用业务组件
│  (AddressDisplay, AmountDisplay)    │
├─────────────────────────────────────┤
│        Base Components              │  ← 基础 UI 组件
│   (Button, Input, Card, Sheet)      │
└─────────────────────────────────────┘
```

### 依赖规则

- 上层组件 **MAY** 依赖下层组件
- 下层组件 **MUST NOT** 依赖上层组件
- 同层组件 **SHOULD NOT** 相互依赖

---

## 15.2 基础组件规范

### 15.2.1 Button 按钮

**功能**：触发动作的交互元素

**属性规范**：

| 属性 | 类型 | 必需 | 说明 |
|-----|------|-----|------|
| label | string | Y | 按钮文本（可通过子元素提供） |
| variant | enum | N | 视觉变体：primary, secondary, destructive, ghost |
| size | enum | N | 尺寸：sm, md, lg |
| disabled | boolean | N | 禁用状态 |
| loading | boolean | N | 加载状态 |

**状态机**：

```
         ┌──────────────────────┐
         │                      │
         ▼                      │
    ┌─────────┐  press    ┌─────────┐
    │  Idle   │ ────────► │ Pressed │
    └─────────┘           └─────────┘
         │                      │
         │ disabled=true        │ release
         ▼                      ▼
    ┌─────────┐           ┌─────────┐
    │Disabled │           │  Idle   │
    └─────────┘           └─────────┘
```

**行为规范**：

1. **MUST** 在 press 事件时显示视觉反馈（颜色变化或缩放）
2. **MUST** 在 disabled 状态时阻止所有交互
3. **MUST** 在 loading 状态时显示加载指示器并禁用交互
4. **SHOULD** 支持键盘 Enter/Space 触发

**可访问性**：

- **MUST** 有 accessible name（通过 label 或 aria-label）
- **MUST** role="button"
- **MUST** 在 disabled 时设置 aria-disabled="true"

---

### 15.2.2 Input 输入框

**功能**：接收用户文本输入

**属性规范**：

| 属性 | 类型 | 必需 | 说明 |
|-----|------|-----|------|
| value | string | Y | 当前值 |
| onChange | (value) => void | Y | 值变更回调 |
| placeholder | string | N | 占位提示 |
| type | enum | N | 类型：text, password, number |
| error | string | N | 错误信息 |
| disabled | boolean | N | 禁用状态 |

**状态机**：

```
                    focus
    ┌─────────┐  ──────────►  ┌─────────┐
    │  Idle   │               │ Focused │
    └─────────┘  ◄──────────  └─────────┘
         │           blur          │
         │                         │ input
         │                         ▼
         │                    ┌─────────┐
         │                    │ Dirty   │
         │                    └─────────┘
         │                         │
         │ error                   │ validate
         ▼                         ▼
    ┌─────────┐               ┌─────────┐
    │ Invalid │  ◄──────────  │Validating│
    └─────────┘   fail        └─────────┘
```

**行为规范**：

1. **MUST** 在 focus 时显示焦点指示器
2. **MUST** 在有 error 时显示错误样式和错误信息
3. **SHOULD** type="password" 时提供显示/隐藏切换
4. **MAY** 提供清除按钮

---

### 15.2.3 Card 卡片

**功能**：内容容器，提供视觉分组

**属性规范**：

| 属性 | 类型 | 必需 | 说明 |
|-----|------|-----|------|
| children | node | Y | 卡片内容 |
| variant | enum | N | 变体：default, outline, elevated |
| pressable | boolean | N | 是否可点击 |

**行为规范**：

1. **MUST** 提供视觉边界（边框、阴影或背景色）
2. **MUST** pressable=true 时响应点击事件
3. **SHOULD** pressable=true 时有按压反馈

---

### 15.2.4 Sheet 底部抽屉

**功能**：从底部滑出的模态面板

**属性规范**：

| 属性 | 类型 | 必需 | 说明 |
|-----|------|-----|------|
| open | boolean | Y | 是否打开 |
| onClose | () => void | Y | 关闭回调 |
| title | string | N | 标题 |
| children | node | Y | 内容 |

**状态机**：

```
    ┌─────────┐  open=true   ┌─────────┐
    │ Closed  │ ───────────► │ Opening │
    └─────────┘              └─────────┘
         ▲                        │
         │                        │ animation complete
         │                        ▼
         │                   ┌─────────┐
         │ close             │  Open   │
         │                   └─────────┘
         │                        │
         │                        │ swipe down / backdrop tap / close button
         │                        ▼
         │                   ┌─────────┐
         └─────────────────  │ Closing │
                             └─────────┘
```

**行为规范**：

1. **MUST** 打开时显示半透明背景遮罩
2. **MUST** 支持向下滑动关闭
3. **MUST** 支持点击背景遮罩关闭
4. **MUST** 有打开/关闭动画
5. **SHOULD** 阻止背景内容滚动
6. **SHOULD** 顶部显示拖动指示条

**可访问性**：

- **MUST** role="dialog"
- **MUST** aria-modal="true"
- **MUST** 打开时焦点移入面板
- **MUST** 关闭时焦点返回触发元素

---

## 15.3 通用业务组件规范

### 15.3.1 AddressDisplay 地址显示

**功能**：显示区块链地址，支持复制和展示二维码

**属性规范**：

| 属性 | 类型 | 必需 | 说明 |
|-----|------|-----|------|
| address | string | Y | 完整地址 |
| format | enum | N | 显示格式：full, short (默认 short) |
| copyable | boolean | N | 是否可复制（默认 true） |
| showQR | boolean | N | 是否显示二维码按钮 |

**显示规则**：

- **short 格式**：显示前 6 位 + "..." + 后 4 位
  - 示例：`0x1234...5678`
- **full 格式**：显示完整地址，自动换行

**行为规范**：

1. **MUST** copyable=true 时点击复制完整地址
2. **MUST** 复制成功后显示反馈（toast 或图标变化）
3. **SHOULD** 使用等宽字体

---

### 15.3.2 AmountDisplay 金额显示

**功能**：格式化显示加密货币金额

**属性规范**：

| 属性 | 类型 | 必需 | 说明 |
|-----|------|-----|------|
| value | number \| bigint \| string | Y | 金额值 |
| symbol | string | Y | 货币符号 |
| decimals | number | N | 小数位数（默认 8） |
| sign | enum | N | 符号显示：always, negative, never |
| color | enum | N | 颜色模式：auto, none |

**显示规则**：

- 使用千分位分隔符
- 金额右对齐
- 符号显示在金额后方
- color=auto 时：正数绿色，负数红色

**格式化示例**：

| 输入 | decimals | 输出 |
|-----|---------|------|
| 1000000000 | 8 | 10.00000000 |
| 123456789 | 8 | 1.23456789 |
| 1234567890123456789n | 18 | 1.234567890123456789 |

---

### 15.3.3 TokenIcon 代币图标

**功能**：显示代币/链的图标

**属性规范**：

| 属性 | 类型 | 必需 | 说明 |
|-----|------|-----|------|
| symbol | string | Y | 代币符号 |
| iconUrl | string | N | 图标 URL |
| size | enum | N | 尺寸：sm(24), md(32), lg(48) |

**行为规范**：

1. **MUST** 有 iconUrl 时显示图标
2. **MUST** 无 iconUrl 或加载失败时显示 fallback
3. **Fallback 规则**：显示 symbol 首字母，背景色基于 symbol 哈希生成

---

## 15.4 钱包领域组件规范

### 15.4.1 WalletCard 钱包卡片

**功能**：展示钱包概览和快捷操作

**属性规范**：

| 属性 | 类型 | 必需 | 说明 |
|-----|------|-----|------|
| wallet | Wallet | Y | 钱包数据 |
| balance | Balance | N | 余额数据 |
| onTransfer | () => void | N | 转账回调 |
| onReceive | () => void | N | 收款回调 |

**Wallet 数据结构**：

```
Wallet {
  id: string
  name: string
  address: string
  chainId: string
  avatar?: string
}
```

**布局规范**：

```
┌─────────────────────────────────┐
│  [Avatar]  钱包名称              │
│            0x1234...5678  [复制] │
├─────────────────────────────────┤
│        ¥ 12,345.67              │  ← 法币估值（可选）
│        1.2345 BTC               │  ← 代币余额
├─────────────────────────────────┤
│  [转账]    [铸造]    [收款]      │  ← 快捷操作
└─────────────────────────────────┘
```

**行为规范**：

1. **MUST** 显示钱包名称和缩略地址
2. **SHOULD** 地址可点击复制
3. **SHOULD** 提供快捷操作按钮

---

### 15.4.2 ChainSelector 链选择器

**功能**：选择区块链网络

**属性规范**：

| 属性 | 类型 | 必需 | 说明 |
|-----|------|-----|------|
| value | ChainId | N | 当前选中的链 |
| onChange | (chain) => void | Y | 选择回调 |
| chains | Chain[] | Y | 可选链列表 |

**状态机**：

```
    ┌─────────┐   tap    ┌─────────┐
    │ Closed  │ ───────► │  Open   │
    └─────────┘          └─────────┘
         ▲                    │
         │                    │ select / cancel
         └────────────────────┘
```

**行为规范**：

1. **MUST** 显示当前选中链的图标和名称
2. **MUST** 打开选择面板（Sheet 或 Dropdown）
3. **MUST** 选中项有视觉标识
4. **SHOULD** 显示链的原生代币符号

---

### 15.4.3 TransactionItem 交易记录项

**功能**：显示单条交易记录

**属性规范**：

| 属性 | 类型 | 必需 | 说明 |
|-----|------|-----|------|
| transaction | Transaction | Y | 交易数据 |
| onPress | () => void | N | 点击回调 |

**Transaction 数据结构**：

```
Transaction {
  hash: string
  type: 'send' | 'receive' | 'swap' | 'approve' | 'contract'
  status: 'pending' | 'confirmed' | 'failed'
  amount: string
  symbol: string
  timestamp: number
  counterparty?: string  // 对方地址
}
```

**显示规范**：

```
┌───────────────────────────────────┐
│ [类型图标]  发送 / 接收            │
│             0x1234...5678         │  ← 对方地址
│                                   │
│                      -1.5 ETH     │  ← 金额（发送红/接收绿）
│             2024-01-15 14:30      │  ← 时间
│             [状态标签]             │  ← pending/confirmed/failed
└───────────────────────────────────┘
```

---

## 15.5 布局组件规范

### 15.5.1 AppLayout 应用布局

**功能**：定义应用的整体布局结构

**属性规范**：

| 属性 | 类型 | 必需 | 说明 |
|-----|------|-----|------|
| header | node | N | 顶部区域 |
| children | node | Y | 主内容区域 |
| footer | node | N | 底部区域（如 TabBar） |

**布局规范**：

```
┌─────────────────────────────┐
│          Header             │  ← 固定顶部
├─────────────────────────────┤
│                             │
│          Content            │  ← 可滚动区域
│                             │
├─────────────────────────────┤
│          Footer             │  ← 固定底部
└─────────────────────────────┘
```

**行为规范**：

1. **MUST** header 和 footer 固定定位
2. **MUST** content 区域可滚动
3. **MUST** 适配安全区域（刘海屏、底部指示条）
4. **SHOULD** content 滚动时 header 可选隐藏

---

### 15.5.2 TabBar 底部导航栏

**功能**：应用主导航

**属性规范**：

| 属性 | 类型 | 必需 | 说明 |
|-----|------|-----|------|
| items | TabItem[] | Y | 标签项列表 |
| activeIndex | number | Y | 当前激活索引 |
| onChange | (index) => void | Y | 切换回调 |

**TabItem 结构**：

```
TabItem {
  icon: Icon
  label: string
  badge?: number | boolean
}
```

**行为规范**：

1. **MUST** 激活项有视觉区分（颜色/填充图标）
2. **MUST** 支持触摸点击切换
3. **SHOULD** 有 badge 时显示红点或数字
4. **SHOULD** 底部适配安全区域

---

## 15.6 组件通用规范

### 加载状态

所有异步组件 **MUST** 提供以下状态：

| 状态 | 显示 |
|-----|------|
| loading | 骨架屏或加载指示器 |
| error | 错误信息 + 重试按钮 |
| empty | 空状态提示 |
| success | 正常内容 |

### 响应式

- **MUST** 适配 320px - 428px 宽度范围
- **SHOULD** 文字支持动态字体大小
- **MUST** 触摸目标最小 44x44 px

### 主题

- **MUST** 支持浅色/深色主题切换
- **MUST** 颜色使用语义化 token（如 primary, destructive）
- **MUST NOT** 硬编码颜色值

---

## 本章小结

- 组件分为基础、通用、领域、布局四层
- 每个组件有明确的状态机和行为规范
- 使用 MUST/SHOULD/MAY 定义实现要求
- 规范与具体技术栈无关

---

## 下一章

继续阅读 [第十六章：表单规范](../02-表单系统/)。
