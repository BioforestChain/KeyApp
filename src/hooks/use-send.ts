import { useState, useCallback, useMemo, useEffect } from 'react'
import type { AssetInfo } from '@/types/asset'
import { initialState, MOCK_FEES } from './use-send.constants'
import type { SendState, UseSendOptions, UseSendReturn } from './use-send.types'
import { parseAmountToBigInt } from './use-send.utils'
import { fetchBioforestBalance, fetchBioforestFee, submitBioforestTransfer } from './use-send.bioforest'
import { adjustAmountForFee, canProceedToConfirm, validateAddressInput, validateAmountInput } from './use-send.logic'
import { submitMockTransfer } from './use-send.mock'

/**
 * Hook for managing send flow state
 */
export function useSend(options: UseSendOptions = {}): UseSendReturn {
  const { initialAsset, useMock = true, walletId, fromAddress, chainConfig } = options

  const [state, setState] = useState<SendState>({
    ...initialState,
    asset: initialAsset ?? null,
  })

  const isBioforestChain = chainConfig?.type === 'bioforest'

  // Validate address
  const validateAddress = useCallback((address: string): string | null => {
    return validateAddressInput(address, isBioforestChain)
  }, [isBioforestChain])

  // Validate amount
  const validateAmount = useCallback((amount: string, asset: AssetInfo | null): string | null => {
    return validateAmountInput(amount, asset)
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

    if (useMock || !isBioforestChain || !chainConfig || !fromAddress) {
      // Mock fee estimation delay
      setTimeout(() => {
        const fee = MOCK_FEES[asset.assetType] ?? { amount: '0.001', symbol: asset.assetType }
        const feeRaw = parseAmountToBigInt(fee.amount, asset.decimals) ?? 0n
        setState((prev) => ({
          ...prev,
          feeAmount: fee.amount,
          feeAmountRaw: feeRaw.toString(),
          feeSymbol: fee.symbol,
          feeLoading: false,
        }))
      }, 300)
      return
    }

    void (async () => {
      try {
        const feeEstimate = await fetchBioforestFee(chainConfig, fromAddress)
        setState((prev) => ({
          ...prev,
          feeAmount: feeEstimate.formatted,
          feeAmountRaw: feeEstimate.raw,
          feeSymbol: feeEstimate.symbol,
          feeLoading: false,
        }))
      } catch (error) {
        setState((prev) => ({
          ...prev,
          feeLoading: false,
          errorMessage: error instanceof Error ? error.message : '获取手续费失败',
        }))
      }
    })()
  }, [chainConfig, fromAddress, isBioforestChain, useMock])

  useEffect(() => {
    if (useMock || !isBioforestChain || !chainConfig || !fromAddress) return

    let cancelled = false

    void (async () => {
      try {
        const balanceAsset = await fetchBioforestBalance(chainConfig, fromAddress)
        if (cancelled) return

        setState((prev) => ({
          ...prev,
          asset: balanceAsset,
        }))
      } catch {
        if (cancelled) return
      }
    })()

    return () => {
      cancelled = true
    }
  }, [chainConfig, fromAddress, isBioforestChain, useMock])

  // Check if can proceed
  const canProceed = useMemo(() => {
    return canProceedToConfirm({
      toAddress: state.toAddress,
      amount: state.amount,
      asset: state.asset,
      isBioforestChain,
    })
  }, [isBioforestChain, state.amount, state.asset, state.toAddress])

  // Validate and go to confirm
  const goToConfirm = useCallback((): boolean => {
    const addressError = validateAddress(state.toAddress)
    const amountError = state.asset ? validateAmount(state.amount, state.asset) : '请选择资产'

    if (addressError || amountError) {
      setState((prev) => ({
        ...prev,
        addressError,
        amountError,
      }))
      return false
    }

    if (state.asset) {
      const adjustResult = adjustAmountForFee(state.amount, state.asset, state.feeAmountRaw)
      if (adjustResult.status === 'error') {
        setState((prev) => ({
          ...prev,
          amountError: adjustResult.message,
        }))
        return false
      }
      if (adjustResult.adjustedAmount !== undefined) {
        setState((prev) => ({
          ...prev,
          amount: adjustResult.adjustedAmount,
        }))
      }
    }

    setState((prev) => ({
      ...prev,
      step: 'confirm',
      addressError: null,
      amountError: null,
    }))
    return true
  }, [state.toAddress, state.amount, state.asset, state.feeAmountRaw, validateAddress, validateAmount])

  // Go back to input
  const goBack = useCallback(() => {
    setState((prev) => ({
      ...prev,
      step: 'input',
    }))
  }, [])

  // Submit transaction
  const submit = useCallback(async (password: string) => {
    if (useMock) {
      const result = await submitMockTransfer(setState)
      return result.status === 'ok' ? { status: 'ok' as const } : { status: 'error' as const }
    }

    if (!chainConfig || chainConfig.type !== 'bioforest') {
      setState((prev) => ({
        ...prev,
        step: 'result',
        isSubmitting: false,
        resultStatus: 'failed',
        txHash: null,
        errorMessage: '当前链暂不支持真实转账',
      }))
      return { status: 'error' as const }
    }

    if (!walletId || !fromAddress || !state.asset) {
      setState((prev) => ({
        ...prev,
        step: 'result',
        isSubmitting: false,
        resultStatus: 'failed',
        txHash: null,
        errorMessage: '钱包信息不完整',
      }))
      return { status: 'error' as const }
    }

    const addressError = validateAddress(state.toAddress)
    const amountError = validateAmount(state.amount, state.asset)
    if (addressError || amountError) {
      setState((prev) => ({
        ...prev,
        addressError,
        amountError,
      }))
      return { status: 'error' as const }
    }

    setState((prev) => ({
      ...prev,
      step: 'sending',
      isSubmitting: true,
      errorMessage: null,
    }))

    const result = await submitBioforestTransfer({
      chainConfig,
      walletId,
      password,
      fromAddress,
      toAddress: state.toAddress,
      amount: state.amount,
      decimals: state.asset.decimals,
    })

    if (result.status === 'password') {
      setState((prev) => ({
        ...prev,
        step: 'confirm',
        isSubmitting: false,
      }))
      return { status: 'password' as const }
    }

    if (result.status === 'error') {
      setState((prev) => ({
        ...prev,
        step: 'result',
        isSubmitting: false,
        resultStatus: 'failed',
        txHash: null,
        errorMessage: result.message,
      }))
      return { status: 'error' as const }
    }

    setState((prev) => ({
      ...prev,
      step: 'result',
      isSubmitting: false,
      resultStatus: 'success',
      txHash: result.txHash,
      errorMessage: null,
    }))

    return { status: 'ok' as const }
  }, [chainConfig, fromAddress, state.amount, state.asset, state.toAddress, useMock, validateAddress, validateAmount, walletId])

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
