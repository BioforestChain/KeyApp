# AI 开发指南 - 必读

> **重要**：本章节是 AI 模型开发本项目前的必读内容。

---

## 序言：纠正 AI 直觉

AI 模型在开发移动端 Web 应用时，往往会基于通用 Web 开发经验做出直觉性的选择。但本项目使用了特定的技术栈和架构模式，这些"直觉"可能导致严重的问题。

### 🚫 常见错误直觉

| 场景 | ❌ 错误直觉 | ✅ 正确做法 |
|------|------------|------------|
| 弹出层/Sheet | 使用 Radix Dialog、自定义 `position: fixed` | 使用 Stackflow 的 `BottomSheet` 或 `Modal` 组件 |
| 居中对话框 | 使用 Radix AlertDialog | 使用 Stackflow 的 `Modal` Activity |
| 页面导航 | 使用 React Router | 使用 Stackflow 的 `push()`、`pop()` |
| 状态管理 | 使用 Redux、Zustand 随意创建 store | 遵循 `stores/` 目录下的现有模式 |
| 样式 | 随意使用 inline style 或新建 CSS 文件 | 使用 Tailwind CSS 类名 |
| 组件库 | 随意安装 Ant Design、Material UI | 使用 shadcn/ui（已集成） |

### 📚 为什么会出错？

1. **Stackflow 是页面栈管理器**：它管理整个页面栈的动画和生命周期。使用 `position: fixed` 会绕过 Stackflow 的控制，导致动画冲突、页面"抖动"等问题。

2. **本项目是移动端优先**：需要原生 App 般的用户体验，包括滑动返回、栈式导航等。传统 Web 的弹窗模式不适用。

3. **组件已经封装好**：不要重新发明轮子，查看 `src/components/` 和 `src/stackflow/activities/sheets/` 下的现有实现。

---

## 目录索引

使用以下命令获取白皮书完整目录：

```bash
# 列出所有白皮书章节
find docs/white-book -name "*.md" | sort
```

或者让 AI 执行 Grep 命令动态获取。

### 核心章节速查

| 章节 | 路径 | 何时阅读 |
|------|------|---------|
| **导航系统** | `03-架构篇/03-导航系统/` | 实现页面跳转、Tab 切换时 |
| **Sheet 组件** | `05-组件篇/01-基础组件/Sheet.md` | 实现底部弹出层时 |
| **Dialog 组件** | `05-组件篇/01-基础组件/Dialog.md` | 实现居中对话框时 |
| **服务架构** | `04-服务篇/01-服务架构/` | 调用后端 API 或链服务时 |
| **钱包存储** | `04-服务篇/08-钱包数据存储/` | 操作钱包数据时 |
| **国际化** | `07-国际化篇/` | 添加文案或多语言时 |
| **测试策略** | `08-测试篇/` | 编写测试用例时 |

---

## 外部文档链接

以下是本项目依赖的核心库的 LLM 友好文档：

| 库 | 文档链接 | 用途 |
|---|---------|------|
| **Stackflow** | https://stackflow.so/llms-full.txt | 页面栈导航、Activity、Sheet、Modal |
| **shadcn/ui** | https://ui.shadcn.com/docs | UI 组件库 |
| **TanStack Query** | https://tanstack.com/query/latest | 数据获取和缓存 |
| **TanStack Store** | https://tanstack.com/store/latest | 状态管理 |

---

## 开发检查清单

在开始编码前，请确认：

- [ ] 是否已阅读相关白皮书章节？
- [ ] 是否已查看 `src/` 下的类似实现？
- [ ] 弹出层是否使用了 Stackflow 的 `BottomSheet` 或 `Modal`？
- [ ] 是否遵循了现有的代码风格和模式？
- [ ] 是否添加了必要的国际化文案？
- [ ] 是否更新了相关测试？

---

## 快速参考

### Stackflow Activity 类型

```tsx
// 普通全屏页面
import { AppScreen } from "@stackflow/plugin-basic-ui";

// 底部弹出层（Sheet）
import { BottomSheet } from "@stackflow/plugin-basic-ui";

// 居中对话框（Modal）
import { Modal } from "@stackflow/plugin-basic-ui";
```

### 导航操作

```tsx
import { useFlow } from "@/stackflow";

const { push, pop, replace } = useFlow();

// 打开新页面
push("ActivityName", { param: "value" });

// 返回上一页
pop();

// 替换当前页面
replace("ActivityName", { param: "value" });
```

### Sheet Activity 模式

当需要创建新的 Sheet 时，参考 `src/stackflow/activities/sheets/` 下的实现：

1. 创建 Activity 组件，使用 `<BottomSheet>` 或 `<Modal>` 包裹
2. 在 `stackflow.ts` 中注册路由和组件
3. 在 `sheets/index.ts` 中导出

---

## 常见问题

### Q: 为什么我的弹窗导致页面"抖动"或消失？

A: 你可能使用了 Radix Dialog 或自定义 `position: fixed`。这会与 Stackflow 的动画系统冲突。请改用 Stackflow 的 `BottomSheet` 或 `Modal`。

### Q: 如何传递数据给 Sheet 并获取返回值？

A: 使用全局回调模式。参考 `PasswordConfirmSheetActivity` 的实现：

```tsx
// 设置回调
setPasswordConfirmCallback((password) => {
  // 处理返回的密码
});

// 打开 Sheet
push("PasswordConfirmSheetActivity", {});
```

### Q: 什么时候用 BottomSheet，什么时候用 Modal？

- **BottomSheet**：选择列表、表单输入、确认操作（从底部滑入）
- **Modal**：警告、确认对话框（居中显示）
