import type { AddressAuthType } from './types'

export type AuthorizeDeepLink =
  | {
      kind: 'address'
      eventId: string
      type: AddressAuthType
      chainName?: string
      signMessage?: string
      getMain?: string
    }
  | {
      kind: 'signature'
      eventId: string
      signaturedata?: string
    }

export interface RouterLike {
  navigate: (opts: { to: string; search?: Record<string, unknown> }) => void
}

function buildTypedAuthorizeHash(parsed: AuthorizeDeepLink): string {
  if (parsed.kind === 'address') {
    const searchParams = new URLSearchParams()
    searchParams.set('type', parsed.type)
    if (parsed.chainName !== undefined) searchParams.set('chainName', parsed.chainName)
    if (parsed.signMessage !== undefined) searchParams.set('signMessage', parsed.signMessage)
    if (parsed.getMain !== undefined) searchParams.set('getMain', parsed.getMain)

    const qs = searchParams.toString()
    return `#/authorize/address/${encodeURIComponent(parsed.eventId)}${qs ? `?${qs}` : ''}`
  }

  const searchParams = new URLSearchParams()
  if (parsed.signaturedata !== undefined) searchParams.set('signaturedata', parsed.signaturedata)
  const qs = searchParams.toString()
  return `#/authorize/signature/${encodeURIComponent(parsed.eventId)}${qs ? `?${qs}` : ''}`
}

function parseAddressAuthType(value: string | null): AddressAuthType | null {
  if (value === 'main' || value === 'network' || value === 'all') return value
  return null
}

function normalizeChainName(chainName: string | null): string | undefined {
  const normalized = (chainName ?? '').trim().toLowerCase()
  return normalized === '' ? undefined : normalized
}

function readOptionalString(params: URLSearchParams, key: string): string | undefined {
  if (!params.has(key)) return undefined
  return params.get(key) ?? ''
}

/**
 * Parse mpay-style authorize deep links (hash-history) and return a normalized link.
 *
 * Supported legacy patterns:
 * - `#/authorize/address?eventId=...&type=main|network|all&chainName=...&signMessage=...&getMain=...`
 * - `#/authorize/signature?eventId=...&signaturedata=...`
 *
 * Returns `null` when no rewrite is needed (e.g. already `/authorize/address/<id>`).
 */
export function parseLegacyAuthorizeHash(hash: string): AuthorizeDeepLink | null {
  const raw = hash.trim()
  if (!raw.startsWith('#')) return null

  const inner = raw.slice(1)
  if (!inner.startsWith('/')) return null

  const url = new URL(inner, 'https://local.invalid')

  // Only rewrite legacy URLs that do NOT include an eventId in the path segment.
  if (url.pathname === '/authorize/address') {
    const eventId = url.searchParams.get('eventId')?.trim() ?? ''
    if (eventId === '') return null

    const chainName = normalizeChainName(url.searchParams.get('chainName'))
    const signMessage = readOptionalString(url.searchParams, 'signMessage')
    const getMain = readOptionalString(url.searchParams, 'getMain')

    return {
      kind: 'address',
      eventId,
      type: parseAddressAuthType(url.searchParams.get('type')) ?? 'main',
      ...(chainName ? { chainName } : {}),
      ...(signMessage !== undefined ? { signMessage } : {}),
      ...(getMain !== undefined ? { getMain } : {}),
    }
  }

  if (url.pathname === '/authorize/signature') {
    const eventId = url.searchParams.get('eventId')?.trim() ?? ''
    if (eventId === '') return null
    const signaturedata = readOptionalString(url.searchParams, 'signaturedata')
    return {
      kind: 'signature',
      eventId,
      ...(signaturedata !== undefined ? { signaturedata } : {}),
    }
  }

  return null
}

/**
 * Install deep-link listeners to support legacy mpay-style authorize URLs.
 *
 * This is mock-first: it allows E2E or external runtimes to open
 * `#/authorize/address?eventId=...` and be redirected to the typed routes.
 */
export function installAuthorizeDeepLinkListener(router: RouterLike): () => void {
  function tryHandle(hash: string) {
    const parsed = parseLegacyAuthorizeHash(hash)
    if (!parsed) return

    if (parsed.kind === 'address') {
      router.navigate({
        to: `/authorize/address/${parsed.eventId}`,
        search: {
          type: parsed.type,
          chainName: parsed.chainName,
          signMessage: parsed.signMessage,
          getMain: parsed.getMain,
        },
      })
      return
    }

    router.navigate({
      to: `/authorize/signature/${parsed.eventId}`,
      search: {
        signaturedata: parsed.signaturedata,
      },
    })
  }

  const onHashChange = () => {
    tryHandle(window.location.hash)
  }

  // Initial pass (app cold start with deep link).
  onHashChange()

  window.addEventListener('hashchange', onHashChange)
  return () => {
    window.removeEventListener('hashchange', onHashChange)
  }
}

export function rewriteLegacyAuthorizeHashInPlace(hash: string = window.location.hash): boolean {
  const parsed = parseLegacyAuthorizeHash(hash)
  if (!parsed) return false

  const nextHash = buildTypedAuthorizeHash(parsed)
  if (nextHash === window.location.hash) return false

  const { pathname, search } = window.location
  window.history.replaceState(window.history.state, '', `${pathname}${search}${nextHash}`)
  return true
}

export function installLegacyAuthorizeHashRewriter(options: { reloadOnRewrite: boolean }): () => void {
  const onHashChange = () => {
    const rewritten = rewriteLegacyAuthorizeHashInPlace(window.location.hash)
    if (rewritten && options.reloadOnRewrite) {
      window.location.reload()
    }
  }

  window.addEventListener('hashchange', onHashChange)
  return () => {
    window.removeEventListener('hashchange', onHashChange)
  }
}
