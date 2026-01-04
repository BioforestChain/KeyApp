/**
 * Wrapped Identity Provider
 * 
 * 包装现有的 IIdentityService，适配 ApiProvider 接口。
 */

import type { ApiProvider } from './types'
import type { IIdentityService } from '../types'

export class WrappedIdentityProvider implements ApiProvider {
  readonly type: string
  readonly endpoint = ''

  constructor(
    type: string,
    private readonly identityService: IIdentityService,
  ) {
    this.type = type
  }

  async deriveAddress(seed: Uint8Array, index = 0): Promise<string> {
    return this.identityService.deriveAddress(seed, index)
  }

  async deriveAddresses(seed: Uint8Array, startIndex: number, count: number): Promise<string[]> {
    return this.identityService.deriveAddresses(seed, startIndex, count)
  }

  isValidAddress(address: string): boolean {
    return this.identityService.isValidAddress(address)
  }

  normalizeAddress(address: string): string {
    return this.identityService.normalizeAddress(address)
  }
}
