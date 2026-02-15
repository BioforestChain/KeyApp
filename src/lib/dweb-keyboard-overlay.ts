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

export interface StartDwebKeyboardOverlayOptions extends ApplyDwebKeyboardOverlayOptions {
  maxAttempts?: number
  retryDelayMs?: number
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

/**
 * 启动键盘 overlay 应用流程（包含重试），用于规避运行时初始化时机过早导致的失效。
 */
export function startDwebKeyboardOverlay(
  options: StartDwebKeyboardOverlayOptions = {},
): () => void {
  const maxAttempts = Math.max(1, options.maxAttempts ?? 10)
  const retryDelayMs = Math.max(50, options.retryDelayMs ?? 300)
  let stopped = false
  let timer: ReturnType<typeof setTimeout> | null = null
  let attempts = 0

  const run = async (): Promise<void> => {
    if (stopped) {
      return
    }

    const applied = await applyDwebKeyboardOverlay(options)
    attempts += 1

    if (applied || stopped || attempts >= maxAttempts) {
      return
    }

    timer = setTimeout(() => {
      void run()
    }, retryDelayMs)
  }

  void run()

  return () => {
    stopped = true
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }
}
