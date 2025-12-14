import type { AddressAuthResponse, IPlaocAdapter } from './types'
import type { Wallet } from '@/stores'
import { WALLET_PLAOC_PATH } from './paths'
import { sha256 } from '@noble/hashes/sha2.js'
import { bytesToHex } from '@noble/hashes/utils.js'
import {
  createBioforestKeypair,
  decrypt,
  isBioforestChain,
  signMessage as signBioforestMessage,
  verifyPassword,
} from '@/lib/crypto'

type AddressAuthError = 'rejected' | 'timeout'

type AddressAuthSignOptions = Readonly<{
  signMessage: string
  password: string
}>

/**
 * Address authorization service (mock-first)
 *
 * Owns the eventId single-response guard and response cleanup.
 */
export class AddressAuthService {
  private hasResponded = false

  constructor(
    private readonly adapter: IPlaocAdapter,
    private readonly eventId: string
  ) {}

  /**
   * Build all chain address responses across all wallets for a specific chain (network scope).
   */
  handleNetworkAddresses(wallets: Wallet[], chainName: string): AddressAuthResponse[] {
    const target = chainName.trim().toLowerCase()
    if (!target) return []

    const responses: AddressAuthResponse[] = []
    for (const wallet of wallets) {
      for (const ca of wallet.chainAddresses) {
        if (String(ca.chain).toLowerCase() !== target) continue
        responses.push({
          name: wallet.name,
          address: ca.address,
          chainName: ca.chain,
          publicKey: '',
          magic: `${wallet.id}:${ca.chain}`,
          signMessage: '',
        })
      }
    }
    return responses
  }

  /**
   * Build all chain address responses for a single wallet (main scope).
   */
  handleMainAddresses(wallet: Wallet): AddressAuthResponse[] {
    return wallet.chainAddresses.map((ca) => ({
      name: wallet.name,
      address: ca.address,
      chainName: ca.chain,
      publicKey: '',
      magic: `${wallet.id}:${ca.chain}`,
      signMessage: '',
    }))
  }

  /**
   * Build signed chain address responses for a single wallet (main scope).
   *
   * NOTE: For non-bioforest chains this returns deterministic mock signatures.
   */
  async handleMainAddressesSigned(wallet: Wallet, options: AddressAuthSignOptions): Promise<AddressAuthResponse[]> {
    const responses = this.handleMainAddresses(wallet)
    return await this.signAddressResponses(responses, [wallet], options)
  }

  /**
   * Build all chain address responses across all wallets (all scope).
   */
  handleAllAddresses(wallets: Wallet[]): AddressAuthResponse[] {
    const responses: AddressAuthResponse[] = []
    for (const wallet of wallets) {
      responses.push(...this.handleMainAddresses(wallet))
    }
    return responses
  }

  /**
   * Build signed chain address responses across all wallets (all scope).
   *
   * NOTE: For non-bioforest chains this returns deterministic mock signatures.
   */
  async handleAllAddressesSigned(wallets: Wallet[], options: AddressAuthSignOptions): Promise<AddressAuthResponse[]> {
    const responses = this.handleAllAddresses(wallets)
    return await this.signAddressResponses(responses, wallets, options)
  }

  /**
   * Build signed chain address responses across all wallets for a specific chain (network scope).
   *
   * NOTE: For non-bioforest chains this returns deterministic mock signatures.
   */
  async handleNetworkAddressesSigned(
    wallets: Wallet[],
    chainName: string,
    options: AddressAuthSignOptions
  ): Promise<AddressAuthResponse[]> {
    const responses = this.handleNetworkAddresses(wallets, chainName)
    return await this.signAddressResponses(responses, wallets, options)
  }

  /**
   * Respond with approved addresses and cleanup eventId.
   */
  async approve(addresses: AddressAuthResponse[]): Promise<void> {
    await this.respondOnce(WALLET_PLAOC_PATH.authorizeAddress, addresses)
  }

  /**
   * Respond with an error and cleanup eventId.
   */
  async reject(error: AddressAuthError): Promise<void> {
    void error
    await this.respondOnce(WALLET_PLAOC_PATH.authorizeAddress, null)
  }

  private async respondOnce(path: string, data: unknown): Promise<void> {
    if (this.hasResponded) return
    this.hasResponded = true
    try {
      await this.adapter.respondWith(this.eventId, path, data)
    } finally {
      await this.adapter.removeEventId(this.eventId)
    }
  }

  private async signAddressResponses(
    responses: AddressAuthResponse[],
    wallets: Wallet[],
    options: AddressAuthSignOptions
  ): Promise<AddressAuthResponse[]> {
    const message = options.signMessage.trim()
    if (!message) return responses

    const walletsById = new Map<string, Wallet>()
    for (const wallet of wallets) walletsById.set(wallet.id, wallet)

    const verifiedPasswordWalletIds = new Set<string>()
    const decryptedSecretByWalletId = new Map<string, string>()

    for (const response of responses) {
      const walletId = this.getWalletIdFromMagic(response.magic)
      const wallet = walletsById.get(walletId)
      const encryptedSecret = wallet?.encryptedMnemonic
      if (!wallet || !encryptedSecret) throw new Error('Missing secret')

      const chainName = response.chainName.trim().toLowerCase()
      if (isBioforestChain(chainName)) {
        let secret = decryptedSecretByWalletId.get(walletId)
        if (!secret) {
          try {
            secret = await decrypt(encryptedSecret, options.password)
          } catch {
            throw new Error('Invalid password')
          }
          decryptedSecretByWalletId.set(walletId, secret)
        }

        const keypair = createBioforestKeypair(secret)
        const signature = signBioforestMessage(message, keypair.secretKey)
        response.signMessage = `0x${bytesToHex(signature)}`
        response.publicKey = bytesToHex(keypair.publicKey)
        continue
      }

      if (!verifiedPasswordWalletIds.has(walletId)) {
        const ok = await verifyPassword(encryptedSecret, options.password)
        if (!ok) throw new Error('Invalid password')
        verifiedPasswordWalletIds.add(walletId)
      }

      response.signMessage = this.createDeterministicMockSignature({
        message,
        address: response.address,
        chainName: response.chainName,
      })
    }

    return responses
  }

  private getWalletIdFromMagic(magic: string): string {
    const idx = magic.indexOf(':')
    return idx === -1 ? magic : magic.slice(0, idx)
  }

  private createDeterministicMockSignature({
    message,
    address,
    chainName,
  }: {
    message: string
    address: string
    chainName: string
  }): string {
    const encoder = new TextEncoder()
    const partA = sha256(encoder.encode(`address:${address}|chain:${chainName}|message:${message}`))
    const partB = sha256(encoder.encode(`event:${this.eventId}`))
    const sig = new Uint8Array(64)
    sig.set(partA, 0)
    sig.set(partB, 32)
    return `0x${bytesToHex(sig)}`
  }
}
