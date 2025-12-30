/**
 * Ecosystem Store
 * 存储小程序生态系统状态：权限、订阅源等
 */

import { Store } from '@tanstack/react-store'

/** 权限记录 */
export interface PermissionRecord {
  appId: string
  granted: string[]
  grantedAt: number
}

/** 订阅源记录 */
export interface SourceRecord {
  url: string
  name: string
  lastUpdated: string
  enabled: boolean
}

/** Ecosystem 子页面类型 */
export type EcosystemSubPage = 'discover' | 'mine' | 'stack'

/** 子页面索引映射 */
export const ECOSYSTEM_SUBPAGE_INDEX: Record<EcosystemSubPage, number> = {
  discover: 0,
  mine: 1,
  stack: 2,
}

/** 索引到子页面映射 */
export const ECOSYSTEM_INDEX_SUBPAGE: EcosystemSubPage[] = ['discover', 'mine', 'stack']

/** 同步控制源 */
export type SyncSource = 'swiper' | 'indicator' | null

/** Ecosystem 状态 */
export interface EcosystemState {
  permissions: PermissionRecord[]
  sources: SourceRecord[]
  /** 当前子页面（发现/我的） */
  activeSubPage: EcosystemSubPage
  /** Swiper 滑动进度 (0-2 for 3 pages) */
  swiperProgress: number
  /** 当前同步控制源（用于双向绑定） */
  syncSource: SyncSource
}

const STORAGE_KEY = 'ecosystem_store'

/** 从 localStorage 加载状态 */
function loadState(): EcosystemState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<EcosystemState>
      return {
        permissions: parsed.permissions ?? [],
        sources: parsed.sources ?? [
          {
            url: `${import.meta.env.BASE_URL}miniapps/ecosystem.json`,
            name: 'Bio 官方生态',
            lastUpdated: new Date().toISOString(),
            enabled: true,
          },
        ],
        activeSubPage: parsed.activeSubPage ?? 'discover',
        swiperProgress: 0,
        syncSource: null,
      }
    }
  } catch {
    // ignore
  }
  return {
    permissions: [],
    sources: [
      {
        url: `${import.meta.env.BASE_URL}miniapps/ecosystem.json`,
        name: 'Bio 官方生态',
        lastUpdated: new Date().toISOString(),
        enabled: true,
      },
    ],
    activeSubPage: 'discover',
    swiperProgress: 0,
    syncSource: null,
  }
}

/** 保存状态到 localStorage */
function saveState(state: EcosystemState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

/** Store 实例 */
export const ecosystemStore = new Store<EcosystemState>(loadState())

// 自动保存
ecosystemStore.subscribe(() => {
  saveState(ecosystemStore.state)
})

/** Selectors */
export const ecosystemSelectors = {
  /** 获取应用的已授权权限 */
  getGrantedPermissions: (state: EcosystemState, appId: string): string[] => {
    return state.permissions.find((p) => p.appId === appId)?.granted ?? []
  },

  /** 检查是否有特定权限 */
  hasPermission: (state: EcosystemState, appId: string, permission: string): boolean => {
    const granted = ecosystemSelectors.getGrantedPermissions(state, appId)
    return granted.includes(permission)
  },

  /** 获取启用的订阅源 */
  getEnabledSources: (state: EcosystemState): SourceRecord[] => {
    return state.sources.filter((s) => s.enabled)
  },
}

/** Actions */
export const ecosystemActions = {
  /** 授予权限 */
  grantPermissions: (appId: string, permissions: string[]): void => {
    ecosystemStore.setState((state) => {
      const existing = state.permissions.find((p) => p.appId === appId)
      if (existing) {
        // 合并权限
        const newGranted = [...new Set([...existing.granted, ...permissions])]
        return {
          ...state,
          permissions: state.permissions.map((p) =>
            p.appId === appId ? { ...p, granted: newGranted, grantedAt: Date.now() } : p
          ),
        }
      } else {
        // 新增记录
        return {
          ...state,
          permissions: [
            ...state.permissions,
            { appId, granted: permissions, grantedAt: Date.now() },
          ],
        }
      }
    })
  },

  /** 撤销权限 */
  revokePermissions: (appId: string, permissions?: string[]): void => {
    ecosystemStore.setState((state) => {
      if (!permissions) {
        // 撤销所有权限
        return {
          ...state,
          permissions: state.permissions.filter((p) => p.appId !== appId),
        }
      }
      // 撤销指定权限
      return {
        ...state,
        permissions: state.permissions.map((p) =>
          p.appId === appId
            ? { ...p, granted: p.granted.filter((g) => !permissions.includes(g)) }
            : p
        ),
      }
    })
  },

  /** 添加订阅源 */
  addSource: (url: string, name: string): void => {
    ecosystemStore.setState((state) => {
      if (state.sources.some((s) => s.url === url)) {
        return state // 已存在
      }
      return {
        ...state,
        sources: [
          ...state.sources,
          { url, name, lastUpdated: new Date().toISOString(), enabled: true },
        ],
      }
    })
  },

  /** 移除订阅源 */
  removeSource: (url: string): void => {
    ecosystemStore.setState((state) => ({
      ...state,
      sources: state.sources.filter((s) => s.url !== url),
    }))
  },

  /** 切换订阅源启用状态 */
  toggleSource: (url: string): void => {
    ecosystemStore.setState((state) => ({
      ...state,
      sources: state.sources.map((s) =>
        s.url === url ? { ...s, enabled: !s.enabled } : s
      ),
    }))
  },

  /** 更新订阅源时间 */
  updateSourceTimestamp: (url: string): void => {
    ecosystemStore.setState((state) => ({
      ...state,
      sources: state.sources.map((s) =>
        s.url === url ? { ...s, lastUpdated: new Date().toISOString() } : s
      ),
    }))
  },

  /** 设置当前子页面 */
  setActiveSubPage: (subPage: EcosystemSubPage): void => {
    ecosystemStore.setState((state) => ({
      ...state,
      activeSubPage: subPage,
    }))
  },

  /** 更新 Swiper 进度 */
  setSwiperProgress: (progress: number): void => {
    ecosystemStore.setState((state) => ({
      ...state,
      swiperProgress: progress,
    }))
  },

  /** 设置同步控制源 */
  setSyncSource: (source: SyncSource): void => {
    ecosystemStore.setState((state) => ({
      ...state,
      syncSource: source,
    }))
  },
}
