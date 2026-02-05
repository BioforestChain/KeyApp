import { existsSync, mkdirSync, rmSync, symlinkSync, mkdtempSync } from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'
import type { ReleaseContext } from './context'

function ensureNodeModules(root: string, workdir: string): void {
  const localNodeModules = join(root, 'node_modules')
  const workdirNodeModules = join(workdir, 'node_modules')
  if (existsSync(workdirNodeModules)) return
  if (!existsSync(localNodeModules)) return
  try {
    symlinkSync(localNodeModules, workdirNodeModules, 'dir')
  } catch {}
}

export function prepareReleaseWorktree(ctx: ReleaseContext): { path: string; cleanup: () => void } {
  const parent = join(ctx.root, '.git-worktree')
  if (!existsSync(parent)) {
    mkdirSync(parent, { recursive: true })
  }
  execSync('git fetch origin main --tags', { cwd: ctx.root, stdio: 'inherit' })
  const workdir = mkdtempSync(join(parent, 'release-'))
  execSync(`git worktree add --detach "${workdir}" origin/main`, { cwd: ctx.root, stdio: 'inherit' })
  ensureNodeModules(ctx.root, workdir)
  const cleanup = () => {
    try {
      execSync(`git worktree remove --force "${workdir}"`, { cwd: ctx.root, stdio: 'inherit' })
    } catch {
      rmSync(workdir, { recursive: true, force: true })
    }
  }
  return { path: workdir, cleanup }
}
