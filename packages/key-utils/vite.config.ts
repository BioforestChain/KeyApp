import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import { readdirSync } from 'fs'

const srcDir = resolve(__dirname, 'src')
const srcFiles = readdirSync(srcDir).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'))

const entry: Record<string, string> = {
  index: resolve(srcDir, 'index.ts'),
}

for (const file of srcFiles) {
  if (file !== 'index.ts') {
    const name = file.replace(/\.tsx?$/, '')
    entry[name] = resolve(srcDir, file)
  }
}

export default defineConfig({
  plugins: [
    dts({
      include: ['src'],
      rollupTypes: false,
    }),
  ],
  build: {
    lib: {
      entry,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        preserveModules: false,
      },
    },
    minify: false,
    sourcemap: true,
  },
})
