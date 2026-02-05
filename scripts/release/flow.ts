import { confirm } from '@inquirer/prompts'
import type { ReleaseContext } from './context'
import { checkoutReleaseBranch, pushReleaseBranch, tryPushMain } from './git'
import { createReleasePr, findReleasePr, mergePr, triggerStableWorkflow, waitForChecks } from './github'
import { detectTargetVersion, getReleaseState, type ReleaseState } from './release-state'

function logState(ctx: ReleaseContext, state: ReleaseState): void {
  ctx.log.step('Release 状态检测')
  console.log(`版本: ${state.version}`)
  console.log(`release commit in main: ${state.releaseCommitInMain ? 'yes' : 'no'}`)
  console.log(`open PR: ${state.openPr ? `#${state.openPr.number}` : 'none'}`)
  console.log(`tag exists: ${state.tagExists ? 'yes' : 'no'}`)
  console.log(`release exists: ${state.releaseExists ? 'yes' : 'no'}`)
  console.log(`gh-pages metadata version: ${state.ghPagesMetadataVersion ?? 'unknown'}`)
}

function shouldTriggerStable(state: ReleaseState): boolean {
  if (!state.releaseExists) return true
  if (state.ghPagesMetadataVersion && state.ghPagesMetadataVersion !== state.version) return true
  if (!state.ghPagesMetadataVersion) return true
  return false
}

async function maybeWaitAndMerge(ctx: ReleaseContext, prNumber: number): Promise<void> {
  const shouldContinue = ctx.nonInteractive
    ? true
    : await confirm({
        message: `等待 PR #${prNumber} 检查并合并？`,
        default: true,
      })
  if (!shouldContinue) {
    ctx.log.warn(`已保留 PR #${prNumber}，可稍后执行 pnpm release:resume`)
    return
  }
  waitForChecks(ctx, prNumber)
  mergePr(ctx, prNumber, ctx.adminMode)
  ctx.log.success(`已合并 PR #${prNumber}`)
}

export async function pushAndFinalize(ctx: ReleaseContext, version: string): Promise<void> {
  ctx.log.step('推送到 GitHub')

  const shouldPush = ctx.nonInteractive
    ? (ctx.pushFlag ?? true)
    : await confirm({
        message: '是否推送到 GitHub？',
        default: true,
      })

  if (!shouldPush) {
    ctx.log.info('跳过推送。你可以稍后手动执行:')
    console.log('  git push origin main')
    return
  }

  if (tryPushMain(ctx)) {
    triggerStableWorkflow(ctx)
    return
  }

  ctx.log.warn('直接推送 main 失败，准备使用 PR 流程')
  const branch = checkoutReleaseBranch(ctx, version)
  pushReleaseBranch(ctx, branch)

  let pr = findReleasePr(ctx, version, 'open')
  if (!pr) {
    pr = createReleasePr(ctx, branch, version)
  }

  if (!pr) {
    throw new Error('无法创建或获取 release PR')
  }

  await maybeWaitAndMerge(ctx, pr.number)
  const state = getReleaseState(ctx, version)
  if (state.releaseCommitInMain && shouldTriggerStable(state)) {
    triggerStableWorkflow(ctx)
  }
}

export async function resumeRelease(ctx: ReleaseContext, explicitVersion?: string): Promise<void> {
  const version = explicitVersion ?? detectTargetVersion(ctx)
  if (!version) {
    ctx.log.error('无法识别目标版本，请使用 --version 指定')
    return
  }

  const state = getReleaseState(ctx, version)
  logState(ctx, state)

  if (!state.releaseCommitInMain) {
    if (!state.openPr) {
      ctx.log.error('未找到 release PR 或已合并的 release commit，无法恢复')
      return
    }
    await maybeWaitAndMerge(ctx, state.openPr.number)
  }

  const refreshedState = getReleaseState(ctx, version)
  logState(ctx, refreshedState)

  if (shouldTriggerStable(refreshedState)) {
    const shouldTrigger = ctx.nonInteractive
      ? (ctx.triggerFlag ?? true)
      : await confirm({
          message: '是否自动触发 stable 发布？',
          default: true,
        })
    if (shouldTrigger) {
      triggerStableWorkflow(ctx)
    }
  } else {
    ctx.log.success('release 已完成，无需触发 stable workflow')
  }
}
