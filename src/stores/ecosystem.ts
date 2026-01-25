/**
 * Ecosystem Store
 * 存储小程序生态系统状态：权限、订阅源等
 */

import { Store } from '@tanstack/react-store';
import { type MyAppRecord } from '@/services/ecosystem/types';
import { loadMyApps, normalizeAppId, saveMyApps } from '@/services/ecosystem/my-apps';
import i18n from '@/i18n';

/** 权限记录 */
export interface PermissionRecord {
  appId: string;
  granted: string[];
  grantedAt: number;
}

/** 订阅源状态 */
export type SourceStatus = 'idle' | 'loading' | 'success' | 'error';

/** 订阅源记录 */
export interface SourceRecord {
  url: string;
  name: string;
  lastUpdated: string;
  enabled: boolean;
  status: SourceStatus;
  errorMessage?: string;
  icon?: string;
}

/** Ecosystem 子页面类型 */
export type EcosystemSubPage = 'discover' | 'mine' | 'stack';

/** 默认可用子页面（不包含 stack，由桌面根据运行态启用） */
const DEFAULT_AVAILABLE_SUBPAGES: EcosystemSubPage[] = ['discover', 'mine'];

/** 子页面索引映射 */
export const ECOSYSTEM_SUBPAGE_INDEX: Record<EcosystemSubPage, number> = {
  discover: 0,
  mine: 1,
  stack: 2,
};

/** 索引到子页面映射 */
export const ECOSYSTEM_INDEX_SUBPAGE: EcosystemSubPage[] = ['discover', 'mine', 'stack'];

/** 同步控制源 */
export type SyncSource = 'swiper' | 'indicator' | null;

/** Ecosystem 状态 */
export interface EcosystemState {
  permissions: PermissionRecord[];
  sources: SourceRecord[];
  myApps: MyAppRecord[];
  /** 当前可用子页面（由 EcosystemDesktop 根据配置/运行态写入） */
  availableSubPages: EcosystemSubPage[];
  /** 当前子页面（发现/我的） */
  activeSubPage: EcosystemSubPage;
  /** Swiper 滑动进度 (0-2 for 3 pages) */
  swiperProgress: number;
  /** 当前同步控制源（用于双向绑定） */
  syncSource: SyncSource;
}

const STORAGE_KEY = 'ecosystem_store';
const getDefaultSourceName = () => i18n.t('ecosystem:sources.defaultName');

function arraysEqual<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function getDefaultSources(): SourceRecord[] {
  const defaultName = getDefaultSourceName();
  return [
    {
      url: `${import.meta.env.BASE_URL}miniapps/ecosystem.json`,
      name: defaultName,
      lastUpdated: new Date().toISOString(),
      enabled: true,
      status: 'idle' as const,
    },
  ];
}

function mergeSourcesWithDefault(sources: SourceRecord[]): SourceRecord[] {
  const defaults = getDefaultSources();
  const merged = [...sources];

  for (const fallback of defaults) {
    if (!merged.some((source) => source.url === fallback.url)) {
      merged.push(fallback);
    }
  }

  return merged;
}

function normalizeSources(input: unknown): SourceRecord[] {
  if (!Array.isArray(input)) return [];
  const now = new Date().toISOString();

  return input
    .map((item): SourceRecord | null => {
      if (typeof item === 'string') {
        return {
          url: item,
          name: 'Bio 官方生态', // i18n-ignore: migration fallback
          lastUpdated: now,
          enabled: true,
          status: 'idle',
        };
      }
      if (!item || typeof item !== 'object') return null;

      const record = item as Partial<SourceRecord> & { url?: unknown };
      if (typeof record.url !== 'string' || record.url.length === 0) return null;

      return {
        url: record.url,
        name: typeof record.name === 'string' && record.name.length > 0 ? record.name : getDefaultSourceName(),
        lastUpdated: typeof record.lastUpdated === 'string' && record.lastUpdated.length > 0 ? record.lastUpdated : now,
        enabled: typeof record.enabled === 'boolean' ? record.enabled : true,
        status: record.status ?? 'idle',
        errorMessage: record.errorMessage,
        icon: record.icon,
      };
    })
    .filter((item): item is SourceRecord => item !== null);
}

