/**
 * BIP39 Identity Service
 */

import type { ChainConfig } from '@/services/chain-config'
import type { IIdentityService, Address, Signature } from '../types'
import { isValidAddress } from '@/lib/crypto'

export class Bip39IdentityService implements IIdentityService {
  private readonly chainId: string

  constructor(config: ChainConfig) {
    this.chainId = config.id
  }

  async deriveAddress(_seed: Uint8Array, _index = 0): Promise<Address> {
    throw new Error('Use deriveAddressesForChains from @/lib/crypto instead')
  }

  async deriveAddresses(_seed: Uint8Array, _startIndex: number, _count: number): Promise<Address[]> {
    throw new Error('Use deriveAddressesForChains from @/lib/crypto instead')
  }

  isValidAddress(address: string): boolean {
    if (this.chainId === 'bitcoin') {
      return isValidAddress(address, 'bitcoin')
    }
    if (this.chainId === 'tron') {
      return isValidAddress(address, 'tron')
    }
    return false
  }

  normalizeAddress(address: string): Address {
    return address // BIP39 addresses are case-sensitive
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
