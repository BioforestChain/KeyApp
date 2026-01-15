import { describe, it, expect } from 'vitest'
import { toTransactionInfo, toTransactionInfoList } from './adapters'
import { Amount } from '@/types/amount'

// Mock Transaction data matching the schema
const mockTransaction = {
    hash: '0x123abc',
    from: '0xfrom',
    to: '0xto',
    timestamp: 1700000000000,
    status: 'confirmed' as const,
    action: 'transfer' as const,
    direction: 'out' as const,
    assets: [{
        assetType: 'native' as const,
        value: '1000000000',
        symbol: 'ETH',
        decimals: 18,
    }],
}

describe('Transaction Adapters', () => {
    describe('toTransactionInfo', () => {
        it('should convert a valid transaction', () => {
            const result = toTransactionInfo(mockTransaction)

            expect(result.id).toBe('0x123abc')
            expect(result.hash).toBe('0x123abc')
            expect(result.type).toBe('send') // transfer + out = send
            expect(result.status).toBe('confirmed')
            expect(result.address).toBe('0xto') // direction out, so use 'to'
            expect(result.symbol).toBe('ETH')
            expect(result.amount).toBeInstanceOf(Amount)
        })

        it('should map transfer + in to receive', () => {
            const incomingTx = { ...mockTransaction, direction: 'in' as const }
            const result = toTransactionInfo(incomingTx)

            expect(result.type).toBe('receive')
            expect(result.address).toBe('0xfrom') // direction in, so use 'from'
        })

        it('should handle chain parameter', () => {
            const result = toTransactionInfo(mockTransaction, 'ethereum')
            expect(result.chain).toBe('ethereum')
        })
    })

    describe('toTransactionInfoList', () => {
        it('should convert empty array', () => {
            const result = toTransactionInfoList([])
            expect(result).toEqual([])
        })

        it('should convert array of transactions', () => {
            const result = toTransactionInfoList([mockTransaction, mockTransaction])
            expect(result.length).toBe(2)
            expect(result[0].id).toBe('0x123abc')
        })

        it('should pass chain to each transaction', () => {
            const result = toTransactionInfoList([mockTransaction], 'binance')
            expect(result[0].chain).toBe('binance')
        })
    })
})
