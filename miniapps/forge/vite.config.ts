import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/miniapps/forge/',
  build: {
    outDir: resolve(__dirname, '../../public/miniapps/forge'),
    emptyOutDir: true,
  },
  server: {
    port: 5181,
  },
})
