import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { WALLET_PLAOC_PATH } from '../paths'
import {
  assertNonNull,
  flushAsync,
  makeFetchEvent,
  parseHashParams,
  setupDwebAdapter,
} from './dweb-harness'

describe('authorize dweb adapter', () => {
  beforeEach(() => {
    vi.spyOn(Date, 'now').mockReturnValue(1700)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    window.location.hash = ''
  })

  it('registers dwebServiceWorker fetch listener', async () => {
    const { addEventListener, getFetchListener } = await setupDwebAdapter()
    expect(addEventListener).toHaveBeenCalledWith('fetch', expect.any(Function))
    assertNonNull(getFetchListener())
  })

  it('routes /wallet/authorize/address to authorize address flow', async () => {
    const { adapter, getFetchListener } = await setupDwebAdapter()
    const listener = getFetchListener()
    assertNonNull(listener)

    const { event } = makeFetchEvent({
      url: `file://caller.dweb${WALLET_PLAOC_PATH.authorizeAddress}?chainName=ethereum&type=main&signMessage=hi&getMain=1`,
      manifest: {
        mmid: 'caller.dweb',
        name: 'Caller DApp',
        icons: [{ src: '/caller.png' }],
        homepage_url: 'https://caller.invalid',
      },
    })

    listener(event)

    expect(window.location.hash.startsWith('#/authorize/address?')).toBe(true)
    const params = parseHashParams(window.location.hash)
    expect(params.get('chainName')).toBe('ethereum')
    expect(params.get('type')).toBe('main')
    expect(params.get('signMessage')).toBe('hi')
    expect(params.get('getMain')).toBe('1')

    const eventId = params.get('eventId')
    expect(eventId).toBe('evt-1700-1')

    const info = await adapter.getCallerAppInfo(eventId ?? '')
    expect(info).toEqual({
      appId: 'caller.dweb',
      appName: 'Caller DApp',
      appIcon: '/caller.png',
      origin: 'https://caller.invalid',
    })
  })

  it('routes /wallet/authorize/signature to signature flow (signaturedata from query)', async () => {
    const { getFetchListener } = await setupDwebAdapter()
    const listener = getFetchListener()
    assertNonNull(listener)

    const signaturedata = JSON.stringify([
      {
        type: 1,
        chainName: 'ethereum',
        senderAddress: '0x111',
        receiveAddress: '0x222',
        balance: '0.5',
        fee: '0.002',
      },
    ])

    const { event } = makeFetchEvent({
      url: `file://caller.dweb${WALLET_PLAOC_PATH.authorizeSignature}?signaturedata=${encodeURIComponent(signaturedata)}`,
    })

    listener(event)

    expect(window.location.hash.startsWith('#/authorize/signature?')).toBe(true)
    const params = parseHashParams(window.location.hash)
    expect(params.get('eventId')).toBe('evt-1700-1')
    expect(params.get('signaturedata')).toBe(signaturedata)
  })

  it('routes /wallet/authorize/signature to signature flow (signaturedata from body)', async () => {
    const { getFetchListener } = await setupDwebAdapter()
    const listener = getFetchListener()
    assertNonNull(listener)

    const signaturedata = JSON.stringify([
      {
        type: 1,
        chainName: 'ethereum',
        senderAddress: '0x111',
        receiveAddress: '0x222',
        balance: '0.5',
        fee: '0.002',
      },
    ])

    const { event } = makeFetchEvent({
      url: `file://caller.dweb${WALLET_PLAOC_PATH.authorizeSignature}`,
      body: signaturedata,
    })

    listener(event)
    await flushAsync()

    expect(window.location.hash.startsWith('#/authorize/signature?')).toBe(true)
    const params = parseHashParams(window.location.hash)
    expect(params.get('eventId')).toBe('evt-1700-1')
    expect(params.get('signaturedata')).toBe(signaturedata)
  })

  it('wraps respondWith payload as JSON { data }', async () => {
    const { adapter, getFetchListener } = await setupDwebAdapter()
    const listener = getFetchListener()
    assertNonNull(listener)

    const { event, getLastResponse } = makeFetchEvent({
      url: `file://caller.dweb${WALLET_PLAOC_PATH.authorizeAddress}?type=main`,
    })

    listener(event)

    const params = parseHashParams(window.location.hash)
    const eventId = params.get('eventId')
    assertNonNull(eventId)

    await adapter.respondWith(eventId, WALLET_PLAOC_PATH.authorizeAddress, ['ok'])

    const res = getLastResponse()
    assertNonNull(res)

    expect(JSON.parse(res.bodyText)).toEqual({ data: ['ok'] })
    const headers = new Headers(res.init?.headers)
    expect(headers.get('Content-Type')).toBe('application/json')
  })

  it('responds cancel/reject as JSON { data: null } via removeEventId', async () => {
    const { adapter, getFetchListener } = await setupDwebAdapter()
    const listener = getFetchListener()
    assertNonNull(listener)

    const { event, getLastResponse } = makeFetchEvent({
      url: `file://caller.dweb${WALLET_PLAOC_PATH.authorizeAddress}?type=main`,
    })

    listener(event)

    const params = parseHashParams(window.location.hash)
    const eventId = params.get('eventId')
    assertNonNull(eventId)

    await adapter.removeEventId(eventId)

    const res = getLastResponse()
    assertNonNull(res)
    expect(JSON.parse(res.bodyText)).toEqual({ data: null })
  })

  it('does not overwrite successful respondWith on subsequent removeEventId', async () => {
    const { adapter, getFetchListener } = await setupDwebAdapter()
    const listener = getFetchListener()
    assertNonNull(listener)

    const { event, getAllResponses } = makeFetchEvent({
      url: `file://caller.dweb${WALLET_PLAOC_PATH.authorizeAddress}?type=main`,
    })

    listener(event)

    const params = parseHashParams(window.location.hash)
    const eventId = params.get('eventId')
    assertNonNull(eventId)

    await adapter.respondWith(eventId, WALLET_PLAOC_PATH.authorizeAddress, ['ok'])
    await adapter.removeEventId(eventId)

    const bodies = getAllResponses().map((r) => r.bodyText)
    expect(bodies.length).toBe(1)
    expect(JSON.parse(bodies[0] ?? '')).toEqual({ data: ['ok'] })
  })

  it('fast-path: assetTypeBalance skips UI and responds immediately', async () => {
    const { getFetchListener } = await setupDwebAdapter()
    const listener = getFetchListener()
    assertNonNull(listener)

    const signaturedata = JSON.stringify([
      {
        type: 5,
        chainName: 'ethereum',
        senderAddress: '0xabc',
        assetTypes: [{ assetType: 'ETH' }],
      },
    ])

    const { event, getLastResponse } = makeFetchEvent({
      url: `file://caller.dweb${WALLET_PLAOC_PATH.authorizeSignature}?signaturedata=${encodeURIComponent(signaturedata)}`,
    })

    listener(event)
    await flushAsync()

    expect(window.location.hash).toBe('')
    const res = getLastResponse()
    assertNonNull(res)

    const parsed = JSON.parse(res.bodyText) as { data: unknown }
    expect(Array.isArray(parsed.data)).toBe(true)
    const arr = parsed.data as unknown[]
    expect(arr.length).toBe(1)
    const first = arr[0]
    expect(first).toEqual({
      ETH: {
        assetType: 'ETH',
        decimals: expect.any(Number),
        balance: expect.any(String),
      },
    })
  })
})
