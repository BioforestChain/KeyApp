import semver from 'semver'
import type { ReleaseContext } from './context'
import { listReleasePrs, type ReleasePr, hasRelease } from './github'

export type ReleaseState = {
  version: string
  releaseCommit: string | null
  releaseCommitInMain: boolean
  openPr: ReleasePr | null
  tagExists: boolean
  releaseExists: boolean
  ghPagesMetadataVersion: string | null
}

export function extractVersionFromText(text: string): string | null {
  const match = text.match(/release:\s*v(\d+\.\d+\.\d+)/i)
  return match?.[1] ?? null
}

export function detectTargetVersion(ctx: ReleaseContext): string | null {
  if (ctx.versionArg) return ctx.versionArg

  const openPrs = listReleasePrs(ctx, 'open')
  if (openPrs.length) {
    const versions = openPrs
      .map((pr) => extractVersionFromText(pr.title))
      .filter((version): version is string => Boolean(version) && semver.valid(version))
    if (versions.length) {
      return versions.sort(semver.rcompare)[0]
    }
  }

  const latestReleaseCommit = ctx.exec('git log origin/main --grep "release: v" -n 1 --format=%s', { silent: true })
  const versionFromCommit = latestReleaseCommit ? extractVersionFromText(latestReleaseCommit) : null
  if (versionFromCommit) return versionFromCommit

  try {
    const pkg = ctx.readJson<{ version?: string }>(ctx.workPath('package.json'))
    if (pkg.version && semver.valid(pkg.version)) return pkg.version
  } catch {}

  return null
}

export function getReleaseCommitInMain(ctx: ReleaseContext, version: string): string | null {
  const commit = ctx.exec(`git log origin/main --grep "release: v${version}" -n 1 --format=%H`, { silent: true })
  return commit || null
}

export function getGhPagesMetadataVersion(ctx: ReleaseContext): string | null {
  try {
    ctx.exec('git fetch origin gh-pages', { cwd: ctx.root, silent: true })
    const raw = ctx.exec('git show origin/gh-pages:dweb/metadata.json', { cwd: ctx.root, silent: true })
    if (!raw) return null
    const json = JSON.parse(raw) as { version?: string }
    return json.version ?? null
  } catch {
    return null
  }
}

export function hasTag(ctx: ReleaseContext, version: string): boolean {
  ctx.exec('git fetch origin --tags', { cwd: ctx.root, silent: true })
  const tag = ctx.exec(`git tag --list v${version}`, { cwd: ctx.root, silent: true })
  return Boolean(tag)
}

export function getOpenReleasePr(ctx: ReleaseContext, version: string): ReleasePr | null {
  const openPrs = listReleasePrs(ctx, 'open')
  const target = `release: v${version}`
  return openPrs.find((pr) => pr.title.toLowerCase().includes(target.toLowerCase())) ?? null
}

export function getReleaseState(ctx: ReleaseContext, version: string): ReleaseState {
  const releaseCommit = getReleaseCommitInMain(ctx, version)
  return {
    version,
    releaseCommit,
    releaseCommitInMain: Boolean(releaseCommit),
    openPr: getOpenReleasePr(ctx, version),
    tagExists: hasTag(ctx, version),
    releaseExists: hasRelease(ctx, version),
    ghPagesMetadataVersion: getGhPagesMetadataVersion(ctx),
  }
}
