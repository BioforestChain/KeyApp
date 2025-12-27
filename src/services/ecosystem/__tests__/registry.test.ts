import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  loadSources,
  getSources,
  addSource,
  removeSource,
  toggleSource,
  getApps,
  getAppById,
  refreshSources,
} from '../registry'

describe('Miniapp Registry', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear()
    // Reset module state by reloading sources
    loadSources()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('loadSources', () => {
    it('loads default source when no stored sources', () => {
      loadSources()
      const sources = getSources()
      
      expect(sources).toHaveLength(1)
      expect(sources[0]).toEqual({
        url: '/ecosystem.json',
        name: 'Bio 官方生态',
        enabled: true,
      })
    })

    it('loads stored sources from localStorage', () => {
      const storedSources = [
        { url: 'https://example.com/apps.json', name: 'Custom', enabled: true },
      ]
      localStorage.setItem('ecosystem_sources', JSON.stringify(storedSources))

      loadSources()
      const sources = getSources()

      expect(sources).toEqual(storedSources)
    })
  })

  describe('addSource', () => {
    it('adds a new source', () => {
      addSource('https://example.com/apps.json', 'Example')
      const sources = getSources()

      expect(sources).toHaveLength(2)
      expect(sources[1]).toEqual({
        url: 'https://example.com/apps.json',
        name: 'Example',
        enabled: true,
      })
    })

    it('does not add duplicate source', () => {
      addSource('/ecosystem.json', 'Duplicate')
      const sources = getSources()

      expect(sources).toHaveLength(1)
    })

    it('persists to localStorage', () => {
      addSource('https://new-source.com/apps.json', 'New')
      
      const stored = JSON.parse(localStorage.getItem('ecosystem_sources') ?? '[]')
      expect(stored).toHaveLength(2)
    })
  })

  describe('removeSource', () => {
    it('removes a source by URL', () => {
      addSource('https://to-remove.com/apps.json', 'Remove Me')
      expect(getSources()).toHaveLength(2)

      removeSource('https://to-remove.com/apps.json')
      expect(getSources()).toHaveLength(1)
    })
  })

  describe('toggleSource', () => {
    it('toggles source enabled state', () => {
      toggleSource('/ecosystem.json', false)
      
      const sources = getSources()
      expect(sources[0]?.enabled).toBe(false)
    })
  })

  describe('refreshSources', () => {
    it('fetches apps from enabled sources', async () => {
      const mockApps = [
        { id: 'app-1', name: 'App 1', url: '/app1/', icon: '', description: '', version: '1.0' },
      ]

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ apps: mockApps }),
      })

      const apps = await refreshSources()

      expect(apps).toHaveLength(1)
      expect(apps[0]?.id).toBe('app-1')
    })

    it('skips disabled sources', async () => {
      toggleSource('/ecosystem.json', false)

      global.fetch = vi.fn()

      await refreshSources()

      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('handles fetch errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const apps = await refreshSources()

      expect(apps).toEqual([])
    })
  })

  describe('getApps / getAppById', () => {
    it('returns cached apps', async () => {
      const mockApps = [
        { id: 'test-app', name: 'Test', url: '/', icon: '', description: '', version: '1.0' },
      ]

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ apps: mockApps }),
      })

      await refreshSources()

      expect(getApps()).toHaveLength(1)
      expect(getAppById('test-app')?.name).toBe('Test')
      expect(getAppById('nonexistent')).toBeUndefined()
    })
  })
})
