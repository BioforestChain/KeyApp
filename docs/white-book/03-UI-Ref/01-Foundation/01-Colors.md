# 01. 色彩系统 (Colors)

基于 HSL 值的 CSS 变量系统。

## 基础色板

| Token | 描述 | 用途 |
| :--- | :--- | :--- |
| `background` | 页面背景 | body, dialog background |
| `foreground` | 页面文字 | body text |
| `card` | 卡片背景 | Card, Popover |
| `primary` | 主色调 | 主要按钮, 激活状态 |
| `secondary` | 次色调 | 次要按钮, 标签 |
| `muted` | 柔和色 | 辅助文字, 禁用状态 |
| `accent` | 强调色 | 悬停效果, 选中项 |
| `destructive` | 破坏色 | 删除, 错误提示 |

## 使用示例

```tsx
// ✅ 正确：语义化
<div className="bg-background text-foreground">
  <button className="bg-primary text-primary-foreground">Action</button>
  <span className="text-muted-foreground">Subtitle</span>
</div>

// ❌ 错误：硬编码
<div className="bg-white text-black">
  <button className="bg-blue-500 text-white">Action</button>
</div>
```
