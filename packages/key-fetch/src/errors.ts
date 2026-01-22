/**
 * Key-Fetch 错误类型
 */

/** 服务受限错误 - 用于显示给用户的友好提示 */
export class ServiceLimitedError extends Error {
  constructor(message = '服务受限') {
    super(message)
    this.name = 'ServiceLimitedError'
  }
}
