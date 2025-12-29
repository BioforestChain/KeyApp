import { describe, it, expect, vi } from 'vitest'
import { EventEmitter } from './events'

describe('EventEmitter', () => {
  it('should add and trigger event handlers', () => {
    const emitter = new EventEmitter()
    const handler = vi.fn()

    emitter.on('test', handler)
    emitter.emit('test', 'arg1', 'arg2')

    expect(handler).toHaveBeenCalledWith('arg1', 'arg2')
  })

  it('should support multiple handlers for the same event', () => {
    const emitter = new EventEmitter()
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    emitter.on('test', handler1)
    emitter.on('test', handler2)
    emitter.emit('test', 'data')

    expect(handler1).toHaveBeenCalledWith('data')
    expect(handler2).toHaveBeenCalledWith('data')
  })

  it('should remove event handlers with off()', () => {
    const emitter = new EventEmitter()
    const handler = vi.fn()

    emitter.on('test', handler)
    emitter.off('test', handler)
    emitter.emit('test', 'data')

    expect(handler).not.toHaveBeenCalled()
  })

  it('should not throw if removing non-existent handler', () => {
    const emitter = new EventEmitter()
    const handler = vi.fn()

    expect(() => emitter.off('test', handler)).not.toThrow()
  })

  it('should handle errors in handlers gracefully', () => {
    const emitter = new EventEmitter()
    const errorHandler = vi.fn(() => {
      throw new Error('Handler error')
    })
    const normalHandler = vi.fn()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    emitter.on('test', errorHandler)
    emitter.on('test', normalHandler)
    emitter.emit('test', 'data')

    expect(errorHandler).toHaveBeenCalled()
    expect(normalHandler).toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('should remove all listeners for a specific event', () => {
    const emitter = new EventEmitter()
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    emitter.on('test1', handler1)
    emitter.on('test2', handler2)
    emitter.removeAllListeners('test1')
    emitter.emit('test1', 'data')
    emitter.emit('test2', 'data')

    expect(handler1).not.toHaveBeenCalled()
    expect(handler2).toHaveBeenCalled()
  })

  it('should remove all listeners when no event specified', () => {
    const emitter = new EventEmitter()
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    emitter.on('test1', handler1)
    emitter.on('test2', handler2)
    emitter.removeAllListeners()
    emitter.emit('test1', 'data')
    emitter.emit('test2', 'data')

    expect(handler1).not.toHaveBeenCalled()
    expect(handler2).not.toHaveBeenCalled()
  })
})
