import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import semver from 'semver'
import type { ReleaseContext } from './context'
import { input, select, confirm } from '@inquirer/prompts'

export interface PackageJson {
  version: string
  lastChangelogCommit?: string
  [key: string]: unknown
}

interface ManifestJson {
  version: string
  change_log: string
  [key: string]: unknown
}

export async function selectVersion(ctx: ReleaseContext): Promise<string> {
  ctx.log.step('选择版本号')

  const pkg = ctx.readJson<PackageJson>(ctx.workPath('package.json'))
  const currentVersion = pkg.version

  console.log(`\n当前版本: ${ctx.colors.bold}${currentVersion}${ctx.colors.reset}\n`)

  if (ctx.nonInteractive) {
    let newVersion: string | null = null

    if (ctx.versionArg) {
      if (!semver.valid(ctx.versionArg)) {
        throw new Error(`非交互模式版本号无效: ${ctx.versionArg}`)
      }
      newVersion = ctx.versionArg
    } else if (ctx.bumpArg) {
      if (ctx.bumpArg === 'current') {
        newVersion = currentVersion
      } else if (ctx.bumpArg === 'patch' || ctx.bumpArg === 'minor' || ctx.bumpArg === 'major') {
        newVersion = semver.inc(currentVersion, ctx.bumpArg)
      } else {
        throw new Error(`非交互模式 bump 参数无效: ${ctx.bumpArg}`)
      }
    }

    if (!newVersion) {
      throw new Error('非交互模式需要提供 --version 或 --bump')
    }

    ctx.log.success(`非交互模式使用版本号: v${newVersion}`)
    return newVersion
  }

  const choice = await select({
    message: '请选择版本升级类型:',
    choices: [
      {
        value: 'patch',
        name: `🔧 Patch (${currentVersion} → ${semver.inc(currentVersion, 'patch')}) - Bug 修复`,
      },
      {
        value: 'minor',
        name: `✨ Minor (${currentVersion} → ${semver.inc(currentVersion, 'minor')}) - 新功能`,
      },
      {
        value: 'major',
        name: `🚀 Major (${currentVersion} → ${semver.inc(currentVersion, 'major')}) - 重大变更`,
      },
      {
        value: 'current',
        name: `📌 当前版本 (${currentVersion}) - 强制使用当前版本号`,
      },
      {
        value: 'custom',
        name: '✏️  自定义版本号',
      },
    ],
  })

  let newVersion: string

  if (choice === 'current') {
    newVersion = currentVersion
  } else if (choice === 'custom') {
    const customVersion = await input({
      message: '请输入版本号 (例如: 1.2.3):',
      validate: (value) => {
        if (!semver.valid(value)) {
          return '请输入有效的语义化版本号 (例如: 1.2.3)'
        }
        return true
      },
    })
    newVersion = customVersion
  } else {
    newVersion = semver.inc(currentVersion, choice as 'patch' | 'minor' | 'major')!
  }

  const confirmed = await confirm({
    message: `确认发布版本 ${ctx.colors.bold}v${newVersion}${ctx.colors.reset}？`,
    default: true,
  })

  if (!confirmed) {
    throw new Error('用户取消')
  }

  return newVersion
}

export async function updateChangelog(ctx: ReleaseContext, version: string): Promise<string> {
  ctx.log.step('更新 CHANGELOG.md')

  const summary = ctx.nonInteractive
    ? ctx.changelogArg ?? '功能更新和优化'
    : await input({
        message: '请输入本次更新的简要描述:',
        default: '功能更新和优化',
      })

  const date = new Date().toISOString().split('T')[0]
  const commitHash = ctx.execOutput('git rev-parse HEAD')

  let content = `## [${version}] - ${date}\n\n`
  content += `${summary}\n\n`
  content += `<!-- last-commit: ${commitHash} -->\n\n`

  let existingContent = ''
  if (existsSync(ctx.workPath('CHANGELOG.md'))) {
    existingContent = readFileSync(ctx.workPath('CHANGELOG.md'), 'utf-8')
    existingContent = existingContent.replace(/^# 更新日志\n+/, '')
    existingContent = existingContent.replace(/^# Changelog\n+/, '')
  }

  const newContent = `# 更新日志\n\n${content}${existingContent}`
  writeFileSync(ctx.workPath('CHANGELOG.md'), newContent)

  ctx.log.success('更新 CHANGELOG.md')
  return summary
}

export function updateVersionFiles(ctx: ReleaseContext, version: string, changelog: string): void {
  ctx.log.step('更新版本文件')

  const pkg = ctx.readJson<PackageJson>(ctx.workPath('package.json'))
  pkg.version = version
  pkg.lastChangelogCommit = ctx.execOutput('git rev-parse HEAD')
  ctx.writeJson(ctx.workPath('package.json'), pkg)
  ctx.log.success('更新 package.json')

  if (existsSync(ctx.workPath('manifest.json'))) {
    const manifest = ctx.readJson<ManifestJson>(ctx.workPath('manifest.json'))
    manifest.version = version
    manifest.change_log = changelog
    ctx.writeJson(ctx.workPath('manifest.json'), manifest)
    ctx.log.success('更新 manifest.json')
  }
}
