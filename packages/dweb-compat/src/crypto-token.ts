/**
 * Crypto Token API 封装
 * 
 * 提供 Token 授权和加密操作的便捷函数
 */

import { bioRequest } from './bridge'

// ==================== 类型定义 ====================

export type CryptoAction = 'asymmetricEncrypt' | 'sign'
export type TokenDuration = '5min' | '30min' | '2hour' | '1day'

export interface RequestCryptoTokenParams {
    actions: CryptoAction[]
    duration: TokenDuration
    address: string
}

export interface RequestCryptoTokenResponse {
    tokenId: string
    sessionSecret: string
    expiresAt: number
    grantedActions: CryptoAction[]
    /** Token 绑定的地址 */
    address: string
}

export interface AsymmetricEncryptParams {
    data: string
    recipientPublicKey: string
}

export interface SignParams {
    data: string
}

export interface CryptoExecuteResponse {
    result: string
    publicKey: string
    /** Token 绑定的地址 */
    address: string
}

// ==================== Token 操作 ====================

/**
 * 请求加密操作授权
 * 
 * 用户需要输入手势密码确认授权
 * 
 * @param actions 需要的操作权限
 * @param duration 授权时长
 * @param address 使用的地址
 * @param chainId 链 ID（可选，用于 UI 显示）
 */
export async function requestCryptoToken(
    actions: CryptoAction[],
    duration: TokenDuration,
    address: string,
    chainId?: string
): Promise<RequestCryptoTokenResponse> {
    return bioRequest<RequestCryptoTokenResponse>('bio_requestCryptoToken', {
        actions,
        duration,
        address,
        chainId,
    })
}

// ==================== Token 查询 ====================

export interface GetCryptoTokenInfoResponse {
    /** Token 是否有效 */
    valid: boolean
    /** Token 绑定的地址 */
    address: string
    /** 过期时间戳 */
    expiresAt: number
    /** 授权的操作列表 */
    actions: CryptoAction[]
    /** 无效原因（仅当 valid=false 时） */
    invalidReason?: 'TOKEN_NOT_FOUND' | 'TOKEN_EXPIRED' | 'INVALID_SESSION_SECRET' | 'MINIAPP_MISMATCH'
}

/**
 * 查询 Token 信息
 * 
 * 用于检查缓存的 Token 是否有效，以及获取 Token 绑定的地址
 */
export async function getCryptoTokenInfo(
    tokenId: string,
    sessionSecret: string
): Promise<GetCryptoTokenInfoResponse> {
    return bioRequest<GetCryptoTokenInfoResponse>('bio_getCryptoTokenInfo', {
        tokenId,
        sessionSecret,
    })
}

/**
 * 使用 Token 执行非对称加密
 */
export async function asymmetricEncrypt(
    tokenId: string,
    sessionSecret: string,
    data: string,
    recipientPublicKey: string
): Promise<CryptoExecuteResponse> {
    return bioRequest<CryptoExecuteResponse>('bio_cryptoExecute', {
        tokenId,
        sessionSecret,
        action: 'asymmetricEncrypt',
        params: { data, recipientPublicKey },
    })
}

/**
 * 使用 Token 执行签名
 */
export async function signData(
    tokenId: string,
    sessionSecret: string,
    data: string
): Promise<CryptoExecuteResponse> {
    return bioRequest<CryptoExecuteResponse>('bio_cryptoExecute', {
        tokenId,
        sessionSecret,
        action: 'sign',
        params: { data },
    })
}

// ==================== Token 缓存 ====================

const CRYPTO_TOKEN_CACHE_KEY = 'bio_crypto_token_cache'

interface CachedToken {
    tokenId: string
    sessionSecret: string
    address: string
    expiresAt: number
}

function getCachedToken(): CachedToken | null {
    try {
        const cached = localStorage.getItem(CRYPTO_TOKEN_CACHE_KEY)
        if (!cached) return null
        return JSON.parse(cached)
    } catch {
        return null
    }
}

function setCachedToken(token: CachedToken): void {
    localStorage.setItem(CRYPTO_TOKEN_CACHE_KEY, JSON.stringify(token))
}

function clearCachedToken(): void {
    localStorage.removeItem(CRYPTO_TOKEN_CACHE_KEY)
}

// ==================== RWA 登录便捷函数 ====================

