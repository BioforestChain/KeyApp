/**
 * 服务元信息 Builder
 */

import { z } from 'zod'
import type {
  ServiceMetaDef,
  AnyMemberDef,
  ApiMemberDef,
  GetMemberDef,
  SetMemberDef,
  GetSetMemberDef,
  StreamMemberDef,
  MethodMemberDef,
  Middleware,
  MiddlewareContext,
  ServiceType,
} from './types'

/** 全局中间件列表 */
const globalMiddlewares: Middleware[] = []

/** 服务元信息类 */
export class ServiceMeta<T extends ServiceMetaDef> {
  private middlewares: Middleware[] = []

  constructor(public readonly def: T) {}

  /** 注册服务级中间件 */
  use(middleware: Middleware): this {
    this.middlewares.push(middleware)
    return this
  }

  /** 注册全局中间件 */
  static useGlobal(middleware: Middleware): void {
    globalMiddlewares.push(middleware)
  }

  /** 清除全局中间件 (测试用) */
  static clearGlobal(): void {
    globalMiddlewares.length = 0
  }

  /** 实现服务 */
  impl(implementation: ServiceType<T>): ServiceType<T> {
    const wrapped: Record<string, unknown> = {}
    // 注意：不在这里捕获中间件，而是在每个方法中动态获取
    const serviceMiddlewares = this.middlewares

    for (const [name, memberDef] of Object.entries(this.def.members)) {
      const implValue = (implementation as Record<string, unknown>)[name]

      if (memberDef.type === 'api') {
        wrapped[name] = this.wrapApi(name, memberDef, implValue as Function, serviceMiddlewares)
      } else if (memberDef.type === 'get') {
        wrapped[name] = this.wrapGet(name, memberDef, implValue as Function, serviceMiddlewares)
      } else if (memberDef.type === 'set') {
        wrapped[name] = this.wrapSet(name, memberDef, implValue as Function, serviceMiddlewares)
      } else if (memberDef.type === 'getset') {
        const getsetImpl = implValue as { get: Function; set: Function }
        wrapped[name] = {
          get: this.wrapGet(name, memberDef, getsetImpl.get, serviceMiddlewares),
          set: this.wrapSet(name, memberDef, getsetImpl.set, serviceMiddlewares),
        }
      } else if (memberDef.type === 'stream') {
        wrapped[name] = this.wrapStream(name, memberDef, implValue as Function, serviceMiddlewares)
      } else if (memberDef.type === 'method') {
        wrapped[name] = this.wrapMethod(name, memberDef, implValue as Function, serviceMiddlewares)
      }
    }

    return wrapped as ServiceType<T>
  }

  private wrapApi(
    name: string,
    memberDef: AnyMemberDef,
    fn: Function,
    serviceMiddlewares: Middleware[],
  ): Function {
    return async (input: unknown) => {
      const ctx: MiddlewareContext = {
        service: this.def.name,
        member: name,
        type: 'api',
        input,
        meta: memberDef,
      }
      // 运行时动态获取全局中间件
      const allMiddlewares = [...globalMiddlewares, ...serviceMiddlewares]
      return this.runMiddlewares(ctx, allMiddlewares, () => fn(input))
    }
  }

  private wrapGet(
    name: string,
    memberDef: AnyMemberDef,
    fn: Function,
    serviceMiddlewares: Middleware[],
  ): Function {
    return async () => {
      const ctx: MiddlewareContext = {
        service: this.def.name,
        member: name,
        type: 'get',
        input: undefined,
        meta: memberDef,
      }
      const allMiddlewares = [...globalMiddlewares, ...serviceMiddlewares]
      return this.runMiddlewares(ctx, allMiddlewares, () => fn())
    }
  }

  private wrapSet(
    name: string,
    memberDef: AnyMemberDef,
    fn: Function,
    serviceMiddlewares: Middleware[],
  ): Function {
    return async (value: unknown) => {
      const ctx: MiddlewareContext = {
        service: this.def.name,
        member: name,
        type: 'set',
        input: value,
        meta: memberDef,
      }
      const allMiddlewares = [...globalMiddlewares, ...serviceMiddlewares]
      return this.runMiddlewares(ctx, allMiddlewares, () => fn(value))
    }
  }

  private wrapStream(
    name: string,
    memberDef: AnyMemberDef,
    fn: Function,
    serviceMiddlewares: Middleware[],
  ): Function {
    const self = this
    return async function* () {
      const ctx: MiddlewareContext = {
        service: self.def.name,
        member: name,
        type: 'stream',
        input: undefined,
        meta: memberDef,
      }
      const allMiddlewares = [...globalMiddlewares, ...serviceMiddlewares]
      await self.runMiddlewares(ctx, allMiddlewares, async () => {})
      yield* fn()
    }
  }

