import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    tailwindcss(),
  ],
  base: '/miniapps/forge/',
  build: {
    outDir: resolve(__dirname, '../../public/miniapps/forge'),
    emptyOutDir: true,
  },
  server: {
    port: 5181,
  },
})
