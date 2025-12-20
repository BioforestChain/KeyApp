/**
 * 服务元信息系统
 *
 * Schema-first 的服务定义与实现
 */

export { defineServiceMeta, ServiceMeta, ServiceMetaBuilder } from './builder'
export {
  loggingMiddleware,
  createLoggingMiddleware,
  getServiceLogs,
  clearServiceLogs,
  subscribeToLogs,
  type ServiceLogEntry,
} from './logging-middleware'
export {
  createDelayMiddleware,
  createConditionalDelayMiddleware,
  createErrorMiddleware,
  createRandomErrorMiddleware,
  createInputTransformMiddleware,
  createOutputTransformMiddleware,
  createCacheMiddleware,
  createRetryMiddleware,
  composeMiddlewares,
  when,
  forService,
  forMember,
} from './middlewares'
export {
  breakpointMiddleware,
  createBreakpointMiddleware,
  getBreakpoints,
  getBreakpoint,
  setBreakpoint,
  updateBreakpoint,
  removeBreakpoint,
  clearBreakpoints,
  getPausedRequests,
  resumePausedRequest,
  abortPausedRequest,
  subscribeBreakpoints,
  type BreakpointConfig,
  type PausedRequest,
} from './breakpoint'
export {
  settingsMiddleware,
  getSettings,
  subscribeSettings,
  getGlobalDelay,
  setGlobalDelay,
  getGlobalError,
  setGlobalError,
  isMockEnabled,
  setMockEnabled,
  resetSettings,
} from './settings'
export type {
  MemberType,
  AnyMemberDef,
  ApiMemberDef,
  GetMemberDef,
  SetMemberDef,
  GetSetMemberDef,
  StreamMemberDef,
  MethodMemberDef,
  ServiceMetaDef,
  Middleware,
  MiddlewareContext,
  ServiceType,
} from './types'
