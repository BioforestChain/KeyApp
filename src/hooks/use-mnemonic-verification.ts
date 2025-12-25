import { useState, useCallback, useMemo, useEffect } from 'react'

/**
 * Fisher-Yates shuffle algorithm
 * Creates a randomly shuffled copy of the array
 */
export function fisherYatesShuffle<T>(arr: readonly T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1))
    const temp = result[randomIndex]
    result[randomIndex] = result[i]!
    result[i] = temp!
  }
  return result
}

/**
 * Select N random unique indices from a range
 */
export function selectRandomIndices(count: number, max: number): number[] {
  if (count > max) {
    throw new Error(`Cannot select ${count} indices from range 0-${max - 1}`)
  }
  const indices: number[] = []
  while (indices.length < count) {
    const randomIndex = Math.floor(Math.random() * max)
    if (!indices.includes(randomIndex)) {
      indices.push(randomIndex)
    }
  }
  return indices.sort((a, b) => a - b)
}

export interface VerificationSlot {
  /** Position in original mnemonic (0-indexed) */
  position: number
  /** Expected word at this position */
  expectedWord: string
  /** User's selected word (null if not selected) */
  selectedWord: string | null
  /** Whether selection is correct */
  isCorrect: boolean | null
}

export interface MnemonicVerificationState {
  /** Verification slots (4 random positions) */
  slots: VerificationSlot[]
  /** Shuffled candidate words */
  candidates: string[]
  /** Words that have been used */
  usedWords: Set<string>
  /** Whether all slots are correctly filled */
  isComplete: boolean
  /** Number of correct selections */
  correctCount: number
}

export interface UseMnemonicVerificationReturn {
  /** Current verification state */
  state: MnemonicVerificationState
  /** Select a word for the next empty slot */
  selectWord: (word: string) => void
  /** Deselect a word from a slot (for retry) */
  deselectSlot: (slotIndex: number) => void
  /** Reset verification with new random selections */
  reset: () => void
  /** Get next empty slot index (-1 if all filled) */
  nextEmptySlotIndex: number
}

const VERIFICATION_WORD_COUNT = 4

/**
 * Hook for mnemonic backup verification
 * Selects 4 random words and verifies user can identify them
 */
export function useMnemonicVerification(
  mnemonic: readonly string[],
): UseMnemonicVerificationReturn {
  // Generate initial verification state
  const generateState = useCallback((): MnemonicVerificationState => {
    // Handle empty or insufficient mnemonic
    if (mnemonic.length < VERIFICATION_WORD_COUNT) {
      return {
        slots: [],
        candidates: [],
        usedWords: new Set(),
        isComplete: false,
        correctCount: 0,
      }
    }

    const positions = selectRandomIndices(VERIFICATION_WORD_COUNT, mnemonic.length)
    const slots: VerificationSlot[] = positions.map((position) => ({
      position,
      expectedWord: mnemonic[position]!,
      selectedWord: null,
      isCorrect: null,
    }))
    const candidates = fisherYatesShuffle(mnemonic)
    return {
      slots,
      candidates,
      usedWords: new Set(),
      isComplete: false,
      correctCount: 0,
    }
  }, [mnemonic])

  const [state, setState] = useState<MnemonicVerificationState>(generateState)

  // Regenerate state when mnemonic changes (e.g., from empty to populated)
  useEffect(() => {
    if (mnemonic.length >= VERIFICATION_WORD_COUNT && state.slots.length === 0) {
      setState(generateState())
    }
  }, [mnemonic.length, state.slots.length, generateState])

  // Find next empty slot
  const nextEmptySlotIndex = useMemo(() => {
    return state.slots.findIndex((slot) => slot.selectedWord === null)
  }, [state.slots])

  // Select a word for the next empty slot
  const selectWord = useCallback(
    (word: string) => {
      if (nextEmptySlotIndex === -1) return
      if (state.usedWords.has(word)) return

      setState((prev) => {
        const newSlots = [...prev.slots]
        const slot = newSlots[nextEmptySlotIndex]!
        const isCorrect = word === slot.expectedWord

        newSlots[nextEmptySlotIndex] = {
          ...slot,
          selectedWord: word,
          isCorrect,
        }

        const newUsedWords = new Set(prev.usedWords)
        newUsedWords.add(word)

        const correctCount = newSlots.filter((s) => s.isCorrect === true).length
        const allFilled = newSlots.every((s) => s.selectedWord !== null)
        const isComplete = allFilled && correctCount === VERIFICATION_WORD_COUNT

        return {
          ...prev,
          slots: newSlots,
          usedWords: newUsedWords,
          isComplete,
          correctCount,
        }
      })
    },
    [nextEmptySlotIndex, state.usedWords],
  )

  // Deselect a word from a slot
  const deselectSlot = useCallback((slotIndex: number) => {
    setState((prev) => {
      const slot = prev.slots[slotIndex]
      if (!slot || slot.selectedWord === null) return prev

      const newSlots = [...prev.slots]
      const word = slot.selectedWord

      newSlots[slotIndex] = {
        ...slot,
        selectedWord: null,
        isCorrect: null,
      }

      const newUsedWords = new Set(prev.usedWords)
      newUsedWords.delete(word)

      const correctCount = newSlots.filter((s) => s.isCorrect === true).length

      return {
        ...prev,
        slots: newSlots,
        usedWords: newUsedWords,
        isComplete: false,
        correctCount,
      }
    })
  }, [])

  // Reset with new random selections
  const reset = useCallback(() => {
    setState(generateState())
  }, [generateState])

  return {
    state,
    selectWord,
    deselectSlot,
    reset,
    nextEmptySlotIndex,
  }
}
