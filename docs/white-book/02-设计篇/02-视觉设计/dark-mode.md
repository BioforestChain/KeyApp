# 暗色模式最佳实践

> 确保应用在浅色和暗色主题下都有良好的可读性和视觉体验。

---

## 核心原则

### 1. 使用语义化颜色 Token

**始终优先使用 shadcn/ui 的语义化颜色变量**，它们会自动适配主题：

```tsx
// ✅ 正确 - 使用语义化颜色
<div className="bg-background text-foreground">
  <p className="text-muted-foreground">辅助文字</p>
  <Button className="bg-primary text-primary-foreground">确认</Button>
</div>

// ❌ 错误 - 硬编码颜色
<div className="bg-white text-black">
  <p className="text-gray-500">辅助文字</p>
</div>
```

### 2. 配色对必须配套使用

每个 shadcn/ui 颜色变量都有对应的 `-foreground` 变体：

| 背景色 | 前景色 | 使用场景 |
|--------|--------|----------|
| `bg-primary` | `text-primary-foreground` | 主要按钮 |
| `bg-secondary` | `text-secondary-foreground` | 次要按钮 |
| `bg-destructive` | `text-destructive-foreground` | 危险按钮 |
| `bg-muted` | `text-muted-foreground` | 低调区域 |
| `bg-accent` | `text-accent-foreground` | 强调区域 |
| `bg-card` | `text-card-foreground` | 卡片容器 |

**例外**：`text-muted-foreground` 可以单独用于次要文字，不需要配套 `bg-muted`。

### 3. 禁止 `bg-primary text-white`

```tsx
// ❌ 错误 - text-white 在暗色模式下不会变色
<button className="bg-primary text-white">确认</button>

// ✅ 正确 - text-primary-foreground 会自动适配主题
<button className="bg-primary text-primary-foreground">确认</button>
```

**原因**：在暗色模式下，`--primary` 变亮而 `--primary-foreground` 变暗，保持对比度。`text-white` 始终是白色，在亮色的 `bg-primary` 上可能对比度不足。

### 4. 不要将背景色用作文字色

```tsx
// ❌ 错误 - secondary 是背景色
<p className="text-secondary">看不见的文字</p>

// ✅ 正确
<p className="text-muted-foreground">次要文字</p>
// 或用于按钮
<Button className="bg-secondary text-secondary-foreground">次要操作</Button>
```

### 5. `bg-muted` 必须指定文字颜色

```tsx
// ❌ 错误 - 没有文字颜色，可能继承错误的颜色
<div className="bg-muted">
  <span>这段文字可能不可见</span>
</div>

// ✅ 正确
<div className="bg-muted text-muted-foreground">
  <span>清晰可见</span>
</div>
```

---

## 硬编码颜色规则

### 需要 dark: 变体的情况

使用硬编码灰色时，**必须**添加暗色变体：

```tsx
// ✅ 正确 - 有 dark: 变体
<div className="bg-gray-100 dark:bg-gray-800">...</div>
<p className="text-gray-500 dark:text-gray-400">...</p>
<div className="border-gray-200 dark:border-gray-700">...</div>

// ❌ 错误 - 缺少 dark: 变体
<div className="bg-gray-100">...</div>
```

### 灰度映射参考

| 浅色 | 暗色 |
|------|------|
| gray-50 | gray-900 |
| gray-100 | gray-800 |
| gray-200 | gray-700 |
| gray-300 | gray-600 |
| gray-400 | gray-500 |
| gray-500 | gray-400 |

### 可接受的例外

以下情况**不需要** dark: 变体：

1. **半透明颜色在渐变/彩色背景上**：
   ```tsx
   // ✅ OK - 在渐变背景上
   <div className="bg-gradient-purple">
     <span className="bg-white/20">半透明装饰</span>
     <p className="text-white/80">白色文字</p>
   </div>
   ```

2. **相机/扫描器界面**：
   ```tsx
   // ✅ OK - 相机背景
   <div className="bg-black">
     <video />
   </div>
   ```

3. **固定颜色背景上的白字**（如 `bg-green-500`、`bg-red-500`）：
   ```tsx
   // ✅ OK - 固定颜色背景
   <div className="bg-green-500 text-white">成功</div>
   ```

4. **开发工具** (`mock-devtools/`)：规则可以放宽

---

## 自动检查

运行主题检查：

```bash
pnpm theme:check
```

检查规则：

| 规则 | 严重性 | 说明 |
|------|--------|------|
| `no-bg-as-text` | Error | 禁止将背景色用作文字色 |
| `text-white-on-semantic-bg` | Error | 禁止在语义背景色上使用 text-white |
| `orphan-foreground` | Warning | foreground 颜色应有配套背景 |
| `bg-muted-no-text-color` | Warning | bg-muted 需要明确的文字颜色 |
| `missing-dark-variant` | Warning | 硬编码灰色应有 dark: 变体 |

---

## 相关文档

- [主题配色系统](./theme-colors.md) - 配色对的详细说明
- [shadcn/ui 主题文档](https://ui.shadcn.com/docs/theming)
