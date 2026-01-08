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
  "permissions": [
    "wallet:read",
    "wallet:write"
  ],
  "splash_screen": {
    "timeout": 3000
  }
}
```

## 字段详解

*   `display`: 控制窗口模式。`standalone` (隐藏浏览器UI), `minimal-ui`, `browser`。
*   `permissions`: 申请的 BioBridge 权限。
*   `splash_screen`: 自定义启动闪屏的行为。
