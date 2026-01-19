/**
 * CryptoBox 类型定义测试
 */

import { describe, it, expect } from 'vitest'
import {
    TOKEN_DURATION_MS,
    CryptoBoxErrorCodes,
    type CryptoAction,
    type TokenDuration,
    type CryptoToken,
    type StoredToken,
    type RequestCryptoTokenParams,
    type CryptoExecuteParams,
} from '../types'

describe('CryptoBox Types', () => {
    describe('TOKEN_DURATION_MS', () => {
        it('should have correct milliseconds for 5min', () => {
            expect(TOKEN_DURATION_MS['5min']).toBe(5 * 60 * 1000)
        })

        it('should have correct milliseconds for 15min', () => {
            expect(TOKEN_DURATION_MS['15min']).toBe(15 * 60 * 1000)
        })

        it('should have correct milliseconds for 1hour', () => {
            expect(TOKEN_DURATION_MS['1hour']).toBe(60 * 60 * 1000)
        })

        it('should have correct milliseconds for 1day', () => {
            expect(TOKEN_DURATION_MS['1day']).toBe(24 * 60 * 60 * 1000)
        })
    })

    describe('CryptoBoxErrorCodes', () => {
        it('should have TOKEN_NOT_FOUND code', () => {
            expect(CryptoBoxErrorCodes.TOKEN_NOT_FOUND).toBe(4100)
        })

        it('should have MINIAPP_MISMATCH code', () => {
            expect(CryptoBoxErrorCodes.MINIAPP_MISMATCH).toBe(4101)
        })

        it('should have TOKEN_EXPIRED code', () => {
            expect(CryptoBoxErrorCodes.TOKEN_EXPIRED).toBe(4102)
        })

        it('should have ACTION_NOT_PERMITTED code', () => {
            expect(CryptoBoxErrorCodes.ACTION_NOT_PERMITTED).toBe(4103)
        })

        it('should have USER_REJECTED code', () => {
            expect(CryptoBoxErrorCodes.USER_REJECTED).toBe(4001)
        })
    })

    describe('Type guards', () => {
        it('should accept valid CryptoAction values', () => {
            const actions: CryptoAction[] = ['asymmetricEncrypt', 'sign']
            expect(actions).toHaveLength(2)
        })

        it('should accept valid TokenDuration values', () => {
            const durations: TokenDuration[] = ['5min', '15min', '1hour', '1day']
            expect(durations).toHaveLength(4)
        })

        it('should create valid CryptoToken', () => {
            const token: CryptoToken = {
                tokenId: 'test-uuid',
                miniappId: 'app.test.dweb',
                address: 'bfm1test',
                actions: ['asymmetricEncrypt'],
                expiresAt: Date.now() + 300000,
                createdAt: Date.now(),
            }
            expect(token.tokenId).toBe('test-uuid')
            expect(token.actions).toContain('asymmetricEncrypt')
        })

        it('should create valid StoredToken with patternHash', () => {
            const storedToken: StoredToken = {
                tokenId: 'test-uuid',
                miniappId: 'app.test.dweb',
                address: 'bfm1test',
                actions: ['sign'],
                expiresAt: Date.now() + 300000,
                createdAt: Date.now(),
                patternHash: 'abc123hash',
            }
            expect(storedToken.patternHash).toBe('abc123hash')
        })

        it('should create valid RequestCryptoTokenParams', () => {
            const params: RequestCryptoTokenParams = {
                actions: ['asymmetricEncrypt', 'sign'],
                duration: '15min',
                address: 'bfm1test',
            }
            expect(params.duration).toBe('15min')
        })

        it('should create valid CryptoExecuteParams for asymmetricEncrypt', () => {
            const params: CryptoExecuteParams = {
                tokenId: 'test-uuid',
                action: 'asymmetricEncrypt',
                params: {
                    data: 'hello',
                    recipientPublicKey: '0xabc123',
                },
            }
            expect(params.action).toBe('asymmetricEncrypt')
        })

        it('should create valid CryptoExecuteParams for sign', () => {
            const params: CryptoExecuteParams = {
                tokenId: 'test-uuid',
                action: 'sign',
                params: {
                    data: 'message to sign',
                },
            }
            expect(params.action).toBe('sign')
        })
    })
})
