# 设计基础 (Foundation)

> 设计系统的基础层：原则、颜色、交互规范

---

## 文档列表

| 文档 | 说明 |
|------|------|
| [01-Colors](./01-Colors.md) | 基础颜色定义 |
| [02-Design-Principles](./02-Design-Principles.md) | 设计原则（信任优先、渐进复杂度） |
| [03-Theme-Colors](./03-Theme-Colors.md) | 主题配色系统（配色对、钱包主题色） |
| [04-Interaction-Specs](./04-Interaction-Specs.md) | 交互规范（触摸、手势、动效、可访问性） |

---

## 快速参考

### 行为约束级别

| 级别 | 含义 | 后果 |
|------|------|------|
| **MUST** | 必须遵守 | 违反导致功能缺陷或安全问题 |
| **SHOULD** | 建议遵守 | 不遵守会降低用户体验 |
| **MAY** | 可选实现 | 增强体验但非必需 |
| **MUST NOT** | 禁止行为 | 违反导致严重问题 |

### 设计核心原则

1. **信任优先** - 透明、可控、安全提示
2. **渐进复杂度** - 新手友好，进阶可选
3. **响应式设计** - 移动优先，360px 为设计基准

### 配色对规则

```tsx
// ✅ 配套使用
<Button className="bg-primary text-primary-foreground" />

// ❌ 禁止单独使用 foreground
<span className="text-primary-foreground" />
```

### 触摸目标最小尺寸

- iOS: 44 × 44 px
- Android: 48 × 48 dp

---

## 相关文档

- [组件库索引](../05-Components/00-Index.md)
- [原子组件](../02-Primitives/00-Index.md)
