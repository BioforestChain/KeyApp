import { existsSync, rmSync, cpSync } from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'
import type { ReleaseContext } from './context'

function resolvePlaocBin(): string | null {
  try {
    execSync('plaoc --version', { stdio: 'ignore' })
    return 'plaoc'
  } catch {
    const voltaHome = process.env.VOLTA_HOME ?? (process.env.HOME ? join(process.env.HOME, '.volta') : null)
    if (!voltaHome) return null
    const plaocPath = join(voltaHome, 'bin', 'plaoc')
    if (!existsSync(plaocPath)) return null
    try {
      execSync(`${plaocPath} --version`, { stdio: 'ignore' })
      return plaocPath
    } catch {
      return null
    }
  }
}

export async function runBuild(ctx: ReleaseContext): Promise<void> {
  ctx.log.step('运行类型检查')
  ctx.exec('pnpm typecheck')

  ctx.log.step('运行单元测试')
  ctx.exec('pnpm test')

  ctx.log.step('构建 Web 版本')
  ctx.exec('pnpm build:web', {
    env: { SERVICE_IMPL: 'web', VITE_DEV_MODE: 'false' },
  })

  const distDir = ctx.workPath('dist')
  const distWebDir = ctx.workPath('dist-web')
  if (existsSync(distWebDir)) {
    rmSync(distWebDir, { recursive: true })
  }
  if (existsSync(distDir)) {
    cpSync(distDir, distWebDir, { recursive: true })
    rmSync(distDir, { recursive: true })
  }

  ctx.log.step('构建 DWEB 版本')
  ctx.exec('pnpm build:dweb', {
    env: { SERVICE_IMPL: 'dweb', VITE_DEV_MODE: 'false' },
  })

  const distDwebDir = ctx.workPath('dist-dweb')
  if (existsSync(distDwebDir)) {
    rmSync(distDwebDir, { recursive: true })
  }
  if (existsSync(distDir)) {
    cpSync(distDir, distDwebDir, { recursive: true })
    rmSync(distDir, { recursive: true })
  }

  ctx.log.step('运行 Plaoc 打包')
  const distsDir = ctx.workPath('dists')
  if (existsSync(distsDir)) {
    rmSync(distsDir, { recursive: true })
  }
  const plaocBin = resolvePlaocBin()
  if (plaocBin) {
    ctx.exec(`${plaocBin} bundle "${distDwebDir}" -c ./ -o "${distsDir}"`)
  } else {
    ctx.log.warn('Plaoc CLI 未安装，使用 dist-dweb 作为 dists 兜底')
    cpSync(distDwebDir, distsDir, { recursive: true })
  }

  ctx.log.success('构建完成')
}

export async function uploadDweb(ctx: ReleaseContext): Promise<void> {
  ctx.log.step('上传 DWEB 到正式服务器')

  const sftpUrl = process.env.DWEB_SFTP_URL || 'sftp://iweb.xin:22022'
  const sftpUser = process.env.DWEB_SFTP_USER
  const sftpPass = process.env.DWEB_SFTP_PASS

  if (!sftpUser || !sftpPass) {
    ctx.log.warn('未配置 SFTP 环境变量 (DWEB_SFTP_USER, DWEB_SFTP_PASS)')
    if (ctx.nonInteractive) {
      if (ctx.skipUploadFlag === true) {
        ctx.log.info('跳过上传')
        return
      }
      throw new Error('非交互模式未配置 SFTP 环境变量且未指定 --skip-upload')
    }

    const shouldSkip = await import('@inquirer/prompts').then(({ confirm }) =>
      confirm({
        message: '是否跳过上传？',
        default: true,
      }),
    )
    if (shouldSkip) {
      ctx.log.info('跳过上传')
      return
    }
    throw new Error('请配置 SFTP 环境变量')
  }

  if (ctx.skipUploadFlag === true) {
    ctx.log.info('跳过上传')
    return
  }

  ctx.exec('bun scripts/build.ts dweb --upload --stable --skip-typecheck --skip-test', {
    env: {
      DWEB_SFTP_URL: sftpUrl,
      DWEB_SFTP_USER: sftpUser,
      DWEB_SFTP_PASS: sftpPass,
    },
  })

  ctx.log.success('上传完成')
}
