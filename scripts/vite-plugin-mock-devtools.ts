/**
 * Vite Plugin: Mock DevTools
 *
 * 在 mock 模式下自动：
 * 1. 收集所有 mock 服务的 meta 定义
 * 2. 生成虚拟模块自动注册所有服务
 * 3. 在应用入口注入注册代码
 */

import type { Plugin } from 'vite'
import { resolve } from 'node:path'
import { readdirSync, existsSync } from 'node:fs'

const VIRTUAL_MODULE_ID = 'virtual:mock-registry'
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID

interface MockDevToolsPluginOptions {
  /** 服务目录路径 */
  servicesDir?: string
  /** 是否启用 (默认根据 SERVICE_IMPL === 'mock' 判断) */
  enabled?: boolean
}

export function mockDevToolsPlugin(options: MockDevToolsPluginOptions = {}): Plugin {
  const {
    servicesDir = 'src/services',
    enabled = process.env.SERVICE_IMPL === 'mock',
  } = options

  if (!enabled) {
    return {
      name: 'vite-plugin-mock-devtools',
      // 禁用时返回空插件
    }
  }

  let root: string

  return {
    name: 'vite-plugin-mock-devtools',

    configResolved(config) {
      root = config.root
    },

    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID
      }
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        // 扫描服务目录，找到所有 mock.ts 文件
        const servicesPath = resolve(root, servicesDir)
        const mockServices = findMockServices(servicesPath)

        // 使用副作用导入（模块加载时 wrapMockService 会自动注册）
        const imports = mockServices.map((service) => `import '@/services/${service}/mock'`)

        return `
/**
 * 自动生成的 Mock 服务注册模块
 * 由 vite-plugin-mock-devtools 生成
 * 
 * 服务在导入时通过 wrapMockService 自动注册到 MockDevTools
 */

${imports.join('\n')}

console.log('[MockDevTools] ${mockServices.length} mock services auto-registered:', ${JSON.stringify(mockServices)})
`
      }
    },

    // 在入口文件中注入 mock registry 导入
    transform(code, id) {
      // 只处理主入口文件
      if (id.endsWith('frontend-main.tsx') || id.endsWith('main.tsx')) {
        return {
          code: `import '${VIRTUAL_MODULE_ID}'\n${code}`,
          map: null,
        }
      }
    },
  }
}

/** 扫描服务目录，找到所有包含 mock.ts 的服务 */
function findMockServices(servicesPath: string): string[] {
  if (!existsSync(servicesPath)) {
    return []
  }

  const services: string[] = []
  const entries = readdirSync(servicesPath, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const mockPath = resolve(servicesPath, entry.name, 'mock.ts')
      if (existsSync(mockPath)) {
        services.push(entry.name)
      }
    }
  }

  return services
}

export default mockDevToolsPlugin
