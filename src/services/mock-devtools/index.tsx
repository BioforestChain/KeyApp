/**
 * MockDevTools - 统一调试工具
 * 仅在 mock 模式下可用
 */

export { MockDevTools, type MockDevToolsProps } from './components/MockDevTools'
export {
  DevPanelShell,
  type DevPanelTab,
  type DevPanelPosition,
  type DevPanelShellProps,
} from './components/DevPanelShell'

// 状态管理 (供 MockDevTools UI 使用)
export {
  subscribe,
  getLogs,
  clearLogs,
  getInterceptRules,
  addInterceptRule,
  removeInterceptRule,
  updateInterceptRule,
  setInterceptEnabled,
  isInterceptEnabled,
  getPausedRequests,
  setGlobalDelay,
  getGlobalDelay,
  setGlobalError,
  getGlobalError,
  resetAllData,
} from './define-mock'

// 类型导出
export type {
  RequestLogEntry,
  InterceptRule,
  InterceptAction,
  PausedRequest,
} from './types'
