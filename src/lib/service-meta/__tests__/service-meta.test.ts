/**
 * 服务元信息系统测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { z } from 'zod'
import { defineServiceMeta, ServiceMeta } from '../index'

describe('defineServiceMeta', () => {
  beforeEach(() => {
    ServiceMeta.clearGlobal()
  })

  it('creates service meta with api members', () => {
    const meta = defineServiceMeta('test', (s) =>
      s
        .description('Test service')
        .api('hello', {
          description: 'Say hello',
          input: z.object({ name: z.string() }),
          output: z.string(),
        })
    )

    expect(meta.def.name).toBe('test')
    expect(meta.def.description).toBe('Test service')
    expect(meta.def.members.hello.type).toBe('api')
  })

  it('implements service correctly', async () => {
    const meta = defineServiceMeta('test', (s) =>
      s
        .api('greet', {
          input: z.object({ name: z.string() }),
          output: z.string(),
        })
    )

    const service = meta.impl({
      async greet({ name }) {
        return `Hello, ${name}!`
      },
    })

    const result = await service.greet({ name: 'World' })
    expect(result).toBe('Hello, World!')
  })

  it('supports middleware', async () => {
    const logs: string[] = []

    const meta = defineServiceMeta('test', (s) =>
      s
        .api('echo', {
          input: z.object({ msg: z.string() }),
          output: z.string(),
        })
    )

    meta.use(async (ctx, next) => {
      logs.push(`before: ${ctx.member}`)
      const result = await next()
      logs.push(`after: ${ctx.member}`)
      return result
    })

    const service = meta.impl({
      async echo({ msg }) {
        logs.push(`impl: ${msg}`)
        return msg
      },
    })

    await service.echo({ msg: 'test' })

    expect(logs).toEqual(['before: echo', 'impl: test', 'after: echo'])
  })

  it('supports global middleware', async () => {
    const logs: string[] = []

    ServiceMeta.useGlobal(async (ctx, next) => {
      logs.push(`global: ${ctx.service}.${ctx.member}`)
      return next()
    })

    const meta = defineServiceMeta('svc', (s) =>
      s
        .api('test', {
          input: z.void(),
          output: z.void(),
        })
    )

    const service = meta.impl({
      async test() {},
    })

    await service.test()

    expect(logs).toEqual(['global: svc.test'])
  })

  it('middleware can modify result', async () => {
    const meta = defineServiceMeta('test', (s) =>
      s
        .api('getValue', {
          input: z.void(),
          output: z.number(),
        })
    )

    meta.use(async (_ctx, next) => {
      const result = (await next()) as number
      return result * 2
    })

    const service = meta.impl({
      async getValue() {
        return 21
      },
    })

    const result = await service.getValue()
    expect(result).toBe(42)
  })

  it('middleware receives correct context', async () => {
    let capturedCtx: unknown

    const meta = defineServiceMeta('myService', (s) =>
      s
        .api('myMethod', {
          description: 'My method',
          input: z.object({ id: z.number() }),
          output: z.boolean(),
        })
    )

    meta.use(async (ctx, next) => {
      capturedCtx = ctx
      return next()
    })

    const service = meta.impl({
      async myMethod() {
        return true
      },
    })

    await service.myMethod({ id: 123 })

    expect(capturedCtx).toMatchObject({
      service: 'myService',
      member: 'myMethod',
      type: 'api',
      input: { id: 123 },
    })
  })

  it('handles errors in middleware', async () => {
    const meta = defineServiceMeta('test', (s) =>
      s
        .api('fail', {
          input: z.void(),
          output: z.void(),
        })
    )

    meta.use(async () => {
      throw new Error('Middleware error')
    })

    const service = meta.impl({
      async fail() {},
    })

    await expect(service.fail()).rejects.toThrow('Middleware error')
  })

  it('handles errors in implementation', async () => {
    const errorLog: string[] = []

    const meta = defineServiceMeta('test', (s) =>
      s
        .api('fail', {
          input: z.void(),
          output: z.void(),
        })
    )

    meta.use(async (_ctx, next) => {
      try {
        return await next()
      } catch (error) {
        errorLog.push((error as Error).message)
        throw error
      }
    })

    const service = meta.impl({
      async fail() {
        throw new Error('Impl error')
      },
    })

    await expect(service.fail()).rejects.toThrow('Impl error')
    expect(errorLog).toEqual(['Impl error'])
  })

  it('supports multiple members', async () => {
    const meta = defineServiceMeta('crud', (s) =>
      s
        .api('create', {
          input: z.object({ name: z.string() }),
          output: z.object({ id: z.string() }),
        })
        .api('read', {
          input: z.object({ id: z.string() }),
          output: z.object({ id: z.string(), name: z.string() }),
        })
        .api('delete', {
          input: z.object({ id: z.string() }),
          output: z.void(),
        })
    )

    const store: Record<string, { id: string; name: string }> = {}

    const service = meta.impl({
      async create({ name }) {
        const id = Math.random().toString(36).slice(2)
        store[id] = { id, name }
        return { id }
      },
      async read({ id }) {
        return store[id]!
      },
      async delete({ id }) {
        delete store[id]
      },
    })

    const { id } = await service.create({ name: 'Test' })
    const item = await service.read({ id })
    expect(item.name).toBe('Test')

    await service.delete({ id })
    expect(store[id]).toBeUndefined()
  })
})

describe('clipboard service example', () => {
  it('works with new architecture', async () => {
    const clipboardMeta = defineServiceMeta('clipboard', (s) =>
      s
        .api('write', {
          input: z.object({ text: z.string() }),
          output: z.void(),
        })
        .api('read', {
          input: z.void(),
          output: z.string(),
        })
    )

    let storage = ''

    const clipboardService = clipboardMeta.impl({
      async write({ text }) {
        storage = text
      },
      async read() {
        return storage
      },
    })

    await clipboardService.write({ text: 'Hello' })
    const result = await clipboardService.read()
    expect(result).toBe('Hello')
  })
})
