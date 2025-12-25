import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useMnemonicVerification,
  fisherYatesShuffle,
  selectRandomIndices,
} from './use-mnemonic-verification'

describe('fisherYatesShuffle', () => {
  it('returns array of same length', () => {
    const arr = [1, 2, 3, 4, 5]
    const shuffled = fisherYatesShuffle(arr)
    expect(shuffled).toHaveLength(arr.length)
  })

  it('contains all original elements', () => {
    const arr = ['a', 'b', 'c', 'd', 'e']
    const shuffled = fisherYatesShuffle(arr)
    expect(shuffled.sort()).toEqual(arr.sort())
  })

  it('does not modify original array', () => {
    const arr = [1, 2, 3, 4, 5]
    const original = [...arr]
    fisherYatesShuffle(arr)
    expect(arr).toEqual(original)
  })

  it('produces different orderings', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const results = new Set<string>()
    // Run multiple times to check randomness
    for (let i = 0; i < 10; i++) {
      results.add(fisherYatesShuffle(arr).join(','))
    }
    // Should produce at least some different orderings
    expect(results.size).toBeGreaterThan(1)
  })
})

describe('selectRandomIndices', () => {
  it('returns correct count of indices', () => {
    const indices = selectRandomIndices(4, 12)
    expect(indices).toHaveLength(4)
  })

  it('returns unique indices', () => {
    const indices = selectRandomIndices(4, 12)
    const unique = new Set(indices)
    expect(unique.size).toBe(4)
  })

  it('returns sorted indices', () => {
    const indices = selectRandomIndices(4, 12)
    const sorted = [...indices].sort((a, b) => a - b)
    expect(indices).toEqual(sorted)
  })

  it('returns indices within range', () => {
    const indices = selectRandomIndices(4, 12)
    indices.forEach((i) => {
      expect(i).toBeGreaterThanOrEqual(0)
      expect(i).toBeLessThan(12)
    })
  })

  it('throws error if count exceeds max', () => {
    expect(() => selectRandomIndices(10, 5)).toThrow()
  })
})

