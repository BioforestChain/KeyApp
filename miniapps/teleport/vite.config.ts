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
  base: '/miniapps/teleport/',
  build: {
    outDir: resolve(__dirname, '../../public/miniapps/teleport'),
    emptyOutDir: true,
  },
  server: {
    port: 5180,
  },
})
