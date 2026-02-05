import type { ReleaseContext } from './context'

export type ReleasePr = {
  number: number
  title: string
  headRefName: string
  url: string
  mergeable?: string
  reviewDecision?: string
  statusCheckRollup?: Array<{ name?: string; status?: string; conclusion?: string }>
}

function parseJson<T>(raw: string): T {
  return JSON.parse(raw) as T
}

export function ensureGhCli(ctx: ReleaseContext): boolean {
  try {
    ctx.exec('gh --version', { silent: true })
    return true
  } catch {
    ctx.log.warn('未检测到 gh CLI')
    return false
  }
}

export function listReleasePrs(ctx: ReleaseContext, state: 'open' | 'merged' | 'closed' = 'open'): ReleasePr[] {
  if (!ensureGhCli(ctx)) return []
  const raw = ctx.exec(
    `gh pr list --state ${state} --search "release: v" --json number,title,headRefName,url,mergeable,reviewDecision,statusCheckRollup`,
    { silent: true },
  )
  if (!raw) return []
  try {
    return parseJson<ReleasePr[]>(raw)
  } catch {
    return []
  }
}

export function findReleasePr(ctx: ReleaseContext, version: string, state: 'open' | 'merged' | 'closed' = 'open'): ReleasePr | null {
  const prs = listReleasePrs(ctx, state)
  const target = `release: v${version}`
  return prs.find((pr) => pr.title.toLowerCase().includes(target.toLowerCase())) ?? null
}

export function createReleasePr(ctx: ReleaseContext, branch: string, version: string): ReleasePr | null {
  if (!ensureGhCli(ctx)) return null
  ctx.exec(
    `gh pr create --base main --head ${branch} --title "release: v${version}" --body "auto release"`,
  )
  const pr = findReleasePr(ctx, version, 'open')
  if (pr) return pr
  const raw = ctx.exec(`gh pr view --head ${branch} --json number,title,headRefName,url,mergeable,reviewDecision`, {
    silent: true,
  })
  if (!raw) return null
  try {
    return parseJson<ReleasePr>(raw)
  } catch {
    return null
  }
}

export function waitForChecks(ctx: ReleaseContext, prNumber: number): void {
  if (!ensureGhCli(ctx)) {
    throw new Error('缺少 gh CLI，无法等待检查')
  }
  ctx.exec(`gh pr checks ${prNumber} --watch`)
}

export function mergePr(ctx: ReleaseContext, prNumber: number, adminMode: boolean): void {
  if (!ensureGhCli(ctx)) {
    throw new Error('缺少 gh CLI，无法合并 PR')
  }
  const adminFlag = adminMode ? ' --admin' : ''
  ctx.exec(`gh pr merge ${prNumber} --merge --delete-branch${adminFlag}`)
}

export function triggerStableWorkflow(ctx: ReleaseContext): boolean {
  if (!ensureGhCli(ctx)) {
    ctx.log.warn('未检测到 gh CLI，跳过自动触发 stable 发布')
    return false
  }
  const raw = ctx.exec('gh workflow list --json name,path', { silent: true })
  if (!raw) return false
  try {
    const workflows = JSON.parse(raw) as Array<{ name?: string; path?: string }>
    const byPath = workflows.find((wf) => wf.path?.endsWith('/cd.yml') || wf.path?.endsWith('cd.yml'))
    const byName = workflows.find((wf) => wf.name?.toLowerCase().includes('build and deploy'))
    const workflow = byPath?.name ?? byName?.name ?? workflows[0]?.name
    if (!workflow) return false
    ctx.exec(`gh workflow run "${workflow}" --ref main -f channel=stable`)
    ctx.log.success('已触发 stable 发布')
    return true
  } catch {
    return false
  }
}

export function hasRelease(ctx: ReleaseContext, version: string): boolean {
  if (!ensureGhCli(ctx)) return false
  const raw = ctx.exec(`gh release view v${version} --json tagName`, { silent: true })
  return Boolean(raw)
}
