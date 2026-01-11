import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    dts({
      include: ['src'],
      rollupTypes: false,
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'address-display/index': resolve(__dirname, 'src/address-display/index.ts'),
        'amount-display/index': resolve(__dirname, 'src/amount-display/index.ts'),
        'token-icon/index': resolve(__dirname, 'src/token-icon/index.ts'),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@number-flow/react', '@biochain/key-utils'],
      output: {
        preserveModules: false,
      },
    },
    minify: false,
    sourcemap: true,
  },
})
