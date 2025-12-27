import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/miniapps/teleport/',
  build: {
    outDir: resolve(__dirname, '../../public/miniapps/teleport'),
    emptyOutDir: true,
  },
  server: {
    port: 5180,
  },
})
