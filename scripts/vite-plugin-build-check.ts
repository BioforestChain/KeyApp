/**
 * Vite Plugin: Build Check
 *
 * 构建完成后验证输出目录结构：
 * - dist/ecosystem.json 存在且有效
 * - dist/miniapps/ 存在
 * - 各 miniapp 有必需文件（index.html, icon.svg, assets/）
 */

import type { Plugin } from 'vite'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, join } from 'node:path'

interface BuildCheckOptions {
  /** 是否在检查失败时抛出错误（默认 true） */
  failOnError?: boolean
}

export function buildCheckPlugin(options: BuildCheckOptions = {}): Plugin {
  const { failOnError = true } = options

  let distDir: string

  const errors: string[] = []
  const warnings: string[] = []

  function error(msg: string) {
    errors.push(msg)
    console.error(`[build-check] ❌ ${msg}`)
  }

  function warn(msg: string) {
    warnings.push(msg)
    console.warn(`[build-check] ⚠️ ${msg}`)
  }

  function ok(msg: string) {
    console.log(`[build-check] ✅ ${msg}`)
  }

  return {
    name: 'vite-plugin-build-check',
    apply: 'build',

    writeBundle(outputOptions) {
      distDir = outputOptions.dir || 'dist'
    },

    async closeBundle() {
      if (!distDir) return

      console.log('\n[build-check] Verifying build output...\n')

      // 1. 检查 ecosystem.json
      const ecosystemPath = resolve(distDir, 'ecosystem.json')
      if (!existsSync(ecosystemPath)) {
        error('ecosystem.json not found')
      } else {
        try {
          const ecosystem = JSON.parse(readFileSync(ecosystemPath, 'utf-8'))
          if (!ecosystem.apps || !Array.isArray(ecosystem.apps)) {
            error('ecosystem.json: missing or invalid "apps" array')
          } else if (ecosystem.apps.length === 0) {
            warn('ecosystem.json: apps array is empty')
          } else {
            ok(`ecosystem.json: ${ecosystem.apps.length} apps registered`)
          }
        } catch (e) {
          error(`ecosystem.json: invalid JSON - ${e}`)
        }
      }

      // 2. 检查 miniapps 目录
      const miniappsDir = resolve(distDir, 'miniapps')
      if (!existsSync(miniappsDir)) {
        error('miniapps/ directory not found')
      } else {
        const miniapps = readdirSync(miniappsDir).filter((f) =>
          statSync(join(miniappsDir, f)).isDirectory()
        )

        if (miniapps.length === 0) {
          warn('miniapps/ directory is empty')
        } else {
          // 3. 检查各 miniapp 必需文件
          for (const app of miniapps) {
            const appDir = join(miniappsDir, app)
            const requiredFiles = ['index.html', 'icon.svg']
            const requiredDirs = ['assets']

            for (const file of requiredFiles) {
              if (!existsSync(join(appDir, file))) {
                error(`miniapps/${app}/${file} not found`)
              }
            }

            for (const dir of requiredDirs) {
              if (!existsSync(join(appDir, dir))) {
                error(`miniapps/${app}/${dir}/ not found`)
              }
            }

            // screenshots 是可选的，但如果存在应该有内容
            const screenshotsDir = join(appDir, 'screenshots')
            if (existsSync(screenshotsDir)) {
              const screenshots = readdirSync(screenshotsDir)
              if (screenshots.length === 0) {
                warn(`miniapps/${app}/screenshots/ is empty`)
              } else {
                ok(`miniapps/${app}: ${screenshots.length} screenshots`)
              }
            }
          }

          ok(`miniapps/: ${miniapps.length} apps built (${miniapps.join(', ')})`)
        }
      }

      // 4. 检查主应用必需文件
      const mainFiles = ['index.html', 'assets']
      for (const file of mainFiles) {
        if (!existsSync(resolve(distDir, file))) {
          error(`${file} not found in dist/`)
        }
      }

      // 总结
      console.log('')
      if (errors.length > 0) {
        console.error(`[build-check] ❌ ${errors.length} error(s), ${warnings.length} warning(s)`)
        if (failOnError) {
          throw new Error(`Build check failed with ${errors.length} error(s)`)
        }
      } else if (warnings.length > 0) {
        console.warn(`[build-check] ⚠️ ${warnings.length} warning(s), 0 errors`)
      } else {
        console.log('[build-check] ✅ All checks passed!')
      }
    },
  }
}

export default buildCheckPlugin
