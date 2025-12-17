# 第二十六章：构建配置

> Vite、环境变量、多目标构建

---

## 26.1 Vite 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const SERVICE_IMPL = process.env.SERVICE_IMPL || 'web'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  resolve: {
    alias: {
      '@': '/src',
      '#biometric-impl': `./src/services/platform/biometric/${SERVICE_IMPL}.ts`,
      '#storage-impl': `./src/services/platform/storage/${SERVICE_IMPL}.ts`,
    },
  },
  
  build: {
    outDir: SERVICE_IMPL === 'dweb' ? 'dist-dweb' : 'dist-web',
    sourcemap: true,
  },
})
```

---

## 26.2 环境变量

```bash
# .env.development
VITE_API_URL=http://localhost:3000

# .env.production
VITE_API_URL=https://api.bfmpay.com
```

```typescript
const apiUrl = import.meta.env.VITE_API_URL
```

---

## 26.3 构建命令

```json
{
  "scripts": {
    "build:web": "SERVICE_IMPL=web vite build",
    "build:dweb": "SERVICE_IMPL=dweb vite build",
    "build:all": "bun scripts/build.ts all"
  }
}
```

---

## 26.4 输出分析

```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({
      filename: 'dist/stats.html',
      open: true,
    }),
  ],
})
```

---

## 本章小结

- 通过环境变量切换平台实现
- 分开构建 Web 和 DWEB 版本
- 使用 visualizer 分析包体积
