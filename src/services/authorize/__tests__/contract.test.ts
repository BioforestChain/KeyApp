import { describe, it } from 'vitest'
import { WALLET_PLAOC_PATH } from '../paths'

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
  describe('Address authorize', () => {
    it.todo('request: URL pathname is /wallet/authorize/address (see FIXTURES.address.request.url)')
    it.todo('request: method confirmed (likely POST) + body handling confirmed (empty vs json)')
    it.todo('request: query params include type(main|network|all); chainName required when type=network')
    it.todo('request: signMessage/getMain delivery channel confirmed (query vs body)')

    it.todo('response: wire envelope shape confirmed (JSON { data: ... } + content-type/status; see FIXTURES.address.response.*)')
    it.todo('response: payload shape confirmed (mpay expects AddressInfo[] | null, not {addresses})')
    it.todo('response: reject/timeout/cancel is null payload (no {error} wrapper)')
    it.todo('response: AddressInfo item fields confirmed (name/address/chainName/publicKey/magic/signMessage?/main?)')

    it.todo('lifecycle: removeEventId required/idempotent; timeout/cancel/disconnect semantics confirmed')
    it.todo('lifecycle: after successful respondWith, removeEventId MUST NOT overwrite success (no-op after consume)')
  })

  describe('Signature authorize', () => {
    it.todo('request: URL pathname is /wallet/authorize/signature (see FIXTURES.signature.request.*.url)')
    it.todo('request: method confirmed (likely POST)')
    it.todo('request: signaturedata delivery confirmed (POST body first + query fallback) and parseable as JSON array')
    it.todo('request: single vs batch semantics confirmed (array length 1 vs N; replay/dup rules)')

    it.todo('response: wire envelope shape confirmed (JSON { data: ... } + content-type/status; see FIXTURES.signature.response.*)')
    it.todo('response: payload shape confirmed (mpay expects ResultArray | null, not {signature})')
    it.todo('response: reject/timeout/cancel is null payload (no {error} wrapper)')
    it.todo('response: per-item error compatibility confirmed (null or { error: true, message })')

    it.todo('compat: assetTypeBalance fast-path confirmed in/out of scope for KeyApp Phase B')
    it.todo('lifecycle: after successful respondWith, removeEventId MUST NOT overwrite success (no-op after consume)')
  })
})