  private wrapMethod(
    name: string,
    memberDef: AnyMemberDef,
    fn: Function,
    serviceMiddlewares: Middleware[],
  ): Function {
    return async (...args: unknown[]) => {
      const ctx: MiddlewareContext = {
        service: this.def.name,
        member: name,
        type: 'method',
        input: args,
        meta: memberDef,
      }
      const allMiddlewares = [...globalMiddlewares, ...serviceMiddlewares]
      return this.runMiddlewares(ctx, allMiddlewares, () => fn(...args))
    }
  }

  private async runMiddlewares(
    ctx: MiddlewareContext,
    middlewares: Middleware[],
    final: () => unknown,
  ): Promise<unknown> {
    let index = 0

    const next = async (): Promise<unknown> => {
      if (index < middlewares.length) {
        const middleware = middlewares[index++]!
        return middleware(ctx, next)
      }
      return final()
    }

    return next()
  }

  /** 获取服务类型 (用于类型推导) */
  get Type(): ServiceType<T> {
    throw new Error('Type is for type inference only')
  }
}

/** Builder 选项类型 */
interface ApiOptions<TInput extends z.ZodTypeAny, TOutput extends z.ZodTypeAny> {
  description?: string
  input: TInput
  output: TOutput
}

interface GetOptions<T extends z.ZodTypeAny> {
  description?: string
  type: T
}

interface SetOptions<T extends z.ZodTypeAny> {
  description?: string
  type: T
}

interface GetSetOptions<T extends z.ZodTypeAny> {
  description?: string
  type: T
}

interface StreamOptions<TYield extends z.ZodTypeAny, TReturn extends z.ZodTypeAny = z.ZodVoid> {
  description?: string
  yield: TYield
  return?: TReturn
}

interface MethodOptions<TArgs extends z.ZodTuple, TOutput extends z.ZodTypeAny> {
  description?: string
  args: TArgs
  output: TOutput
  async?: boolean
}

/** 服务 Builder */
export class ServiceMetaBuilder<TMembers extends Record<string, AnyMemberDef> = {}> {
  private _description?: string
  private _members: Record<string, AnyMemberDef> = {}

  constructor(private readonly name: string) {}

  /** 设置服务描述 */
  description(desc: string): this {
    this._description = desc
    return this
  }

  /** 添加 API 成员 (重载1: options 对象) */
  api<N extends string, TInput extends z.ZodTypeAny, TOutput extends z.ZodTypeAny>(
    name: N,
    options: ApiOptions<TInput, TOutput>,
  ): ServiceMetaBuilder<TMembers & Record<N, ApiMemberDef<TInput, TOutput>>>
  /** 添加 API 成员 (重载2: 直接传参) */
  api<N extends string, TInput extends z.ZodTypeAny, TOutput extends z.ZodTypeAny>(
    name: N,
    input: TInput,
    output: TOutput,
  ): ServiceMetaBuilder<TMembers & Record<N, ApiMemberDef<TInput, TOutput>>>
  api<N extends string, TInput extends z.ZodTypeAny, TOutput extends z.ZodTypeAny>(
    name: N,
    optionsOrInput: ApiOptions<TInput, TOutput> | TInput,
    maybeOutput?: TOutput,
  ): ServiceMetaBuilder<TMembers & Record<N, ApiMemberDef<TInput, TOutput>>> {
    const isOptions = optionsOrInput && typeof optionsOrInput === 'object' && 'input' in optionsOrInput
    const input = isOptions ? (optionsOrInput as ApiOptions<TInput, TOutput>).input : (optionsOrInput as TInput)
    const output = isOptions ? (optionsOrInput as ApiOptions<TInput, TOutput>).output : maybeOutput!
    const description = isOptions ? (optionsOrInput as ApiOptions<TInput, TOutput>).description : undefined

    this._members[name] = {
      type: 'api' as const,
      name,
      description,
      input,
      output,
    } satisfies AnyMemberDef
    return this as unknown as ServiceMetaBuilder<TMembers & Record<N, ApiMemberDef<TInput, TOutput>>>
  }

  /** 添加 Get 成员 */
  get<N extends string, T extends z.ZodTypeAny>(
    name: N,
    options: GetOptions<T>,
  ): ServiceMetaBuilder<TMembers & Record<N, GetMemberDef<T>>> {
    this._members[name] = {
      type: 'get' as const,
      name,
      description: options.description,
      schema: options.type,
    } satisfies AnyMemberDef
    return this as unknown as ServiceMetaBuilder<TMembers & Record<N, GetMemberDef<T>>>
  }

