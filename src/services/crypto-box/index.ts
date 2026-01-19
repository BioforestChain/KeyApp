/**
 * Crypto 黑盒服务 - 主入口
 * 
 * 提供 Token 授权系统的对外接口
 */

export { tokenStore } from './token-store'
export { cryptoExecutor } from './executor'
export * from './types'

import { tokenStore } from './token-store'

/**
 * 初始化 Crypto 黑盒服务
 */
export async function initializeCryptoBox(): Promise<void> {
    await tokenStore.initialize()
}
