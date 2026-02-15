import { isDwebEnvironment } from './crypto/secure-storage'

export interface DwebVirtualKeyboardPlugin {
  setOverlay(overlay: boolean): Promise<unknown>
}

export interface DwebPluginsModule {
  virtualKeyboardPlugin?: DwebVirtualKeyboardPlugin
}

export interface ApplyDwebKeyboardOverlayOptions {
  isDweb?: () => boolean
  loadPlugins?: () => Promise<DwebPluginsModule>
}

async function defaultLoadPlugins(): Promise<DwebPluginsModule> {
  const moduleName = '@plaoc/plugins'
  const module = await import(/* @vite-ignore */ moduleName)
  return module as DwebPluginsModule
}

/**
 * 在 DWEB 环境启用键盘 overlay，避免输入法弹出导致 document 发生 resize。
 */
export async function applyDwebKeyboardOverlay(
  options: ApplyDwebKeyboardOverlayOptions = {},
): Promise<boolean> {
  const isDweb = options.isDweb ?? isDwebEnvironment
  const loadPlugins = options.loadPlugins ?? defaultLoadPlugins

  if (!isDweb()) {
    return false
  }

  try {
    const plugins = await loadPlugins()
    const virtualKeyboardPlugin = plugins.virtualKeyboardPlugin
    if (!virtualKeyboardPlugin || typeof virtualKeyboardPlugin.setOverlay !== 'function') {
      return false
    }

    await virtualKeyboardPlugin.setOverlay(true)
    return true
  } catch (error) {
    console.warn('[dweb-keyboard-overlay] apply failed', error)
    return false
  }
}
