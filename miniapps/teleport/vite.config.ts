import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import mkcert from 'vite-plugin-mkcert'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    mkcert(),
    react(),
    tsconfigPaths(),
    tailwindcss(),
  ],
  base: '/miniapps/teleport/',
  build: {
    outDir: resolve(__dirname, '../../public/miniapps/teleport'),
    emptyOutDir: false,  // 保留 icon.svg 和 screenshots
  },
  server: {
    port: 5180,
  },
})
