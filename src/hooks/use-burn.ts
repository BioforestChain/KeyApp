/**
 * Hook for managing burn (destroy asset) flow state
 * 
 * Only supports BioForest chains. Main asset cannot be destroyed.
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import type { AssetInfo } from '@/types/asset'
import { Amount } from '@/types/amount'
import type { BurnState, UseBurnOptions, UseBurnReturn, BurnSubmitResult } from './use-burn.types'
import { fetchAssetApplyAddress, fetchBioforestBurnFee, submitBioforestBurn } from './use-burn.bioforest'

const initialState: BurnState = {
  step: 'input',
  asset: null,
  amount: null,
  amountError: null,
  recipientAddress: null,
  feeAmount: null,
  feeMinAmount: null,
  feeSymbol: '',
  feeLoading: false,
  isSubmitting: false,
  resultStatus: null,
  txHash: null,
  errorMessage: null,
}

// Mock fee for non-bioforest or mock mode
const MOCK_FEE = { amount: '0.001', symbol: 'BFM' }

/**
 * Validate amount input
 */
function validateAmountInput(amount: Amount | null, asset: AssetInfo | null): string | null {
  if (!amount || !asset) return null

  if (!amount.isPositive()) {
    return '请输入有效金额'
  }

  const balance = asset.amount
  if (amount.gt(balance)) {
    return '销毁数量不能大于余额'
  }

  return null
}

/**
 * Hook for managing burn flow
 */
