/**
 * EVM Identity Mixin
 * 
 * 使用 Mixin Factory 模式为任意类添加 EVM Identity 服务能力。
 */

import type { IIdentityService, Address, Signature } from '../types'
import { toChecksumAddress, isValidAddress, deriveKey } from '@/lib/crypto'

type Constructor<T = object> = new (...args: any[]) => T

/**
 * EVM Identity Mixin - 为任意类添加 EVM 地址派生和验证能力
 */
export function EvmIdentityMixin<TBase extends Constructor>(Base: TBase) {
    return class EvmIdentity extends Base implements IIdentityService {
        async deriveAddress(seed: Uint8Array, index = 0): Promise<Address> {
            const mnemonic = new TextDecoder().decode(seed)
            const derived = deriveKey(mnemonic, 'ethereum', index)
            return derived.address
        }

        async deriveAddresses(seed: Uint8Array, startIndex: number, count: number): Promise<Address[]> {
            const mnemonic = new TextDecoder().decode(seed)
            const addresses: Address[] = []
            for (let i = 0; i < count; i++) {
                const derived = deriveKey(mnemonic, 'ethereum', startIndex + i)
                addresses.push(derived.address)
            }
            return addresses
        }

        isValidAddress(address: string): boolean {
            return isValidAddress(address, 'ethereum')
        }

        normalizeAddress(address: string): Address {
            return toChecksumAddress(address)
        }

        async signMessage(_message: string | Uint8Array, _privateKey: Uint8Array): Promise<Signature> {
            throw new Error('Not implemented')
        }

        async verifyMessage(
            _message: string | Uint8Array,
            _signature: Signature,
            _address: Address,
        ): Promise<boolean> {
            throw new Error('Not implemented')
        }
    }
}
