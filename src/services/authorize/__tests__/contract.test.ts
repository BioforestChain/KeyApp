import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { WALLET_PLAOC_PATH } from '../paths'
import {
  assertNonNull,
  expectJsonEnvelope,
  flushAsync,
  getContentType,
  makeFetchEvent,
  parseHashParams,
  setupDwebAdapter,
} from './dweb-harness'

type WireEnvelope<T> = Readonly<{ data: T }>

/**
 * Legacy-derived request/response shapes (mpay / @bnqkl/wallet-base/services/plaoc/types.ts)
 *
 * Notes:
 * - Address authorize payload is `AddressInfo[] | null` (NOT `{ addresses: ... }`).
 * - Signature authorize payload is `ResultArray | null` (NOT `{ signature: ... }`).
 * - Signature request uses `signaturedata` which is JSON array (URL query, or request body per foreman context).
 * - Legacy signature `type` is commonly numeric enum (message=0, transfer=1, destory=7), but KeyApp also supports string.
 */
type LegacyAddressInfo = Readonly<{
  name: string
  chainName: string
  address: string
  publicKey: string
  magic: string
  signMessage?: string
  main?: string
}>

type LegacySignatureMessage = Readonly<{
  type: 0
  chainName: string
  senderAddress: string
  message: string
}>

type LegacySignatureTransfer = Readonly<{
  type: 1
  chainName: string
  senderAddress: string
  receiveAddress: string
  balance: string
  fee?: string
  assetType?: string
  contractInfo?: Readonly<{
    assetType: string
    decimals: number
    contractAddress: string
  }>
}>

type LegacySignatureDestory = Readonly<{
  type: 7
  chainName: string
  senderAddress: string
  destoryAddress?: string
  destoryAmount: string
  fee?: string
  assetType?: string
}>

type LegacySignatureParameter = LegacySignatureMessage | LegacySignatureTransfer | LegacySignatureDestory

type LegacySignatureResponseItem =
  | string
  | Readonly<{ txId: string; transaction: string }>
  | null
  | Readonly<{ error: true; message: string }>

/**
 * Fixture set for T022 contract capture.
 *
 * These are NOT assertions — they are realistic samples to be replaced/verified
 * against real DWEB runtime traffic once available.
 */
