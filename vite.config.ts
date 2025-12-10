import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'

/**
 * 服务实现选择（编译时）
 * - web: 浏览器环境（默认）
 * - dweb: DWEB/Plaoc 平台
 * - mock: 测试环境
 */
const SERVICE_IMPL = process.env.SERVICE_IMPL ?? 'web'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      
      // ==================== Platform Services (编译时替换) ====================
      // 每个服务独立文件夹，通过 SERVICE_IMPL 环境变量选择实现
      '#biometric-impl': resolve(__dirname, `./src/services/biometric/${SERVICE_IMPL}.ts`),
      '#clipboard-impl': resolve(__dirname, `./src/services/clipboard/${SERVICE_IMPL}.ts`),
      '#toast-impl': resolve(__dirname, `./src/services/toast/${SERVICE_IMPL}.ts`),
      '#haptics-impl': resolve(__dirname, `./src/services/haptics/${SERVICE_IMPL}.ts`),
      '#storage-impl': resolve(__dirname, `./src/services/storage/${SERVICE_IMPL}.ts`),
      '#camera-impl': resolve(__dirname, `./src/services/camera/${SERVICE_IMPL}.ts`),
      
      // Node.js polyfills
      buffer: 'buffer/',
    },
  },
  define: {
    // 全局 Buffer 支持
    'global': 'globalThis',
  },
  optimizeDeps: {
    include: ['buffer'],
  },
})