describe('useMnemonicVerification', () => {
  it('handles empty mnemonic without throwing', () => {
    const { result } = renderHook(() => useMnemonicVerification([]))
    expect(result.current.state.slots).toHaveLength(0)
    expect(result.current.state.candidates).toHaveLength(0)
    expect(result.current.state.isComplete).toBe(false)
  })

  it('handles mnemonic with fewer than 4 words without throwing', () => {
    const { result } = renderHook(() => useMnemonicVerification(['word1', 'word2', 'word3']))
    expect(result.current.state.slots).toHaveLength(0)
    expect(result.current.state.candidates).toHaveLength(0)
  })

  const testMnemonic = [
    'abandon',
    'ability',
    'able',
    'about',
    'above',
    'absent',
    'absorb',
    'abstract',
    'absurd',
    'abuse',
    'access',
    'accident',
  ]

  it('initializes with 4 verification slots', () => {
    const { result } = renderHook(() => useMnemonicVerification(testMnemonic))
    expect(result.current.state.slots).toHaveLength(4)
  })

  it('slots have correct expected words from mnemonic positions', () => {
    const { result } = renderHook(() => useMnemonicVerification(testMnemonic))
    result.current.state.slots.forEach((slot) => {
      expect(slot.expectedWord).toBe(testMnemonic[slot.position])
    })
  })

  it('candidates contain all mnemonic words (shuffled)', () => {
    const { result } = renderHook(() => useMnemonicVerification(testMnemonic))
    const candidates = result.current.state.candidates
    expect(candidates.sort()).toEqual([...testMnemonic].sort())
  })

  it('initial state is not complete', () => {
    const { result } = renderHook(() => useMnemonicVerification(testMnemonic))
    expect(result.current.state.isComplete).toBe(false)
    expect(result.current.state.correctCount).toBe(0)
  })

  it('nextEmptySlotIndex starts at 0', () => {
    const { result } = renderHook(() => useMnemonicVerification(testMnemonic))
    expect(result.current.nextEmptySlotIndex).toBe(0)
  })

  describe('selectWord', () => {
    it('fills the next empty slot', () => {
      const { result } = renderHook(() => useMnemonicVerification(testMnemonic))
      const firstSlot = result.current.state.slots[0]!
      const wordToSelect = firstSlot.expectedWord

      act(() => {
        result.current.selectWord(wordToSelect)
      })

      expect(result.current.state.slots[0]!.selectedWord).toBe(wordToSelect)
    })

    it('marks correct selection as correct', () => {
      const { result } = renderHook(() => useMnemonicVerification(testMnemonic))
      const firstSlot = result.current.state.slots[0]!
      const correctWord = firstSlot.expectedWord

      act(() => {
        result.current.selectWord(correctWord)
      })

      expect(result.current.state.slots[0]!.isCorrect).toBe(true)
      expect(result.current.state.correctCount).toBe(1)
    })

    it('marks incorrect selection as incorrect', () => {
      const { result } = renderHook(() => useMnemonicVerification(testMnemonic))
      const firstSlot = result.current.state.slots[0]!
      // Find a word that is NOT the expected word
      const wrongWord = testMnemonic.find((w) => w !== firstSlot.expectedWord)!

      act(() => {
        result.current.selectWord(wrongWord)
      })

      expect(result.current.state.slots[0]!.isCorrect).toBe(false)
      expect(result.current.state.correctCount).toBe(0)
    })

    it('adds selected word to usedWords', () => {
      const { result } = renderHook(() => useMnemonicVerification(testMnemonic))
      const firstSlot = result.current.state.slots[0]!

      act(() => {
        result.current.selectWord(firstSlot.expectedWord)
      })

      expect(result.current.state.usedWords.has(firstSlot.expectedWord)).toBe(true)
    })

    it('prevents selecting already used word', () => {
      const { result } = renderHook(() => useMnemonicVerification(testMnemonic))
      const firstSlot = result.current.state.slots[0]!

      act(() => {
        result.current.selectWord(firstSlot.expectedWord)
      })

      // Try to select same word again
      act(() => {
        result.current.selectWord(firstSlot.expectedWord)
      })

      // Should still be on second slot
      expect(result.current.nextEmptySlotIndex).toBe(1)
    })

    it('advances nextEmptySlotIndex after selection', () => {
      const { result } = renderHook(() => useMnemonicVerification(testMnemonic))

      act(() => {
        result.current.selectWord(testMnemonic[0]!)
      })

      expect(result.current.nextEmptySlotIndex).toBe(1)
    })

    it('completes when all 4 correct words selected', () => {
      const { result } = renderHook(() => useMnemonicVerification(testMnemonic))

      // Get expected words first (slots are stable after init)
      const expectedWords = result.current.state.slots.map((s) => s.expectedWord)

      // Select all correct words (each in separate act to get updated state)
      expectedWords.forEach((word) => {
        act(() => {
          result.current.selectWord(word)
        })
      })

      expect(result.current.state.isComplete).toBe(true)
      expect(result.current.state.correctCount).toBe(4)
    })

    it('does not complete if any word is wrong', () => {
      const { result } = renderHook(() => useMnemonicVerification(testMnemonic))
      const slots = result.current.state.slots

      // Select 3 correct and 1 wrong
      act(() => {
        result.current.selectWord(slots[0]!.expectedWord)
        result.current.selectWord(slots[1]!.expectedWord)
        result.current.selectWord(slots[2]!.expectedWord)
        // Find wrong word for slot 3
        const wrongWord = testMnemonic.find(
          (w) =>
            w !== slots[3]!.expectedWord &&
            !result.current.state.usedWords.has(w),
        )!
        result.current.selectWord(wrongWord)
      })

      expect(result.current.state.isComplete).toBe(false)
    })
  })

  describe('deselectSlot', () => {
    it('clears selected word from slot', () => {
      const { result } = renderHook(() => useMnemonicVerification(testMnemonic))
      const firstSlot = result.current.state.slots[0]!

      act(() => {
        result.current.selectWord(firstSlot.expectedWord)
      })

      act(() => {
        result.current.deselectSlot(0)
      })

      expect(result.current.state.slots[0]!.selectedWord).toBeNull()
      expect(result.current.state.slots[0]!.isCorrect).toBeNull()
    })

    it('removes word from usedWords', () => {
      const { result } = renderHook(() => useMnemonicVerification(testMnemonic))
      const firstSlot = result.current.state.slots[0]!

      act(() => {
        result.current.selectWord(firstSlot.expectedWord)
      })

      act(() => {
        result.current.deselectSlot(0)
      })

      expect(result.current.state.usedWords.has(firstSlot.expectedWord)).toBe(false)
    })

    it('allows reselecting after deselect', () => {
      const { result } = renderHook(() => useMnemonicVerification(testMnemonic))
      const firstSlot = result.current.state.slots[0]!

      // Select, deselect, reselect
      act(() => {
        result.current.selectWord(firstSlot.expectedWord)
      })
      act(() => {
        result.current.deselectSlot(0)
      })
      act(() => {
        result.current.selectWord(firstSlot.expectedWord)
      })

      expect(result.current.state.slots[0]!.selectedWord).toBe(firstSlot.expectedWord)
    })

    it('sets isComplete to false when deselecting', () => {
      const { result } = renderHook(() => useMnemonicVerification(testMnemonic))

      // Get expected words first
      const expectedWords = result.current.state.slots.map((s) => s.expectedWord)

      // Complete verification (each in separate act)
      expectedWords.forEach((word) => {
        act(() => {
          result.current.selectWord(word)
        })
      })

      expect(result.current.state.isComplete).toBe(true)

      // Deselect one
      act(() => {
        result.current.deselectSlot(0)
      })

      expect(result.current.state.isComplete).toBe(false)
    })
  })

  describe('reset', () => {
    it('generates new random slots', () => {
      const { result } = renderHook(() => useMnemonicVerification(testMnemonic))
      const initialPositions = result.current.state.slots.map((s) => s.position)

      // Reset multiple times to ensure we get different positions
      let foundDifferent = false
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.reset()
        })
        const newPositions = result.current.state.slots.map((s) => s.position)
        if (newPositions.join(',') !== initialPositions.join(',')) {
          foundDifferent = true
          break
        }
      }

      expect(foundDifferent).toBe(true)
    })

    it('clears all selections', () => {
      const { result } = renderHook(() => useMnemonicVerification(testMnemonic))

      // Make some selections
      act(() => {
        result.current.selectWord(testMnemonic[0]!)
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.state.usedWords.size).toBe(0)
      expect(result.current.state.isComplete).toBe(false)
      expect(result.current.nextEmptySlotIndex).toBe(0)
    })
  })
})
