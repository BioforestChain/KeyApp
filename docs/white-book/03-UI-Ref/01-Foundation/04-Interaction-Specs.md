# 交互规范

> 源码: 全局交互行为、动效和可访问性规范

---

## 触摸交互规范

### 触摸目标

| 规范 | 要求 | 约束级别 |
|------|------|----------|
| 最小尺寸 | 44 × 44 px (iOS) / 48 × 48 dp (Android) | MUST |
| 间距 | 相邻可触摸元素间距 ≥ 8 px | MUST |
| 热区扩展 | 视觉元素 < 最小尺寸时扩展触摸热区 | SHOULD |

### 触摸反馈

| 事件 | 反馈 | 时机 | 约束级别 |
|------|------|------|----------|
| touch start | 视觉变化 | 立即 | MUST |
| touch end | 恢复原状 | 立即 | MUST |
| long press | 振动 + 上下文菜单 | 500ms | SHOULD |

### 按压态规范

```css
/* Button 按压态 */
.button:active {
  opacity: 0.7;           /* 或 */
  transform: scale(0.98); /* 或 */
  filter: brightness(0.9);
}

/* Card 按压态 */
.card:active {
  transform: scale(0.98);
  box-shadow: /* 增强阴影 */;
}
```

---

## 手势规范

### 滑动手势

| 手势 | 方向 | 应用场景 | 约束级别 |
|------|------|----------|----------|
| 滑动 | 水平 | 列表项操作 | MAY |
| 滑动 | 垂直 | Sheet 关闭 | MUST |
| 下拉 | 垂直向下 | 刷新内容 | SHOULD |

### Sheet 关闭手势

```typescript
const sheetGesture = {
  // 关闭阈值
  closeThreshold: 0.3,  // 30% 高度
  
  // 速度检测
  velocityThreshold: 500,  // px/s
  
  // 决策逻辑
  shouldClose: (distance: number, velocity: number, height: number) => {
    if (velocity > velocityThreshold) return true;
    return distance / height >= closeThreshold;
  }
};
```

### 禁止行为

| 行为 | 约束级别 |
|------|----------|
| 拦截系统缩放手势 | MUST NOT |
| 拦截系统返回手势 | MUST NOT |
| 自定义不可预期的手势 | SHOULD NOT |

---

## 动效规范

### 时间曲线

| 动效类型 | 持续时间 | 缓动函数 | 约束级别 |
|----------|----------|----------|----------|
| 微交互 | 100-150ms | ease-out | MUST |
| 页面切换 | 250-350ms | ease-in-out | MUST |
| Sheet 展开 | 300-400ms | spring(0.8) | SHOULD |
| 骨架闪烁 | 1500ms | linear | SHOULD |

### 页面转场

```typescript
// Push 进入
const pushAnimation = {
  entering: {
    transform: 'translateX(0)',
    opacity: 1,
    from: { transform: 'translateX(100%)', opacity: 1 }
  },
  exiting: {
    transform: 'translateX(-30%)',
    opacity: 0.3,
    from: { transform: 'translateX(0)', opacity: 1 }
  }
};

// Pop 返回
const popAnimation = {
  entering: {
    transform: 'translateX(0)',
    opacity: 1,
    from: { transform: 'translateX(-30%)', opacity: 0.3 }
  },
  exiting: {
    transform: 'translateX(100%)',
    opacity: 1,
    from: { transform: 'translateX(0)', opacity: 1 }
  }
};
```

### 3D 卡片效果

```css
/* 透视容器 */
.perspective-container {
  perspective: 1000px;
}

/* 3D 卡片 */
.card-3d {
  --tilt-x: 0;
  --tilt-y: 0;
  --tilt-intensity: 0;
  
  transform: rotateX(calc(var(--tilt-x) * 1deg)) 
             rotateY(calc(var(--tilt-y) * 1deg));
  transform-style: preserve-3d;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 参数限制 */
.card-3d {
  --max-tilt: 15;        /* 最大倾斜角度 ±15° */
  --perspective: 1000px; /* 透视距离 */
  --transition: 400ms;   /* 过渡时长 */
}
```

