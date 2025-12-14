import { describe, expect, it, vi } from 'vitest'
import { installAuthorizeDeepLinkListener, parseLegacyAuthorizeHash } from '../deep-link'

describe('authorize/deep-link', () => {
  it('parses legacy address deep link with eventId and normalizes chainName', () => {
    const parsed = parseLegacyAuthorizeHash('#/authorize/address?eventId=evt-1&type=network&chainName=BFMeta')
    expect(parsed).toEqual({
      kind: 'address',
      eventId: 'evt-1',
      type: 'network',
      chainName: 'bfmeta',
    })
  })

  it('parses legacy signature deep link with signaturedata', () => {
    const parsed = parseLegacyAuthorizeHash('#/authorize/signature?eventId=evt-2&signaturedata=%7B%7D')
    expect(parsed).toEqual({
      kind: 'signature',
      eventId: 'evt-2',
      signaturedata: '{}',
    })
  })

  it('returns null for already-typed routes', () => {
    expect(parseLegacyAuthorizeHash('#/authorize/address/evt-3')).toBeNull()
    expect(parseLegacyAuthorizeHash('#/authorize/signature/evt-3')).toBeNull()
  })

  it('installs listener and rewrites legacy hash on mount', () => {
    window.location.hash = '#/authorize/address?eventId=evt-4&type=main&chainName=bfmeta'
    const router = { navigate: vi.fn() }

    const cleanup = installAuthorizeDeepLinkListener(router)

    expect(router.navigate).toHaveBeenCalledWith({
      to: '/authorize/address/evt-4',
      search: {
        type: 'main',
        chainName: 'bfmeta',
        signMessage: undefined,
        getMain: undefined,
      },
    })

    cleanup()
  })
})