const FIXTURES = {
  address: {
    request: {
      // Foreman: dwebServiceWorker.addEventListener('fetch', ...) reads url.searchParams
      method: 'GET',
      url: new URL(
        [
          'https://local.invalid',
          WALLET_PLAOC_PATH.authorizeAddress,
          '?',
          new URLSearchParams({
            eventId: 'evt-address-1',
            type: 'main',
            chainName: 'BFMeta',
            // mpay resolver default: "" (param exists, possibly empty)
            signMessage: '',
            getMain: '',
          }).toString(),
        ].join('')
      ).toString(),
    },
    response: {
      ok: {
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: {
          data: [
            {
              name: 'Main Wallet',
              chainName: 'BFMeta',
              address: 'bfmeta:DsQd3fF3oQwJr7s7pE1d2sX8oB5QmZqQ1A',
              publicKey: '0'.repeat(64),
              magic: 'bfmeta',
              // mpay always includes signMessage field in push (may be empty when not requested)
              signMessage: '',
            },
          ],
        } satisfies WireEnvelope<LegacyAddressInfo[]>,
      },
      rejectedOrTimeout: {
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: { data: null } satisfies WireEnvelope<null>,
      },
      withSignMessage: {
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: {
          data: [
            {
              name: 'Main Wallet',
              chainName: 'BFMeta',
              address: 'bfmeta:DsQd3fF3oQwJr7s7pE1d2sX8oB5QmZqQ1A',
              publicKey: '1'.repeat(64),
              magic: 'bfmeta',
              signMessage: `0x${'a'.repeat(128)}`,
            },
          ],
        } satisfies WireEnvelope<LegacyAddressInfo[]>,
      },
      withMainPhrase: {
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: {
          data: [
            {
              name: 'Main Wallet',
              chainName: 'BFMeta',
              address: 'bfmeta:DsQd3fF3oQwJr7s7pE1d2sX8oB5QmZqQ1A',
              publicKey: '2'.repeat(64),
              magic: 'bfmeta',
              signMessage: '',
              main: 'any-string-can-be-a-secret-in-bioforestChain',
            },
          ],
        } satisfies WireEnvelope<LegacyAddressInfo[]>,
      },
    },
  },
  signature: {
    request: {
      // mpay resolver: signaturedata is JSON.parse(queryParam)
      viaQueryParam: {
        method: 'GET',
        url: new URL(
          [
            'https://local.invalid',
            WALLET_PLAOC_PATH.authorizeSignature,
            '?',
            new URLSearchParams({
              eventId: 'evt-signature-1',
              signaturedata: JSON.stringify([
                {
                  type: 1,
                  chainName: 'ethereum',
                  senderAddress: '0x1234567890abcdef1234567890abcdef12345678',
                  receiveAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
                  balance: '0.5',
                  fee: '0.002',
                } satisfies LegacySignatureTransfer,
              ] satisfies LegacySignatureParameter[]),
            }).toString(),
          ].join('')
        ).toString(),
      },
      // Foreman: request.query.signaturedata first, fallback to event.request.text() (body)
      viaBody: {
        method: 'POST',
        url: new URL('https://local.invalid' + WALLET_PLAOC_PATH.authorizeSignature).toString(),
        headers: { 'content-type': 'application/json' },
        bodyText: JSON.stringify([
          {
            type: 0,
            chainName: 'BFMeta',
            senderAddress: 'bfmeta:DsQd3fF3oQwJr7s7pE1d2sX8oB5QmZqQ1A',
            message: 'hello',
          } satisfies LegacySignatureMessage,
        ] satisfies LegacySignatureParameter[]),
      },
    },
    response: {
      ok: {
        status: 200,
        headers: { 'content-type': 'application/json' },
        // Legacy contract: an array (length 1..3), or null on reject/timeout.
        body: {
          data: [
            `0x${'b'.repeat(128)}`,
            { txId: `0x${'c'.repeat(64)}`, transaction: `0x${'d'.repeat(64)}` },
          ],
        } satisfies WireEnvelope<LegacySignatureResponseItem[]>,
      },
      perItemErrorCompatible: {
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: {
          data: [{ error: true, message: 'User rejected' }],
        } satisfies WireEnvelope<LegacySignatureResponseItem[]>,
      },
      rejectedOrTimeout: {
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: { data: null } satisfies WireEnvelope<null>,
      },
    },
  },
} as const

// Avoid unused warnings while keeping fixtures near TODOs.
void FIXTURES

/**
 * T022 — Real IPC contract fixtures (Phase B)
 *
 * This test file is intentionally fixture-driven and snapshot-free.
 *
 * It becomes actionable once DWEB/runtime provides concrete request/response samples.
 * Keep these as TODOs until we have real samples (fixture-first; no guessing).
 *
 * Minimum samples:
 * - Address authorize success (request + wire response)
 * - Signature authorize success (request + wire response)
 * - Timeout/cancel (request + wire response + lifecycle semantics)
 */
