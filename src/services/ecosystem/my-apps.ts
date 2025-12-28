/**
 * My Apps - 本地已安装应用管理
 */

const MY_APPS_KEY = 'ecosystem_my_apps'

export interface MyAppRecord {
  appId: string
  installedAt: number
  lastUsedAt: number
}

const LEGACY_APP_ID_MAP: Record<string, string> = {
  teleport: 'xin.dweb.teleport',
  forge: 'xin.dweb.forge',
}

function normalizeAppId(appId: string): string {
  return LEGACY_APP_ID_MAP[appId] ?? appId
}

export function loadMyApps(): MyAppRecord[] {
  try {
    const raw = localStorage.getItem(MY_APPS_KEY)
    const parsed = raw ? (JSON.parse(raw) as MyAppRecord[]) : []

    // Migrate legacy short ids to reverse-domain ids (best-effort).
    const migrated = parsed.map((r) => ({
      ...r,
      appId: normalizeAppId(r.appId),
    }))

    if (JSON.stringify(parsed) !== JSON.stringify(migrated)) {
      saveMyApps(migrated)
    }

    return migrated
  } catch {
    return []
  }
}

export function saveMyApps(apps: MyAppRecord[]): void {
  localStorage.setItem(MY_APPS_KEY, JSON.stringify(apps))
}

export function isInMyApps(appId: string): boolean {
  return loadMyApps().some((a) => a.appId === normalizeAppId(appId))
}

export function addToMyApps(appId: string): void {
  appId = normalizeAppId(appId)
  const apps = loadMyApps()
  if (!apps.some((a) => a.appId === appId)) {
    apps.unshift({ appId, installedAt: Date.now(), lastUsedAt: Date.now() })
    saveMyApps(apps)
  }
}

export function updateLastUsed(appId: string): void {
  appId = normalizeAppId(appId)
  const apps = loadMyApps()
  const app = apps.find((a) => a.appId === appId)
  if (app) {
    app.lastUsedAt = Date.now()
    saveMyApps(apps)
  }
}

export function removeFromMyApps(appId: string): void {
  appId = normalizeAppId(appId)
  const apps = loadMyApps().filter((a) => a.appId !== appId)
  saveMyApps(apps)
}
