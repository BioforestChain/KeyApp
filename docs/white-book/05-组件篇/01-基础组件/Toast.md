# Toast 轻提示

> 轻量级反馈消息

---

## 功能描述

短暂显示的轻量级消息提示，用于操作反馈，不需要用户交互。

---

## 属性规范

| 属性 | 类型 | 必需 | 默认值 | 说明 |
|-----|------|-----|-------|------|
| message | string | Y | - | 提示内容 |
| type | enum | N | 'info' | 类型 |
| duration | number | N | 3000 | 显示时长（ms） |
| position | enum | N | 'top' | 显示位置 |
| action | Action | N | - | 操作按钮 |

### type 类型

| 值 | 图标 | 颜色 | 使用场景 |
|---|------|-----|---------|
| info | ℹ | 中性 | 普通信息 |
| success | ✓ | 绿色 | 操作成功 |
| warning | ⚠ | 黄色 | 警告提示 |
| error | ✗ | 红色 | 操作失败 |

### position 位置

| 值 | 说明 |
|---|------|
| top | 顶部居中 |
| bottom | 底部居中（避开 TabBar） |

---

## 行为规范

### 必须 (MUST)

1. 自动消失（duration 后）
2. 有进入/退出动画
3. 多个 Toast 可堆叠显示
4. 同时最多显示 3 个

### 建议 (SHOULD)

1. 支持滑动提前关闭
2. 新 Toast 从最近位置进入
3. 点击 action 后自动关闭

### 可选 (MAY)

1. 支持 duration: Infinity（持续显示）
2. 支持进度条显示剩余时间

---

## 可访问性

| 要求 | 说明 |
|-----|------|
| role | status（info）或 alert（error/warning） |
| aria-live | polite（info）或 assertive（error） |
| 不阻断 | 不阻止用户操作 |

---

## 布局规范

### 单条 Toast

```
┌───────────────────────────────────┐
│  [图标]  提示消息内容    [操作]   │
└───────────────────────────────────┘
```

### 多条堆叠

```
┌───────────────────────────────────┐
│  Toast 3 (最新)                   │
└───────────────────────────────────┘
         ↑ 8px 间距
┌───────────────────────────────────┐
│  Toast 2                          │
└───────────────────────────────────┘
         ↑ 8px 间距
┌───────────────────────────────────┐
│  Toast 1 (最旧)                   │
└───────────────────────────────────┘
```

---

## 设计标注

### 尺寸规格

| 部分 | 规格 |
|-----|------|
| 最小宽度 | 200px |
| 最大宽度 | min(90vw, 400px) |
| 内边距 | 12px 16px |
| 圆角 | 8px |
| 图标尺寸 | 20px |
| 与边缘距离 | 16px |
| 与安全区距离 | env(safe-area-inset-*) |

### 动画规格

| 属性 | 值 |
|-----|---|
| 进入 | slideIn + fadeIn, 200ms |
| 退出 | slideOut + fadeOut, 150ms |
| 缓动 | ease-out |

### 默认持续时间

| 类型 | 时长 |
|-----|------|
| success | 2000ms |
| info | 3000ms |
| warning | 4000ms |
| error | 5000ms |

---

## 使用场景

### 操作成功

```
type: success
message: "复制成功"
duration: 2000
```

### 操作失败

```
type: error
message: "网络连接失败"
action: { label: "重试", onClick: retry }
duration: 5000
```

### 带操作

```
type: info
message: "交易已提交"
action: { label: "查看详情", onClick: viewTx }
```

---

## API 调用方式

建议提供命令式 API：

```
toast.success("复制成功")
toast.error("操作失败", { action: { label: "重试", onClick } })
toast.info("提示信息")
toast.warning("警告信息")
```
