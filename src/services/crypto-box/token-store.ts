/**
 * Crypto 黑盒 Token 存储服务
 * 
 * 使用 IndexedDB 持久化 Token，支持：
 * - Token 创建/读取/删除
 * - 过期清理
 * - 加密 Payload 存储与解密
 * 
 * 安全设计：
 * - patternKey 加密存储在 encryptedPayload 中
 * - sessionSecret 派生自 walletId + patternKey + miniappId + tokenId
 * - 执行时从加密 Payload 获取真实数据
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { encrypt, decrypt } from '@/lib/crypto'
import type {
    CryptoToken,
    StoredToken,
    CryptoAction,
    TokenDuration,
    TokenValidationResult,
    TokenPayload,
} from './types'

const DB_NAME = 'crypto-box-db'
const DB_VERSION = 2  // 升级版本以支持新的 schema
const STORE_NAME = 'tokens'

interface CryptoBoxDBSchema extends DBSchema {
    tokens: {
        key: string
        value: StoredToken
        indexes: {
            'by-miniapp': string
            'by-wallet': string
            'by-expires': number
        }
    }
}

/**
 * Token 存储服务
 */
class TokenStore {
    private db: IDBPDatabase<CryptoBoxDBSchema> | null = null
    private initialized = false

    /**
     * 初始化存储
     */
    async initialize(): Promise<void> {
        if (this.initialized) return

        this.db = await openDB<CryptoBoxDBSchema>(DB_NAME, DB_VERSION, {
            upgrade(db, oldVersion) {
                // 删除旧版本的 store
                if (db.objectStoreNames.contains(STORE_NAME)) {
                    db.deleteObjectStore(STORE_NAME)
                }
                // 创建新的 store
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'tokenId' })
                store.createIndex('by-miniapp', 'miniappId')
                store.createIndex('by-wallet', 'walletId')
                store.createIndex('by-expires', 'expiresAt')
            },
        })

        this.initialized = true

        // 启动时清理过期 Token
        await this.cleanupExpired()
    }

    private ensureInitialized(): void {
        if (!this.initialized || !this.db) {
            throw new Error('TokenStore not initialized')
        }
    }

    /**
     * 生成 Token ID
     */
    generateTokenId(): string {
        return crypto.randomUUID()
    }

    /**
     * 计算 SHA-256 哈希
     */
    private async sha256(data: string): Promise<string> {
        const encoder = new TextEncoder()
        const dataBuffer = encoder.encode(data)
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    }

    /**
     * 派生 sessionSecret
     * sessionSecret = SHA256(walletId + patternKey + miniappId + tokenId)
     */
    async deriveSessionSecret(
        walletId: string,
        patternKey: string,
        miniappId: string,
        tokenId: string
    ): Promise<string> {
        return this.sha256(`${walletId}:${patternKey}:${miniappId}:${tokenId}`)
    }

    /**
     * 创建并存储 Token
     * 
     * @returns Token 信息和 sessionSecret
     */
    async createToken(params: {
        miniappId: string
        walletId: string
        address: string
        actions: CryptoAction[]
        duration: TokenDuration
        patternKey: string
    }): Promise<{ token: CryptoToken; sessionSecret: string }> {
        this.ensureInitialized()

        const { TOKEN_DURATION_MS: durationMs } = await import('./types')
        const now = Date.now()
        const tokenId = this.generateTokenId()
        const expiresAt = now + durationMs[params.duration]

        // 派生 sessionSecret
        const sessionSecret = await this.deriveSessionSecret(
            params.walletId,
            params.patternKey,
            params.miniappId,
            tokenId
        )

        // 构建 Payload 并加密
        const payload: TokenPayload = {
            patternKey: params.patternKey,
            miniappId: params.miniappId,
            walletId: params.walletId,
            address: params.address,
            actions: params.actions,
            expiresAt,
        }
        const encryptedPayload = JSON.stringify(await encrypt(JSON.stringify(payload), sessionSecret))

        // 存储 Token（明文副本 + 加密 Payload）
        const storedToken: StoredToken = {
            tokenId,
            miniappId: params.miniappId,
            walletId: params.walletId,
            address: params.address,
            actions: params.actions,
            expiresAt,
            createdAt: now,
            encryptedPayload,
        }

        await this.db!.put(STORE_NAME, storedToken)

        // 返回给调用者
        const { encryptedPayload: _, ...token } = storedToken
        return { token, sessionSecret }
    }

    /**
     * 解密 Token Payload
     */
    async decryptPayload(token: StoredToken, sessionSecret: string): Promise<TokenPayload | null> {
        try {
            const encryptedData = JSON.parse(token.encryptedPayload)
            const decrypted = await decrypt(encryptedData, sessionSecret)
            return JSON.parse(decrypted) as TokenPayload
        } catch {
            return null
        }
    }

    /**
     * 获取 Token
     */
    async getToken(tokenId: string): Promise<StoredToken | null> {
        this.ensureInitialized()
        const token = await this.db!.get(STORE_NAME, tokenId)
        return token ?? null
    }

    /**
     * 删除 Token
     */
    async deleteToken(tokenId: string): Promise<void> {
        this.ensureInitialized()
        await this.db!.delete(STORE_NAME, tokenId)
    }

    /**
     * 验证 Token 并解密 Payload
     * 
     * 从加密 Payload 获取真实数据进行验证（不信任明文副本）
     */
    async validateToken(
        tokenId: string,
        sessionSecret: string,
        callerMiniappId: string,
        requestedAction: CryptoAction
    ): Promise<TokenValidationResult> {
        this.ensureInitialized()

        const token = await this.getToken(tokenId)

        // 1. Token 不存在
        if (!token) {
            return { valid: false, error: 'TOKEN_NOT_FOUND' }
        }

        // 2. 解密 Payload
        const payload = await this.decryptPayload(token, sessionSecret)
        if (!payload) {
            return { valid: false, error: 'INVALID_SESSION_SECRET' }
        }

        // 3. 从 Payload 验证 miniappId（真实数据）
        if (payload.miniappId !== callerMiniappId) {
            return { valid: false, error: 'MINIAPP_MISMATCH' }
        }

        // 4. 从 Payload 验证过期时间（真实数据）
        if (Date.now() > payload.expiresAt) {
            await this.deleteToken(tokenId)
            return { valid: false, error: 'TOKEN_EXPIRED' }
        }

        // 5. 从 Payload 验证操作权限（真实数据）
        if (!payload.actions.includes(requestedAction)) {
            return { valid: false, error: 'ACTION_NOT_PERMITTED' }
        }

        return { valid: true, token, payload }
    }

    /**
     * 清理过期 Token
     */
    async cleanupExpired(): Promise<number> {
        this.ensureInitialized()

        const now = Date.now()
        const tx = this.db!.transaction(STORE_NAME, 'readwrite')
        const index = tx.store.index('by-expires')

        let deletedCount = 0
        let cursor = await index.openCursor(IDBKeyRange.upperBound(now))

        while (cursor) {
            await cursor.delete()
            deletedCount++
            cursor = await cursor.continue()
        }

        await tx.done
        return deletedCount
    }

    /**
     * 获取 miniapp 的所有有效 Token（明文副本）
     */
    async getTokensByMiniapp(miniappId: string): Promise<CryptoToken[]> {
        this.ensureInitialized()

        const now = Date.now()
        const tokens = await this.db!.getAllFromIndex(STORE_NAME, 'by-miniapp', miniappId)

        // 过滤未过期的 Token 并移除 encryptedPayload
        return tokens
            .filter(t => t.expiresAt > now)
            .map(({ encryptedPayload: _, ...token }) => token)
    }

    /**
     * 关闭数据库连接
     */
    close(): void {
        if (this.db) {
            this.db.close()
            this.db = null
            this.initialized = false
        }
    }
}

// 单例导出
export const tokenStore = new TokenStore()
