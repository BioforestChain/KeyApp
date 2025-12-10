import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useSend } from './use-send'
import type { AssetInfo } from '@/types/asset'

const mockAsset: AssetInfo = {
  assetType: 'ETH',
  name: 'Ethereum',
  amount: '1000000000000000000', // 1 ETH
  decimals: 18,
}

describe('useSend', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Initial state', () => {
    it('starts with input step', () => {
      const { result } = renderHook(() => useSend())
      expect(result.current.state.step).toBe('input')
    })

    it('starts with empty values', () => {
      const { result } = renderHook(() => useSend())
      expect(result.current.state.toAddress).toBe('')
      expect(result.current.state.amount).toBe('')
      expect(result.current.state.asset).toBeNull()
    })

    it('uses initial asset if provided', () => {
      const { result } = renderHook(() => useSend({ initialAsset: mockAsset }))
      expect(result.current.state.asset).toEqual(mockAsset)
    })
  })

  describe('setToAddress', () => {
    it('updates address', () => {
      const { result } = renderHook(() => useSend())
      act(() => {
        result.current.setToAddress('0x1234567890abcdef1234567890abcdef12345678')
      })
      expect(result.current.state.toAddress).toBe('0x1234567890abcdef1234567890abcdef12345678')
    })

    it('clears address error on change', () => {
      const { result } = renderHook(() => useSend())
      // Trigger validation error first
      act(() => {
        result.current.goToConfirm()
      })
      expect(result.current.state.addressError).not.toBeNull()

      // Now set valid address
      act(() => {
        result.current.setToAddress('0x1234567890abcdef1234567890abcdef12345678')
      })
      expect(result.current.state.addressError).toBeNull()
    })
  })

  describe('setAmount', () => {
    it('updates amount', () => {
      const { result } = renderHook(() => useSend())
      act(() => {
        result.current.setAmount('1.5')
      })
      expect(result.current.state.amount).toBe('1.5')
    })

    it('clears amount error on change', () => {
      const { result } = renderHook(() => useSend({ initialAsset: mockAsset }))
      // Set valid address but empty amount
      act(() => {
        result.current.setToAddress('0x1234567890abcdef1234567890abcdef12345678')
        result.current.goToConfirm()
      })
      expect(result.current.state.amountError).not.toBeNull()

      // Now set amount
      act(() => {
        result.current.setAmount('0.5')
      })
      expect(result.current.state.amountError).toBeNull()
    })
  })

  describe('setAsset', () => {
    it('updates asset and estimates fee', async () => {
      const { result } = renderHook(() => useSend())

      act(() => {
        result.current.setAsset(mockAsset)
      })
      expect(result.current.state.asset).toEqual(mockAsset)
      expect(result.current.state.feeLoading).toBe(true)

      // Wait for fee estimation
      act(() => {
        vi.advanceTimersByTime(300)
      })

      expect(result.current.state.feeLoading).toBe(false)
      expect(result.current.state.feeAmount).toBe('0.002')
      expect(result.current.state.feeSymbol).toBe('ETH')
    })
  })

  describe('canProceed', () => {
    it('returns false when address is empty', () => {
      const { result } = renderHook(() => useSend({ initialAsset: mockAsset }))
      act(() => {
        result.current.setAmount('1')
      })
      expect(result.current.canProceed).toBe(false)
    })

    it('returns false when amount is empty', () => {
      const { result } = renderHook(() => useSend({ initialAsset: mockAsset }))
      act(() => {
        result.current.setToAddress('0x1234567890abcdef1234567890abcdef12345678')
      })
      expect(result.current.canProceed).toBe(false)
    })

    it('returns false when asset is null', () => {
      const { result } = renderHook(() => useSend())
      act(() => {
        result.current.setToAddress('0x1234567890abcdef1234567890abcdef12345678')
        result.current.setAmount('1')
      })
      expect(result.current.canProceed).toBe(false)
    })

    it('returns true when all fields are valid', () => {
      const { result } = renderHook(() => useSend({ initialAsset: mockAsset }))
      act(() => {
        result.current.setToAddress('0x1234567890abcdef1234567890abcdef12345678')
        result.current.setAmount('0.5')
      })
      expect(result.current.canProceed).toBe(true)
    })
  })

  describe('goToConfirm', () => {
    it('returns false and sets error for empty address', () => {
      const { result } = renderHook(() => useSend({ initialAsset: mockAsset }))
      act(() => {
        result.current.setAmount('1')
      })

      let success: boolean
      act(() => {
        success = result.current.goToConfirm()
      })

      expect(success!).toBe(false)
      expect(result.current.state.addressError).toBe('请输入收款地址')
      expect(result.current.state.step).toBe('input')
    })

    it('returns false and sets error for invalid address', () => {
      const { result } = renderHook(() => useSend({ initialAsset: mockAsset }))
      act(() => {
        result.current.setToAddress('invalid')
        result.current.setAmount('1')
      })

      let success: boolean
      act(() => {
        success = result.current.goToConfirm()
      })

      expect(success!).toBe(false)
      expect(result.current.state.addressError).toBe('无效的地址格式')
    })

    it('returns false and sets error for empty amount', () => {
      const { result } = renderHook(() => useSend({ initialAsset: mockAsset }))
      act(() => {
        result.current.setToAddress('0x1234567890abcdef1234567890abcdef12345678')
      })

      let success: boolean
      act(() => {
        success = result.current.goToConfirm()
      })

      expect(success!).toBe(false)
      expect(result.current.state.amountError).toBe('请输入金额')
    })

    it('returns false for insufficient balance', () => {
      const { result } = renderHook(() => useSend({ initialAsset: mockAsset }))
      act(() => {
        result.current.setToAddress('0x1234567890abcdef1234567890abcdef12345678')
        result.current.setAmount('10') // More than 1 ETH balance
      })

      let success: boolean
      act(() => {
        success = result.current.goToConfirm()
      })

      expect(success!).toBe(false)
      expect(result.current.state.amountError).toBe('余额不足')
    })

    it('returns true and goes to confirm for valid input', () => {
      const { result } = renderHook(() => useSend({ initialAsset: mockAsset }))
      act(() => {
        result.current.setToAddress('0x1234567890abcdef1234567890abcdef12345678')
        result.current.setAmount('0.5')
      })

      let success: boolean
      act(() => {
        success = result.current.goToConfirm()
      })

      expect(success!).toBe(true)
      expect(result.current.state.step).toBe('confirm')
    })
  })

  describe('goBack', () => {
    it('returns to input step', () => {
      const { result } = renderHook(() => useSend({ initialAsset: mockAsset }))
      // Go to confirm first
      act(() => {
        result.current.setToAddress('0x1234567890abcdef1234567890abcdef12345678')
        result.current.setAmount('0.5')
      })
      act(() => {
        result.current.goToConfirm()
      })
      expect(result.current.state.step).toBe('confirm')

      act(() => {
        result.current.goBack()
      })
      expect(result.current.state.step).toBe('input')
    })
  })

  describe('submit', () => {
    it('transitions to sending then result', async () => {
      vi.useRealTimers() // Need real timers for async

      const { result } = renderHook(() => useSend({ initialAsset: mockAsset }))
      act(() => {
        result.current.setToAddress('0x1234567890abcdef1234567890abcdef12345678')
        result.current.setAmount('0.5')
        result.current.goToConfirm()
      })

      // Start submit
      act(() => {
        result.current.submit()
      })

      expect(result.current.state.step).toBe('sending')
      expect(result.current.state.isSubmitting).toBe(true)

      // Wait for completion
      await waitFor(() => {
        expect(result.current.state.step).toBe('result')
      }, { timeout: 3000 })

      expect(result.current.state.isSubmitting).toBe(false)
      expect(result.current.state.resultStatus).toBeDefined()
    })
  })

  describe('reset', () => {
    it('resets to initial state', () => {
      const { result } = renderHook(() => useSend({ initialAsset: mockAsset }))
      act(() => {
        result.current.setToAddress('0x1234567890abcdef1234567890abcdef12345678')
        result.current.setAmount('0.5')
        result.current.goToConfirm()
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.state.step).toBe('input')
      expect(result.current.state.toAddress).toBe('')
      expect(result.current.state.amount).toBe('')
      expect(result.current.state.asset).toEqual(mockAsset) // Keeps initial asset
    })
  })
})
