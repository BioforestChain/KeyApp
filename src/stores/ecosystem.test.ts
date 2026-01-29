import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ecosystemStore, ecosystemActions, ecosystemSelectors } from './ecosystem'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock })

// Mock import.meta.env
vi.stubGlobal('import', { meta: { env: { BASE_URL: '/' } } })

describe('ecosystemStore - myApps management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    // Reset store state
    ecosystemStore.setState(() => ({
      permissions: [],
      sources: [],
      myApps: [],
      availableSubPages: ['discover', 'mine'],
      activeSubPage: 'discover',
      swiperProgress: 0,
      syncSource: null,
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('installApp', () => {
    it('adds app to myApps list', () => {
      ecosystemActions.installApp('test.app.id')
      
      expect(ecosystemStore.state.myApps).toHaveLength(1)
      expect(ecosystemStore.state.myApps[0]?.appId).toBe('test.app.id')
    })

    it('sets installedAt and lastUsedAt timestamps', () => {
      const before = Date.now()
      ecosystemActions.installApp('test.app.id')
      const after = Date.now()
      
      const app = ecosystemStore.state.myApps[0]
      expect(app?.installedAt).toBeGreaterThanOrEqual(before)
      expect(app?.installedAt).toBeLessThanOrEqual(after)
      expect(app?.lastUsedAt).toBeGreaterThanOrEqual(before)
      expect(app?.lastUsedAt).toBeLessThanOrEqual(after)
    })

    it('adds new app to the front of the list', () => {
      ecosystemActions.installApp('app.first')
      ecosystemActions.installApp('app.second')
      
      expect(ecosystemStore.state.myApps[0]?.appId).toBe('app.second')
      expect(ecosystemStore.state.myApps[1]?.appId).toBe('app.first')
    })

    it('does not duplicate already installed app', () => {
      ecosystemActions.installApp('test.app.id')
      ecosystemActions.installApp('test.app.id')
      
      expect(ecosystemStore.state.myApps).toHaveLength(1)
    })

    it('normalizes legacy app IDs', () => {
      ecosystemActions.installApp('teleport')
      
      expect(ecosystemStore.state.myApps[0]?.appId).toBe('xin.dweb.teleport')
    })

    it('persists to localStorage', () => {
      ecosystemActions.installApp('test.app.id')
      
      expect(localStorageMock.setItem).toHaveBeenCalled()
      // Find the last call to ecosystem_my_apps
      const myAppsCalls = localStorageMock.setItem.mock.calls.filter(
        (call) => call[0] === 'ecosystem_my_apps'
      )
      expect(myAppsCalls.length).toBeGreaterThan(0)
      const lastCall = myAppsCalls[myAppsCalls.length - 1]
      const savedApps = JSON.parse(lastCall![1])
      expect(savedApps.some((a: { appId: string }) => a.appId === 'test.app.id')).toBe(true)
    })
  })

  describe('uninstallApp', () => {
    beforeEach(() => {
      ecosystemActions.installApp('app.one')
      ecosystemActions.installApp('app.two')
      vi.clearAllMocks()
    })

    it('removes app from myApps list', () => {
      ecosystemActions.uninstallApp('app.one')
      
      expect(ecosystemStore.state.myApps).toHaveLength(1)
      expect(ecosystemStore.state.myApps[0]?.appId).toBe('app.two')
    })

    it('does nothing if app not found', () => {
      ecosystemActions.uninstallApp('app.nonexistent')
      
      expect(ecosystemStore.state.myApps).toHaveLength(2)
    })

    it('normalizes legacy app IDs', () => {
      ecosystemActions.installApp('biobridge')
      ecosystemActions.uninstallApp('biobridge')
      
      expect(ecosystemStore.state.myApps.find((a) => a.appId === 'xin.dweb.biobridge')).toBeUndefined()
    })

    it('persists to localStorage', () => {
      ecosystemActions.uninstallApp('app.one')
      
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })

  describe('updateAppLastUsed', () => {
    beforeEach(() => {
      ecosystemActions.installApp('test.app.id')
      vi.clearAllMocks()
    })

    it('updates lastUsedAt timestamp', async () => {
      const originalLastUsed = ecosystemStore.state.myApps[0]?.lastUsedAt ?? 0
      
      // Wait a bit to ensure timestamp difference
      await new Promise((r) => setTimeout(r, 10))
      
      ecosystemActions.updateAppLastUsed('test.app.id')
      
      const updatedLastUsed = ecosystemStore.state.myApps[0]?.lastUsedAt ?? 0
      expect(updatedLastUsed).toBeGreaterThan(originalLastUsed)
    })

    it('does nothing if app not installed', () => {
      const stateBefore = { ...ecosystemStore.state }
      ecosystemActions.updateAppLastUsed('nonexistent.app')
      
      expect(ecosystemStore.state.myApps).toEqual(stateBefore.myApps)
    })

    it('persists to localStorage', () => {
      ecosystemActions.updateAppLastUsed('test.app.id')
      
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })
  })

  describe('isAppInstalled selector', () => {
    beforeEach(() => {
      ecosystemActions.installApp('installed.app')
    })

    it('returns true for installed app', () => {
      const result = ecosystemSelectors.isAppInstalled(ecosystemStore.state, 'installed.app')
      expect(result).toBe(true)
    })

    it('returns false for non-installed app', () => {
      const result = ecosystemSelectors.isAppInstalled(ecosystemStore.state, 'not.installed')
      expect(result).toBe(false)
    })

    it('normalizes legacy app IDs', () => {
      ecosystemActions.installApp('teleport')
      
      const result = ecosystemSelectors.isAppInstalled(ecosystemStore.state, 'teleport')
      expect(result).toBe(true)
      
      const resultNormalized = ecosystemSelectors.isAppInstalled(
        ecosystemStore.state,
        'xin.dweb.teleport'
      )
      expect(resultNormalized).toBe(true)
    })
  })

  describe('store subscription reactivity', () => {
    it('triggers subscribers on installApp', () => {
      const subscriber = vi.fn()
      const unsubscribe = ecosystemStore.subscribe(subscriber)
      
      ecosystemActions.installApp('new.app')
      
      expect(subscriber).toHaveBeenCalled()
      unsubscribe()
    })

    it('triggers subscribers on uninstallApp', () => {
      ecosystemActions.installApp('app.to.remove')
      
      const subscriber = vi.fn()
      const unsubscribe = ecosystemStore.subscribe(subscriber)
      
      ecosystemActions.uninstallApp('app.to.remove')
      
      expect(subscriber).toHaveBeenCalled()
      unsubscribe()
    })

    it('triggers subscribers on updateAppLastUsed', () => {
      ecosystemActions.installApp('app.to.update')
      
      const subscriber = vi.fn()
      const unsubscribe = ecosystemStore.subscribe(subscriber)
      
      ecosystemActions.updateAppLastUsed('app.to.update')
      
      expect(subscriber).toHaveBeenCalled()
      unsubscribe()
    })
  })
})

describe('ecosystemStore - activeSubPage', () => {
  beforeEach(() => {
    ecosystemStore.setState(() => ({
      permissions: [],
      sources: [],
      myApps: [],
      availableSubPages: ['discover', 'mine'],
      activeSubPage: 'discover',
      swiperProgress: 0,
      syncSource: null,
    }))
  })

  it('setActiveSubPage updates the active sub page', () => {
    ecosystemActions.setActiveSubPage('mine')
    expect(ecosystemStore.state.activeSubPage).toBe('mine')
  })

  it('persists activeSubPage to localStorage', () => {
    ecosystemActions.setActiveSubPage('mine')
    
    // Find the last call to ecosystem_store
    const storeCalls = localStorageMock.setItem.mock.calls.filter(
      (call) => call[0] === 'ecosystem_store'
    )
    expect(storeCalls.length).toBeGreaterThan(0)
    const lastCall = storeCalls[storeCalls.length - 1]
    const savedState = JSON.parse(lastCall![1])
    expect(savedState.activeSubPage).toBe('mine')
  })
})
