/**
 * BioForest Identity Service
 */

import {
  createBioforestKeypair,
  publicKeyToBioforestAddress,
  isValidBioforestAddress,
  signMessage as bioforestSign,
} from '@/lib/crypto'

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
import { chainConfigService } from '@/services/chain-config'
import type { IIdentityService, Address, Signature } from '../types'

export class BioforestIdentityService implements IIdentityService {
  private readonly chainId: string
  private prefix: string | null = null

  constructor(chainId: string) {
    this.chainId = chainId
  }

  private getPrefix(): string {
    if (!this.prefix) {
      const config = chainConfigService.getConfig(this.chainId)
      this.prefix = config?.prefix ?? 'b'
    }
    return this.prefix
  }

  async deriveAddress(seed: Uint8Array, _index = 0): Promise<Address> {
    // BioForest uses the same keypair for all indices (no HD derivation)
    const seedString = new TextDecoder().decode(seed)
    const keypair = createBioforestKeypair(seedString)
    return publicKeyToBioforestAddress(keypair.publicKey, this.getPrefix())
  }

  async deriveAddresses(seed: Uint8Array, startIndex: number, count: number): Promise<Address[]> {
    // BioForest chains use same address for all indices
    const address = await this.deriveAddress(seed, startIndex)
    return Array(count).fill(address) as Address[]
  }

  isValidAddress(address: string): boolean {
    return isValidBioforestAddress(address)
  }

  normalizeAddress(address: string): Address {
    // BioForest addresses are case-sensitive, return as-is
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
    // Note: Need public key to verify, address alone is not sufficient
    // This would require looking up the public key from address
    // For now, return false as placeholder
    void signature
    void message
    return false
  }
}
