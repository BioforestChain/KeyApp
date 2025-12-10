import { useState, useCallback, useMemo } from 'react'
import type { AssetInfo } from '@/types/asset'
import { isValidAddress } from '@/components/transfer/address-input'

/** Send flow step */
export type SendStep = 'input' | 'confirm' | 'sending' | 'result'

/** Send result status */
export type SendResultStatus = 'success' | 'failed' | 'pending'

/** Send flow state */
export interface SendState {
  /** Current step */
  step: SendStep
  /** Selected asset to send */
  asset: AssetInfo | null
  /** Recipient address */
  toAddress: string
  /** Amount to send (user-friendly format) */
  amount: string
  /** Address validation error */
  addressError: string | null
  /** Amount validation error */
  amountError: string | null
  /** Estimated fee amount */
  feeAmount: string
  /** Fee token symbol */
  feeSymbol: string
  /** Fee loading state */
  feeLoading: boolean
  /** Is submitting transaction */
  isSubmitting: boolean
  /** Result status */
  resultStatus: SendResultStatus | null
  /** Transaction hash */
  txHash: string | null
  /** Error message */
  errorMessage: string | null
}

interface UseSendOptions {
  /** Initial asset */
  initialAsset?: AssetInfo
  /** Mock mode (default: true) */
  useMock?: boolean
}

interface UseSendReturn {
  /** Current state */
  state: SendState
  /** Set recipient address */
  setToAddress: (address: string) => void
  /** Set amount */
  setAmount: (amount: string) => void
  /** Set asset */
  setAsset: (asset: AssetInfo) => void
  /** Validate and go to confirm */
  goToConfirm: () => boolean
  /** Go back to input */
  goBack: () => void
  /** Submit transaction */
  submit: () => Promise<void>
  /** Reset to initial state */
  reset: () => void
  /** Check if can proceed to confirm */
  canProceed: boolean
}

/** Mock fee estimation */
const MOCK_FEES: Record<string, { amount: string; symbol: string }> = {
  ETH: { amount: '0.002', symbol: 'ETH' },
  USDT: { amount: '0.003', symbol: 'ETH' },
  USDC: { amount: '0.003', symbol: 'ETH' },
  BTC: { amount: '0.0001', symbol: 'BTC' },
  TRX: { amount: '1', symbol: 'TRX' },
  BFM: { amount: '0.1', symbol: 'BFM' },
}

const initialState: SendState = {
  step: 'input',
  asset: null,
  toAddress: '',
  amount: '',
  addressError: null,
  amountError: null,
  feeAmount: '0',
  feeSymbol: '',
  feeLoading: false,
  isSubmitting: false,
  resultStatus: null,
  txHash: null,
  errorMessage: null,
}

/**
 * Hook for managing send flow state
 */
export function useSend(options: UseSendOptions = {}): UseSendReturn {
  const { initialAsset, useMock = true } = options

  const [state, setState] = useState<SendState>({
    ...initialState,
    asset: initialAsset ?? null,
  })

  // Validate address
  const validateAddress = useCallback((address: string): string | null => {
    if (!address.trim()) {
      return '请输入收款地址'
    }
    if (!isValidAddress(address)) {
      return '无效的地址格式'
    }
    return null
  }, [])

  // Validate amount
  const validateAmount = useCallback((amount: string, asset: AssetInfo | null): string | null => {
    if (!amount.trim()) {
      return '请输入金额'
    }
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      return '请输入有效金额'
    }
    if (asset) {
      // Calculate max balance from string amount
      const maxBalance = parseFloat(asset.amount) / Math.pow(10, asset.decimals)
      if (numAmount > maxBalance) {
        return '余额不足'
      }
    }
    return null
  }, [])

  // Set recipient address
  const setToAddress = useCallback((address: string) => {
    setState((prev) => ({
      ...prev,
      toAddress: address,
      addressError: null, // Clear error on change
    }))
  }, [])

  // Set amount
  const setAmount = useCallback((amount: string) => {
    setState((prev) => ({
      ...prev,
      amount,
      amountError: null, // Clear error on change
    }))
  }, [])

  // Set asset and estimate fee
  const setAsset = useCallback((asset: AssetInfo) => {
    setState((prev) => ({
      ...prev,
      asset,
      feeLoading: true,
    }))

    // Mock fee estimation delay
    setTimeout(() => {
      const fee = MOCK_FEES[asset.assetType] ?? { amount: '0.001', symbol: asset.assetType }
      setState((prev) => ({
        ...prev,
        feeAmount: fee.amount,
        feeSymbol: fee.symbol,
        feeLoading: false,
      }))
    }, 300)
  }, [])

  // Check if can proceed
  const canProceed = useMemo(() => {
    const { toAddress, amount, asset } = state
    return (
      toAddress.trim() !== '' &&
      amount.trim() !== '' &&
      asset !== null &&
      isValidAddress(toAddress) &&
      parseFloat(amount) > 0
    )
  }, [state])

  // Validate and go to confirm
  const goToConfirm = useCallback((): boolean => {
    const addressError = validateAddress(state.toAddress)
    const amountError = validateAmount(state.amount, state.asset)

    if (addressError || amountError) {
      setState((prev) => ({
        ...prev,
        addressError,
        amountError,
      }))
      return false
    }

    setState((prev) => ({
      ...prev,
      step: 'confirm',
      addressError: null,
      amountError: null,
    }))
    return true
  }, [state.toAddress, state.amount, state.asset, validateAddress, validateAmount])

  // Go back to input
  const goBack = useCallback(() => {
    setState((prev) => ({
      ...prev,
      step: 'input',
    }))
  }, [])

  // Submit transaction
  const submit = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      step: 'sending',
      isSubmitting: true,
    }))

    try {
      if (useMock) {
        // Mock transaction submission
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Random success/failure for testing
        const isSuccess = Math.random() > 0.2 // 80% success rate

        if (isSuccess) {
          setState((prev) => ({
            ...prev,
            step: 'result',
            isSubmitting: false,
            resultStatus: 'success',
            txHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
            errorMessage: null,
          }))
        } else {
          throw new Error('交易失败，请稍后重试')
        }
      } else {
        // TODO: Implement real transaction submission
        throw new Error('Real API not implemented')
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        step: 'result',
        isSubmitting: false,
        resultStatus: 'failed',
        txHash: null,
        errorMessage: error instanceof Error ? error.message : '未知错误',
      }))
    }
  }, [useMock])

  // Reset to initial state
  const reset = useCallback(() => {
    setState({
      ...initialState,
      asset: initialAsset ?? null,
    })
  }, [initialAsset])

  return {
    state,
    setToAddress,
    setAmount,
    setAsset,
    goToConfirm,
    goBack,
    submit,
    reset,
    canProceed,
  }
}
