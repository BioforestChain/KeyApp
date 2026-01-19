/**
 * Crypto 黑盒操作执行器
 * 
 * 在验证 Token 后执行实际的加密操作：
 * - asymmetricEncrypt: 使用 Ed25519 进行非对称加密
 * - sign: 使用 Ed25519 进行签名
 * 
 * 安全设计：
 * - 操作在内部完成，私钥不暴露
 * - patternKey 从加密 Payload 中获取
 * - 所有验证数据从加密 Payload 获取（不信任明文副本）
 */

import { tokenStore } from './token-store'
import type {
    CryptoExecuteParams,
    CryptoExecuteResponse,
    AsymmetricEncryptParams,
    SignParams,
} from './types'

// 导入加密工具
import {
    signMessage,
    bytesToHex,
    hexToBytes,
    createBioforestKeypair,
    publicKeyToBioforestAddress,
} from '@/lib/crypto'

// 导入钱包存储服务
import { walletStorageService } from '@/services/wallet-storage'

/**
 * 加密操作执行器
 */
class CryptoExecutor {
    /**
     * 执行加密操作
     * 
     * @param params 执行参数（含 sessionSecret）
     * @param callerMiniappId 调用者 miniapp ID
     */
    async execute(
        params: CryptoExecuteParams,
        callerMiniappId: string
    ): Promise<CryptoExecuteResponse> {
        // 1. 验证 Token 并解密 Payload
        const validation = await tokenStore.validateToken(
            params.tokenId,
            params.sessionSecret,
            callerMiniappId,
            params.action
        )

        if (!validation.valid) {
            const { CryptoBoxErrorCodes } = await import('./types')
            const errorCodeMap: Record<string, number> = {
                'TOKEN_NOT_FOUND': CryptoBoxErrorCodes.TOKEN_NOT_FOUND,
                'MINIAPP_MISMATCH': CryptoBoxErrorCodes.MINIAPP_MISMATCH,
                'TOKEN_EXPIRED': CryptoBoxErrorCodes.TOKEN_EXPIRED,
                'ACTION_NOT_PERMITTED': CryptoBoxErrorCodes.ACTION_NOT_PERMITTED,
                'INVALID_SESSION_SECRET': CryptoBoxErrorCodes.INVALID_SESSION_SECRET,
            }
            throw Object.assign(
                new Error(`Token validation failed: ${validation.error}`),
                { code: errorCodeMap[validation.error] }
            )
        }

        const { payload } = validation

        // 2. 从 Payload 获取 patternKey 并解密钱包私钥
        const keypair = await this.getKeypairForAddress(payload.address, payload.patternKey)

        // 3. 执行操作
        let result: CryptoExecuteResponse

        switch (params.action) {
            case 'asymmetricEncrypt':
                result = await this.executeAsymmetricEncrypt(
                    params.params as AsymmetricEncryptParams,
                    keypair
                )
                break
            case 'sign':
                result = await this.executeSign(
                    params.params as SignParams,
                    keypair
                )
                break
            default:
                throw new Error(`Unknown action: ${params.action}`)
        }

        return result
    }

    /**
     * 获取地址对应的密钥对
     */
    private async getKeypairForAddress(
        address: string,
        patternKey: string
    ): Promise<{ secretKey: Uint8Array; publicKey: Uint8Array }> {
        // 从钱包存储获取 mnemonic
        const wallets = await walletStorageService.getAllWallets()

        // 地址前缀（b 或 c）
        const prefix = address.charAt(0)

        // 找到包含该地址的钱包
        for (const wallet of wallets) {
            try {
                const mnemonic = await walletStorageService.getMnemonic(wallet.id, patternKey)
                const keypair = createBioforestKeypair(mnemonic)

                // 验证派生的地址是否与目标地址匹配
                const derivedAddress = publicKeyToBioforestAddress(keypair.publicKey, prefix)
                if (derivedAddress === address) {
                    return keypair
                }
            } catch {
                // 密码错误或其他问题，继续尝试下一个钱包
                continue
            }
        }

        throw new Error(`No wallet found for address: ${address}`)
    }

    /**
     * 将各种格式的公钥转换为 hex 字符串
     */
    private normalizePublicKey(publicKey: unknown): string {
        if (typeof publicKey === 'string') {
            return publicKey
        }
        if (publicKey && typeof publicKey === 'object' && 'type' in publicKey && 'data' in publicKey) {
            const bufferLike = publicKey as { type: string; data: number[] }
            if (bufferLike.type === 'Buffer' && Array.isArray(bufferLike.data)) {
                return bufferLike.data.map(b => b.toString(16).padStart(2, '0')).join('')
            }
        }
        if (Array.isArray(publicKey) || publicKey instanceof Uint8Array) {
            return Array.from(publicKey as ArrayLike<number>)
                .map(b => b.toString(16).padStart(2, '0'))
                .join('')
        }
        throw new Error(`Invalid publicKey format: ${typeof publicKey}`)
    }

    /**
     * 执行非对称加密
     * 
     * 使用 X25519 ECDH + 加密，与 BFMetaSignUtil.asymmetricEncrypt 兼容
     */
    private async executeAsymmetricEncrypt(
        params: AsymmetricEncryptParams,
        keypair: { secretKey: Uint8Array; publicKey: Uint8Array }
    ): Promise<CryptoExecuteResponse> {
        const recipientPubKey = hexToBytes(this.normalizePublicKey(params.recipientPublicKey))
        const messageBytes = new TextEncoder().encode(params.data)

        // 导入 tweetnacl 和 ed2curve（用于 Ed25519 -> X25519 转换）
        const nacl = await import('tweetnacl')
        const ed2curve = await import('ed2curve')

        // 将 Ed25519 公钥/私钥转换为 X25519（Curve25519）
        const curveRecipientPK = ed2curve.convertPublicKey(recipientPubKey)
        const curveSecretKey = ed2curve.convertSecretKey(keypair.secretKey)

        if (!curveRecipientPK || !curveSecretKey) {
            throw new Error('Failed to convert Ed25519 keys to X25519')
        }

        // 使用固定的全 0 nonce（与 BFMetaSignUtil 兼容）
        const nonce = new Uint8Array(24)

        // 加密
        const encrypted = nacl.box(
            messageBytes,
            nonce,
            curveRecipientPK,
            curveSecretKey
        )

        // 返回 encryptedMessage (不含 nonce)，与 BFMetaSignUtil.asymmetricEncrypt 一致
        return {
            result: bytesToHex(encrypted),
            publicKey: bytesToHex(keypair.publicKey),
        }
    }

    /**
     * 执行 ECDSA 签名
     */
    private async executeSign(
        params: SignParams,
        keypair: { secretKey: Uint8Array; publicKey: Uint8Array }
    ): Promise<CryptoExecuteResponse> {
        const messageBytes = new TextEncoder().encode(params.data)

        // 使用 Ed25519 签名
        const signature = signMessage(messageBytes, keypair.secretKey)

        return {
            result: bytesToHex(signature),
            publicKey: bytesToHex(keypair.publicKey),
        }
    }
}

// 单例导出
export const cryptoExecutor = new CryptoExecutor()
