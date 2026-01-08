import { useState, useCallback, useMemo, useEffect } from 'react'
import type { AssetInfo } from '@/types/asset'
import { Amount } from '@/types/amount'
import { initialState, MOCK_FEES } from './use-send.constants'
import type { SendState, UseSendOptions, UseSendReturn } from './use-send.types'
import { fetchBioforestBalance, fetchBioforestFee, submitBioforestTransfer } from './use-send.bioforest'
import { fetchWeb3Fee, submitWeb3Transfer, validateWeb3Address } from './use-send.web3'
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

  const isBioforestChain = chainConfig?.chainKind === 'bioforest'
  const isWeb3Chain = chainConfig?.chainKind === 'evm' || chainConfig?.chainKind === 'tron' || chainConfig?.chainKind === 'bitcoin'

  // Validate address
  const validateAddress = useCallback((address: string): string | null => {
    // Use chain adapter validation for Web3 chains
    if (isWeb3Chain && chainConfig) {
      return validateWeb3Address(chainConfig, address)
    }
    return validateAddressInput(address, isBioforestChain)
  }, [isBioforestChain, isWeb3Chain, chainConfig])

  // Validate amount
  const validateAmount = useCallback((amount: Amount | null, asset: AssetInfo | null): string | null => {
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
  const setAmount = useCallback((amount: Amount | null) => {
    setState((prev) => ({
      ...prev,
      amount,
      amountError: null, // Clear error on change
    }))
  }, [])

  // Set custom fee (from FeeEditJob modal)
  const setFee = useCallback((formattedFee: string) => {
    setState((prev) => {
      if (!prev.feeAmount) return prev
      const newFeeAmount = Amount.fromFormatted(formattedFee, prev.feeAmount.decimals, prev.feeAmount.symbol)
      return {
        ...prev,
        feeAmount: newFeeAmount,
      }
    })
  }, [])

  // Set asset and estimate fee
  const setAsset = useCallback((asset: AssetInfo) => {
    setState((prev) => ({
      ...prev,
      asset,
      feeLoading: true,
    }))

    const shouldUseMock = useMock || (!isBioforestChain && !isWeb3Chain) || !chainConfig || !fromAddress

    if (shouldUseMock) {
      // Mock fee estimation delay
      setTimeout(() => {
        const fee = MOCK_FEES[asset.assetType] ?? { amount: '0.001', symbol: asset.assetType }
        const feeAmount = Amount.fromFormatted(fee.amount, asset.decimals, fee.symbol)
        setState((prev) => ({
          ...prev,
          feeAmount: feeAmount,
          feeMinAmount: feeAmount,
          feeSymbol: fee.symbol,
          feeLoading: false,
        }))
      }, 300)
      return
    }

    void (async () => {
      try {
        // Use appropriate fee fetcher based on chain type
        const feeEstimate = isWeb3Chain
          ? await fetchWeb3Fee(chainConfig, fromAddress)
          : await fetchBioforestFee(chainConfig, fromAddress)
        
        setState((prev) => ({
          ...prev,
          feeAmount: feeEstimate.amount,
          feeMinAmount: feeEstimate.amount,
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
  }, [chainConfig, fromAddress, isBioforestChain, isWeb3Chain, useMock])

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
      feeLoading: state.feeLoading,
    })
  }, [isBioforestChain, state.amount, state.asset, state.toAddress, state.feeLoading])

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

    if (state.asset && state.feeAmount && state.amount) {
      const adjustResult = adjustAmountForFee(state.amount, state.asset, state.feeAmount)
      if (adjustResult.status === 'error') {
        setState((prev) => ({
          ...prev,
          amountError: adjustResult.message,
        }))
        return false
      }
      if (adjustResult.adjustedAmount) {
        setState((prev) => ({
          ...prev,
          amount: adjustResult.adjustedAmount ?? prev.amount,
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
  }, [state.toAddress, state.amount, state.asset, state.feeAmount, validateAddress, validateAmount])

  // Go back to input
  const goBack = useCallback(() => {
    setState((prev) => ({
      ...prev,
      step: 'input',
    }))
  }, [])

  // Submit transaction
  const submit = useCallback(async (password: string) => {
    console.log('[useSend.submit] Called with:', { useMock, chainType: chainConfig?.type, walletId, fromAddress })
    
    if (useMock) {
      console.log('[useSend.submit] Using mock transfer')
      const result = await submitMockTransfer(setState)
      return result.status === 'ok' ? { status: 'ok' as const } : { status: 'error' as const }
    }

    if (!chainConfig) {
      console.log('[useSend.submit] No chain config')
      setState((prev) => ({
        ...prev,
        step: 'result',
        isSubmitting: false,
        resultStatus: 'failed',
        txHash: null,
        errorMessage: '链配置缺失',
      }))
      return { status: 'error' as const }
    }

    // Handle Web3 chains (EVM, Tron, Bitcoin)
    if (chainConfig.chainKind === 'evm' || chainConfig.chainKind === 'tron' || chainConfig.chainKind === 'bitcoin') {
      console.log('[useSend.submit] Using Web3 transfer for:', chainConfig.type)
      
      if (!walletId || !fromAddress || !state.asset || !state.amount) {
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

      setState((prev) => ({
        ...prev,
        step: 'sending',
        isSubmitting: true,
        errorMessage: null,
      }))

      const result = await submitWeb3Transfer({
        chainConfig,
        walletId,
        password,
        fromAddress,
        toAddress: state.toAddress,
        amount: state.amount,
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

      return { status: 'ok' as const, txHash: result.txHash }
    }

    // Unsupported chain type
    if (chainConfig.type !== 'bioforest') {
      console.log('[useSend.submit] Chain type not supported:', chainConfig.type)
      setState((prev) => ({
        ...prev,
        step: 'result',
        isSubmitting: false,
        resultStatus: 'failed',
        txHash: null,
        errorMessage: `不支持的链类型: ${chainConfig.type}`,
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

    // Amount should never be null here (validated above)
    if (!state.amount) {
      setState((prev) => ({
        ...prev,
        step: 'result',
        isSubmitting: false,
        resultStatus: 'failed',
        txHash: null,
        errorMessage: '无效的金额',
      }))
      return { status: 'error' as const }
    }

    const result = await submitBioforestTransfer({
      chainConfig,
      walletId,
      password,
      fromAddress,
      toAddress: state.toAddress,
      amount: state.amount,
      fee: state.feeAmount ?? undefined,
    })

    if (result.status === 'password') {
      setState((prev) => ({
        ...prev,
        step: 'confirm',
        isSubmitting: false,
      }))
      return { status: 'password' as const }
    }

    if (result.status === 'password_required') {
      // Pay password is required - return status so UI can prompt for pay password
      setState((prev) => ({
        ...prev,
        step: 'confirm',
        isSubmitting: false,
      }))
      return { status: 'two_step_secret_required' as const, secondPublicKey: result.secondPublicKey }
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

    return { status: 'ok' as const, txHash: result.txHash }
  }, [chainConfig, fromAddress, state.amount, state.asset, state.toAddress, useMock, validateAddress, validateAmount, walletId])

  // Submit with pay password (for addresses with secondPublicKey)
  const submitWithTwoStepSecret = useCallback(async (password: string, twoStepSecret: string) => {
    if (!chainConfig || !walletId || !fromAddress) {
      return { status: 'error' as const }
    }

    setState((prev) => ({
      ...prev,
      step: 'sending',
      isSubmitting: true,
      resultStatus: null,
      txHash: null,
      errorMessage: null,
    }))

    if (!state.amount) {
      setState((prev) => ({
        ...prev,
        step: 'result',
        isSubmitting: false,
        resultStatus: 'failed',
        txHash: null,
        errorMessage: '无效的金额',
      }))
      return { status: 'error' as const }
    }

    const result = await submitBioforestTransfer({
      chainConfig,
      walletId,
      password,
      fromAddress,
      toAddress: state.toAddress,
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

    // password_required should not happen when twoStepSecret is provided
    if (result.status === 'password_required') {
      setState((prev) => ({
        ...prev,
        step: 'result',
        isSubmitting: false,
        resultStatus: 'failed',
        txHash: null,
        errorMessage: '安全密码验证失败',
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

    return { status: 'ok' as const, txHash: result.txHash }
  }, [chainConfig, fromAddress, state.amount, state.toAddress, walletId])

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
    setFee,
    goToConfirm,
    goBack,
    submit,
    submitWithTwoStepSecret,
    reset,
    canProceed,
  }
}
