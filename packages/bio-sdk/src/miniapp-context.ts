import { z } from 'zod'

export const MiniappSafeAreaInsetsSchema = z.object({
  top: z.number().min(0),
  right: z.number().min(0),
  bottom: z.number().min(0),
  left: z.number().min(0),
})

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
}

export type MiniappContextSubscriptionOptions = {
  emitCached?: boolean
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

function buildDefaultContext(): MiniappContext {
  return {
    version: 1,
    env: {
      safeAreaInsets: { top: 0, right: 0, bottom: 0, left: 0 },
      platform: 'web',
      locale: typeof navigator !== 'undefined' ? navigator.language : undefined,
    },
    host: {
      name: 'KeyApp',
      version: 'unknown',
    },
    updatedAt: new Date().toISOString(),
  }
}

async function requestContextOnce(options?: MiniappContextOptions): Promise<MiniappContext> {
  ensureBridge()

  const requestId = createRequestId()
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const sdkVersion = SDK_VERSION

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
  listeners.add(handler)

  if (options?.emitCached !== false && cachedContext) {
    handler(cachedContext)
  } else if (!cachedContext) {
    void getMiniappContext()
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
