/**
 * EVM Identity Service
 */

import type { ChainConfig } from '@/services/chain-config'
import type { IIdentityService, Address, Signature } from '../types'
import { toChecksumAddress, isValidAddress } from '@/lib/crypto'

export class EvmIdentityService implements IIdentityService {
  constructor(_config: ChainConfig) {}

  async deriveAddress(_seed: Uint8Array, _index = 0): Promise<Address> {
    throw new Error('Use deriveAddressesForChains from @/lib/crypto instead')
  }

  async deriveAddresses(_seed: Uint8Array, _startIndex: number, _count: number): Promise<Address[]> {
    throw new Error('Use deriveAddressesForChains from @/lib/crypto instead')
  }

  isValidAddress(address: string): boolean {
    return isValidAddress(address, 'ethereum')
  }

  normalizeAddress(address: string): Address {
    return toChecksumAddress(address)
  }

  async signMessage(_message: string | Uint8Array, _privateKey: Uint8Array): Promise<Signature> {
    // TODO: Implement EIP-191 personal_sign
    throw new Error('Not implemented')
  }

  async verifyMessage(
    _message: string | Uint8Array,
    _signature: Signature,
    _address: Address,
  ): Promise<boolean> {
    // TODO: Implement signature verification
    throw new Error('Not implemented')
  }
}
