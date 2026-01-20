/**
 * TokenStore 单元测试
 * 
 * 测试 Token 的 CRUD 和验证功能
 * 
 * 注意：新 API 返回 { token, sessionSecret }，验证需要 sessionSecret
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { tokenStore } from '../token-store'
import type { CryptoAction, TokenDuration } from '../types'

// Mock IndexedDB
import 'fake-indexeddb/auto'

describe('TokenStore', () => {
    beforeEach(async () => {
        // 重置 tokenStore 状态
        tokenStore.close()
        // 初始化存储
        await tokenStore.initialize()
    })

    afterEach(() => {
        // 关闭连接
        tokenStore.close()
    })

    describe('initialize', () => {
        it('should initialize without error', async () => {
            tokenStore.close()
            await expect(tokenStore.initialize()).resolves.not.toThrow()
        })

        it('should be idempotent', async () => {
            await tokenStore.initialize()
            await tokenStore.initialize()
            // Should not throw
        })
    })

    describe('generateTokenId', () => {
        it('should generate a valid UUID', () => {
            const tokenId = tokenStore.generateTokenId()
            expect(tokenId).toMatch(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
            )
        })

        it('should generate unique IDs', () => {
            const id1 = tokenStore.generateTokenId()
            const id2 = tokenStore.generateTokenId()
            expect(id1).not.toBe(id2)
        })
    })

    describe('deriveSessionSecret', () => {
        it('should generate SHA-256 hash', async () => {
            const secret = await tokenStore.deriveSessionSecret(
                'wallet-1',
                '0-1-2-5-8',
                'app.test.dweb',
                'token-123'
            )
            expect(secret).toHaveLength(64) // 32 bytes = 64 hex chars
        })

        it('should generate consistent hash for same input', async () => {
            const secret1 = await tokenStore.deriveSessionSecret(
                'wallet-1',
                'pattern',
                'app.test.dweb',
                'token-123'
            )
            const secret2 = await tokenStore.deriveSessionSecret(
                'wallet-1',
                'pattern',
                'app.test.dweb',
                'token-123'
            )
            expect(secret1).toBe(secret2)
        })

        it('should generate different hashes for different inputs', async () => {
            const secret1 = await tokenStore.deriveSessionSecret(
                'wallet-1',
                'pattern-1',
                'app.test.dweb',
                'token-123'
            )
            const secret2 = await tokenStore.deriveSessionSecret(
                'wallet-1',
                'pattern-2',
                'app.test.dweb',
                'token-123'
            )
            expect(secret1).not.toBe(secret2)
        })
    })

    describe('createToken', () => {
        it('should create a token with correct properties', async () => {
            const { token, sessionSecret } = await tokenStore.createToken({
                miniappId: 'app.test.dweb',
                walletId: 'wallet-1',
                address: 'bfm1testaddress',
                actions: ['asymmetricEncrypt'] as CryptoAction[],
                duration: '30min' as TokenDuration,
                patternKey: '0-1-2-5-8',
            })

            expect(token.tokenId).toBeDefined()
            expect(token.miniappId).toBe('app.test.dweb')
            expect(token.walletId).toBe('wallet-1')
            expect(token.address).toBe('bfm1testaddress')
            expect(token.actions).toContain('asymmetricEncrypt')
            expect(token.createdAt).toBeLessThanOrEqual(Date.now())
            expect(token.expiresAt).toBeGreaterThan(Date.now())
            expect(sessionSecret).toHaveLength(64)
        })

        it('should set correct expiry for 5min duration', async () => {
            const before = Date.now()
            const { token } = await tokenStore.createToken({
                miniappId: 'app.test.dweb',
                walletId: 'wallet-1',
                address: 'bfm1test',
                actions: ['sign'] as CryptoAction[],
                duration: '5min' as TokenDuration,
                patternKey: 'pattern',
            })
            const after = Date.now()

            const expectedExpiry = 5 * 60 * 1000
            expect(token.expiresAt).toBeGreaterThanOrEqual(before + expectedExpiry)
            expect(token.expiresAt).toBeLessThanOrEqual(after + expectedExpiry)
        })

        it('should not include encryptedPayload in returned token', async () => {
            const { token } = await tokenStore.createToken({
                miniappId: 'app.test.dweb',
                walletId: 'wallet-1',
                address: 'bfm1test',
                actions: ['asymmetricEncrypt'] as CryptoAction[],
                duration: '30min' as TokenDuration,
                patternKey: 'secret-pattern',
            })

            // CryptoToken should not include encryptedPayload
            expect('encryptedPayload' in token).toBe(false)
        })
    })

    describe('getToken', () => {
        it('should retrieve a stored token', async () => {
            const { token: created } = await tokenStore.createToken({
                miniappId: 'app.test.dweb',
                walletId: 'wallet-1',
                address: 'bfm1test',
                actions: ['asymmetricEncrypt'] as CryptoAction[],
                duration: '30min' as TokenDuration,
                patternKey: 'pattern',
            })

            const retrieved = await tokenStore.getToken(created.tokenId)

            expect(retrieved).not.toBeNull()
            expect(retrieved!.tokenId).toBe(created.tokenId)
            expect(retrieved!.encryptedPayload).toBeDefined() // StoredToken includes encryptedPayload
        })

        it('should return null for non-existent token', async () => {
            const token = await tokenStore.getToken('non-existent-id')
            expect(token).toBeNull()
        })
    })

    describe('deleteToken', () => {
        it('should delete a token', async () => {
            const { token } = await tokenStore.createToken({
                miniappId: 'app.test.dweb',
                walletId: 'wallet-1',
                address: 'bfm1test',
                actions: ['sign'] as CryptoAction[],
                duration: '30min' as TokenDuration,
                patternKey: 'pattern',
            })

            await tokenStore.deleteToken(token.tokenId)
            const retrieved = await tokenStore.getToken(token.tokenId)

            expect(retrieved).toBeNull()
        })

        it('should not throw for non-existent token', async () => {
            await expect(tokenStore.deleteToken('non-existent')).resolves.not.toThrow()
        })
    })

    describe('validateToken', () => {
        it('should return valid for correct token, sessionSecret and action', async () => {
            const { token, sessionSecret } = await tokenStore.createToken({
                miniappId: 'app.test.dweb',
                walletId: 'wallet-1',
                address: 'bfm1test',
                actions: ['asymmetricEncrypt', 'sign'] as CryptoAction[],
                duration: '30min' as TokenDuration,
                patternKey: 'pattern',
            })

            const result = await tokenStore.validateToken(
                token.tokenId,
                sessionSecret,
                'app.test.dweb',
                'asymmetricEncrypt'
            )

            expect(result.valid).toBe(true)
            if (result.valid) {
                expect(result.token.tokenId).toBe(token.tokenId)
                expect(result.payload.patternKey).toBe('pattern')
            }
        })

        it('should return TOKEN_NOT_FOUND for non-existent token', async () => {
            const result = await tokenStore.validateToken(
                'non-existent',
                'any-secret',
                'app.test.dweb',
                'sign'
            )

            expect(result.valid).toBe(false)
            if (!result.valid) {
                expect(result.error).toBe('TOKEN_NOT_FOUND')
            }
        })

        it('should return INVALID_SESSION_SECRET for wrong sessionSecret', async () => {
            const { token } = await tokenStore.createToken({
                miniappId: 'app.test.dweb',
                walletId: 'wallet-1',
                address: 'bfm1test',
                actions: ['sign'] as CryptoAction[],
                duration: '30min' as TokenDuration,
                patternKey: 'pattern',
            })

            const result = await tokenStore.validateToken(
                token.tokenId,
                'wrong-session-secret',
                'app.test.dweb',
                'sign'
            )

            expect(result.valid).toBe(false)
            if (!result.valid) {
                expect(result.error).toBe('INVALID_SESSION_SECRET')
            }
        })

        it('should return MINIAPP_MISMATCH for wrong miniappId', async () => {
            const { token, sessionSecret } = await tokenStore.createToken({
                miniappId: 'app.correct.dweb',
                walletId: 'wallet-1',
                address: 'bfm1test',
                actions: ['sign'] as CryptoAction[],
                duration: '30min' as TokenDuration,
                patternKey: 'pattern',
            })

            const result = await tokenStore.validateToken(
                token.tokenId,
                sessionSecret,
                'app.wrong.dweb',
                'sign'
            )

            expect(result.valid).toBe(false)
            if (!result.valid) {
                expect(result.error).toBe('MINIAPP_MISMATCH')
            }
        })

        it('should return TOKEN_EXPIRED for expired token', async () => {
            const { token, sessionSecret } = await tokenStore.createToken({
                miniappId: 'app.test.dweb',
                walletId: 'wallet-1',
                address: 'bfm1test',
                actions: ['sign'] as CryptoAction[],
                duration: '5min' as TokenDuration,
                patternKey: 'pattern',
            })

            // Mock Date.now to be in the future
            const originalNow = Date.now
            vi.spyOn(Date, 'now').mockReturnValue(token.expiresAt + 1000)

            const result = await tokenStore.validateToken(
                token.tokenId,
                sessionSecret,
                'app.test.dweb',
                'sign'
            )

            // Restore
            Date.now = originalNow

            expect(result.valid).toBe(false)
            if (!result.valid) {
                expect(result.error).toBe('TOKEN_EXPIRED')
            }
        })

        it('should return ACTION_NOT_PERMITTED for unauthorized action', async () => {
            const { token, sessionSecret } = await tokenStore.createToken({
                miniappId: 'app.test.dweb',
                walletId: 'wallet-1',
                address: 'bfm1test',
                actions: ['asymmetricEncrypt'] as CryptoAction[], // Only asymmetricEncrypt
                duration: '30min' as TokenDuration,
                patternKey: 'pattern',
            })

            const result = await tokenStore.validateToken(
                token.tokenId,
                sessionSecret,
                'app.test.dweb',
                'sign' // Request sign, but only asymmetricEncrypt is authorized
            )

            expect(result.valid).toBe(false)
            if (!result.valid) {
                expect(result.error).toBe('ACTION_NOT_PERMITTED')
            }
        })
    })

    describe('getTokensByMiniapp', () => {
        it('should return all tokens for a miniapp', async () => {
            // Use unique miniappId to avoid pollution from other tests
            const uniqueId = `app.getby.${Date.now()}.dweb`
            const otherId = `app.other.${Date.now()}.dweb`

            // Create multiple tokens
            await tokenStore.createToken({
                miniappId: uniqueId,
                walletId: 'wallet-1',
                address: 'bfm1test1',
                actions: ['sign'] as CryptoAction[],
                duration: '30min' as TokenDuration,
                patternKey: 'pattern1',
            })

            await tokenStore.createToken({
                miniappId: uniqueId,
                walletId: 'wallet-1',
                address: 'bfm1test2',
                actions: ['asymmetricEncrypt'] as CryptoAction[],
                duration: '2hour' as TokenDuration,
                patternKey: 'pattern2',
            })

            await tokenStore.createToken({
                miniappId: otherId, // Different miniapp
                walletId: 'wallet-2',
                address: 'bfm1other',
                actions: ['sign'] as CryptoAction[],
                duration: '30min' as TokenDuration,
                patternKey: 'pattern3',
            })

            const tokens = await tokenStore.getTokensByMiniapp(uniqueId)

            expect(tokens).toHaveLength(2)
            tokens.forEach(token => {
                expect(token.miniappId).toBe(uniqueId)
                // Should not include encryptedPayload
                expect('encryptedPayload' in token).toBe(false)
            })
        })

        it('should return empty array for miniapp with no tokens', async () => {
            const tokens = await tokenStore.getTokensByMiniapp('app.notoken.dweb')
            expect(tokens).toHaveLength(0)
        })
    })

    describe('decryptPayload', () => {
        it('should decrypt payload with correct sessionSecret', async () => {
            const { token, sessionSecret } = await tokenStore.createToken({
                miniappId: 'app.test.dweb',
                walletId: 'wallet-1',
                address: 'bfm1test',
                actions: ['sign'] as CryptoAction[],
                duration: '30min' as TokenDuration,
                patternKey: 'my-secret-pattern',
            })

            const storedToken = await tokenStore.getToken(token.tokenId)
            expect(storedToken).not.toBeNull()

            const payload = await tokenStore.decryptPayload(storedToken!, sessionSecret)
            expect(payload).not.toBeNull()
            expect(payload!.patternKey).toBe('my-secret-pattern')
            expect(payload!.miniappId).toBe('app.test.dweb')
        })

        it('should return null for wrong sessionSecret', async () => {
            const { token } = await tokenStore.createToken({
                miniappId: 'app.test.dweb',
                walletId: 'wallet-1',
                address: 'bfm1test',
                actions: ['sign'] as CryptoAction[],
                duration: '30min' as TokenDuration,
                patternKey: 'my-secret-pattern',
            })

            const storedToken = await tokenStore.getToken(token.tokenId)
            const payload = await tokenStore.decryptPayload(storedToken!, 'wrong-secret')
            expect(payload).toBeNull()
        })
    })
})