/** 从 localStorage 加载状态 */
function loadState(): EcosystemState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<EcosystemState>;

      const availableSubPages =
        Array.isArray(parsed.availableSubPages) && parsed.availableSubPages.length > 0
          ? (parsed.availableSubPages as EcosystemSubPage[])
          : DEFAULT_AVAILABLE_SUBPAGES;

      const activeSubPage = (parsed.activeSubPage ?? 'discover') as EcosystemSubPage;
      const fixedAvailableSubPages = availableSubPages.includes(activeSubPage)
        ? availableSubPages
        : [...availableSubPages, activeSubPage];

      const normalizedSources = normalizeSources(parsed.sources);
      const mergedSources = mergeSourcesWithDefault(normalizedSources);
      return {
        permissions: parsed.permissions ?? [],
        sources: mergedSources.length > 0 ? mergedSources : getDefaultSources(),
        myApps: loadMyApps(),
        availableSubPages: fixedAvailableSubPages,
        activeSubPage,
        swiperProgress: 0,
        syncSource: null,
      };
    }
  } catch {
    // ignore
  }
  return {
    permissions: [],
    sources: mergeSourcesWithDefault([]),
    myApps: loadMyApps(),
    availableSubPages: DEFAULT_AVAILABLE_SUBPAGES,
    activeSubPage: 'discover',
    swiperProgress: 0,
    syncSource: null,
  };
}

/** 保存状态到 localStorage */
function saveState(state: EcosystemState): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        permissions: state.permissions,
        sources: state.sources,
        availableSubPages: state.availableSubPages,
        activeSubPage: state.activeSubPage,
        // myApps is saved separately
      }),
    );
    saveMyApps(state.myApps);
  } catch {
    // ignore
  }
}

/** Store 实例 */
export const ecosystemStore = new Store<EcosystemState>(loadState());

// 自动保存
ecosystemStore.subscribe(() => {
  saveState(ecosystemStore.state);
});

/** Selectors */
export const ecosystemSelectors = {
  /** 获取应用的已授权权限 */
  getGrantedPermissions: (state: EcosystemState, appId: string): string[] => {
    return state.permissions.find((p) => p.appId === appId)?.granted ?? [];
  },

  /** 检查是否有特定权限 */
  hasPermission: (state: EcosystemState, appId: string, permission: string): boolean => {
    const granted = ecosystemSelectors.getGrantedPermissions(state, appId);
    return granted.includes(permission);
  },

  /** 获取启用的订阅源 */
  getEnabledSources: (state: EcosystemState): SourceRecord[] => {
    return state.sources.filter((s) => s.enabled);
  },

  /** 检查应用是否已安装 */
  isAppInstalled: (state: EcosystemState, appId: string): boolean => {
    const normalized = normalizeAppId(appId);
    return state.myApps.some((a) => a.appId === normalized);
  },
};

