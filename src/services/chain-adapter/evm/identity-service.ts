/**
 * EVM Identity Service
 */

import type { IIdentityService, Address, Signature } from '../types'
import { toChecksumAddress, isValidAddress, deriveKey } from '@/lib/crypto'

export class EvmIdentityService implements IIdentityService {
  constructor(_chainId: string) {
    // chainId parameter for interface compatibility
  }

  async deriveAddress(seed: Uint8Array, index = 0): Promise<Address> {
    // seed is UTF-8 encoded mnemonic string
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
