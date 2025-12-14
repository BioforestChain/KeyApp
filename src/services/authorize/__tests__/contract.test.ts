import { describe, it } from 'vitest'

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
    it.todo('request: URL pathname is /wallet/authorize/address')
    it.todo('request: query params include type(main|network|all); chainName required when type=network')
    it.todo('request: signMessage/getMain delivery channel confirmed (query vs body)')

    it.todo('response: wire envelope shape confirmed (e.g. JSON { data: ... } + content-type/status)')
    it.todo('response: payload shape confirmed (mpay expects AddressInfo[] | null, not {addresses})')
    it.todo('response: AddressInfo item fields confirmed (name/address/chainName/publicKey/magic/signMessage?/main?)')

    it.todo('lifecycle: removeEventId required/idempotent; timeout/cancel/disconnect semantics confirmed')
  })

  describe('Signature authorize', () => {
    it.todo('request: URL pathname is /wallet/authorize/signature')
    it.todo('request: signaturedata delivery confirmed (query vs body) and parseable as JSON array')
    it.todo('request: single vs batch semantics confirmed (array length 1 vs N; replay/dup rules)')

    it.todo('response: wire envelope shape confirmed (e.g. JSON { data: ... } + content-type/status)')
    it.todo('response: payload shape confirmed (mpay expects ResultArray | null, not {signature})')
    it.todo('response: per-item error compatibility confirmed (null or { error: true, message })')

    it.todo('compat: assetTypeBalance fast-path confirmed in/out of scope for KeyApp Phase B')
  })
})