/** Actions */
export const ecosystemActions = {
  /** 安装应用 */
  installApp: (appId: string): void => {
    ecosystemStore.setState((state) => {
      const normalized = normalizeAppId(appId);
      if (state.myApps.some((a) => a.appId === normalized)) {
        return state; // 已安装
      }
      return {
        ...state,
        myApps: [{ appId: normalized, installedAt: Date.now(), lastUsedAt: Date.now() }, ...state.myApps],
      };
    });
  },

  /** 卸载应用 */
  uninstallApp: (appId: string): void => {
    ecosystemStore.setState((state) => {
      const normalized = normalizeAppId(appId);
      return {
        ...state,
        myApps: state.myApps.filter((a) => a.appId !== normalized),
      };
    });
  },

  /** 更新应用最后使用时间 */
  updateAppLastUsed: (appId: string): void => {
    ecosystemStore.setState((state) => {
      const normalized = normalizeAppId(appId);
      const existing = state.myApps.find((a) => a.appId === normalized);
      if (!existing) return state;

      return {
        ...state,
        myApps: state.myApps.map((a) => (a.appId === normalized ? { ...a, lastUsedAt: Date.now() } : a)),
      };
    });
  },

  /** 授予权限 */
  grantPermissions: (appId: string, permissions: string[]): void => {
    ecosystemStore.setState((state) => {
      const existing = state.permissions.find((p) => p.appId === appId);
      if (existing) {
        // 合并权限
        const newGranted = [...new Set([...existing.granted, ...permissions])];
        return {
          ...state,
          permissions: state.permissions.map((p) =>
            p.appId === appId ? { ...p, granted: newGranted, grantedAt: Date.now() } : p,
          ),
        };
      } else {
        // 新增记录
        return {
          ...state,
          permissions: [...state.permissions, { appId, granted: permissions, grantedAt: Date.now() }],
        };
      }
    });
  },

  /** 撤销权限 */
  revokePermissions: (appId: string, permissions?: string[]): void => {
    ecosystemStore.setState((state) => {
      if (!permissions) {
        // 撤销所有权限
        return {
          ...state,
          permissions: state.permissions.filter((p) => p.appId !== appId),
        };
      }
      // 撤销指定权限
      return {
        ...state,
        permissions: state.permissions.map((p) =>
          p.appId === appId ? { ...p, granted: p.granted.filter((g) => !permissions.includes(g)) } : p,
        ),
      };
    });
  },

  /** 添加订阅源 */
  addSource: (url: string, name: string): void => {
    ecosystemStore.setState((state) => {
      if (state.sources.some((s) => s.url === url)) {
        return state; // 已存在
      }
      return {
        ...state,
        sources: [
          ...state.sources,
          { url, name, lastUpdated: new Date().toISOString(), enabled: true, status: 'idle' as const },
        ],
      };
    });
  },

  /** 移除订阅源 */
  removeSource: (url: string): void => {
    ecosystemStore.setState((state) => ({
      ...state,
      sources: state.sources.filter((s) => s.url !== url),
    }));
  },

  /** 切换订阅源启用状态 */
  toggleSource: (url: string): void => {
    ecosystemStore.setState((state) => ({
      ...state,
      sources: state.sources.map((s) => (s.url === url ? { ...s, enabled: !s.enabled } : s)),
    }));
  },

  /** 更新订阅源时间 */
  updateSourceTimestamp: (url: string): void => {
    ecosystemStore.setState((state) => ({
      ...state,
      sources: state.sources.map((s) => (s.url === url ? { ...s, lastUpdated: new Date().toISOString() } : s)),
    }));
  },

  /** 更新订阅源状态 */
  updateSourceStatus: (url: string, status: SourceStatus, errorMessage?: string): void => {
    ecosystemStore.setState((state) => ({
      ...state,
      sources: state.sources.map((s) =>
        s.url === url
          ? {
              ...s,
              status,
              errorMessage: status === 'error' ? errorMessage : undefined,
              ...(status === 'success' ? { lastUpdated: new Date().toISOString() } : {}),
            }
          : s,
      ),
    }));
  },

  /** 设置当前子页面 */
  setActiveSubPage: (subPage: EcosystemSubPage): void => {
    ecosystemStore.setState((state) => ({
      ...state,
      activeSubPage: subPage,
    }));
  },

  /** 设置当前可用子页面（由桌面配置驱动） */
  setAvailableSubPages: (subPages: EcosystemSubPage[]): void => {
    ecosystemStore.setState((state) => {
      const next = subPages.length > 0 ? subPages : DEFAULT_AVAILABLE_SUBPAGES;
      if (arraysEqual(state.availableSubPages, next)) return state;
      const activeSubPage = next.includes(state.activeSubPage) ? state.activeSubPage : (next[0] ?? 'mine');
      return {
        ...state,
        availableSubPages: next,
        activeSubPage,
      };
    });
  },

  /** 更新 Swiper 进度 */
  setSwiperProgress: (progress: number): void => {
    ecosystemStore.setState((state) => ({
      ...state,
      swiperProgress: progress,
    }));
  },

  /** 设置同步控制源 */
  setSyncSource: (source: SyncSource): void => {
    ecosystemStore.setState((state) => ({
      ...state,
      syncSource: source,
    }));
  },
};
