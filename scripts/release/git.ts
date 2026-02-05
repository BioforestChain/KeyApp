import type { ReleaseContext } from './context'

export async function commitRelease(ctx: ReleaseContext, version: string): Promise<void> {
  ctx.log.step('提交变更')
  ctx.exec('git add -A')
  ctx.exec(`git commit -m "release: v${version}"`)
  ctx.log.success(`提交: release: v${version}`)
}

export function tryPushMain(ctx: ReleaseContext): boolean {
  try {
    ctx.exec('git push origin HEAD:refs/heads/main')
    ctx.log.success('推送到 origin/main')
    return true
  } catch {
    return false
  }
}

export function checkoutReleaseBranch(ctx: ReleaseContext, version: string): string {
  const branch = `release/v${version}`
  ctx.exec(`git checkout -B ${branch}`)
  return branch
}

export function pushReleaseBranch(ctx: ReleaseContext, branch: string): void {
  ctx.exec(`git push origin HEAD:refs/heads/${branch}`)
}
