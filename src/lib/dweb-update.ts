import { isDwebEnvironment } from './crypto/secure-storage'

export interface DwebUpdateMetadata {
  version: string
  changeLog?: string
}

export type DwebUpdateStatus = 'not-dweb' | 'error' | 'up-to-date' | 'update-available'

export interface DwebUpdateCheckResult {
  status: DwebUpdateStatus
  currentVersion: string
  latestVersion?: string
  metadataUrl: string
  installUrl: string
  changeLog?: string
  error?: string
}

interface ParsedVersion {
  major: number
  minor: number
  patch: number
  suffix?: string
  suffixNumber?: number
}

const VERSION_REGEX = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/

function parseVersion(value: string): ParsedVersion | null {
  const match = value.match(VERSION_REGEX)
  if (!match) return null
  const [, major, minor, patch, suffix] = match
  const suffixNumber = suffix && /^\d+$/.test(suffix) ? Number(suffix) : undefined
  return {
    major: Number(major),
    minor: Number(minor),
    patch: Number(patch),
    suffix: suffix ?? undefined,
    suffixNumber,
  }
}

function compareVersion(remote: string, local: string): number | null {
  const remoteParsed = parseVersion(remote)
  const localParsed = parseVersion(local)
  if (!remoteParsed || !localParsed) return null
  if (remoteParsed.major !== localParsed.major) return remoteParsed.major - localParsed.major
  if (remoteParsed.minor !== localParsed.minor) return remoteParsed.minor - localParsed.minor
  if (remoteParsed.patch !== localParsed.patch) return remoteParsed.patch - localParsed.patch

  const remoteSuffix = remoteParsed.suffixNumber ?? (remoteParsed.suffix ? Number.NaN : 0)
  const localSuffix = localParsed.suffixNumber ?? (localParsed.suffix ? Number.NaN : 0)

  if (!Number.isNaN(remoteSuffix) && !Number.isNaN(localSuffix)) {
    return remoteSuffix - localSuffix
  }

  if (remoteParsed.suffix && !localParsed.suffix) return 1
  if (!remoteParsed.suffix && localParsed.suffix) return -1
  if (remoteParsed.suffix && localParsed.suffix) {
    return remoteParsed.suffix.localeCompare(localParsed.suffix)
  }
  return 0
}

function normalizeOrigin(origin: string): string {
  return origin.endsWith('/') ? origin : `${origin}/`
}

function normalizeBasePath(basePath: string): string {
  if (!basePath) return './'
  return basePath.endsWith('/') ? basePath : `${basePath}/`
}

function resolveSiteBase(): string {
  // __KEYAPP_SITE_ORIGIN__ + __KEYAPP_BASE_URL__ 必须成对配置，避免丢失站点路径。
  const origin = normalizeOrigin(__KEYAPP_SITE_ORIGIN__)
  try {
    const originUrl = new URL(origin)
    const originPath = originUrl.pathname
    if (originPath && originPath !== '/') {
      return normalizeOrigin(origin)
    }
  } catch {
    return origin
  }

  const basePath = normalizeBasePath(__KEYAPP_BASE_URL__)
  return normalizeOrigin(new URL(basePath, origin).toString())
}

export function resolveDwebMetadataUrl(): string {
  const base = resolveSiteBase()
  const path = __DEV_MODE__ ? 'dweb-dev/metadata.json' : 'dweb/metadata.json'
  return new URL(path, base).toString()
}

export function resolveInstallUrl(metadataUrl: string): string {
  const encoded = encodeURIComponent(metadataUrl)
  return `dweb://install?url=${encoded}`
}

async function fetchMetadata(url: string): Promise<DwebUpdateMetadata> {
  const response = await fetch(url, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`metadata fetch failed: ${response.status}`)
  }
  const data = (await response.json()) as { version?: string; change_log?: string; changeLog?: string }
  const version = typeof data.version === 'string' ? data.version : ''
  const changeLog = typeof data.change_log === 'string' ? data.change_log : data.changeLog
  return { version, changeLog }
}

export async function checkDwebUpdate(): Promise<DwebUpdateCheckResult> {
  const currentVersion = __APP_VERSION__
  let metadataUrl = ''
  let installUrl = ''
  try {
    metadataUrl = resolveDwebMetadataUrl()
    installUrl = resolveInstallUrl(metadataUrl)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'invalid site origin'
    return { status: 'error', currentVersion, metadataUrl, installUrl, error: message }
  }

  if (!isDwebEnvironment()) {
    return { status: 'not-dweb', currentVersion, metadataUrl, installUrl }
  }

  try {
    const metadata = await fetchMetadata(metadataUrl)
    if (!metadata.version) {
      return {
        status: 'error',
        currentVersion,
        metadataUrl,
        installUrl,
        error: 'metadata version missing',
      }
    }

    const diff = compareVersion(metadata.version, currentVersion)
    if (diff === null) {
      return {
        status: 'error',
        currentVersion,
        metadataUrl,
        installUrl,
        error: 'version parse failed',
      }
    }

    if (diff > 0) {
      return {
        status: 'update-available',
        currentVersion,
        latestVersion: metadata.version,
        metadataUrl,
        installUrl,
        changeLog: metadata.changeLog,
      }
    }

    return {
      status: 'up-to-date',
      currentVersion,
      latestVersion: metadata.version,
      metadataUrl,
      installUrl,
      changeLog: metadata.changeLog,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    return { status: 'error', currentVersion, metadataUrl, installUrl, error: message }
  }
}
