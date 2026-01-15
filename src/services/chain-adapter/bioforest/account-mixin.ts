/**
 * Bioforest Account Mixin - IBioAccountService 实现
 * 
 * 提供 BioChain 专属的账户查询功能：
 * - 账户信息查询（含支付密码公钥）
 * - 支付密码验证
 */

import type { BioAccountInfo, BioVerifyPayPasswordParams } from '../types'

type Constructor<T = object> = new (...args: any[]) => T

interface HasEndpointAndChainId {
    readonly endpoint: string
    readonly chainId: string
}

/**
 * Bioforest Account Mixin
 * 
 * @example
 * ```ts
 * class MyProvider extends BioforestAccountMixin(BaseClass) {
 *   // 自动获得 bioGetAccountInfo 和 bioVerifyPayPassword 方法
 * }
 * ```
 */
export function BioforestAccountMixin<TBase extends Constructor<HasEndpointAndChainId>>(Base: TBase) {
    return class extends Base {
        /**
         * 获取账户信息（含支付密码公钥）
         */
        async bioGetAccountInfo(address: string): Promise<BioAccountInfo> {
            const { getAddressInfo } = await import('@/services/bioforest-sdk')

            try {
                const result = await getAddressInfo(this.endpoint, address)
                return {
                    address,
                    secondPublicKey: result?.secondPublicKey ?? null,
                }
            } catch {
                return {
                    address,
                    secondPublicKey: null,
                }
            }
        }

        /**
         * 验证支付密码
         */
        async bioVerifyPayPassword(params: BioVerifyPayPasswordParams): Promise<boolean> {
            const { getBioforestCore } = await import('@/services/bioforest-sdk')
            const core = await getBioforestCore(this.chainId)
            const accountHelper = core.accountBaseHelper()

            // Try V2 first (newer algorithm)
            try {
                const keypairV2 = await accountHelper.createSecondSecretKeypairV2(params.mainSecret, params.paySecret)
                if (keypairV2.publicKey.toString('hex') === params.publicKey) {
                    return true
                }
            } catch {
                // V2 failed
            }

            // Try V1 (legacy algorithm)
            try {
                const keypairV1 = await accountHelper.createSecondSecretKeypair(params.mainSecret, params.paySecret)
                if (keypairV1.publicKey.toString('hex') === params.publicKey) {
                    return true
                }
            } catch {
                // V1 also failed
            }

            return false
        }
    }
}
