import type { ReleaseContext } from './context'

type RepoInfo = {
  owner: string
  name: string
  slug: string
}

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

function parseRepoFromRemote(remote: string): RepoInfo | null {
  if (!remote) return null
  if (remote.startsWith('git@')) {
    const match = remote.match(/git@[^:]+:([^/]+)\/(.+?)(\.git)?$/)
    if (!match) return null
    const [, owner, name] = match
    return { owner, name, slug: `${owner}/${name}` }
  }
  try {
    const url = new URL(remote)
    const parts = url.pathname.replace(/^\/+/, '').replace(/\.git$/, '').split('/')
    if (parts.length >= 2) {
      const [owner, name] = parts
      return { owner, name, slug: `${owner}/${name}` }
    }
  } catch {}
  return null
}

function resolveRepo(ctx: ReleaseContext): RepoInfo | null {
  const remote = ctx.exec('git config --get remote.origin.url', { silent: true })
  return parseRepoFromRemote(remote)
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
  const repo = resolveRepo(ctx)
  const repoArg = repo ? ` --repo ${repo.slug}` : ''
  const raw = ctx.exec(
    `gh pr list --state ${state} --search "release: v" --json number,title,headRefName,url,mergeable,reviewDecision,statusCheckRollup${repoArg}`,
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
  return (
    prs.find((pr) => pr.title.toLowerCase().includes(target.toLowerCase())) ??
    prs.find((pr) => pr.headRefName === `release/v${version}`) ??
    null
  )
}

async function loadReleasePr(ctx: ReleaseContext, branch: string, version: string): Promise<ReleasePr | null> {
  const repo = resolveRepo(ctx)
  const repoArg = repo ? ` --repo ${repo.slug}` : ''
  const raw = ctx.exec(
    `gh pr view --head ${branch} --json number,title,headRefName,url,mergeable,reviewDecision,statusCheckRollup${repoArg}`,
    { silent: true },
  )
  if (!raw) {
    return findReleasePr(ctx, version, 'open')
  }
  try {
    return parseJson<ReleasePr>(raw)
  } catch {
    return findReleasePr(ctx, version, 'open')
  }
}

export async function createReleasePr(ctx: ReleaseContext, branch: string, version: string): Promise<ReleasePr | null> {
  if (!ensureGhCli(ctx)) return null
  const repo = resolveRepo(ctx)
  const repoArg = repo ? ` --repo ${repo.slug}` : ''
  ctx.exec(
    `gh pr create --base main --head ${branch} --title "release: v${version}" --body "auto release"${repoArg}`,
  )
  const retries = 5
  for (let i = 0; i < retries; i += 1) {
    const pr = await loadReleasePr(ctx, branch, version)
    if (pr) return pr
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  return null
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
