/**
 * Key-Fetch React Integration Tests
 * 
 * Tests for useState injection mechanism that enables React support
 * for KeyFetchInstance and derived instances.
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { z } from 'zod'
import { keyFetch, derive, transform } from '../index'
import { injectUseState, getUseStateImpl } from '../core'

// Mock React hook implementation
const mockUseStateImpl = vi.fn().mockReturnValue({
    data: undefined,
    isLoading: true,
    isFetching: false,
    error: undefined,
    refetch: vi.fn(),
})

describe('key-fetch React useState injection', () => {
    beforeEach(() => {
        // Inject mock useState implementation
        injectUseState(mockUseStateImpl)
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('getUseStateImpl', () => {
        test('should return injected implementation', () => {
            const impl = getUseStateImpl()
            expect(impl).toBe(mockUseStateImpl)
        })
    })

    describe('KeyFetchInstance.useState', () => {
        const TestSchema = z.object({
            value: z.string(),
        })

        test('should call injected useState implementation', () => {
            const instance = keyFetch.create({
                name: 'test.instance',
                outputSchema: TestSchema,
                url: 'https://api.test.com/data',
            })

            const params = { id: '123' }
            const options = { enabled: true }

            instance.useState(params, options)

            expect(mockUseStateImpl).toHaveBeenCalledTimes(1)
            expect(mockUseStateImpl).toHaveBeenCalledWith(instance, params, options)
        })

        test('should return useState result', () => {
            const expectedResult = {
                data: { value: 'test' },
                isLoading: false,
                isFetching: false,
                error: undefined,
                refetch: vi.fn(),
            }
            mockUseStateImpl.mockReturnValueOnce(expectedResult)

            const instance = keyFetch.create({
                name: 'test.instance2',
                outputSchema: TestSchema,
                url: 'https://api.test.com/data',
            })

            const result = instance.useState({})

            expect(result).toBe(expectedResult)
        })
    })

    describe('derive().useState', () => {
        const SourceSchema = z.object({
            items: z.array(z.object({
                id: z.string(),
                name: z.string(),
            })),
        })

        const DerivedSchema = z.array(z.string())

        test('should use injected useState implementation for derived instances', () => {
            const sourceInstance = keyFetch.create({
                name: 'test.source',
                outputSchema: SourceSchema,
                url: 'https://api.test.com/items',
            })

            const derivedInstance = derive({
                name: 'test.derived',
                source: sourceInstance,
                outputSchema: DerivedSchema,
                use: [
                    transform<z.infer<typeof SourceSchema>, z.infer<typeof DerivedSchema>>({
                        transform: (data) => data.items.map(item => item.name),
                    }),
                ],
            })

            const params = { filter: 'active' }
            const options = { enabled: true }

            derivedInstance.useState(params, options)

            expect(mockUseStateImpl).toHaveBeenCalledTimes(1)
            // First argument should be the derived instance
            expect(mockUseStateImpl.mock.calls[0][0]).toBe(derivedInstance)
        })
    })
})

describe('key-fetch getUseStateImpl before injection', () => {
    test('getUseStateImpl returns the current implementation', () => {
        // After injection in the beforeEach, it should exist
        const impl = getUseStateImpl()
        // This test is just to verify the getter works
        expect(typeof impl).toBe('function')
    })
})
