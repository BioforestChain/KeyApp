/**
 * KeyApp Context - 应用上下文管理
 * 
 * 提供主题、语言、平台等上下文信息，支持事件监听
 */

import type {
  KeyAppContextState,
  KeyAppContextEventMap,
  KeyAppContextEventType,
  ThemeContext,
  LocaleContext,
  EnvContext,
  A11yContext,
} from './types'

const DEFAULT_STATE: KeyAppContextState = {
  theme: {
    colorMode: 'light',
    primaryHue: 323,
    primarySaturation: 0.26,
  },
  locale: {
    lang: 'en-US',
    rtl: false,
  },
  env: {
    platform: 'web',
    version: '1.0.0',
    safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
  },
  a11y: {
    fontScale: 1.0,
    reduceMotion: false,
  },
}

function parseInitialContext(): KeyAppContextState {
  if (typeof window === 'undefined') {
    return DEFAULT_STATE
  }

  const params = new URLSearchParams(window.location.search)
  
  return {
    theme: {
      colorMode: (params.get('colorMode') as 'light' | 'dark') || DEFAULT_STATE.theme.colorMode,
      primaryHue: Number(params.get('primaryHue')) || DEFAULT_STATE.theme.primaryHue,
      primarySaturation: Number(params.get('primarySaturation')) || DEFAULT_STATE.theme.primarySaturation,
    },
    locale: {
      lang: params.get('lang') || DEFAULT_STATE.locale.lang,
      rtl: params.get('rtl') === 'true',
    },
    env: {
      platform: (params.get('platform') as KeyAppContextState['env']['platform']) || DEFAULT_STATE.env.platform,
      version: params.get('version') || DEFAULT_STATE.env.version,
      safeAreaInsets: {
        top: Number(params.get('safeAreaTop')) || 0,
        bottom: Number(params.get('safeAreaBottom')) || 0,
        left: Number(params.get('safeAreaLeft')) || 0,
        right: Number(params.get('safeAreaRight')) || 0,
      },
    },
    a11y: {
      fontScale: Number(params.get('fontScale')) || DEFAULT_STATE.a11y.fontScale,
      reduceMotion: params.get('reduceMotion') === 'true',
    },
  }
}

class KeyAppContext extends EventTarget {
  #state: KeyAppContextState

  constructor() {
    super()
    this.#state = parseInitialContext()
    this.#setupMessageListener()
    this.#applyThemeToDocument()
  }

  #setupMessageListener() {
    if (typeof window === 'undefined') return

    window.addEventListener('message', (event) => {
      if (event.data?.type === 'keyapp:context-update') {
        this.#handleContextUpdate(event.data.payload)
      }
    })
  }

  #handleContextUpdate(payload: Partial<KeyAppContextState>) {
    const oldState = this.#state
    
    if (payload.theme) {
      this.#state = { ...this.#state, theme: { ...this.#state.theme, ...payload.theme } }
      if (JSON.stringify(oldState.theme) !== JSON.stringify(this.#state.theme)) {
        this.dispatchEvent(new CustomEvent('themechange', { detail: this.#state.theme }))
        this.#applyThemeToDocument()
      }
    }
    
    if (payload.locale) {
      this.#state = { ...this.#state, locale: { ...this.#state.locale, ...payload.locale } }
      if (JSON.stringify(oldState.locale) !== JSON.stringify(this.#state.locale)) {
        this.dispatchEvent(new CustomEvent('localechange', { detail: this.#state.locale }))
        this.#applyLocaleToDocument()
      }
    }
    
    if (payload.env) {
      this.#state = { ...this.#state, env: { ...this.#state.env, ...payload.env } }
      if (JSON.stringify(oldState.env) !== JSON.stringify(this.#state.env)) {
        this.dispatchEvent(new CustomEvent('envchange', { detail: this.#state.env }))
      }
    }
    
    if (payload.a11y) {
      this.#state = { ...this.#state, a11y: { ...this.#state.a11y, ...payload.a11y } }
      if (JSON.stringify(oldState.a11y) !== JSON.stringify(this.#state.a11y)) {
        this.dispatchEvent(new CustomEvent('a11ychange', { detail: this.#state.a11y }))
      }
    }
    
    this.dispatchEvent(new CustomEvent('change', { detail: this.#state }))
  }

  #applyThemeToDocument() {
    if (typeof document === 'undefined') return

    const { colorMode, primaryHue, primarySaturation } = this.#state.theme
    
    // 设置 dark class
    document.documentElement.classList.toggle('dark', colorMode === 'dark')
    
    // 设置 CSS 变量
    document.documentElement.style.setProperty('--primary-hue', String(primaryHue))
    document.documentElement.style.setProperty('--primary-saturation', String(primarySaturation))
  }

  #applyLocaleToDocument() {
    if (typeof document === 'undefined') return

    const { lang, rtl } = this.#state.locale
    
    document.documentElement.lang = lang
    document.documentElement.dir = rtl ? 'rtl' : 'ltr'
  }

  get theme(): ThemeContext {
    return { ...this.#state.theme }
  }

  get locale(): LocaleContext {
    return { ...this.#state.locale }
  }

  get env(): EnvContext {
    return { ...this.#state.env }
  }

  get a11y(): A11yContext {
    return { ...this.#state.a11y }
  }

  snapshot(): KeyAppContextState {
    return JSON.parse(JSON.stringify(this.#state))
  }

  // 类型安全的事件监听方法
  on<K extends KeyAppContextEventType>(
    type: K,
    listener: (event: KeyAppContextEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
  ): void {
    super.addEventListener(type, listener as EventListener, options)
  }

  off<K extends KeyAppContextEventType>(
    type: K,
    listener: (event: KeyAppContextEventMap[K]) => void,
    options?: boolean | EventListenerOptions
  ): void {
    super.removeEventListener(type, listener as EventListener, options)
  }
}

// 单例导出
export const ctx = new KeyAppContext()
