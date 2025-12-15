import { dwebServiceWorker, type ServiceWorkerFetchEvent } from '@plaoc/plugins'
import { WALLET_PLAOC_PATH } from './paths'
import type { CallerAppInfo, IPlaocAdapter } from './types'
import { walletStore } from '@/stores'

type WireEnvelope<T> = Readonly<{ data: T }>

const JSON_HEADERS: Readonly<Record<string, string>> = {
  'Content-Type': 'application/json',
}

const pendingEvents = new Map<string, ServiceWorkerFetchEvent>()
let fetchListenerInstalled = false
let eventSeq = 0

function nextEventId() {
  eventSeq += 1
  return `evt-${Date.now()}-${eventSeq}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeMaybeString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const v = value.trim()
  return v === '' ? undefined : v
}

function normalizeChainName(value: unknown): string | undefined {
  const v = normalizeMaybeString(value)
  return v?.toLowerCase()
}

function normalizeMaybeNumber(value: unknown): number | undefined {
  if (typeof value !== 'number') return undefined
  if (!Number.isFinite(value)) return undefined
  return value
}

async function respondJson(event: ServiceWorkerFetchEvent, data: unknown): Promise<void> {
  const body: WireEnvelope<unknown> = { data }
  await event.respondWith(JSON.stringify(body), { headers: JSON_HEADERS })
}

function parseAssetTypeBalancePayload(signaturedata: string): {
  chainName: string
  senderAddress: string
  assetTypes: Array<{ assetType: string; contractAddress?: string }>
} | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(signaturedata)
  } catch {
    return null
  }

  if (!Array.isArray(parsed) || parsed.length !== 1) return null
  const first = parsed[0]
  if (!isRecord(first)) return null

  const rawType = first.type
  const typeStr = normalizeMaybeString(rawType)?.toLowerCase()
  const typeNum = normalizeMaybeNumber(rawType)
  const isAssetTypeBalance = typeStr === 'assettypebalance' || typeNum === 5
  if (!isAssetTypeBalance) return null

  const chainName = normalizeChainName(first.chainName ?? first.chain)
  const senderAddress = normalizeMaybeString(first.senderAddress)
  if (!chainName || !senderAddress) return null

  const assetTypesRaw = first.assetTypes
  if (!Array.isArray(assetTypesRaw)) return null

  const assetTypes: Array<{ assetType: string; contractAddress?: string }> = []
  for (const item of assetTypesRaw) {
    if (!isRecord(item)) continue
    const assetType = normalizeMaybeString(item.assetType)
    if (!assetType) continue
    const contractAddress = normalizeMaybeString(item.contractAddress)
    assetTypes.push({ assetType, ...(contractAddress ? { contractAddress } : {}) })
  }

  if (assetTypes.length === 0) return null
  return { chainName, senderAddress, assetTypes }
}

function computeAssetTypeBalances(req: ReturnType<typeof parseAssetTypeBalancePayload>): Record<
  string,
  {
    assetType: string
    decimals: number
    balance: string
    contracts?: string
  }
> {
  if (!req) return {}

  const state = walletStore.state
  const chainName = req.chainName
  const senderAddress = req.senderAddress

  const matchingChainAddresses = state.wallets.flatMap((w) =>
    w.chainAddresses.filter(
      (ca) =>
        String(ca.chain).trim().toLowerCase() === chainName &&
        String(ca.address).trim().toLowerCase() === senderAddress.trim().toLowerCase()
    )
  )

  const allTokens = matchingChainAddresses.flatMap((ca) => ca.tokens)

  const result: Record<
    string,
    {
      assetType: string
      decimals: number
      balance: string
      contracts?: string
    }
  > = {}

  for (const reqAsset of req.assetTypes) {
    const wantedAssetType = reqAsset.assetType
    const wantedContract = reqAsset.contractAddress?.trim().toLowerCase()

    const token =
      wantedContract
        ? allTokens.find((t) => (t.contractAddress ?? '').trim().toLowerCase() === wantedContract)
        : allTokens.find((t) => t.symbol === wantedAssetType || t.id === wantedAssetType)

    result[wantedAssetType] = {
      assetType: wantedAssetType,
      decimals: token?.decimals ?? 0,
      balance: token?.balance ?? '0',
      ...(token?.contractAddress
        ? { contracts: token.contractAddress }
        : reqAsset.contractAddress
          ? { contracts: reqAsset.contractAddress }
          : {}),
    }
  }

  return result
}

async function handleAuthorizeFetch(event: ServiceWorkerFetchEvent): Promise<void> {
  const url = new URL(event.request.url)
  const eventId = nextEventId()

  if (url.pathname.endsWith(WALLET_PLAOC_PATH.authorizeAddress)) {
    pendingEvents.set(eventId, event)

    const params = new URLSearchParams()
    params.set('eventId', eventId)

    const chainName = url.searchParams.get('chainName')
    const type = url.searchParams.get('type')
    const signMessage = url.searchParams.get('signMessage')
    const getMain = url.searchParams.get('getMain')

    if (chainName !== null) params.set('chainName', chainName)
    if (type !== null) params.set('type', type)
    if (signMessage !== null) params.set('signMessage', signMessage)
    if (getMain !== null) params.set('getMain', getMain)

    window.location.hash = `#/authorize/address?${params.toString()}`
    return
  }

  if (url.pathname.endsWith(WALLET_PLAOC_PATH.authorizeSignature)) {
    let signaturedata = url.searchParams.get('signaturedata')
    if (!signaturedata || signaturedata.trim() === '') {
      signaturedata = await event.request.text()
    }

    const fastPayload = signaturedata ? parseAssetTypeBalancePayload(signaturedata) : null
    if (fastPayload) {
      const balances = computeAssetTypeBalances(fastPayload)
      await respondJson(event, [balances])
      return
    }

    pendingEvents.set(eventId, event)

    const params = new URLSearchParams()
    params.set('eventId', eventId)
    if (signaturedata !== undefined) params.set('signaturedata', signaturedata)

    window.location.hash = `#/authorize/signature?${params.toString()}`
    return
  }

  // Unknown path: close request to avoid dangling IPC calls.
  await respondJson(event, null)
}

