/**
 * My Apps - Local installed app persistence layer
 * 
 * NOTE: Do not use this directly for state management. Use ecosystemStore instead.
 */

import type { MyAppRecord } from './types'

const MY_APPS_KEY = 'ecosystem_my_apps'

const LEGACY_APP_ID_MAP: Record<string, string> = {
  teleport: 'xin.dweb.teleport',
  forge: 'xin.dweb.biobridge',
  biobridge: 'xin.dweb.biobridge',
}

export function normalizeAppId(appId: string): string {
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

