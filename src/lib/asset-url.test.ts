import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { resolveAssetUrl } from './asset-url'

describe('resolveAssetUrl', () => {
  const originalBaseURI = document.baseURI

  beforeEach(() => {
    // Mock document.baseURI
    Object.defineProperty(document, 'baseURI', {
      value: 'https://example.com/app/',
      configurable: true,
    })
  })

  afterEach(() => {
    Object.defineProperty(document, 'baseURI', {
      value: originalBaseURI,
      configurable: true,
    })
  })

  it('resolves absolute path starting with /', () => {
    expect(resolveAssetUrl('/icons/eth.svg')).toBe('https://example.com/app/icons/eth.svg')
  })

  it('resolves relative path starting with ./', () => {
    expect(resolveAssetUrl('./icons/eth.svg')).toBe('https://example.com/app/icons/eth.svg')
  })

  it('returns http URLs unchanged', () => {
    expect(resolveAssetUrl('http://cdn.example.com/icon.svg')).toBe('http://cdn.example.com/icon.svg')
  })

  it('returns https URLs unchanged', () => {
    expect(resolveAssetUrl('https://cdn.example.com/icon.svg')).toBe('https://cdn.example.com/icon.svg')
  })

  it('returns other strings unchanged', () => {
    expect(resolveAssetUrl('icon.svg')).toBe('icon.svg')
  })

  describe('with GitHub Pages style baseURI', () => {
    beforeEach(() => {
      Object.defineProperty(document, 'baseURI', {
        value: 'https://bioforestchain.github.io/KeyApp/webapp/',
        configurable: true,
      })
    })

    it('correctly resolves /icons path', () => {
      expect(resolveAssetUrl('/icons/ethereum/chain.svg')).toBe(
        'https://bioforestchain.github.io/KeyApp/webapp/icons/ethereum/chain.svg'
      )
    })

    it('correctly resolves /icons/tokens path', () => {
      expect(resolveAssetUrl('/icons/bfmeta/tokens')).toBe(
        'https://bioforestchain.github.io/KeyApp/webapp/icons/bfmeta/tokens'
      )
    })
  })

  describe('with localhost baseURI', () => {
    beforeEach(() => {
      Object.defineProperty(document, 'baseURI', {
        value: 'http://localhost:5173/',
        configurable: true,
      })
    })

    it('correctly resolves /icons path', () => {
      expect(resolveAssetUrl('/icons/ethereum/chain.svg')).toBe(
        'http://localhost:5173/icons/ethereum/chain.svg'
      )
    })
  })
})
