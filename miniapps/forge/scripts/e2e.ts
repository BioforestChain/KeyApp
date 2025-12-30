#!/usr/bin/env bun
/**
 * E2E 测试启动脚本
 * 
 * 动态检测可用端口，启动 vite dev server，然后运行 playwright 测试
 */

import { spawn } from 'child_process'
import { createServer } from 'net'

async function findAvailablePort(startPort: number): Promise<number> {
  return new Promise((resolve) => {
    const server = createServer()
    server.listen(startPort, () => {
      const port = (server.address() as { port: number }).port
      server.close(() => resolve(port))
    })
    server.on('error', () => {
      resolve(findAvailablePort(startPort + 1))
    })
  })
}

async function main() {
  const args = process.argv.slice(2)
  const updateSnapshots = args.includes('--update-snapshots') || args.includes('-u')
  
  const port = await findAvailablePort(5184)
  console.log(`[e2e] Using port ${port}`)
  
  // Start vite dev server
  const vite = spawn('pnpm', ['vite', '--port', String(port)], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { 
      ...process.env,
      // E2E 测试使用 mock API，设置一个占位 base URL
      VITE_COT_API_BASE_URL: process.env.VITE_COT_API_BASE_URL || 'https://e2e-mock.test',
    },
  })
  
  let serverReady = false
  
  vite.stdout?.on('data', (data) => {
    const output = data.toString()
    if (output.includes('ready in') || output.includes('Local:')) {
      serverReady = true
    }
  })
  
  vite.stderr?.on('data', (data) => {
    console.error(data.toString())
  })
  
  // Wait for server to be ready
  const maxWait = 30000
  const startTime = Date.now()
  while (!serverReady && Date.now() - startTime < maxWait) {
    await new Promise(r => setTimeout(r, 200))
  }
  
  if (!serverReady) {
    console.error('[e2e] Server failed to start')
    vite.kill()
    process.exit(1)
  }
  
  console.log('[e2e] Server ready, running tests...')
  
  // Run playwright
  const playwrightArgs = ['playwright', 'test']
  if (updateSnapshots) {
    playwrightArgs.push('--update-snapshots')
  }
  
  const playwright = spawn('npx', playwrightArgs, {
    stdio: 'inherit',
    env: { 
      ...process.env, 
      E2E_BASE_URL: `https://localhost:${port}`,
    },
  })
  
  playwright.on('close', (code) => {
    vite.kill()
    process.exit(code ?? 0)
  })
  
  // Handle cleanup
  process.on('SIGINT', () => {
    vite.kill()
    playwright.kill()
    process.exit(0)
  })
}

main()