export function useBurn(options: UseBurnOptions = {}): UseBurnReturn {
  const {
    initialAsset,
    assetLocked = false,
    useMock = true,
    walletId,
    fromAddress,
    chainConfig
  } = options

  const [state, setState] = useState<BurnState>({
    ...initialState,
    asset: initialAsset ?? null,
  })

  const isBioforestChain = chainConfig?.chainKind === 'bioforest'

  // Validate amount
  const validateAmount = useCallback((amount: Amount | null, asset: AssetInfo | null): string | null => {
    return validateAmountInput(amount, asset)
  }, [])

  // Set amount
  const setAmount = useCallback((amount: Amount | null) => {
    setState((prev) => ({
      ...prev,
      amount,
      amountError: null,
    }))
  }, [])

  // Set asset and fetch applyAddress + fee
  const setAsset = useCallback((asset: AssetInfo) => {
    setState((prev) => ({
      ...prev,
      asset,
      amount: null,
      amountError: null,
      feeLoading: true,
      recipientAddress: null,
    }))

    const shouldUseMock = useMock || !isBioforestChain || !chainConfig || !fromAddress

    if (shouldUseMock) {
      // Mock mode
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          recipientAddress: 'mock_apply_address',
          feeAmount: Amount.fromFormatted(MOCK_FEE.amount, asset.decimals, MOCK_FEE.symbol),
          feeMinAmount: Amount.fromFormatted(MOCK_FEE.amount, asset.decimals, MOCK_FEE.symbol),
          feeSymbol: chainConfig?.symbol ?? MOCK_FEE.symbol,
          feeLoading: false,
        }))
      }, 300)
      return
    }

    // Real mode - fetch applyAddress and fee
    void (async () => {
      try {
        // Fetch asset's applyAddress
        const applyAddress = await fetchAssetApplyAddress(chainConfig, asset.assetType, fromAddress)
        if (!applyAddress) {
          setState((prev) => ({
            ...prev,
            feeLoading: false,
            errorMessage: '无法获取资产发行地址',
          }))
          return
        }

        // Fetch fee (use placeholder amount for fee calculation)
        const feeResult = await fetchBioforestBurnFee(chainConfig, asset.assetType, '1')

        setState((prev) => ({
          ...prev,
          recipientAddress: applyAddress,
          feeAmount: feeResult.amount,
          feeMinAmount: feeResult.amount,
          feeSymbol: feeResult.symbol,
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

  // Initialize with initial asset
  useEffect(() => {
    if (initialAsset && !state.recipientAddress) {
      setAsset(initialAsset)
    }
  }, [initialAsset, setAsset, state.recipientAddress])

  // Check if can proceed
  const canProceed = useMemo(() => {
    return !!(
      state.asset &&
      state.amount &&
      state.amount.isPositive() &&
      state.recipientAddress &&
      !state.feeLoading
    )
  }, [state.amount, state.asset, state.recipientAddress, state.feeLoading])

  // Validate and go to confirm
  const goToConfirm = useCallback((): boolean => {
    const amountError = validateAmount(state.amount, state.asset)

    if (amountError) {
      setState((prev) => ({
        ...prev,
        amountError,
      }))
      return false
    }

    if (!state.recipientAddress) {
      setState((prev) => ({
        ...prev,
        errorMessage: '资产发行地址未获取',
      }))
      return false
    }

    setState((prev) => ({
      ...prev,
      step: 'confirm',
      amountError: null,
    }))
    return true
  }, [state.amount, state.asset, state.recipientAddress, validateAmount])

  // Go back to input
  const goBack = useCallback(() => {
    setState((prev) => ({
      ...prev,
      step: 'input',
    }))
  }, [])

  // Submit transaction
  const submit = useCallback(async (password: string): Promise<BurnSubmitResult> => {


    if (useMock) {

      setState((prev) => ({
        ...prev,
        step: 'burning',
        isSubmitting: true,
      }))

      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setState((prev) => ({
        ...prev,
        step: 'result',
        isSubmitting: false,
        resultStatus: 'success',
        txHash: `mock_burn_tx_${Date.now()}`,
      }))

      return { status: 'ok', txHash: `mock_burn_tx_${Date.now()}` }
    }

    if (!chainConfig || chainConfig.chainKind !== 'bioforest') {
      setState((prev) => ({
        ...prev,
        step: 'result',
        isSubmitting: false,
        resultStatus: 'failed',
        errorMessage: '仅支持 BioForest 链的资产销毁',
      }))
      return { status: 'error', message: '仅支持 BioForest 链' }
    }

    if (!walletId || !fromAddress || !state.asset || !state.amount || !state.recipientAddress) {
      setState((prev) => ({
        ...prev,
        step: 'result',
        isSubmitting: false,
        resultStatus: 'failed',
        errorMessage: '参数不完整',
      }))
      return { status: 'error', message: '参数不完整' }
    }

    setState((prev) => ({
      ...prev,
      step: 'burning',
      isSubmitting: true,
      errorMessage: null,
    }))

    const result = await submitBioforestBurn({
      chainConfig,
      walletId,
      password,
      fromAddress,
      recipientAddress: state.recipientAddress,
      assetType: state.asset.assetType,
      amount: state.amount,
      fee: state.feeAmount ?? undefined,
    })

    if (result.status === 'password') {
      setState((prev) => ({
        ...prev,
        step: 'confirm',
        isSubmitting: false,
      }))
      return { status: 'password' }
    }

    if (result.status === 'password_required') {
      setState((prev) => ({
        ...prev,
        step: 'confirm',
        isSubmitting: false,
      }))
      return { status: 'two_step_secret_required', secondPublicKey: result.secondPublicKey }
    }

    if (result.status === 'error') {
      setState((prev) => ({
        ...prev,
        step: 'result',
        isSubmitting: false,
        resultStatus: 'failed',
        errorMessage: result.message,
      }))
      return { status: 'error', message: result.message }
    }

    setState((prev) => ({
      ...prev,
      step: 'result',
      isSubmitting: false,
      resultStatus: 'success',
      txHash: result.txHash,
    }))

    return { status: 'ok', txHash: result.txHash }
  }, [chainConfig, fromAddress, state.amount, state.asset, state.feeAmount, state.recipientAddress, useMock, walletId])

  // Submit with two-step secret (pay password)
  const submitWithTwoStepSecret = useCallback(async (password: string, twoStepSecret: string): Promise<BurnSubmitResult> => {
    if (!chainConfig || !walletId || !fromAddress || !state.asset || !state.amount || !state.recipientAddress) {
      return { status: 'error', message: '参数不完整' }
    }

    setState((prev) => ({
      ...prev,
      step: 'burning',
      isSubmitting: true,
      errorMessage: null,
    }))

    const result = await submitBioforestBurn({
      chainConfig,
      walletId,
      password,
      fromAddress,
      recipientAddress: state.recipientAddress,
      assetType: state.asset.assetType,
      amount: state.amount,
      fee: state.feeAmount ?? undefined,
      twoStepSecret,
    })

    if (result.status === 'password') {
      setState((prev) => ({
        ...prev,
        step: 'confirm',
        isSubmitting: false,
      }))
      return { status: 'password' }
    }

    if (result.status === 'error') {
      setState((prev) => ({
        ...prev,
        step: 'result',
        isSubmitting: false,
        resultStatus: 'failed',
        errorMessage: result.message,
      }))
      return { status: 'error', message: result.message }
    }

    if (result.status === 'password_required') {
      // 不应该发生，因为已经提供了 twoStepSecret
      setState((prev) => ({
        ...prev,
        step: 'confirm',
        isSubmitting: false,
      }))
      return { status: 'two_step_secret_required', secondPublicKey: result.secondPublicKey }
    }

    // result.status === 'ok'
    setState((prev) => ({
      ...prev,
      step: 'result',
      isSubmitting: false,
      resultStatus: 'success',
      txHash: result.txHash,
    }))

    return { status: 'ok', txHash: result.txHash }
  }, [chainConfig, fromAddress, state.amount, state.asset, state.feeAmount, state.recipientAddress, walletId])

  // Reset to initial state
  const reset = useCallback(() => {
    setState({
      ...initialState,
      asset: initialAsset ?? null,
    })
  }, [initialAsset])

  return {
    state,
    setAmount,
    setAsset,
    goToConfirm,
    goBack,
    submit,
    submitWithTwoStepSecret,
    reset,
    canProceed,
    assetLocked,
  }
}
