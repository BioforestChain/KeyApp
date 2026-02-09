import { describe, it, expect, beforeEach } from 'vitest'
import { __clearMiniappSheetQueueForTests, enqueueMiniappSheet } from '../sheet-queue'

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('miniapp sheet queue', () => {
  beforeEach(() => {
    __clearMiniappSheetQueueForTests()
  })

  it('runs tasks in FIFO order for same app', async () => {
    const order: string[] = []
    const first = createDeferred<void>()

    const firstTask = enqueueMiniappSheet('com.bioforest.org-app', async () => {
      order.push('first-start')
      await first.promise
      order.push('first-end')
      return 'first'
    })

    const secondTask = enqueueMiniappSheet('com.bioforest.org-app', async () => {
      order.push('second-start')
      return 'second'
    })

    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    expect(order).toEqual(['first-start'])

    first.resolve()

    await expect(firstTask).resolves.toBe('first')
    await expect(secondTask).resolves.toBe('second')
    expect(order).toEqual(['first-start', 'first-end', 'second-start'])
  })

  it('normalizes queue key and serializes case-different app ids', async () => {
    const order: string[] = []
    const first = createDeferred<void>()

    const firstTask = enqueueMiniappSheet('Com.BioForest.Org-App', async () => {
      order.push('first-start')
      await first.promise
      return 'first'
    })

    const secondTask = enqueueMiniappSheet('com.bioforest.org-app', async () => {
      order.push('second-start')
      return 'second'
    })

    await Promise.resolve()
    await Promise.resolve()
    expect(order).toEqual(['first-start'])

    first.resolve()

    await expect(firstTask).resolves.toBe('first')
    await expect(secondTask).resolves.toBe('second')
    expect(order).toEqual(['first-start', 'second-start'])
  })

  it('allows different apps to run independently', async () => {
    const order: string[] = []
    const first = createDeferred<void>()

    const appATask = enqueueMiniappSheet('app-a', async () => {
      order.push('app-a-start')
      await first.promise
      return 'a'
    })

    const appBTask = enqueueMiniappSheet('app-b', async () => {
      order.push('app-b-start')
      return 'b'
    })

    await Promise.resolve()
    await Promise.resolve()
    expect(order).toEqual(['app-a-start', 'app-b-start'])

    first.resolve()

    await expect(appATask).resolves.toBe('a')
    await expect(appBTask).resolves.toBe('b')
  })

  it('continues queue after rejection', async () => {
    const order: string[] = []

    const firstTask = enqueueMiniappSheet('same-app', async () => {
      order.push('first')
      throw new Error('boom')
    })

    const secondTask = enqueueMiniappSheet('same-app', async () => {
      order.push('second')
      return 'ok'
    })

    await expect(firstTask).rejects.toThrow('boom')
    await expect(secondTask).resolves.toBe('ok')
    expect(order).toEqual(['first', 'second'])
  })
})