export interface RwaLoginResult {
    /** 钱包地址 */
    address: string
    /** 用户公钥 (Buffer) */
    publicKey: Buffer
    /** 加密的 signcode (Buffer) */
    signcode: Buffer
}

/**
 * 将各种格式的公钥转换为 hex 字符串
 */
function normalizeToHex(input: unknown): string {
    if (typeof input === 'string') {
        return input
    }
    // { type: 'Buffer', data: [...] } 格式
    if (input && typeof input === 'object' && 'type' in input && 'data' in input) {
        const bufferLike = input as { type: string; data: number[] }
        if (bufferLike.type === 'Buffer' && Array.isArray(bufferLike.data)) {
            return Buffer.from(bufferLike.data).toString('hex')
        }
    }
    // Uint8Array 或 number[]
    if (Array.isArray(input) || input instanceof Uint8Array) {
        return Buffer.from(input as ArrayLike<number>).toString('hex')
    }
    // Buffer
    if (Buffer.isBuffer(input)) {
        return input.toString('hex')
    }
    throw new Error(`Invalid input format: ${typeof input}`)
}

/**
 * RWA Hub 登录
 * 
 * 封装了完整的 RWA 登录流程：
 * 1. 检查缓存的 Token 是否有效且地址匹配
 * 2. 如果缓存有效，直接使用
 * 3. 否则请求新的加密授权
 * 4. 执行非对称加密生成 signcode
 * 
 * @param systemPublicKey 系统公钥，支持 hex 字符串、Buffer 对象或字节数组
 */
export async function rwaLogin(
    systemPublicKey: unknown
): Promise<RwaLoginResult> {
    const systemPubKeyHex = normalizeToHex(systemPublicKey)
    // BFMeta 相关链的所有可能名称
    const BFMETA_CHAINS = ['bfmeta', 'bfchainv2', 'bioforest', 'bfmchain', 'bfchain']

    // 1. 获取钱包地址（指定 BFMeta 链）
    const accounts = await bioRequest<Array<{ address: string; chain: string; publicKey?: string }>>(
        'bio_requestAccounts',
        { chain: 'bfmeta' }  // RWA Hub 需要 BFMeta 链
    )

    if (!accounts || accounts.length === 0) {
        throw new Error('No accounts available')
    }

    // 找到 BFMeta 系列链的地址
    const account = accounts.find(a => {
        const chain = a.chain.toLowerCase()
        return BFMETA_CHAINS.includes(chain)
    })
    if (!account) {
        const chains = accounts.map(a => a.chain).join(', ')
        throw new Error(`BFMeta account not found. Available chains: ${chains}`)
    }

    // 2. 检查缓存的 Token
    let tokenId: string | undefined
    let sessionSecret: string | undefined
    
    const cached = getCachedToken()
    
    if (cached && cached.address === account.address && cached.expiresAt > Date.now()) {
        // 缓存存在且地址匹配，验证 Token 是否仍然有效
        try {
            const info = await getCryptoTokenInfo(cached.tokenId, cached.sessionSecret)
            if (info.valid && info.address === account.address) {
                // Token 有效且地址匹配，复用缓存
                tokenId = cached.tokenId
                sessionSecret = cached.sessionSecret
            }
        } catch {
            // 验证失败，需要新 Token
        }
    }
    
    if (!tokenId || !sessionSecret) {
        // 需要新 Token：地址不匹配、Token 过期或无效
        clearCachedToken()
        
        // 请求加密授权（用户输入手势密码）
        const response = await requestCryptoToken(
            ['asymmetricEncrypt'],
            '1day',  // 默认使用 1 天授权
            account.address,
            account.chain
        )
        tokenId = response.tokenId
        sessionSecret = response.sessionSecret
        
        // 缓存新 Token
        setCachedToken({
            tokenId,
            sessionSecret,
            address: response.address,
            expiresAt: response.expiresAt,
        })
    }

    // 3. 执行非对称加密生成 signcode
    const timestamp = Date.now().toString()
    const { result, publicKey, address } = await asymmetricEncrypt(
        tokenId,
        sessionSecret,
        timestamp,
        systemPubKeyHex
    )

    // 返回 Buffer 格式，与 RWA 后端期望一致
    // 注意：使用 asymmetricEncrypt 返回的 address，而不是 account.address
    // 这确保了返回的地址与 Token 绑定的地址一致
    return {
        address,
        publicKey: Buffer.from(publicKey, 'hex'),
        signcode: Buffer.from(result, 'hex'),
    }
}
