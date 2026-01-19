/**
 * Crypto 黑盒 BioBridge Handler
 * 
 * 处理 bio_requestCryptoToken 和 bio_cryptoExecute 请求
 */

import type { MethodHandler } from '../types'
import { tokenStore, cryptoExecutor, CryptoBoxErrorCodes } from '../../crypto-box'
import type {
    RequestCryptoTokenParams,
    RequestCryptoTokenResponse,
    CryptoExecuteParams,
    CryptoAction,
    TokenDuration,
} from '../../crypto-box'

// 获取授权对话框的注入器
let getCryptoAuthorizeDialog: ((appId: string) => ((params: {
    actions: CryptoAction[]
    duration: TokenDuration
    address: string
    chainId?: string
    app: { name: string; icon?: string }
}) => Promise<{ approved: boolean; patternKey?: string; walletId?: string; selectedDuration?: string }>) | null) | null = null

/**
 * 注册 Crypto 授权对话框获取器
 */
export function setCryptoAuthorizeDialog(
    getter: ((appId: string) => ((params: {
        actions: CryptoAction[]
        duration: TokenDuration
        address: string
        chainId?: string
        app: { name: string; icon?: string }
    }) => Promise<{ approved: boolean; patternKey?: string; walletId?: string; selectedDuration?: string }>) | null) | null
): void {
    getCryptoAuthorizeDialog = getter
}

/**
 * bio_requestCryptoToken - 请求加密操作授权
 * 
 * 用户输入手势密码后生成 Token
 */
export const handleRequestCryptoToken: MethodHandler = async (params, context) => {
    const opts = params as RequestCryptoTokenParams | undefined

    if (!opts?.actions || !opts?.duration || !opts?.address) {
        throw Object.assign(
            new Error('Missing required parameters: actions, duration, address'),
            { code: CryptoBoxErrorCodes.INTERNAL_ERROR }
        )
    }

    // 验证 actions
    const validActions: CryptoAction[] = ['asymmetricEncrypt', 'sign']
    for (const action of opts.actions) {
        if (!validActions.includes(action)) {
            throw Object.assign(
                new Error(`Invalid action: ${action}`),
                { code: CryptoBoxErrorCodes.INTERNAL_ERROR }
            )
        }
    }

    // 获取授权对话框
    if (!getCryptoAuthorizeDialog) {
        throw Object.assign(
            new Error('Crypto authorize dialog not available'),
            { code: CryptoBoxErrorCodes.INTERNAL_ERROR }
        )
    }

    const showDialog = getCryptoAuthorizeDialog(context.appId)
    if (!showDialog) {
        throw Object.assign(
            new Error('Crypto authorize dialog not available'),
            { code: CryptoBoxErrorCodes.INTERNAL_ERROR }
        )
    }

    // 显示授权对话框，等待用户输入手势密码
    const result = await showDialog({
        actions: opts.actions,
        duration: opts.duration,
        address: opts.address,
        chainId: opts.chainId,
        app: { name: context.appName, icon: context.appIcon },
    })

    if (!result.approved || !result.patternKey || !result.walletId) {
        throw Object.assign(
            new Error('User rejected'),
            { code: CryptoBoxErrorCodes.USER_REJECTED }
        )
    }

    // 使用用户选择的时长（如果有），否则使用默认请求时长
    const finalDuration = (result.selectedDuration as TokenDuration) || opts.duration

    // 确保 TokenStore 已初始化
    await tokenStore.initialize()

    // 创建 Token（返回 token 和 sessionSecret）
    const { token, sessionSecret } = await tokenStore.createToken({
        miniappId: context.appId,
        walletId: result.walletId,
        address: opts.address,
        actions: opts.actions,
        duration: finalDuration,
        patternKey: result.patternKey,
    })

    const response: RequestCryptoTokenResponse = {
        tokenId: token.tokenId,
        sessionSecret,
        expiresAt: token.expiresAt,
        grantedActions: token.actions,
        address: token.address,  // 返回 Token 绑定的地址，miniapp 应缓存此地址
    }

    return response
}

/**
 * bio_cryptoExecute - 使用 Token 执行加密操作
 */
export const handleCryptoExecute: MethodHandler = async (params, context) => {
    const opts = params as CryptoExecuteParams | undefined

    if (!opts?.tokenId || !opts?.sessionSecret || !opts?.action || !opts?.params) {
        throw Object.assign(
            new Error('Missing required parameters: tokenId, sessionSecret, action, params'),
            { code: CryptoBoxErrorCodes.INTERNAL_ERROR }
        )
    }

    // 确保 TokenStore 已初始化
    await tokenStore.initialize()

    // 执行加密操作（sessionSecret 用于解密 Payload）
    const result = await cryptoExecutor.execute(opts, context.appId)

    return result
}
