/**
 * Bioforest Identity Mixin
 * 
 * 使用 Mixin Factory 模式为任意类添加 Bioforest Identity 服务能力。
 */

import {
    createBioforestKeypair,
    publicKeyToBioforestAddress,
    isValidBioforestAddress,
    signMessage as bioforestSign,
} from '@/lib/crypto'
import { chainConfigService } from '@/services/chain-config'
import type { IIdentityService, Address, Signature } from '../types'

function bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
}

type Constructor<T = object> = new (...args: any[]) => T

/**
 * Bioforest Identity Mixin - 为任意类添加 Bioforest 地址派生和验证能力
 * 
 * 要求基类有 chainId 属性
 */
export function BioforestIdentityMixin<TBase extends Constructor<{ chainId: string }>>(Base: TBase) {
    return class BioforestIdentity extends Base implements IIdentityService {
        #prefix: string | null = null

        #getPrefix(): string {
            if (!this.#prefix) {
                const config = chainConfigService.getConfig(this.chainId)
                this.#prefix = config?.prefix ?? 'b'
            }
            return this.#prefix
        }

        async deriveAddress(seed: Uint8Array, _index = 0): Promise<Address> {
            const seedString = new TextDecoder().decode(seed)
            const keypair = createBioforestKeypair(seedString)
            return publicKeyToBioforestAddress(keypair.publicKey, this.#getPrefix())
        }

        async deriveAddresses(seed: Uint8Array, startIndex: number, count: number): Promise<Address[]> {
            const address = await this.deriveAddress(seed, startIndex)
            return Array(count).fill(address) as Address[]
        }

        isValidAddress(address: string): boolean {
            return isValidBioforestAddress(address)
        }

        normalizeAddress(address: string): Address {
            return address
        }

        async signMessage(message: string | Uint8Array, privateKey: Uint8Array): Promise<Signature> {
            const signature = bioforestSign(message, privateKey)
            return bytesToHex(signature)
        }

        async verifyMessage(
            message: string | Uint8Array,
            signature: Signature,
            _address: Address,
        ): Promise<boolean> {
            void signature
            void message
            return false
        }
    }
}
