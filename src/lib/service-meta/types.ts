/**
 * 服务元信息类型定义
 */

import type { z } from 'zod'

/** 成员类型 */
export type MemberType = 'api' | 'get' | 'set' | 'getset' | 'stream' | 'method'

/** API 成员定义 */
export interface ApiMemberDef<TInput extends z.ZodTypeAny, TOutput extends z.ZodTypeAny> {
  type: 'api'
  name: string
  description?: string | undefined
  input: TInput
  output: TOutput
}

/** Get 成员定义 */
export interface GetMemberDef<T extends z.ZodTypeAny> {
  type: 'get'
  name: string
  description?: string | undefined
  schema: T
}

/** Set 成员定义 */
export interface SetMemberDef<T extends z.ZodTypeAny> {
  type: 'set'
  name: string
  description?: string | undefined
  schema: T
}

/** GetSet 成员定义 */
export interface GetSetMemberDef<T extends z.ZodTypeAny> {
  type: 'getset'
  name: string
  description?: string | undefined
  schema: T
}

/** Stream 成员定义 */
export interface StreamMemberDef<TYield extends z.ZodTypeAny, TReturn extends z.ZodTypeAny> {
  type: 'stream'
  name: string
  description?: string | undefined
  yield: TYield
  return?: TReturn | undefined
}

/** Method 成员定义 */
export interface MethodMemberDef<TArgs extends z.ZodTuple, TOutput extends z.ZodTypeAny> {
  type: 'method'
  name: string
  description?: string | undefined
  args: TArgs
  output: TOutput
  async?: boolean | undefined
}

/** 任意成员定义 */
export type AnyMemberDef =
  | ApiMemberDef<z.ZodTypeAny, z.ZodTypeAny>
  | GetMemberDef<z.ZodTypeAny>
  | SetMemberDef<z.ZodTypeAny>
  | GetSetMemberDef<z.ZodTypeAny>
  | StreamMemberDef<z.ZodTypeAny, z.ZodTypeAny>
  | MethodMemberDef<z.ZodTuple, z.ZodTypeAny>

/** 服务元信息 */
export interface ServiceMetaDef {
  name: string
  description?: string | undefined
  members: Record<string, AnyMemberDef>
}

/** 中间件上下文 */
export interface MiddlewareContext {
  service: string
  member: string
  type: MemberType
  input: unknown
  meta: AnyMemberDef
}

/** 中间件函数 */
export type Middleware = (ctx: MiddlewareContext, next: () => Promise<unknown>) => Promise<unknown>

/** 从成员定义推导实现类型 */
export type MemberImpl<T extends AnyMemberDef> =
  T extends ApiMemberDef<infer TInput, infer TOutput>
    ? (input: z.infer<TInput>) => Promise<z.infer<TOutput>>
    : T extends GetMemberDef<infer TSchema>
      ? () => z.infer<TSchema>
      : T extends SetMemberDef<infer TSchema>
        ? (value: z.infer<TSchema>) => void
        : T extends GetSetMemberDef<infer TSchema>
          ? { get: () => z.infer<TSchema>; set: (value: z.infer<TSchema>) => void }
          : T extends StreamMemberDef<infer TYield, infer _TReturn>
            ? () => AsyncIterable<z.infer<TYield>>
            : T extends MethodMemberDef<infer TArgs, infer TOutput>
              ? (...args: z.infer<TArgs>) => Promise<z.infer<TOutput>>
              : never

/** 从服务元信息推导服务类型 */
export type ServiceType<T extends ServiceMetaDef> = {
  [K in keyof T['members']]: MemberImpl<T['members'][K]>
}
