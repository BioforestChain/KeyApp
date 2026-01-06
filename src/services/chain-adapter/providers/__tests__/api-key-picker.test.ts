import { describe, it, expect, beforeEach } from 'vitest'
import { pickApiKey, clearApiKeyCache, getLockedApiKey } from '../api-key-picker'

describe('pickApiKey', () => {
  beforeEach(() => {
    clearApiKeyCache()
  })

  it('returns undefined for empty string', () => {
    expect(pickApiKey('', 'test')).toBeUndefined()
    expect(pickApiKey('  ', 'test')).toBeUndefined()
  })

  it('returns undefined for undefined input', () => {
    expect(pickApiKey(undefined, 'test')).toBeUndefined()
  })

  it('returns the single key when only one provided', () => {
    const result = pickApiKey('single-key', 'test')
    expect(result).toBe('single-key')
  })

  it('returns one of the keys when multiple provided', () => {
    const keys = 'key1,key2,key3'
    const result = pickApiKey(keys, 'test')
    expect(['key1', 'key2', 'key3']).toContain(result)
  })

  it('trims whitespace from keys', () => {
    const keys = ' key1 , key2 , key3 '
    const result = pickApiKey(keys, 'test')
    expect(['key1', 'key2', 'key3']).toContain(result)
  })

  it('filters out empty keys', () => {
    const keys = 'key1,,key2,  ,key3'
    const result = pickApiKey(keys, 'test')
    expect(['key1', 'key2', 'key3']).toContain(result)
  })

  it('locks the selected key for subsequent calls', () => {
    const keys = 'key1,key2,key3'
    const first = pickApiKey(keys, 'cache-test')
    const second = pickApiKey(keys, 'cache-test')
    const third = pickApiKey(keys, 'cache-test')
    
    expect(first).toBe(second)
    expect(second).toBe(third)
  })

  it('uses different keys for different cache keys', () => {
    const result1 = pickApiKey('only-one', 'service-a')
    const result2 = pickApiKey('another-one', 'service-b')
    
    expect(result1).toBe('only-one')
    expect(result2).toBe('another-one')
  })

  it('getLockedApiKey returns the cached key', () => {
    pickApiKey('my-key', 'get-test')
    expect(getLockedApiKey('get-test')).toBe('my-key')
  })

  it('getLockedApiKey returns undefined for uncached key', () => {
    expect(getLockedApiKey('nonexistent')).toBeUndefined()
  })

  it('clearApiKeyCache clears all cached keys', () => {
    pickApiKey('key1', 'cache1')
    pickApiKey('key2', 'cache2')
    
    clearApiKeyCache()
    
    expect(getLockedApiKey('cache1')).toBeUndefined()
    expect(getLockedApiKey('cache2')).toBeUndefined()
  })
})
