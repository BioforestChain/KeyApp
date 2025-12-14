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

/**
 * Base URL 配置
 * - 使用 './' 允许部署在任意子路径下
 * - 例如: https://example.com/ 或 https://example.com/app/
 */
const BASE_URL = process.env.VITE_BASE_URL ?? './'

export default defineConfig({
  base: BASE_URL,
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
      '#authorize-impl': resolve(__dirname, `./src/services/authorize/${SERVICE_IMPL}.ts`),
      '#currency-exchange-impl': resolve(__dirname, `./src/services/currency-exchange/${SERVICE_IMPL === 'dweb' ? 'web' : SERVICE_IMPL}.ts`),

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
  build: {
    // 确保资源路径使用相对路径
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // 使用 hash 命名避免缓存问题
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // 手动分块，减少主 chunk 体积
        manualChunks(id) {
          // React 核心
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor'
          }
          // TanStack
          if (id.includes('node_modules/@tanstack/')) {
            return 'tanstack'
          }
          // Radix UI
          if (id.includes('node_modules/@radix-ui/')) {
            return 'radix'
          }
          // 动画
          if (id.includes('node_modules/motion/') || id.includes('node_modules/framer-motion/')) {
            return 'motion'
          }
          // i18n
          if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) {
            return 'i18n'
          }
          // 加密库 - 最大的依赖
          if (id.includes('node_modules/@noble/') || id.includes('node_modules/@scure/')) {
            return 'crypto'
          }
          // BioForest 链库
          if (id.includes('node_modules/@bnqkl/')) {
            return 'bioforest'
          }
        },
      },
    },
  },
})
