# 01. Container 架构 (Container Architecture)

> Code: `src/services/miniapp-runtime/container/`

KeyApp 的 Miniapp 运行时采用 **Container 抽象层** 设计，支持多种沙箱隔离技术。

## 设计目标

1. **统一接口**: 无论底层使用 iframe 还是 Wujie，上层代码通过统一的 `ContainerHandle` 操作
2. **可扩展性**: 未来可轻松添加新的容器实现（如 Web Worker、Shadow DOM）
3. **平滑迁移**: 从 iframe 模式迁移到 Wujie 模式无需修改 UI 层代码

## 容器类型

| 类型     | 实现文件              | 特点               | 适用场景      |
| -------- | --------------------- | ------------------ | ------------- |
| `iframe` | `iframe-container.ts` | 原生浏览器隔离     | 简单 H5 应用  |
| `wujie`  | `wujie-container.ts`  | JS 沙箱 + CSS 隔离 | 复杂 SPA 应用 |

## 核心接口

### ContainerCreateOptions

创建容器时的配置选项：

```typescript
interface ContainerCreateOptions {
  type: 'iframe' | 'wujie';
  appId: string;
  url: string;
  mountTarget: HTMLElement; // 容器挂载的目标元素
}
```

### ContainerHandle

容器操作句柄：

```typescript
interface ContainerHandle {
  element: HTMLElement; // 容器的 DOM 元素
  destroy: () => void; // 销毁容器
  moveToForeground: () => void; // 移到前台
  moveToBackground: () => void; // 移到后台
  getIframe: () => HTMLIFrameElement | null; // 获取 iframe（用于通讯）
}
```

## 工作原理

### 1. iframe 模式

直接创建 `<iframe>` 元素：

```
┌─────────────────────────────────────┐
│ KeyApp Host                         │
│  ┌───────────────────────────────┐  │
│  │ iframe (sandbox)              │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │ Miniapp HTML/JS/CSS     │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

- `getIframe()` 直接返回 iframe 元素本身

### 2. Wujie 模式

Wujie 创建一个隐藏的 iframe 用于 JS 沙箱，UI 渲染到指定容器：

```
┌─────────────────────────────────────┐
│ KeyApp Host                         │
│  ┌───────────────────────────────┐  │
│  │ Container (wujie 渲染目标)    │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │ Miniapp UI (Shadow DOM) │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Hidden iframe (JS Sandbox)    │  │ ← getIframe() 返回此元素
│  │ name="appId"                  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

- Wujie 的 JS 沙箱运行在一个隐藏的同域 iframe 中
- `getIframe()` 通过 `document.querySelector('iframe[name="appId"]')` 获取

## 使用示例

```typescript
import { createContainer } from '@/services/miniapp-runtime/container';

// 创建容器
const handle = await createContainer({
  type: 'wujie', // 或 'iframe'
  appId: 'my-miniapp',
  url: 'https://example.com/miniapp/',
  mountTarget: containerRef.current!,
});

// 获取 iframe 用于通讯
const iframe = handle.getIframe();
if (iframe) {
  // 通过 PostMessage 通讯
  iframe.contentWindow?.postMessage(message, '*');
}

// 销毁容器
handle.destroy();
```

## 与 Bio-SDK 通讯

无论使用哪种容器类型，Bio-SDK 通讯都通过 `PostMessageBridge` 实现：

```typescript
import { attachBioProviderToContainer } from '@/services/miniapp-runtime';

// 附加 Bio Provider 到容器
attachBioProviderToContainer(handle, {
  onRequest: async (method, params) => {
    // 处理来自 Miniapp 的请求
  },
});
```

详见 [Bio-SDK 通讯机制](../02-Connectivity/01-Bio-SDK-Communication.md)。

## 样式隔离

### Wujie 模式下的样式注意事项

Wujie 容器使用 Shadow DOM 实现 CSS 隔离。Miniapp 需要注意：

1. **避免使用 `100vh`**: 在嵌套 iframe/Shadow DOM 中，`100vh` 参考的是主文档视口，而非容器高度
2. **使用百分比高度**: 推荐使用 `height: 100%` 配合正确的父元素高度链

**推荐做法**:

```css
/* ✅ 正确 */
html,
body,
#root {
  height: 100%;
  width: 100%;
}

.container {
  min-height: 100%; /* 或 min-h-full (Tailwind) */
}

/* ❌ 错误 */
.container {
  min-height: 100vh; /* 会超出容器 */
}
```

详见 [Miniapp 样式规范](#miniapp-样式规范)。

## 相关文档

- [Miniapp Manifest 规范](./02-Miniapp-Manifest.md)
- [Bio-SDK 通讯机制](../02-Connectivity/01-Bio-SDK-Communication.md)
- [Ecosystem 组件](../../03-UI-Ref/05-Components/09-Ecosystem.md)