### 减少动效模式

| 约束 | 说明 |
|------|------|
| MUST | 检测系统 "减少动效" 设置 |
| MUST | 禁用弹簧动画 |
| MUST | 使用淡入淡出替代滑动 |
| MUST | 缩短动画时间至最小 |

```typescript
const prefersReducedMotion = 
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const duration = prefersReducedMotion ? 0 : 300;
```

---

## 加载状态规范

### 骨架屏

| 适用场景 | 形态 | 约束级别 |
|----------|------|----------|
| 文本 | 圆角矩形，高度=行高 | SHOULD |
| 头像 | 圆形 | SHOULD |
| 卡片 | 与实际尺寸一致 | SHOULD |
| 列表 | 重复 3-5 个骨架项 | SHOULD |

```css
/* 骨架动画 */
@keyframes skeleton-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    hsl(var(--muted)) 25%,
    hsl(var(--muted) / 0.5) 50%,
    hsl(var(--muted)) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
}
```

### 加载指示器类型

| 类型 | 适用场景 | 约束级别 |
|------|----------|----------|
| Spinner | 按钮内、小区域 | SHOULD |
| Skeleton | 页面首次加载 | SHOULD |
| Progress | 已知进度操作 | MAY |

---

## 空状态规范

### 结构

```
┌─────────────────────────────────┐
│          [插图/图标]             │
│                                 │
│         主标题                   │
│         副标题（可选）           │
│                                 │
│         [操作按钮]               │
└─────────────────────────────────┘
```

### 文案规范

| 元素 | 内容 | 约束级别 |
|------|------|----------|
| 主标题 | 描述当前状态 | MUST |
| 副标题 | 说明原因或引导 | SHOULD |
| 按钮 | 提供恢复路径 | SHOULD |

---

## 反馈规范

### Toast 消息

| 类型 | 图标 | 持续时间 | 约束级别 |
|------|------|----------|----------|
| success | ✓ | 2s | MUST |
| error | ✗ | 3s | MUST |
| warning | ⚠ | 3s | SHOULD |
| info | ℹ | 2s | SHOULD |

### 振动反馈

| 场景 | 振动类型 | 约束级别 |
|------|----------|----------|
| 按钮点击 | light | MAY |
| 操作成功 | success | SHOULD |
| 操作失败 | error | SHOULD |
| 危险确认 | warning | MUST |

### 振动约束

| 约束 | 说明 |
|------|------|
| MUST | 检测系统振动设置 |
| MUST NOT | 静音模式下振动（除非用户明确开启） |

---

## 可访问性规范

### 语义结构

| 元素 | 语义角色 | 约束级别 |
|------|----------|----------|
| 导航栏 | role="navigation" | MUST |
| 主内容 | role="main" | MUST |
| 对话框 | role="dialog" | MUST |
| 列表 | role="list" | SHOULD |
| 按钮 | role="button" | MUST |

### 焦点管理

| 约束 | 说明 |
|------|------|
| MUST | 遵循视觉阅读顺序 |
| MUST | 可通过键盘 Tab 遍历 |
| MUST | 模态对话框内焦点循环 |
| MUST | 关闭对话框时焦点返回触发元素 |

### 屏幕阅读器

| 约束 | 说明 |
|------|------|
| MUST | 所有按钮有 accessible name |
| MUST | 所有输入框有 label |
| MUST | 图标按钮使用 aria-label |
| SHOULD | 动态内容使用 aria-live |

### 对比度

| 元素 | 最小对比度 | WCAG 级别 |
|------|-----------|-----------|
| 正文文本 | 4.5:1 | AA |
| 大文本 (≥18px) | 3:1 | AA |
| 图标 | 3:1 | AA |
| 禁用状态 | 无要求 | - |

---

## 相关文档

- [设计原则](./02-Design-Principles.md)
- [主题配色](./03-Theme-Colors.md)
- [组件库](../05-Components/00-Index.md)
