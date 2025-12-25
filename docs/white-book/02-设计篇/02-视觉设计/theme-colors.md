# 主题配色系统

> shadcn/ui 配色对的正确使用方式

---

## 核心概念：配色对

shadcn/ui 使用**配色对**设计，每个颜色变量都有对应的 `xxx-foreground`：

| 变量 | 用途 |
|------|------|
| `--xxx` | **背景色** |
| `--xxx-foreground` | **在该背景上的前景色/文字色** |

**关键规则**：它们必须**配套使用**。

---

## 配色对一览

```
┌─────────────────────────────────────────────────────────────┐
│                      配色对使用指南                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  primary          ──────────────────────►  主要操作         │
│  ┌─────────────────────────────────────┐                   │
│  │ bg-primary text-primary-foreground  │ 主要按钮          │
│  └─────────────────────────────────────┘                   │
│  ┌─────────────────────────────────────┐                   │
│  │ text-primary                        │ 强调文字/链接      │
│  └─────────────────────────────────────┘                   │
│                                                             │
│  secondary        ──────────────────────►  次要操作         │
│  ┌─────────────────────────────────────┐                   │
│  │ bg-secondary text-secondary-foreground │ 次要按钮       │
│  └─────────────────────────────────────┘                   │
│                                                             │
│  muted            ──────────────────────►  低调/辅助        │
│  ┌─────────────────────────────────────┐                   │
│  │ bg-muted text-muted-foreground      │ 低调背景区域      │
│  └─────────────────────────────────────┘                   │
│  ┌─────────────────────────────────────┐                   │
│  │ text-muted-foreground               │ 次要/辅助文字     │
│  └─────────────────────────────────────┘                   │
│                                                             │
│  destructive      ──────────────────────►  危险/删除        │
│  ┌─────────────────────────────────────┐                   │
│  │ bg-destructive text-destructive-foreground │ 危险按钮   │
│  └─────────────────────────────────────┘                   │
│  ┌─────────────────────────────────────┐                   │
│  │ text-destructive                    │ 错误文字          │
│  └─────────────────────────────────────┘                   │
│                                                             │
│  accent           ──────────────────────►  强调/高亮        │
│  ┌─────────────────────────────────────┐                   │
│  │ bg-accent text-accent-foreground    │ 悬停/选中状态     │
│  └─────────────────────────────────────┘                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 正确用法示例

### ✅ 主要按钮

```tsx
<Button className="bg-primary text-primary-foreground">
  确认
</Button>
```

### ✅ 次要按钮

```tsx
<Button className="bg-secondary text-secondary-foreground">
  取消
</Button>
```

### ✅ 次要/辅助文字

```tsx
<p className="text-muted-foreground">
  这是辅助说明文字
</p>
```

### ✅ 强调文字/链接

```tsx
<a className="text-primary hover:underline">
  查看详情
</a>
```

### ✅ 错误提示

```tsx
<p className="text-destructive">
  密码不正确
</p>
```

### ✅ 成功/确认状态

```tsx
<Check className="text-green-500" />
<span className="text-green-500">交易成功</span>
```

---

## 常见错误

### ❌ 错误：text-secondary 当文字用

```tsx
// ❌ 错误！secondary 是背景色，在亮色主题下几乎不可见
<p className="text-secondary">这段文字看不见</p>

// ✅ 正确
<p className="text-muted-foreground">次要文字</p>
```

### ❌ 错误：用 secondary 表示成功状态

```tsx
// ❌ 错误！secondary 是中性灰色，不代表成功
<Check className="text-secondary" />

// ✅ 正确
<Check className="text-green-500" />
```

### ❌ 错误：单独使用 foreground 类

```tsx
// ❌ 错误！foreground 颜色是为特定背景设计的
<div className="text-primary-foreground">
  这个白色文字在默认背景上看不清
</div>

// ✅ 正确：配套使用
<div className="bg-primary text-primary-foreground">
  这样才对
</div>
```

---

## 语义色对照表

| 语义 | 正确用法 | 使用场景 |
|------|----------|----------|
| 主要操作 | `bg-primary text-primary-foreground` | 主要按钮 |
| 主要强调 | `text-primary` | 链接、强调文字 |
| 次要操作 | `bg-secondary text-secondary-foreground` | 次要按钮 |
| 次要文字 | `text-muted-foreground` | 辅助说明、时间戳 |
| 危险操作 | `bg-destructive text-destructive-foreground` | 删除按钮 |
| 错误提示 | `text-destructive` | 错误信息 |
| 成功状态 | `text-green-500` | 完成、确认 |
| 警告状态 | `text-yellow-500` | 警告、注意 |
| 信息提示 | `text-blue-500` | 一般提示 |

---

## 当前主题变量值

### 亮色主题

```css
:root {
  --primary: oklch(0.59 0.26 323);           /* 品牌紫色 */
  --primary-foreground: oklch(1 0 0);        /* 白色 */
  
  --secondary: oklch(0.967 0.001 286.375);   /* 极浅灰（背景） */
  --secondary-foreground: oklch(0.21 0.006 285.885); /* 深色文字 */
  
  --muted: oklch(0.967 0.001 286.375);       /* 极浅灰（同 secondary） */
  --muted-foreground: oklch(0.552 0.016 285.938); /* 中灰文字 */
  
  --destructive: oklch(0.577 0.245 27.325);  /* 红色 */
  --destructive-foreground: oklch(1 0 0);    /* 白色 */
}
```

### 暗色主题

```css
.dark {
  --primary: oklch(0.67 0.26 322);           /* 亮一点的品牌紫色 */
  --primary-foreground: oklch(0.141 0.005 285.823); /* 深色 */
  
  --secondary: oklch(0.274 0.006 286.033);   /* 深灰（背景） */
  --secondary-foreground: oklch(0.985 0 0);  /* 白色文字 */
  
  --muted: oklch(0.274 0.006 286.033);       /* 深灰（同 secondary） */
  --muted-foreground: oklch(0.705 0.015 286.067); /* 浅灰文字 */
  
  --destructive: oklch(0.704 0.191 22.216);  /* 亮红色 */
  --destructive-foreground: oklch(1 0 0);    /* 白色 */
}
```

---

## 快速参考

| 我想要... | 使用 |
|-----------|------|
| 主要按钮 | `bg-primary text-primary-foreground` |
| 次要按钮 | `bg-secondary text-secondary-foreground` |
| 危险按钮 | `bg-destructive text-destructive-foreground` |
| 强调链接 | `text-primary` |
| 辅助文字 | `text-muted-foreground` |
| 错误文字 | `text-destructive` |
| 成功图标 | `text-green-500` |
| 低调背景 | `bg-muted` |
| 卡片背景 | `bg-card text-card-foreground` |

---

## 本节小结

1. **配色对必须配套使用**：`bg-xxx` 搭配 `text-xxx-foreground`
2. **不要单独使用 `text-secondary`**：它是背景色，不是文字色
3. **次要文字用 `text-muted-foreground`**：这才是设计给辅助文字的颜色
4. **成功/确认状态用 `text-green-500`**：不要用 secondary
5. **理解亮/暗模式差异**：颜色值会自动切换，保持对比度

---

## 相关链接

- [shadcn/ui 主题文档](https://ui.shadcn.com/docs/theming)
- [Tailwind CSS 颜色](https://tailwindcss.com/docs/customizing-colors)
