import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import commonjs from 'vite-plugin-commonjs';
import mkcert from 'vite-plugin-mkcert';
import { networkInterfaces } from 'node:os';
import { resolve } from 'node:path';
import { mockDevToolsPlugin } from './scripts/vite-plugin-mock-devtools';
import { miniappsPlugin } from './scripts/vite-plugin-miniapps';
import { remoteMiniappsPlugin } from './scripts/vite-plugin-remote-miniapps';
import { buildCheckPlugin } from './scripts/vite-plugin-build-check';

function getPreferredLanIPv4(): string | undefined {
  const ifaces = networkInterfaces();
  const ips: string[] = [];

  for (const entries of Object.values(ifaces)) {
    for (const entry of entries ?? []) {
      if (entry.family !== 'IPv4' || entry.internal) continue;
      const ip = entry.address;
      // Filter special/reserved ranges that confuse mobile debugging.
      if (ip.startsWith('127.') || ip.startsWith('169.254.') || ip.startsWith('198.18.')) continue;
      if (ip === '0.0.0.0') continue;
      ips.push(ip);
    }
  }

  const score = (ip: string) => {
    if (ip.startsWith('192.168.')) return 3;
    if (ip.startsWith('10.')) return 2;
    if (/^172\.(1[6-9]|2\\d|3[0-1])\\./.test(ip)) return 1;
    return 0;
  };

  ips.sort((a, b) => score(b) - score(a));
  return ips[0];
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  /**
   * 服务实现选择（编译时）
   * - web: 浏览器环境（默认）
   * - dweb: DWEB/Plaoc 平台
   * - mock: 测试环境
   */
  const SERVICE_IMPL = env.SERVICE_IMPL ?? process.env.SERVICE_IMPL ?? 'web';

  /**
   * Base URL 配置
   * - 使用 './' 允许部署在任意子路径下
   * - 例如: https://example.com/ 或 https://example.com/app/
   */
  const BASE_URL = env.VITE_BASE_URL ?? process.env.VITE_BASE_URL ?? './';

  const DEV_HOST = env.VITE_DEV_HOST ?? process.env.VITE_DEV_HOST ?? getPreferredLanIPv4();

  const tronGridApiKey = env.TRONGRID_API_KEY ?? process.env.TRONGRID_API_KEY ?? '';
  const etherscanApiKey = env.ETHERSCAN_API_KEY ?? process.env.ETHERSCAN_API_KEY ?? '';

  return {
    base: BASE_URL,
    server: {
      host: true,
      // 手机上的“每隔几秒自动刷新”通常是 HMR WebSocket 连不上导致的。
      // 明确指定 wss + 局域网 IP，避免客户端默认连到 localhost（在手机上等于连自己）。
      hmr: DEV_HOST
        ? {
            protocol: 'wss',
            host: DEV_HOST,
          }
        : undefined,
    },
    plugins: [
      mkcert({
        // 默认 hosts 会包含 0.0.0.0 / 某些保留网段，iOS 上偶发会导致 wss 不稳定。
        // 这里收敛到“确切可访问”的 host 列表，减少证书/SAN 干扰。
        hosts: DEV_HOST ? ['localhost', '127.0.0.1', DEV_HOST] : undefined,
      }),
      commonjs({
        filter(id) {
          // Transform .cjs files to ESM
          if (id.includes('.cjs')) {
            console.log('[commonjs] transforming:', id);
            return true;
          }
          return false;
        },
      }),
      react(),
      tailwindcss(),
      mockDevToolsPlugin(),
      // 远程 miniapps (必须在 miniappsPlugin 之前，以便注册到全局状态)
      remoteMiniappsPlugin({
        miniapps: [
          {
            metadataUrl: 'https://iweb.xin/rwahub.bfmeta.com.miniapp/metadata.json',
            dirName: 'rwa-hub',
            server: { runtime: 'wujie' },
            build: {
              runtime: 'wujie',
              rewriteBase: true,
            },
          },
        ],
        timeout: 60000,
        retries: 3,
      }),
      miniappsPlugin({
        apps: {
          'xin.dweb.teleport': {
            server: 'iframe',
            build: 'wujie',
          },
          'xin.dweb.biobridge': {
            server: 'wujie',
            build: 'wujie',
          },
        },
      }),
      buildCheckPlugin(),
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
        '#currency-exchange-impl': resolve(
          __dirname,
          `./src/services/currency-exchange/${SERVICE_IMPL === 'dweb' ? 'web' : SERVICE_IMPL}.ts`,
        ),
        '#staking-impl': resolve(__dirname, `./src/services/staking/${SERVICE_IMPL}.ts`),
        '#transaction-impl': resolve(__dirname, `./src/services/transaction/${SERVICE_IMPL}.ts`),

        // Node.js polyfills
        buffer: 'buffer/',
      },
    },
    define: {
      // 全局 Buffer 支持
      global: 'globalThis',
      // Mock 模式标识（用于条件加载 MockDevTools）
      __MOCK_MODE__: JSON.stringify(SERVICE_IMPL === 'mock'),
      // Dev 模式标识（用于显示开发版水印）
      __DEV_MODE__: JSON.stringify((env.VITE_DEV_MODE ?? process.env.VITE_DEV_MODE) === 'true'),
      // API Keys 对象（用于动态读取环境变量）
      __API_KEYS__: JSON.stringify({
        TRONGRID_API_KEY: tronGridApiKey,
        ETHERSCAN_API_KEY: etherscanApiKey,
      }),
    },
    optimizeDeps: {
      include: ['buffer'],
      // Force Vite to pre-bundle the CJS bundle file
      esbuildOptions: {
        loader: {
          '.bundle.js': 'js',
          '.cjs': 'js',
        },
      },
    },
    build: {
      // 确保资源路径使用相对路径
      assetsDir: 'assets',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          clear: resolve(__dirname, 'clear.html'),
        },
        output: {
          // 使用 hash 命名避免缓存问题
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          // 手动分块，减少主 chunk 体积
          manualChunks(id) {
            // React 核心
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'react-vendor';
            }
            // TanStack
            if (id.includes('node_modules/@tanstack/')) {
              return 'tanstack';
            }
            // Radix UI
            if (id.includes('node_modules/@radix-ui/')) {
              return 'radix';
            }
            // 动画
            if (id.includes('node_modules/motion/') || id.includes('node_modules/framer-motion/')) {
              return 'motion';
            }
            // i18n
            if (id.includes('node_modules/i18next') || id.includes('node_modules/react-i18next')) {
              return 'i18n';
            }
            // 加密库 - 最大的依赖
            if (id.includes('node_modules/@noble/') || id.includes('node_modules/@scure/')) {
              return 'crypto';
            }
            // BioForest 链库
            if (id.includes('node_modules/@bnqkl/')) {
              return 'bioforest';
            }
          },
        },
      },
    },
  };
});