/**
 * DWEB/Plaoc IPC adapter (real)
 *
 * Responsibilities (SRP):
 * - Capture DWEB fetch events and route to authorize UI
 * - Provide getCallerAppInfo/respondWith/removeEventId for pages to complete the IPC
 */
export class PlaocAdapter implements IPlaocAdapter {
  constructor() {
    if (!fetchListenerInstalled) {
      dwebServiceWorker.addEventListener('fetch', (event) => {
        void handleAuthorizeFetch(event)
      })
      fetchListenerInstalled = true
    }
  }

  async getCallerAppInfo(eventId: string): Promise<CallerAppInfo> {
    const event = pendingEvents.get(eventId)
    if (!event) throw new Error('Unknown eventId')

    const manifest = await event.getRemoteManifest()
    const appName = manifest.name ?? ''
    const appIcon = manifest.icons?.[0]?.src ?? ''
    const origin = manifest.homepage_url ?? ''

    return {
      appId: manifest.mmid,
      appName,
      appIcon,
      origin,
    }
  }

  async respondWith(eventId: string, path: string, data: unknown): Promise<void> {
    void path
    const event = pendingEvents.get(eventId)
    if (!event) return

    pendingEvents.delete(eventId)
    try {
      await respondJson(event, data)
    } catch {
      // ignore: request may already be closed by remote
    }
  }

  async removeEventId(eventId: string): Promise<void> {
    const event = pendingEvents.get(eventId)
    if (!event) return

    pendingEvents.delete(eventId)
    try {
      await respondJson(event, null)
    } catch {
      // ignore: request may already be closed by remote
    }
  }

  isAvailable(): boolean {
    return typeof globalThis === 'object' && globalThis !== null && 'plaoc' in globalThis
  }
}
