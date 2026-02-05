import type { ReleaseContext } from './context'

export async function checkWorkspace(ctx: ReleaseContext): Promise<boolean> {
  ctx.log.step('检查工作区状态')

  const head = ctx.execOutput('git rev-parse HEAD')
  const originMain = ctx.execOutput('git rev-parse origin/main')
  if (head !== originMain) {
    ctx.log.error('当前工作树不是 origin/main 最新提交，已终止')
    return false
  }

  const status = ctx.execOutput('git status --porcelain')
  if (status) {
    ctx.log.warn('检测到未提交的变更:')
    console.log(status)
    ctx.log.error('发布必须基于干净的 origin/main')
    return false
  }

  ctx.log.success('工作区干净')
  ctx.log.success('确认 origin/main 一致性')
  return true
}
