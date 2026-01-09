import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useBurn } from './use-burn'
import { Amount } from '@/types/amount'
import type { AssetInfo } from '@/types/asset'

const mockAsset: AssetInfo = {
  assetType: 'TEST',
  name: 'Test Token',
  amount: Amount.fromFormatted('100', 8, 'TEST'),
  decimals: 8,
}

describe('useBurn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('initializes with default state', () => {
      const { result } = renderHook(() => useBurn())

      expect(result.current.state.step).toBe('input')
      expect(result.current.state.asset).toBeNull()
      expect(result.current.state.amount).toBeNull()
      expect(result.current.state.recipientAddress).toBeNull()
      expect(result.current.canProceed).toBe(false)
    })

    it('initializes with initial asset', () => {
      const { result } = renderHook(() =>
        useBurn({ initialAsset: mockAsset })
      )

      expect(result.current.state.asset).toEqual(mockAsset)
    })
  })

  describe('setAmount', () => {
    it('sets amount correctly', () => {
      const { result } = renderHook(() =>
        useBurn({ initialAsset: mockAsset })
      )

      const newAmount = Amount.fromFormatted('50', 8, 'TEST')
      act(() => {
        result.current.setAmount(newAmount)
      })

      expect(result.current.state.amount?.toFormatted()).toBe('50')
    })

    it('clears amount error on change', () => {
      const { result } = renderHook(() =>
        useBurn({ initialAsset: mockAsset })
      )

      // Set invalid amount first
      act(() => {
        result.current.setAmount(Amount.fromFormatted('0', 8, 'TEST'))
      })

      // Try to proceed (will set error)
      act(() => {
        result.current.goToConfirm()
      })

      // Set new amount should clear error
      act(() => {
        result.current.setAmount(Amount.fromFormatted('10', 8, 'TEST'))
      })

      expect(result.current.state.amountError).toBeNull()
    })
  })

  describe('setAsset', () => {
    it('sets asset and fetches fee in mock mode', async () => {
      const { result } = renderHook(() => useBurn({ useMock: true }))

      act(() => {
        result.current.setAsset(mockAsset)
      })

      await waitFor(() => {
        expect(result.current.state.asset).toEqual(mockAsset)
        expect(result.current.state.feeLoading).toBe(false)
      })
    })
  })

  describe('goToConfirm', () => {
    it('validates amount is positive', async () => {
      const { result } = renderHook(() =>
        useBurn({ initialAsset: mockAsset, useMock: true })
      )

      await waitFor(() => {
        expect(result.current.state.feeLoading).toBe(false)
      })

      // Set zero amount
      act(() => {
        result.current.setAmount(Amount.fromFormatted('0', 8, 'TEST'))
      })

      let success: boolean
      act(() => {
        success = result.current.goToConfirm()
      })

      expect(success!).toBe(false)
      expect(result.current.state.amountError).toBeTruthy()
    })

    it('validates amount is not greater than balance', async () => {
      const { result } = renderHook(() =>
        useBurn({ initialAsset: mockAsset, useMock: true })
      )

      await waitFor(() => {
        expect(result.current.state.feeLoading).toBe(false)
      })

      // Set amount greater than balance (100)
      act(() => {
        result.current.setAmount(Amount.fromFormatted('150', 8, 'TEST'))
      })

      let success: boolean
      act(() => {
        success = result.current.goToConfirm()
      })

      expect(success!).toBe(false)
      expect(result.current.state.amountError).toBeTruthy()
    })

    it('proceeds to confirm with valid data', async () => {
      const { result } = renderHook(() =>
        useBurn({ initialAsset: mockAsset, useMock: true })
      )

      await waitFor(() => {
        expect(result.current.state.feeLoading).toBe(false)
      })

      // Set valid amount
      act(() => {
        result.current.setAmount(Amount.fromFormatted('50', 8, 'TEST'))
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
    it('returns to input step', async () => {
      const { result } = renderHook(() =>
        useBurn({ initialAsset: mockAsset, useMock: true })
      )

      await waitFor(() => {
        expect(result.current.state.feeLoading).toBe(false)
      })

      // Go to confirm
      act(() => {
        result.current.setAmount(Amount.fromFormatted('50', 8, 'TEST'))
        result.current.goToConfirm()
      })

      expect(result.current.state.step).toBe('confirm')

      // Go back
      act(() => {
        result.current.goBack()
      })

      expect(result.current.state.step).toBe('input')
    })
  })

  describe('submit (mock mode)', () => {
    it('submits successfully in mock mode', async () => {
      const { result } = renderHook(() =>
        useBurn({ initialAsset: mockAsset, useMock: true })
      )

      await waitFor(() => {
        expect(result.current.state.feeLoading).toBe(false)
      })

      // Setup
      act(() => {
        result.current.setAmount(Amount.fromFormatted('50', 8, 'TEST'))
        result.current.goToConfirm()
      })

      // Submit
      let submitResult: Awaited<ReturnType<typeof result.current.submit>>
      await act(async () => {
        submitResult = await result.current.submit('password')
      })

      expect(submitResult!.status).toBe('ok')
      expect(result.current.state.step).toBe('result')
      expect(result.current.state.resultStatus).toBe('success')
    })
  })

  describe('reset', () => {
    it('resets to initial state', async () => {
      const { result } = renderHook(() =>
        useBurn({ initialAsset: mockAsset, useMock: true })
      )

      await waitFor(() => {
        expect(result.current.state.feeLoading).toBe(false)
      })

      // Make changes
      act(() => {
        result.current.setAmount(Amount.fromFormatted('50', 8, 'TEST'))
        result.current.goToConfirm()
      })

      // Reset
      act(() => {
        result.current.reset()
      })

      expect(result.current.state.step).toBe('input')
      expect(result.current.state.amount).toBeNull()
    })
  })

  describe('canProceed', () => {
    it('returns false without asset', () => {
      const { result } = renderHook(() => useBurn())
      expect(result.current.canProceed).toBe(false)
    })

    it('returns false without amount', async () => {
      const { result } = renderHook(() =>
        useBurn({ initialAsset: mockAsset, useMock: true })
      )

      await waitFor(() => {
        expect(result.current.state.feeLoading).toBe(false)
      })

      expect(result.current.canProceed).toBe(false)
    })

    it('returns true with valid asset and amount', async () => {
      const { result } = renderHook(() =>
        useBurn({ initialAsset: mockAsset, useMock: true })
      )

      await waitFor(() => {
        expect(result.current.state.feeLoading).toBe(false)
      })

      act(() => {
        result.current.setAmount(Amount.fromFormatted('50', 8, 'TEST'))
      })

      expect(result.current.canProceed).toBe(true)
    })
  })
})