describe('T022 DWEB runtime contract fixtures', () => {
  beforeEach(() => {
    vi.spyOn(Date, 'now').mockReturnValue(1700)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    window.location.hash = ''
  })

  describe('Address authorize', () => {
    it('request: URL pathname matches /wallet/authorize/address', () => {
      const url = new URL(FIXTURES.address.request.url)
      expect(url.pathname).toBe(WALLET_PLAOC_PATH.authorizeAddress)
    })

    it('request: empty signMessage/getMain params are preserved into authorize hash', async () => {
      const { getFetchListener } = await setupDwebAdapter()
      const listener = getFetchListener()
      assertNonNull(listener)

      const { event } = makeFetchEvent({ url: FIXTURES.address.request.url, method: FIXTURES.address.request.method })
      listener(event)

      expect(window.location.hash.startsWith('#/authorize/address?')).toBe(true)
      const params = parseHashParams(window.location.hash)
      expect(params.get('eventId')).toBe('evt-1700-1')
      expect(params.get('chainName')).toBe('BFMeta')
      expect(params.get('type')).toBe('main')
      expect(params.get('signMessage')).toBe('')
      expect(params.get('getMain')).toBe('')
    })

    it('response: address authorize respondWith uses wire envelope { data } (AddressInfo[])', async () => {
      const { adapter, getFetchListener } = await setupDwebAdapter()
      const listener = getFetchListener()
      assertNonNull(listener)

      const { event, getLastResponse } = makeFetchEvent({
        url: FIXTURES.address.request.url,
        method: FIXTURES.address.request.method,
      })

      listener(event)

      const params = parseHashParams(window.location.hash)
      const eventId = params.get('eventId')
      assertNonNull(eventId)

      const data = FIXTURES.address.response.ok.body.data
      await adapter.respondWith(eventId, WALLET_PLAOC_PATH.authorizeAddress, data)

      const res = getLastResponse()
      assertNonNull(res)
      expectJsonEnvelope(res.bodyText, data)
      expect(getContentType(res.init)).toBe('application/json')
      expect(res.init?.status ?? 200).toBe(200)
    })
  })

  describe('Signature authorize', () => {
    it('request: URL pathname matches /wallet/authorize/signature', () => {
      const url1 = new URL(FIXTURES.signature.request.viaQueryParam.url)
      const url2 = new URL(FIXTURES.signature.request.viaBody.url)
      expect(url1.pathname).toBe(WALLET_PLAOC_PATH.authorizeSignature)
      expect(url2.pathname).toBe(WALLET_PLAOC_PATH.authorizeSignature)
    })

    it('request: signaturedata is parseable as JSON array (query)', () => {
      const url = new URL(FIXTURES.signature.request.viaQueryParam.url)
      const signaturedata = url.searchParams.get('signaturedata')
      assertNonNull(signaturedata)
      const parsed = JSON.parse(signaturedata) as unknown
      expect(Array.isArray(parsed)).toBe(true)
    })

    it('request: signaturedata falls back to POST body when query is absent', async () => {
      const { getFetchListener } = await setupDwebAdapter()
      const listener = getFetchListener()
      assertNonNull(listener)

      const { event } = makeFetchEvent({
        url: FIXTURES.signature.request.viaBody.url,
        body: FIXTURES.signature.request.viaBody.bodyText,
        headers: FIXTURES.signature.request.viaBody.headers,
        method: FIXTURES.signature.request.viaBody.method,
      })

      listener(event)
      await flushAsync()

      expect(window.location.hash.startsWith('#/authorize/signature?')).toBe(true)
      const params = parseHashParams(window.location.hash)
      expect(params.get('eventId')).toBe('evt-1700-1')
      expect(params.get('signaturedata')).toBe(FIXTURES.signature.request.viaBody.bodyText)
    })

    it('response: signature authorize respondWith uses wire envelope { data } (ResultArray)', async () => {
      const { adapter, getFetchListener } = await setupDwebAdapter()
      const listener = getFetchListener()
      assertNonNull(listener)

      const { event, getLastResponse } = makeFetchEvent({
        url: FIXTURES.signature.request.viaQueryParam.url,
        method: FIXTURES.signature.request.viaQueryParam.method,
      })

      listener(event)

      const params = parseHashParams(window.location.hash)
      const eventId = params.get('eventId')
      assertNonNull(eventId)

      const data = FIXTURES.signature.response.ok.body.data
      await adapter.respondWith(eventId, WALLET_PLAOC_PATH.authorizeSignature, data)

      const res = getLastResponse()
      assertNonNull(res)
      expectJsonEnvelope(res.bodyText, data)
      expect(getContentType(res.init)).toBe('application/json')
      expect(res.init?.status ?? 200).toBe(200)
    })

    it('response: cancel/reject uses wire envelope { data: null }', async () => {
      const { adapter, getFetchListener } = await setupDwebAdapter()
      const listener = getFetchListener()
      assertNonNull(listener)

      const { event, getLastResponse } = makeFetchEvent({
        url: FIXTURES.signature.request.viaQueryParam.url,
        method: FIXTURES.signature.request.viaQueryParam.method,
      })

      listener(event)

      const params = parseHashParams(window.location.hash)
      const eventId = params.get('eventId')
      assertNonNull(eventId)

      await adapter.removeEventId(eventId)

      const res = getLastResponse()
      assertNonNull(res)
      expectJsonEnvelope(res.bodyText, null)
      expect(getContentType(res.init)).toBe('application/json')
      expect(res.init?.status ?? 200).toBe(200)
    })
  })
})
