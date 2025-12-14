import type { IPlaocAdapter } from './types'
import type { DestroyPayload, MessagePayload, TransferPayload } from './types'
import { WALLET_PLAOC_PATH } from './paths'
import { sha256 } from '@noble/hashes/sha2.js'
import { bytesToHex } from '@noble/hashes/utils.js'
import { createBioforestKeypair, decrypt, isBioforestChain, signMessage, verifyPassword, type EncryptedData } from '@/lib/crypto'

export type SignatureAuthError = 'rejected' | 'timeout' | 'insufficient_balance'

/**
 * Signature authorization service (mock-first)
 *
 * Owns the eventId single-response guard and response cleanup.
 */
export class SignatureAuthService {
  private hasResponded = false

  constructor(
    private readonly adapter: IPlaocAdapter,
    private readonly eventId: string
  ) {}

  /**
   * Respond with a signature and cleanup eventId.
   */
  async approve(signature: string): Promise<void> {
    await this.respondOnce(WALLET_PLAOC_PATH.authorizeSignature, { signature })
  }

  /**
   * Respond with an error and cleanup eventId.
   */
  async reject(error: SignatureAuthError): Promise<void> {
    await this.respondOnce(WALLET_PLAOC_PATH.authorizeSignature, { error })
  }

  /**
   * Handle message signing (mock-first).
   *
   * - Always verifies password before proceeding.
   * - For BioForest chains: decrypts secret and returns a real Ed25519 signature (hex).
   * - For non-BioForest chains: returns a deterministic mock signature (hex).
   *
   * NOTE: This method does not call `approve()` automatically to keep UI control explicit.
   */
  async handleMessageSign(payload: MessagePayload, encryptedSecret: EncryptedData, password: string): Promise<string> {
    const chainName = payload.chainName.trim().toLowerCase()

    if (isBioforestChain(chainName)) {
      let secret: string
      try {
        secret = await decrypt(encryptedSecret, password)
      } catch {
        throw new Error('Invalid password')
      }

      const keypair = createBioforestKeypair(secret)
      const signature = signMessage(payload.message, keypair.secretKey)
      return `0x${bytesToHex(signature)}`
    }

    const ok = await verifyPassword(encryptedSecret, password)
    if (!ok) throw new Error('Invalid password')

    {
      // Deterministic mock signature (64 bytes => 128 hex chars) for non-bioforest chains.
      const encoder = new TextEncoder()
      const partA = sha256(encoder.encode(`message:${payload.message}`))
      const partB = sha256(encoder.encode(`event:${this.eventId}`))
      const sig = new Uint8Array(64)
      sig.set(partA, 0)
      sig.set(partB, 32)
      return `0x${bytesToHex(sig)}`
    }
  }

  /**
   * Handle transfer signing (mock-first).
   *
   * - Always verifies password before proceeding.
   * - For BioForest chains: decrypts secret and signs a canonical transfer string (Ed25519, hex).
   * - For non-BioForest chains: returns a deterministic mock signature (hex).
   *
   * NOTE: This method does not call `approve()` automatically to keep UI control explicit.
   */
  async handleTransferSign(payload: TransferPayload, encryptedSecret: EncryptedData, password: string): Promise<string> {
    const chainName = payload.chainName.trim().toLowerCase()

    const message = [
      'transfer',
      chainName,
      payload.senderAddress,
      payload.receiveAddress,
      payload.balance,
      payload.fee ?? '',
      payload.contractInfo?.assetType ?? payload.assetType ?? '',
      payload.contractInfo?.contractAddress ?? '',
      payload.contractInfo?.decimals?.toString() ?? '',
    ].join('|')

    if (isBioforestChain(chainName)) {
      let secret: string
      try {
        secret = await decrypt(encryptedSecret, password)
      } catch {
        throw new Error('Invalid password')
      }

      const keypair = createBioforestKeypair(secret)
      const signature = signMessage(message, keypair.secretKey)
      return `0x${bytesToHex(signature)}`
    }

    const ok = await verifyPassword(encryptedSecret, password)
    if (!ok) throw new Error('Invalid password')

    const encoder = new TextEncoder()
    const partA = sha256(encoder.encode(message))
    const partB = sha256(encoder.encode(`event:${this.eventId}`))
    const sig = new Uint8Array(64)
    sig.set(partA, 0)
    sig.set(partB, 32)
    return `0x${bytesToHex(sig)}`
  }

  /**
   * Handle asset destruction signing (mock-first).
   *
   * - Always verifies password before proceeding.
   * - For BioForest chains: decrypts secret and signs a canonical destory string (Ed25519, hex).
   * - For non-BioForest chains: returns a deterministic mock signature (hex).
   *
   * NOTE: This method does not call `approve()` automatically to keep UI control explicit.
   */
  async handleDestroySign(payload: DestroyPayload, encryptedSecret: EncryptedData, password: string): Promise<string> {
    const chainName = payload.chainName.trim().toLowerCase()

    const message = [
      'destory',
      chainName,
      payload.senderAddress,
      payload.destoryAddress,
      payload.destoryAmount,
      payload.fee ?? '',
      payload.assetType ?? '',
    ].join('|')

    if (isBioforestChain(chainName)) {
      let secret: string
      try {
        secret = await decrypt(encryptedSecret, password)
      } catch {
        throw new Error('Invalid password')
      }

      const keypair = createBioforestKeypair(secret)
      const signature = signMessage(message, keypair.secretKey)
      return `0x${bytesToHex(signature)}`
    }

    const ok = await verifyPassword(encryptedSecret, password)
    if (!ok) throw new Error('Invalid password')

    const encoder = new TextEncoder()
    const partA = sha256(encoder.encode(message))
    const partB = sha256(encoder.encode(`event:${this.eventId}`))
    const sig = new Uint8Array(64)
    sig.set(partA, 0)
    sig.set(partB, 32)
    return `0x${bytesToHex(sig)}`
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
}
