import { useMemo, useState, useCallback } from 'react'
import { deriveAllAddresses, type DerivedKey } from '@/lib/crypto/derivation'
import { validateMnemonic } from '@/lib/crypto/mnemonic'

export interface MultiChainAddressResult {
  /** All generated addresses */
  addresses: DerivedKey[]
  /** Whether generation is in progress */
  isGenerating: boolean
  /** Error message if generation failed */
  error: string | null
  /** Generate addresses from mnemonic */
  generate: (mnemonic: string[]) => Promise<DerivedKey[]>
  /** Clear results */
  clear: () => void
}

/**
 * Hook for generating addresses for all chains from a mnemonic
 * Used for duplicate detection during wallet recovery
 */
export function useMultiChainAddressGeneration(): MultiChainAddressResult {
  const [addresses, setAddresses] = useState<DerivedKey[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (mnemonic: string[]): Promise<DerivedKey[]> => {
    setIsGenerating(true)
    setError(null)

    try {
      // Validate mnemonic first
      if (!validateMnemonic(mnemonic)) {
        throw new Error('Invalid mnemonic')
      }

      const mnemonicString = mnemonic.join(' ')

      // Generate addresses for all chains
      // This is done synchronously but wrapped in promise for consistency
      const results = deriveAllAddresses(mnemonicString)

      setAddresses(results)
      return results
    } catch (err) {
      const message = err instanceof Error ? err.message : '地址生成失败'
      setError(message)
      return []
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const clear = useCallback(() => {
    setAddresses([])
    setError(null)
  }, [])

  return {
    addresses,
    isGenerating,
    error,
    generate,
    clear,
  }
}

/**
 * Synchronous address generation from mnemonic (for non-React contexts)
 */
export function generateAllAddresses(mnemonic: string[]): DerivedKey[] {
  if (!validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic')
  }
  return deriveAllAddresses(mnemonic.join(' '))
}

/**
 * Get all addresses as a Set for efficient lookup
 */
export function getAddressSet(keys: DerivedKey[]): Set<string> {
  return new Set(keys.map((k) => k.address.toLowerCase()))
}
