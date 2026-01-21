# 02. 小程序清单规范 (Manifest)

Code: `src/ecosystem/types.ts`

每个 Miniapp 必须在其根目录提供一个 `manifest.json` 文件。

## 示例

```json
{
  "name": "Uniswap",
  "short_name": "Uniswap",
  "start_url": "./index.html",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#ff007a",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ],
  "permissions": ["wallet:read", "wallet:write"],
  "splash_screen": {
    "timeout": 3000
  }
}
```

## 字段详解

- `display`: 控制窗口模式。`standalone` (隐藏浏览器UI), `minimal-ui`, `browser`。
- `permissions`: 申请的 BioBridge 权限。
- `splash_screen`: 自定义启动闪屏的行为。

## 样式规范 (CSS Guidelines)

Miniapp 运行在 KeyApp 的容器中（iframe 或 Wujie 沙箱），需要遵循以下样式规范以确保正确渲染。

### 布局高度

**关键规则**: 避免使用 `100vh`，改用 `100%`。

| ❌ 错误                   | ✅ 正确                 | 原因                               |
| ------------------------- | ----------------------- | ---------------------------------- |
| `min-height: 100vh`       | `min-height: 100%`      | `100vh` 参考主文档视口，会超出容器 |
| `height: 100vh`           | `height: 100%`          | 同上                               |
| `min-h-screen` (Tailwind) | `min-h-full` (Tailwind) | `min-h-screen` 等价于 `100vh`      |

### 必需的根样式

在 Miniapp 的全局 CSS 中，必须设置完整的高度链：

```css
/* src/index.css */
html,
body,
#root {
  height: 100%;
  width: 100%;
}
```

### 完整示例

```css
/* index.css */
html,
body,
#root {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}

/* App 容器 */
.app-container {
  min-height: 100%; /* ✅ 使用 100% */
  /* min-height: 100vh;  ❌ 不要使用 */
}
```

```tsx
// App.tsx (Tailwind)
export function App() {
  return (
    <div className="bg-background min-h-full">
      {' '}
      {/* ✅ min-h-full */}
      {/* ... */}
    </div>
  );
}
```

### 为什么不能用 `100vh`？

在 Wujie 容器模式下，Miniapp 的 UI 渲染在 Shadow DOM 中，而 JS 运行在一个隐藏的 iframe 中。`100vh` 单位参考的是**主文档（KeyApp）的视口高度**，而非 Miniapp 容器的高度。

```
┌─────────────────────────────────────┐  ← 主文档视口 (100vh 参考这里)
│ KeyApp Host                         │
│  ┌───────────────────────────────┐  │
│  │ Miniapp 容器 (实际可用空间)   │  │  ← Miniapp 应该填满这里
│  │                               │  │
│  │  使用 100vh 会超出容器边界！  │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│  [底部导航栏]                       │
└─────────────────────────────────────┘
```

### 相关文档

- [Container 架构](./01-Container-Architecture.md) - 了解 iframe/Wujie 双模式
