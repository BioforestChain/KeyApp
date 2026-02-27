import { describe, expect, it } from 'vitest'
import { hexToBytes } from '@noble/hashes/utils.js'
import { privateKeyToAccount } from 'viem/accounts'
import { recoverTransactionAddress } from 'viem'

import { EvmTransactionMixin } from './transaction-mixin'
import type { UnsignedTransaction } from '../types'

class EvmSignTestBase {
  constructor(public readonly chainId: string) {}
}

class EvmSignTestService extends EvmTransactionMixin(EvmSignTestBase) {}

describe('EvmTransactionMixin.signTransaction', () => {
  it('signs token tx with value=0x0 and keeps sender address consistent', async () => {
    const service = new EvmSignTestService('binance')
    const privateKeyHex = '0x59c6995e998f97a5a0044976f5d8f17f4b10df9589ef5f8a7f6f3f6db74ad5a4'
    const expectedAddress = privateKeyToAccount(privateKeyHex).address.toLowerCase()

    const unsignedTx: UnsignedTransaction = {
      chainId: 'binance',
      intentType: 'transfer',
      data: {
        nonce: 137,
        gasPrice: '0x2faf080',
        gasLimit: '0x249f0',
        to: '0x55d398326f99059ff775485246999027b3197955',
        value: '0x0',
        data: '0xa9059cbb000000000000000000000000063096cbc147d5170e1b10fa4895bfa882c1d45e0000000000000000000000000000000000000000000000008ac7230489e80000',
        chainId: 56,
      },
    }

    const signed = await service.signTransaction(unsignedTx, {
      privateKey: hexToBytes(privateKeyHex.slice(2)),
    })

    const serialized = signed.data as `0x${string}`
    const recoveredAddress = (await recoverTransactionAddress({ serializedTransaction: serialized })).toLowerCase()
    expect(recoveredAddress).toBe(expectedAddress)
  })
})
