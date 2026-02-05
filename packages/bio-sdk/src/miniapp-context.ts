import { z } from 'zod'

export const MiniappSafeAreaInsetsSchema = z.object({
  top: z.number().min(0),
  right: z.number().min(0),
  bottom: z.number().min(0),
  left: z.number().min(0),
})

export type MiniappSafeAreaInsets = z.infer<typeof MiniappSafeAreaInsetsSchema>

export const MiniappContextEnvSchema = z.object({
  safeAreaInsets: MiniappSafeAreaInsetsSchema,
  platform: z.enum(['web', 'dweb', 'ios', 'android']).optional(),
  locale: z.string().optional(),
})

export const MiniappContextHostSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
  build: z.string().optional(),
})

export const MiniappContextSchema = z
  .object({
    version: z.number().min(1),
    env: MiniappContextEnvSchema,
    host: MiniappContextHostSchema,
    updatedAt: z.string(),
    theme: z
      .object({
        colorMode: z.enum(['light', 'dark']).optional(),
      })
      .optional(),
  })
  .passthrough()

export type MiniappContext = z.infer<typeof MiniappContextSchema>

export type MiniappContextRequestMessage = {
  type: 'miniapp:context-request'
  requestId: string
  sdkVersion: string
  payload?: {
    appId?: string
  }
}

export type MiniappContextUpdateMessage = {
  type: 'keyapp:context-update'
  requestId?: string
  payload: MiniappContext
}

export type MiniappContextOptions = {
  forceRefresh?: boolean
  timeoutMs?: number
  retries?: number
  appId?: string
}

export type MiniappContextSubscriptionOptions = {
  emitCached?: boolean
  appId?: string
}

type PendingRequest = {
  resolve: (context: MiniappContext) => void
  reject: (error: Error) => void
  timeoutId: ReturnType<typeof setTimeout> | null
}

const DEFAULT_TIMEOUT_MS = 1200
const DEFAULT_RETRIES = 1
const SDK_VERSION = '1.0.0'

const listeners = new Set<(context: MiniappContext) => void>()
const pendingRequests = new Map<string, PendingRequest>()
let cachedContext: MiniappContext | null = null
let bridgeReady = false
let warnedUnsupported = false
let inflightContextPromise: Promise<MiniappContext> | null = null
let lastRequestAppId: string | undefined

function ensureBridge(): void {
  if (bridgeReady || typeof window === 'undefined') return
  bridgeReady = true
  window.addEventListener('message', handleMessage)
}

function handleMessage(event: MessageEvent): void {
  const data = event.data as MiniappContextUpdateMessage | undefined
  if (!data || data.type !== 'keyapp:context-update') return

  const parsed = MiniappContextSchema.safeParse(data.payload)
  if (!parsed.success) {
    console.warn('[bio-sdk] Invalid miniapp context payload', parsed.error)
    return
  }

  cachedContext = parsed.data
  listeners.forEach((listener) => listener(parsed.data))

  if (data.requestId) {
    const pending = pendingRequests.get(data.requestId)
    if (pending) {
      clearPendingRequest(data.requestId, pending)
      pending.resolve(parsed.data)
      return
    }
  }

  if (!data.requestId && pendingRequests.size > 0) {
    pendingRequests.forEach((pending, key) => {
      clearPendingRequest(key, pending)
      pending.resolve(parsed.data)
    })
  }
}

function clearPendingRequest(requestId: string, pending: PendingRequest): void {
  if (pending.timeoutId) clearTimeout(pending.timeoutId)
  pendingRequests.delete(requestId)
}

function createRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `ctx_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function postMessage(message: MiniappContextRequestMessage): void {
  if (typeof window === 'undefined') return
  if (window.parent === window) {
    console.warn('[bio-sdk] Miniapp context requires iframe environment')
    return
  }
  window.parent.postMessage(message, '*')
}

function resolveAppId(options?: MiniappContextOptions): string | undefined {
  if (options?.appId) {
    lastRequestAppId = options.appId
    return options.appId
  }
  return lastRequestAppId
}

function readSafeAreaInsets(): MiniappSafeAreaInsets {
  if (typeof document === 'undefined' || !document.body) {
    return { top: 0, right: 0, bottom: 0, left: 0 }
  }

  const probe = document.createElement('div')
  probe.style.cssText =
    'position:fixed;inset:0;padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px);visibility:hidden;pointer-events:none;'
  document.body.appendChild(probe)
  const styles = getComputedStyle(probe)
  const insets = {
    top: Number.parseFloat(styles.paddingTop) || 0,
    right: Number.parseFloat(styles.paddingRight) || 0,
    bottom: Number.parseFloat(styles.paddingBottom) || 0,
    left: Number.parseFloat(styles.paddingLeft) || 0,
  }
  document.body.removeChild(probe)
  return insets
}

function readColorMode(): 'light' | 'dark' | undefined {
  if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
    return 'dark'
  }
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return undefined
}

function readLocale(): string | undefined {
  if (typeof document !== 'undefined' && document.documentElement.lang) {
    return document.documentElement.lang
  }
  if (typeof navigator !== 'undefined') {
    return navigator.language
  }
  return undefined
}

function buildDefaultContext(): MiniappContext {
  return {
    version: 1,
    env: {
      safeAreaInsets: readSafeAreaInsets(),
      platform: 'web',
      locale: readLocale(),
    },
    host: {
      name: 'KeyApp',
      version: 'unknown',
    },
    updatedAt: new Date().toISOString(),
    theme: {
      colorMode: readColorMode(),
    },
  }
}

async function requestContextOnce(options?: MiniappContextOptions): Promise<MiniappContext> {
  ensureBridge()

  const requestId = createRequestId()
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const sdkVersion = SDK_VERSION
  const appId = resolveAppId(options)

  const promise = new Promise<MiniappContext>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      pendingRequests.delete(requestId)
      reject(new Error('Miniapp context request timed out'))
    }, timeoutMs)

    pendingRequests.set(requestId, { resolve, reject, timeoutId })
  })

  postMessage({
    type: 'miniapp:context-request',
    requestId,
    sdkVersion,
    payload: appId ? { appId } : undefined,
  })

  return promise
}

async function requestContextWithRetry(options?: MiniappContextOptions): Promise<MiniappContext> {
  const retries = options?.retries ?? DEFAULT_RETRIES
  let attempt = 0
  let lastError: Error | null = null

  while (attempt <= retries) {
    try {
      return await requestContextOnce(options)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Miniapp context request failed')
    }
    attempt += 1
  }

  if (lastError) throw lastError
  throw new Error('Miniapp context request failed')
}

export async function getMiniappContext(options?: MiniappContextOptions): Promise<MiniappContext> {
  if (cachedContext && !options?.forceRefresh) {
    return cachedContext
  }

  if (typeof window === 'undefined') {
    return buildDefaultContext()
  }

  if (window.parent === window) {
    if (!warnedUnsupported) {
      warnedUnsupported = true
      console.warn('[bio-sdk] Miniapp context requires iframe environment')
    }
    const fallback = buildDefaultContext()
    cachedContext = fallback
    return fallback
  }

  if (!options?.forceRefresh && inflightContextPromise) {
    return inflightContextPromise
  }

  const requestPromise = requestContextWithRetry(options)
    .then((context) => {
      cachedContext = context
      return context
    })
    .catch((error) => {
      if (!warnedUnsupported) {
        warnedUnsupported = true
        console.warn('[bio-sdk] Miniapp context is not supported by the host', error)
      }
      const fallback = buildDefaultContext()
      cachedContext = fallback
      return fallback
    })
    .finally(() => {
      if (inflightContextPromise === requestPromise) {
        inflightContextPromise = null
      }
    })

  inflightContextPromise = requestPromise
  return requestPromise
}

export function onMiniappContextUpdate(
  handler: (context: MiniappContext) => void,
  options?: MiniappContextSubscriptionOptions
): () => void {
  ensureBridge()
  if (options?.appId) {
    lastRequestAppId = options.appId
  }
  listeners.add(handler)

  if (options?.emitCached !== false && cachedContext) {
    handler(cachedContext)
  } else if (!cachedContext) {
    void getMiniappContext({ appId: options?.appId })
  }

  return () => {
    listeners.delete(handler)
  }
}

export function applyMiniappSafeAreaCssVars(
  context: MiniappContext,
  options?: { target?: HTMLElement | Document }
): void {
  if (typeof document === 'undefined') return
  const target = options?.target ?? document
  const element = target instanceof Document ? target.documentElement : target
  if (!element) return

  const { top, right, bottom, left } = context.env.safeAreaInsets
  element.style.setProperty('--keyapp-safe-area-top', `${top}px`)
  element.style.setProperty('--keyapp-safe-area-right', `${right}px`)
  element.style.setProperty('--keyapp-safe-area-bottom', `${bottom}px`)
  element.style.setProperty('--keyapp-safe-area-left', `${left}px`)
}
