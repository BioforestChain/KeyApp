/**
 * Crypto 黑盒 Token 授权系统 - 类型定义
 */

// ==================== Token 相关类型 ====================

/**
 * 授权的加密操作类型
 * - asymmetricEncrypt: 非对称加密（如 RWA 登录）
 * - sign: ECDSA 签名
 * 
 * 注意：BioChain 交易签名不在此列，必须使用专门的 bio_signTransaction
 */
export type CryptoAction = 'asymmetricEncrypt' | 'sign'

/**
 * Token 授权时长
 */
export type TokenDuration = '5min' | '30min' | '2hour' | '1day'

/**
 * Token 时长映射（毫秒）
 */
export const TOKEN_DURATION_MS: Record<TokenDuration, number> = {
    '5min': 5 * 60 * 1000,
    '30min': 30 * 60 * 1000,
    '2hour': 2 * 60 * 60 * 1000,
    '1day': 24 * 60 * 60 * 1000,
}

/**
 * Token 时长选项列表（用于 UI Select）
 */
export const TOKEN_DURATION_OPTIONS: TokenDuration[] = ['5min', '30min', '2hour', '1day']

/**
 * Crypto Token 结构（明文副本，用于查询展示）
 */
export interface CryptoToken {
    /** Token 唯一标识 */
    tokenId: string
    /** 授权的 miniapp ID */
    miniappId: string
    /** 钱包 ID */
    walletId: string
    /** 使用的钱包地址 */
    address: string
    /** 授权的操作列表 */
    actions: CryptoAction[]
    /** 过期时间戳 */
    expiresAt: number
    /** 创建时间 */
    createdAt: number
}

/**
 * 加密 Payload 内容（真实数据源）
 */
export interface TokenPayload {
    /** 手势密码 */
    patternKey: string
    /** 授权的 miniapp ID */
    miniappId: string
    /** 钱包 ID */
    walletId: string
    /** 使用的钱包地址 */
    address: string
    /** 授权的操作列表 */
    actions: CryptoAction[]
    /** 过期时间戳 */
    expiresAt: number
}

/**
 * 存储在 IndexedDB 中的 Token 记录
 * 明文副本 + 加密 Payload
 */
export interface StoredToken extends CryptoToken {
    /** 加密的 Payload（真实数据源） */
    encryptedPayload: string
}

// ==================== API 请求/响应类型 ====================

/**
 * bio_requestCryptoToken 请求参数
 */
export interface RequestCryptoTokenParams {
    /** 需要的操作权限 */
    actions: CryptoAction[]
    /** 授权时长 */
    duration: TokenDuration
    /** 使用的地址 */
    address: string
    /** 链 ID（可选，用于 UI 显示） */
    chainId?: string
}

/**
 * bio_requestCryptoToken 响应
 */
export interface RequestCryptoTokenResponse {
    /** Token ID（返回给 miniapp） */
    tokenId: string
    /** Session Secret（用于后续执行的解密密钥） */
    sessionSecret: string
    /** 过期时间戳 */
    expiresAt: number
    /** 授权的操作 */
    grantedActions: CryptoAction[]
    /** Token 绑定的地址（miniapp 应缓存此地址，地址变化时需重新请求 Token） */
    address: string
}

/**
 * 非对称加密参数
 */
export interface AsymmetricEncryptParams {
    /** 要加密的数据 */
    data: string
    /** 接收方公钥（hex） */
    recipientPublicKey: string
}

/**
 * 签名参数
 */
export interface SignParams {
    /** 要签名的数据 */
    data: string
}

/**
 * bio_cryptoExecute 请求参数
 */
export interface CryptoExecuteParams {
    /** Token ID */
    tokenId: string
    /** Session Secret（解密 Payload 的密钥） */
    sessionSecret: string
    /** 要执行的操作 */
    action: CryptoAction
    /** 操作参数 */
    params: AsymmetricEncryptParams | SignParams
    /** 期望使用的地址（安全验证：必须与 Token 中的地址匹配） */
    address?: string
}

/**
 * bio_cryptoExecute 响应
 */
export interface CryptoExecuteResponse {
    /** 操作结果（hex 编码）*/
    result: string
    /** 执行时使用的公钥（hex 编码）*/
    publicKey: string
    /** Token 绑定的地址（miniapp 应使用此地址，而非自己缓存的地址） */
    address: string
}

/**
 * bio_getCryptoTokenInfo 请求参数
 */
export interface GetCryptoTokenInfoParams {
    /** Token ID */
    tokenId: string
    /** Session Secret（用于解密和验证） */
    sessionSecret: string
}

/**
 * bio_getCryptoTokenInfo 响应
 */
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

// ==================== 验证相关类型 ====================

/**
 * Token 验证结果
 */
export type TokenValidationResult =
    | { valid: true; token: StoredToken; payload: TokenPayload }
    | { valid: false; error: TokenValidationError }

/**
 * Token 验证错误类型
 */
export type TokenValidationError =
    | 'TOKEN_NOT_FOUND'
    | 'MINIAPP_MISMATCH'
    | 'TOKEN_EXPIRED'
    | 'ACTION_NOT_PERMITTED'
    | 'INVALID_SESSION_SECRET'

// ==================== 错误代码 ====================

export const CryptoBoxErrorCodes = {
    /** Token 未找到 */
    TOKEN_NOT_FOUND: 4100,
    /** miniapp ID 不匹配 */
    MINIAPP_MISMATCH: 4101,
    /** Token 已过期 */
    TOKEN_EXPIRED: 4102,
    /** 操作未授权 */
    ACTION_NOT_PERMITTED: 4103,
    /** Session Secret 无效 */
    INVALID_SESSION_SECRET: 4104,
    /** 地址不匹配（请求地址与 Token 绑定地址不一致） */
    ADDRESS_MISMATCH: 4105,
    /** 用户拒绝授权 */
    USER_REJECTED: 4001,
    /** 内部错误 */
    INTERNAL_ERROR: -32603,
} as const

// ==================== UI 显示标签 ====================

/**
 * 操作描述映射（用于 UI 显示）
 */
export const CRYPTO_ACTION_LABELS: Record<CryptoAction, { name: string; description: string }> = {
    asymmetricEncrypt: {
        name: '非对称加密',
        description: '使用您的私钥进行非对称加密',
    },
    sign: {
        name: '数据签名',
        description: '使用您的私钥进行签名',
    },
}

/**
 * 时长描述映射（用于 UI 显示）
 */
export const TOKEN_DURATION_LABELS: Record<TokenDuration, string> = {
    '5min': '5 分钟',
    '30min': '30 分钟',
    '2hour': '2 小时',
    '1day': '1 天',
}
