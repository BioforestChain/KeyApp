# Sheet 底部抽屉

> 从底部滑出的模态面板

---

## 功能描述

从屏幕底部滑出的模态面板，用于展示次级操作或信息，不离开当前页面。

---

## 属性规范

| 属性 | 类型 | 必需 | 默认值 | 说明 |
|-----|------|-----|-------|------|
| open | boolean | Y | - | 是否打开 |
| onOpenChange | (open) => void | Y | - | 状态变更回调 |
| title | string | N | - | 标题 |
| description | string | N | - | 描述文本 |
| children | node | Y | - | 内容 |
| snapPoints | number[] | N | - | 吸附高度点 |
| dismissible | boolean | N | true | 是否可关闭 |

### snapPoints 吸附点

定义 Sheet 可以停留的高度（占屏幕高度的比例）：

```
snapPoints: [0.25, 0.5, 0.9]
// 25%、50%、90% 三个停留点
```

---

## 状态机

```
    ┌─────────┐  open=true   ┌─────────┐
    │ Closed  │ ───────────► │ Opening │
    └─────────┘              └─────────┘
         ▲                        │
         │                        │ animation done
         │                        ▼
         │                   ┌─────────┐
         │                   │  Open   │ ◄─┐
         │                   └─────────┘   │ snap
         │                        │        │
         │                        ├────────┘
         │                        │
         │    close               │ swipe down / backdrop / button
         │                        ▼
         │                   ┌─────────┐
         └─────────────────  │ Closing │
                             └─────────┘
```

---

## 行为规范

### 必须 (MUST)

1. 打开时显示半透明背景遮罩
2. 支持向下滑动关闭（滑动超过 30% 或速度快）
3. 支持点击背景遮罩关闭（dismissible=true 时）
4. 有流畅的打开/关闭动画
5. 顶部显示拖动指示条

### 建议 (SHOULD)

1. 打开时阻止背景滚动
2. 使用弹簧动画
3. 支持多个吸附点
4. 最大高度不超过 90% 屏幕高度

### 可选 (MAY)

1. 支持嵌套 Sheet
2. 支持左右滑动切换内容

---

## 可访问性

| 要求 | 说明 |
|-----|------|
| role | dialog |
| aria-modal | true |
| aria-labelledby | 关联标题 |
| 焦点陷阱 | 焦点限制在 Sheet 内 |
| 打开时 | 焦点移入 Sheet |
| 关闭时 | 焦点返回触发元素 |
| ESC 键 | 关闭 Sheet |

---

## 布局规范

```
┌─────────────────────────────────────┐
│              [遮罩层]               │
│                                     │
│  ┌─────────────────────────────────┐│
│  │           ═══════               ││ ← 拖动指示条
│  │         标题（可选）             ││
│  │         描述（可选）             ││
│  ├─────────────────────────────────┤│
│  │                                 ││
│  │           内容区域              ││ ← 可滚动
│  │                                 ││
│  ├─────────────────────────────────┤│
│  │         操作按钮（可选）         ││
│  │         [安全区域]              ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

## 设计标注

### 尺寸规格

| 部分 | 规格 |
|-----|------|
| 圆角 | 顶部 24px |
| 拖动条宽度 | 36px |
| 拖动条高度 | 4px |
| 拖动条距顶部 | 8px |
| 内边距 | 16px |
| 安全区域 | 底部 env(safe-area-inset-bottom) |

### 颜色规格

| 部分 | 颜色 |
|-----|------|
| 遮罩 | rgba(0, 0, 0, 0.5) |
| 背景 | --color-background |
| 拖动条 | --color-muted |

### 动画规格

| 属性 | 值 |
|-----|---|
| 打开时长 | 300ms |
| 关闭时长 | 200ms |
| 缓动函数 | spring (damping: 0.8) 或 ease-out |

---

## 手势规范

### 下滑关闭

```
滑动距离 < 30% 高度 → 弹回当前位置
滑动距离 ≥ 30% 高度 → 关闭
滑动速度 > 500px/s → 无论距离，直接关闭
```

### 多吸附点

```
松手时，根据当前位置和速度方向
选择最近的吸附点或上/下一个吸附点
```

---

## 使用场景

| 场景 | 配置 |
|-----|------|
| 确认操作 | 固定高度，有操作按钮 |
| 选择列表 | 可滚动内容，选中后自动关闭 |
| 详情展示 | 多吸附点，可展开查看更多 |
| 表单输入 | 键盘弹出时自动调整高度 |

---

## 技术实现

### 必须 (MUST)

1. **使用 Stackflow 的 BottomSheet 组件作为底层实现**

   ```tsx
   import { BottomSheet } from "@stackflow/plugin-basic-ui";
   ```

2. 这确保 Sheet 与 Stackflow Activity 系统正确集成，避免页面动画冲突

3. **禁止**使用自定义 `position: fixed` 实现，会导致：
   - 与 Stackflow 页面转场动画冲突
   - 背景页面"运动"问题
   - 滚动锁定与 Activity 生命周期不同步

### 封装规范

项目的 `BottomSheet` 组件（`src/components/layout/bottom-sheet.tsx`）应：

1. 内部使用 `@stackflow/plugin-basic-ui` 的 `BottomSheet`
2. 对外暴露符合本规范的 API
3. 添加项目特定的样式和行为扩展

```tsx
// 正确的实现方式
import { BottomSheet as StackflowBottomSheet } from "@stackflow/plugin-basic-ui";

export function BottomSheet({ open, onClose, children, ...props }) {
  if (!open) return null;
  
  return (
    <StackflowBottomSheet>
      {/* 自定义样式和内容 */}
      {children}
    </StackflowBottomSheet>
  );
}
```

---

## Roadmap / 待办事项

| 优先级 | 事项 | 状态 | 说明 |
|--------|------|------|------|
| P1 | 统一 safe-area-inset-bottom 处理 | 待处理 | 确保所有 Sheet Activity 在 iOS 设备上正确处理底部安全区域 |
| P2 | Sheet 手势下滑关闭 | 待评估 | Stackflow BottomSheet 是否原生支持，或需要额外实现 |
| P2 | Sheet 多吸附点支持 | 待评估 | 评估是否需要支持多个高度吸附点 |

---

## 参考文档

- **Stackflow 官方文档（LLM 友好版）**: https://stackflow.so/llms-full.txt
- **`@stackflow/plugin-basic-ui` API**: 包含 `AppScreen`、`BottomSheet`、`Modal` 三种 Activity 容器组件
