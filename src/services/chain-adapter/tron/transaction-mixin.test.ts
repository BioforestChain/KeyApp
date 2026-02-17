import { describe, expect, it } from 'vitest'
import { secp256k1 } from '@noble/curves/secp256k1.js'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js'
import { TronTransactionMixin } from './transaction-mixin'
import type { SignedTransaction, UnsignedTransaction } from '../types'
import type { TronSignedTransaction } from './types'

class TronTestBase {
  constructor(public readonly chainId: string) {}
}

const TronTransactionService = TronTransactionMixin(TronTestBase)

function expectedTronSignature(txId: string, privateKey: Uint8Array): string {
  const recovered = secp256k1.sign(hexToBytes(txId), privateKey, { prehash: false, format: 'recovered' })
  const recovery = recovered[0]
  const compact = recovered.subarray(1)
  const v = (recovery + 27).toString(16).padStart(2, '0')
  return `${bytesToHex(compact)}${v}`
}

describe('TronTransactionMixin signature format', () => {
  it('signs transaction with tron-compatible r+s+v format', async () => {
    const service = new TronTransactionService('tron')
    const txId = 'd1f6f7cf0ecfdb4f6f07ac8b5f9c5cf6a3dc731fd3704d98ea5f6f5b8d493f0f'
    const privateKey = Uint8Array.from([
      0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88,
      0x99, 0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff, 0x10,
      0x20, 0x30, 0x40, 0x50, 0x60, 0x70, 0x80, 0x90,
      0xa0, 0xb0, 0xc0, 0xd0, 0xe0, 0xf0, 0x12, 0x34,
    ])

    const unsignedTx: UnsignedTransaction = {
      chainId: 'tron',
      intentType: 'transfer',
      data: { txID: txId } as UnsignedTransaction['data'],
    }

    const signed = await service.signTransaction(unsignedTx, { privateKey })
    const trxSigned = signed as SignedTransaction
    const signedData = trxSigned.data as TronSignedTransaction
    const signature = signedData.signature?.[0]

    expect(signature).toBe(expectedTronSignature(txId, privateKey))
    expect(signature?.length).toBe(130)
    expect(signature?.slice(-2)).toMatch(/1b|1c/)
  })
})