  /** 添加 Set 成员 */
  set<N extends string, T extends z.ZodTypeAny>(
    name: N,
    options: SetOptions<T>,
  ): ServiceMetaBuilder<TMembers & Record<N, SetMemberDef<T>>> {
    this._members[name] = {
      type: 'set' as const,
      name,
      description: options.description,
      schema: options.type,
    } satisfies AnyMemberDef
    return this as unknown as ServiceMetaBuilder<TMembers & Record<N, SetMemberDef<T>>>
  }

  /** 添加 GetSet 成员 */
  getset<N extends string, T extends z.ZodTypeAny>(
    name: N,
    options: GetSetOptions<T>,
  ): ServiceMetaBuilder<TMembers & Record<N, GetSetMemberDef<T>>> {
    this._members[name] = {
      type: 'getset' as const,
      name,
      description: options.description,
      schema: options.type,
    } satisfies AnyMemberDef
    return this as unknown as ServiceMetaBuilder<TMembers & Record<N, GetSetMemberDef<T>>>
  }

  /** 添加 Stream 成员 */
  stream<N extends string, TYield extends z.ZodTypeAny, TReturn extends z.ZodTypeAny = z.ZodVoid>(
    name: N,
    options: StreamOptions<TYield, TReturn>,
  ): ServiceMetaBuilder<TMembers & Record<N, StreamMemberDef<TYield, TReturn>>> {
    this._members[name] = {
      type: 'stream' as const,
      name,
      description: options.description,
      yield: options.yield,
      return: options.return,
    } satisfies AnyMemberDef
    return this as unknown as ServiceMetaBuilder<TMembers & Record<N, StreamMemberDef<TYield, TReturn>>>
  }

  /** 添加 Method 成员 (重载1: options 对象) */
  method<N extends string, TArgs extends z.ZodTuple, TOutput extends z.ZodTypeAny>(
    name: N,
    options: MethodOptions<TArgs, TOutput>,
  ): ServiceMetaBuilder<TMembers & Record<N, MethodMemberDef<TArgs, TOutput>>>
  /** 添加 Method 成员 (重载2: 直接传参 - 单参数转 tuple) */
  method<N extends string, TInput extends z.ZodTypeAny, TOutput extends z.ZodTypeAny>(
    name: N,
    input: TInput,
    output: TOutput,
  ): ServiceMetaBuilder<TMembers & Record<N, MethodMemberDef<z.ZodTuple<[TInput]>, TOutput>>>
  method<N extends string, TArgs extends z.ZodTuple, TOutput extends z.ZodTypeAny>(
    name: N,
    optionsOrInput: MethodOptions<TArgs, TOutput> | z.ZodTypeAny,
    maybeOutput?: TOutput,
  ): ServiceMetaBuilder<TMembers & Record<N, MethodMemberDef<TArgs, TOutput>>> {
    const isOptions = optionsOrInput && typeof optionsOrInput === 'object' && 'args' in optionsOrInput
    
    if (isOptions) {
      const options = optionsOrInput as MethodOptions<TArgs, TOutput>
      this._members[name] = {
        type: 'method' as const,
        name,
        description: options.description,
        args: options.args,
        output: options.output,
        async: options.async ?? true,
      } satisfies AnyMemberDef
    } else {
      // 简写形式：将单个输入转换为 tuple
      const input = optionsOrInput as z.ZodTypeAny
      this._members[name] = {
        type: 'method' as const,
        name,
        description: undefined,
        args: z.tuple([input]) as unknown as TArgs,
        output: maybeOutput!,
        async: false, // 简写形式默认同步
      } satisfies AnyMemberDef
    }
    return this as unknown as ServiceMetaBuilder<TMembers & Record<N, MethodMemberDef<TArgs, TOutput>>>
  }

  /** 构建服务元信息 */
  build(): ServiceMeta<{ name: string; description?: string | undefined; members: TMembers }> {
    return new ServiceMeta({
      name: this.name,
      description: this._description,
      members: this._members as TMembers,
    } satisfies ServiceMetaDef)
  }
}

/** 定义服务元信息 */
export function defineServiceMeta<TMembers extends Record<string, AnyMemberDef>>(
  name: string,
  configure: (builder: ServiceMetaBuilder) => ServiceMetaBuilder<TMembers>,
): ServiceMeta<{ name: string; description?: string | undefined; members: TMembers }> {
  const builder = new ServiceMetaBuilder(name)
  return configure(builder).build()
}
