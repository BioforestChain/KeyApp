/**
 * My Apps - 本地已安装应用管理
 */

const MY_APPS_KEY = 'ecosystem:my-apps'

export interface MyAppRecord {
  appId: string
  installedAt: number
  lastUsedAt: number
}

export function loadMyApps(): MyAppRecord[] {
  try {
    const raw = localStorage.getItem(MY_APPS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveMyApps(apps: MyAppRecord[]): void {
  localStorage.setItem(MY_APPS_KEY, JSON.stringify(apps))
}

export function addToMyApps(appId: string): void {
  const apps = loadMyApps()
  if (!apps.some(a => a.appId === appId)) {
    apps.unshift({ appId, installedAt: Date.now(), lastUsedAt: Date.now() })
    saveMyApps(apps)
  }
}

export function updateLastUsed(appId: string): void {
  const apps = loadMyApps()
  const app = apps.find(a => a.appId === appId)
  if (app) {
    app.lastUsedAt = Date.now()
    saveMyApps(apps)
  }
}

export function removeFromMyApps(appId: string): void {
  const apps = loadMyApps().filter(a => a.appId !== appId)
  saveMyApps(apps)
}
