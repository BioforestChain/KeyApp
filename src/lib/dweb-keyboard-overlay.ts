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
  const module = await import('@plaoc/plugins')
  return module as DwebPluginsModule
}

/**
 * 在 DWEB 环境配置键盘 overlay 行为。
 * 当前策略：显式关闭 overlay，避免部分环境下的输入异常。
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

    await virtualKeyboardPlugin.setOverlay(false)
    return true
  } catch (error) {
    console.warn('[dweb-keyboard-overlay] apply failed', error)
    return false
  }
}
