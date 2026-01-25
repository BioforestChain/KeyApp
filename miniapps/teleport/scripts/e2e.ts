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
  const args = new Set(process.argv.slice(2))
  const updateSnapshots = args.has('--update-snapshots') || args.has('-u')
  
  const port = await findAvailablePort(5185)
  
  
  // Start vite dev server
  const vite = spawn('pnpm', ['vite', '--port', String(port)], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  })
  
  let serverReady = false
  
  vite.stdout?.on('data', (data) => {
    const output = data.toString()
    if (output.includes('ready in') || output.includes('Local:')) {
      serverReady = true
    }
  })
  
  vite.stderr?.on('data', (_data) => {})
  
  // Wait for server to be ready
  const maxWait = 30000
  const startTime = Date.now()
  await new Promise<void>((resolve) => {
    const checkReady = () => {
      if (serverReady || Date.now() - startTime >= maxWait) {
        resolve()
        return
      }
      setTimeout(checkReady, 200)
    }
    checkReady()
  })
  
  if (!serverReady) {
    
    vite.kill()
    process.exit(1)
  }
  
  
  
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
