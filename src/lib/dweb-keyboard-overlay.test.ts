import { describe, expect, it, vi } from 'vitest'
import { applyDwebKeyboardOverlay, type DwebPluginsModule } from './dweb-keyboard-overlay'

describe('dweb keyboard overlay', () => {
  it('skips when current environment is not dweb', async () => {
    const loadPlugins = vi.fn<() => Promise<DwebPluginsModule>>()

    const result = await applyDwebKeyboardOverlay({
      isDweb: () => false,
      loadPlugins,
    })

    expect(result).toBe(false)
    expect(loadPlugins).not.toHaveBeenCalled()
  })

  it('applies overlay in dweb environment', async () => {
    const setOverlay = vi.fn<(overlay: boolean) => Promise<void>>().mockResolvedValue()
    const loadPlugins = vi.fn<() => Promise<DwebPluginsModule>>().mockResolvedValue({
      virtualKeyboardPlugin: { setOverlay },
    })

    const result = await applyDwebKeyboardOverlay({
      isDweb: () => true,
      loadPlugins,
    })

    expect(result).toBe(true)
    expect(loadPlugins).toHaveBeenCalledTimes(1)
    expect(setOverlay).toHaveBeenCalledWith(true)
  })

  it('returns false when virtual keyboard plugin is unavailable', async () => {
    const loadPlugins = vi.fn<() => Promise<DwebPluginsModule>>().mockResolvedValue({})

    const result = await applyDwebKeyboardOverlay({
      isDweb: () => true,
      loadPlugins,
    })

    expect(result).toBe(false)
    expect(loadPlugins).toHaveBeenCalledTimes(1)
  })

  it('returns false when plugin loading fails', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const loadPlugins = vi.fn<() => Promise<DwebPluginsModule>>().mockRejectedValue(new Error('load-failed'))

    const result = await applyDwebKeyboardOverlay({
      isDweb: () => true,
      loadPlugins,
    })

    expect(result).toBe(false)
    expect(warnSpy).toHaveBeenCalledTimes(1)

    warnSpy.mockRestore()
  })
})
