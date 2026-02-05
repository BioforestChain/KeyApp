#!/usr/bin/env bun
/**
 * BFM Pay 正式版发布脚本
 *
 * 交互式脚本，完整发布流程（仅基于 origin/main）：
 * 1. 创建 origin/main 的临时工作树
 * 2. 检查工作区状态（必须干净且与 origin/main 一致）
 * 3. 选择版本号（小版本/中版本/大版本/当前/自定义）
 * 4. 运行类型检查和测试
 * 5. 构建 Web 和 DWEB 版本
 * 6. 上传 DWEB 到正式服务器
 * 7. 更新 package.json 和 manifest.json
 * 8. 更新 CHANGELOG.md
 * 9. 提交变更
 * 10. 推送并触发 CI 发布（CI 创建 tag/release）
 *
 * 可选参数:
 *   --admin              当 main 受保护且无法直推时，用 PR + admin 合并兜底
 *   --non-interactive    非交互模式（不会弹出确认与输入）
 *   --yes                非交互模式的别名
 *   --version <x.y.z>    指定版本号
 *   --bump <patch|minor|major|current>  指定版本升级类型
 *   --changelog <text>   指定本次更新的简要描述
 *   --skip-upload        跳过 DWEB 上传
 *   --no-push            不推送到 GitHub
 *   --no-trigger         不触发 stable 发布
 *   --resume             仅执行恢复流程（自动衔接 PR/触发 stable）
 */

import { confirm } from '@inquirer/prompts'
import { createReleaseContext } from './release/context'
import { prepareReleaseWorktree } from './release/worktree'
import { checkWorkspace } from './release/checks'
import { runBuild, uploadDweb } from './release/build'
import { updateChangelog, updateVersionFiles, selectVersion } from './release/version'
import { commitRelease } from './release/git'
import { pushAndFinalize, resumeRelease } from './release/flow'

async function installDependencies(ctx: ReturnType<typeof createReleaseContext>) {
  ctx.log.step('安装依赖')
  ctx.exec('pnpm install --frozen-lockfile', { env: { CI: 'true' } })
  ctx.log.success('依赖安装完成')
}

async function main() {
  const ctx = createReleaseContext(process.argv.slice(2))
  const isResume = ctx.args.includes('--resume')

  console.log(`
${ctx.colors.magenta}╔════════════════════════════════════════╗
║      BFM Pay Release Script           ║
╚════════════════════════════════════════╝${ctx.colors.reset}
`)

  const { path, cleanup } = prepareReleaseWorktree(ctx)
  ctx.setWorkdir(path)

  try {
    const canContinue = await checkWorkspace(ctx)
    if (!canContinue) {
      ctx.log.info('发布已取消')
      return
    }

    if (isResume) {
      await resumeRelease(ctx, ctx.versionArg ?? undefined)
      return
    }

    let newVersion: string
    try {
      newVersion = await selectVersion(ctx)
    } catch {
      ctx.log.info('发布已取消')
      return
    }

    console.log(`
${ctx.colors.cyan}发布流程:${ctx.colors.reset}
  1. 运行类型检查和测试
  2. 构建 Web 和 DWEB 版本
  3. 上传 DWEB 到正式服务器
  4. 更新版本号和 CHANGELOG
  5. 提交变更
  6. 推送并触发 CI 发布（CI 创建 tag/release）
`)

    const confirmRelease = ctx.nonInteractive
      ? true
      : await confirm({
          message: '确认开始发布流程？',
          default: true,
        })

    if (!confirmRelease) {
      ctx.log.info('发布已取消')
      return
    }

    await installDependencies(ctx)
    await runBuild(ctx)
    await uploadDweb(ctx)

    const changelog = await updateChangelog(ctx, newVersion)
    updateVersionFiles(ctx, newVersion, changelog)
    await commitRelease(ctx, newVersion)
    await pushAndFinalize(ctx, newVersion)

    console.log(`
${ctx.colors.green}╔════════════════════════════════════════╗
║        发布完成！ v${newVersion.padEnd(20)}║
╚════════════════════════════════════════╝${ctx.colors.reset}

${ctx.colors.blue}下一步:${ctx.colors.reset}
  - 自动触发 stable 发布（可选择跳过）
  - 查看进度: https://github.com/BioforestChain/KeyApp/actions
  - 发布完成后查看 Release: https://github.com/BioforestChain/KeyApp/releases
  - 访问 GitHub Pages: https://bioforestchain.github.io/KeyApp/
`)
  } finally {
    cleanup()
  }
}

main().catch((error) => {
  const ctx = createReleaseContext(process.argv.slice(2))
  ctx.log.error(`发布失败: ${error.message}`)
  process.exit(1)
})
