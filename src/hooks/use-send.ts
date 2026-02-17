import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { AssetInfo } from '@/types/asset';
import { Amount } from '@/types/amount';
import { initialState, MOCK_FEES } from './use-send.constants';
import type { SendState, UseSendOptions, UseSendReturn } from './use-send.types';
import { fetchBioforestFee, submitBioforestTransfer } from './use-send.bioforest';
import { fetchWeb3Fee, submitWeb3Transfer, validateWeb3Address } from './use-send.web3';
import { adjustAmountForFee, canProceedToConfirm, validateAddressInput, validateAmountInput } from './use-send.logic';
import { submitMockTransfer } from './use-send.mock';
import i18n from '@/i18n';

const t = i18n.t.bind(i18n);

/**
 * Hook for managing send flow state
 */
export function useSend(options: UseSendOptions = {}): UseSendReturn {
  const { initialAsset, useMock = true, walletId, fromAddress, chainConfig, getBalance } = options;

  const [state, setState] = useState<SendState>({
    ...initialState,
    asset: initialAsset ?? null,
  });

  const feeEstimateDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feeEstimateSeqRef = useRef(0);

  const isBioforestChain = chainConfig?.chainKind === 'bioforest';
  const isWeb3Chain =
    chainConfig?.chainKind === 'evm' || chainConfig?.chainKind === 'tron' || chainConfig?.chainKind === 'bitcoin';

  // Validate address
  const validateAddress = useCallback(
    (address: string): string | null => {
      // Use chain adapter validation for Web3 chains
      if (isWeb3Chain && chainConfig) {
        return validateWeb3Address(chainConfig, address);
      }
      return validateAddressInput(address, isBioforestChain, fromAddress);
    },
    [isBioforestChain, isWeb3Chain, chainConfig, fromAddress],
  );

  // Validate amount
  const validateAmount = useCallback((amount: Amount | null, asset: AssetInfo | null): string | null => {
    return validateAmountInput(amount, asset);
  }, []);

  // Set recipient address
  const setToAddress = useCallback((address: string) => {
    setState((prev) => ({
      ...prev,
      toAddress: address,
      addressError: null, // Clear error on change
    }));
  }, []);

  // Set amount
  const setAmount = useCallback((amount: Amount | null) => {
    setState((prev) => ({
      ...prev,
      amount,
      amountError: null, // Clear error on change
    }));
  }, []);

  // Set custom fee (from FeeEditJob modal)
  const setFee = useCallback((formattedFee: string) => {
    setState((prev) => {
      if (!prev.feeAmount) return prev;
      const newFeeAmount = Amount.fromFormatted(formattedFee, prev.feeAmount.decimals, prev.feeAmount.symbol);
      return {
        ...prev,
        feeAmount: newFeeAmount,
      };
    });
  }, []);

  // Set asset and estimate fee
  const setAsset = useCallback(
    (asset: AssetInfo) => {
      setState((prev) => ({
        ...prev,
        asset,
        feeAmount: null,
        feeMinAmount: null,
        feeSymbol: '',
        feeLoading: false,
      }));
    },
    [],
  );

  useEffect(() => {
    if (feeEstimateDebounceRef.current) {
      clearTimeout(feeEstimateDebounceRef.current);
      feeEstimateDebounceRef.current = null;
    }

    if (!state.asset) {
      return;
    }

    const shouldUseMock = useMock || (!isBioforestChain && !isWeb3Chain) || !chainConfig || !fromAddress;
    const toAddress = state.toAddress.trim();
    const hasValidAmount = state.amount?.isPositive() === true;
    const isTronSelfTransfer =
      chainConfig?.chainKind === 'tron' &&
      fromAddress !== undefined &&
      fromAddress.trim().length > 0 &&
      fromAddress.trim() === toAddress;
    const canEstimateFee = toAddress.length > 0 && hasValidAmount && !isTronSelfTransfer;

    if (!canEstimateFee) {
      setState((prev) => {
        if (!prev.feeLoading && prev.feeAmount === null && prev.feeMinAmount === null && prev.feeSymbol === '') {
          return prev;
        }
        return {
          ...prev,
          feeLoading: false,
          feeAmount: null,
          feeMinAmount: null,
          feeSymbol: '',
        };
      });
      return;
    }

    setState((prev) => ({
      ...prev,
      feeLoading: true,
      feeAmount: null,
      feeMinAmount: null,
      feeSymbol: '',
    }));

    const requestSeq = ++feeEstimateSeqRef.current;
    feeEstimateDebounceRef.current = setTimeout(() => {
      void (async () => {
        try {
          const feeEstimate = shouldUseMock
            ? (() => {
                const fee = MOCK_FEES[state.asset!.assetType] ?? { amount: '0.001', symbol: state.asset!.assetType };
                return {
                  amount: Amount.fromFormatted(fee.amount, state.asset!.decimals, fee.symbol),
                  symbol: fee.symbol,
                };
              })()
            : isWeb3Chain && chainConfig && fromAddress
              ? await fetchWeb3Fee({
                  chainConfig,
                  fromAddress,
                  toAddress,
                  amount: state.amount ?? undefined,
                })
              : await fetchBioforestFee(chainConfig!, fromAddress!);

          if (requestSeq !== feeEstimateSeqRef.current) {
            return;
          }

          setState((prev) => ({
            ...prev,
            feeAmount: feeEstimate.amount,
            feeMinAmount: feeEstimate.amount,
            feeSymbol: feeEstimate.symbol,
            feeLoading: false,
          }));
        } catch (error) {
          if (requestSeq !== feeEstimateSeqRef.current) {
            return;
          }
          setState((prev) => ({
            ...prev,
            feeAmount: null,
            feeMinAmount: null,
            feeSymbol: '',
            feeLoading: false,
            errorMessage: error instanceof Error ? error.message : t('error:transaction.feeEstimateFailed'),
          }));
        }
      })();
    }, 300);

    return () => {
      if (feeEstimateDebounceRef.current) {
        clearTimeout(feeEstimateDebounceRef.current);
        feeEstimateDebounceRef.current = null;
      }
    };
  }, [
    chainConfig,
    fromAddress,
    isBioforestChain,
    isWeb3Chain,
    state.amount,
    state.asset,
    state.toAddress,
    useMock,
  ]);

  // Get current balance from external source (single source of truth)
  const currentBalance = useMemo(() => {
    if (!state.asset?.assetType || !getBalance) return state.asset?.amount ?? null;
    return getBalance(state.asset.assetType) ?? state.asset?.amount ?? null;
  }, [state.asset?.assetType, state.asset?.amount, getBalance]);

  // Create asset with current balance for validation
  const assetWithCurrentBalance = useMemo((): AssetInfo | null => {
    if (!state.asset || !currentBalance) return state.asset;
    if (currentBalance.decimals === state.asset.decimals) {
      return { ...state.asset, amount: currentBalance };
    }
    return { ...state.asset, amount: currentBalance, decimals: currentBalance.decimals };
  }, [state.asset, currentBalance]);

  // Check if can proceed
  const canProceed = useMemo(() => {
    return canProceedToConfirm({
      toAddress: state.toAddress,
      amount: state.amount,
      asset: assetWithCurrentBalance,
      isBioforestChain,
      feeAmount: state.feeAmount,
      feeLoading: state.feeLoading,
    });
  }, [isBioforestChain, state.amount, assetWithCurrentBalance, state.toAddress, state.feeAmount, state.feeLoading]);

  // Validate and go to confirm
  const goToConfirm = useCallback((): boolean => {
    const addressError = validateAddress(state.toAddress);
    const amountError = assetWithCurrentBalance
      ? validateAmount(state.amount, assetWithCurrentBalance)
      : t('error:validation.selectAsset');

    if (addressError || amountError) {
      setState((prev) => ({
        ...prev,
        addressError,
        amountError,
      }));
      return false;
    }

    if (assetWithCurrentBalance && state.feeAmount && state.amount) {
      const adjustResult = adjustAmountForFee(state.amount, assetWithCurrentBalance, state.feeAmount);
      if (adjustResult.status === 'error') {
        setState((prev) => ({
          ...prev,
          amountError: adjustResult.message,
        }));
        return false;
      }
      if (adjustResult.adjustedAmount) {
        setState((prev) => ({
          ...prev,
          amount: adjustResult.adjustedAmount ?? prev.amount,
        }));
      }
    }

    setState((prev) => ({
      ...prev,
      step: 'confirm',
      addressError: null,
      amountError: null,
    }));
    return true;
  }, [state.toAddress, state.amount, assetWithCurrentBalance, state.feeAmount, validateAddress, validateAmount]);

  // Go back to input
  const goBack = useCallback(() => {
    setState((prev) => ({
      ...prev,
      step: 'input',
    }));
  }, []);

  // Submit transaction
  const submit = useCallback(
    async (password: string) => {
      if (useMock) {
        const result = await submitMockTransfer(setState);
        return result.status === 'ok'
          ? { status: 'ok' as const }
          : { status: 'error' as const, message: t('transaction:broadcast.unknown') };
      }

      if (!chainConfig) {
        setState((prev) => ({
          ...prev,
          step: 'result',
          isSubmitting: false,
          resultStatus: 'failed',
          txHash: null,
          errorMessage: t('error:transaction.chainConfigMissing'),
        }));
        return { status: 'error' as const };
      }

      // Handle Web3 chains (EVM, Tron, Bitcoin)
      if (chainConfig.chainKind === 'evm' || chainConfig.chainKind === 'tron' || chainConfig.chainKind === 'bitcoin') {
        if (!walletId || !fromAddress || !state.asset || !state.amount) {
          setState((prev) => ({
            ...prev,
            step: 'result',
            isSubmitting: false,
            resultStatus: 'failed',
            txHash: null,
            errorMessage: t('error:transaction.walletInfoIncomplete'),
          }));
          return { status: 'error' as const };
        }

        setState((prev) => ({
          ...prev,
          step: 'sending',
          isSubmitting: true,
          errorMessage: null,
        }));

        const result = await submitWeb3Transfer({
          chainConfig,
          walletId,
          password,
          fromAddress,
          toAddress: state.toAddress,
          amount: state.amount,
        });

        if (result.status === 'password') {
          setState((prev) => ({
            ...prev,
            step: 'confirm',
            isSubmitting: false,
          }));
          return { status: 'password' as const };
        }

        if (result.status === 'error') {
          setState((prev) => ({
            ...prev,
            step: 'result',
            isSubmitting: false,
            resultStatus: 'failed',
            txHash: null,
            errorMessage: result.message,
          }));
          return { status: 'error' as const, message: result.message };
        }

        setState((prev) => ({
          ...prev,
          step: 'result',
          isSubmitting: false,
          resultStatus: 'success',
          txHash: result.txHash,
          errorMessage: null,
        }));

        return { status: 'ok' as const, txHash: result.txHash };
      }

      // Unsupported chain type
      if (chainConfig.chainKind !== 'bioforest') {
        setState((prev) => ({
          ...prev,
          step: 'result',
          isSubmitting: false,
          resultStatus: 'failed',
          txHash: null,
          errorMessage: t('error:transaction.unsupportedChainType', { chainType: chainConfig.chainKind }),
        }));
        return { status: 'error' as const };
      }

      if (!walletId || !fromAddress || !state.asset) {
        setState((prev) => ({
          ...prev,
          step: 'result',
          isSubmitting: false,
          resultStatus: 'failed',
          txHash: null,
          errorMessage: t('error:wallet.incompleteInfo'),
        }));
        return { status: 'error' as const };
      }

      const addressError = validateAddress(state.toAddress);
      const amountError = validateAmount(state.amount, state.asset);
      if (addressError || amountError) {
        setState((prev) => ({
          ...prev,
          addressError,
          amountError,
        }));
        return { status: 'error' as const };
      }

      setState((prev) => ({
        ...prev,
        step: 'sending',
        isSubmitting: true,
        errorMessage: null,
      }));

      // Amount should never be null here (validated above)
      if (!state.amount) {
        setState((prev) => ({
          ...prev,
          step: 'result',
          isSubmitting: false,
          resultStatus: 'failed',
          txHash: null,
          errorMessage: t('error:transaction.invalidAmount'),
        }));
        return { status: 'error' as const };
      }

      const result = await submitBioforestTransfer({
        chainConfig,
        walletId,
        password,
        fromAddress,
        toAddress: state.toAddress,
        amount: state.amount,
        assetType: state.asset.assetType,
        fee: state.feeAmount ?? undefined,
      });

      if (result.status === 'password') {
        setState((prev) => ({
          ...prev,
          step: 'confirm',
          isSubmitting: false,
        }));
        return { status: 'password' as const };
      }

      if (result.status === 'password_required') {
        // Pay password is required - return status so UI can prompt for pay password
        setState((prev) => ({
          ...prev,
          step: 'confirm',
          isSubmitting: false,
        }));
        return { status: 'two_step_secret_required' as const, secondPublicKey: result.secondPublicKey };
      }

      if (result.status === 'error') {
        setState((prev) => ({
          ...prev,
          step: 'result',
          isSubmitting: false,
          resultStatus: 'failed',
          txHash: null,
          errorMessage: result.message,
        }));
        return { status: 'error' as const, message: result.message, pendingTxId: result.pendingTxId };
      }

      setState((prev) => ({
        ...prev,
        step: 'result',
        isSubmitting: false,
        resultStatus: 'success',
        txHash: result.txHash,
        errorMessage: null,
      }));

      return { status: 'ok' as const, txHash: result.txHash, pendingTxId: result.pendingTxId };
    },
    [
      chainConfig,
      fromAddress,
      state.amount,
      state.asset,
      state.toAddress,
      useMock,
      validateAddress,
      validateAmount,
      walletId,
    ],
  );

  // Submit with pay password (for addresses with secondPublicKey)
  const submitWithTwoStepSecret = useCallback(
    async (password: string, twoStepSecret: string) => {
      if (!chainConfig || !walletId || !fromAddress) {
        return { status: 'error' as const };
      }

      setState((prev) => ({
        ...prev,
        step: 'sending',
        isSubmitting: true,
        resultStatus: null,
        txHash: null,
        errorMessage: null,
      }));

      if (!state.amount || !state.asset) {
        setState((prev) => ({
          ...prev,
          step: 'result',
          isSubmitting: false,
          resultStatus: 'failed',
          txHash: null,
          errorMessage: t('error:transaction.invalidAmount'),
        }));
        return { status: 'error' as const };
      }

      const result = await submitBioforestTransfer({
        chainConfig,
        walletId,
        password,
        fromAddress,
        toAddress: state.toAddress,
        amount: state.amount,
        assetType: state.asset.assetType,
        fee: state.feeAmount ?? undefined,
        twoStepSecret,
      });

      if (result.status === 'password') {
        setState((prev) => ({
          ...prev,
          step: 'confirm',
          isSubmitting: false,
        }));
        return { status: 'password' as const };
      }

      if (result.status === 'error') {
        setState((prev) => ({
          ...prev,
          step: 'result',
          isSubmitting: false,
          resultStatus: 'failed',
          txHash: null,
          errorMessage: result.message,
        }));
        return { status: 'error' as const, message: result.message, pendingTxId: result.pendingTxId };
      }

      // password_required should not happen when twoStepSecret is provided
      if (result.status === 'password_required') {
        setState((prev) => ({
          ...prev,
          step: 'result',
          isSubmitting: false,
          resultStatus: 'failed',
          txHash: null,
          errorMessage: t('error:transaction.securityPasswordFailed'),
        }));
        return { status: 'error' as const };
      }

      setState((prev) => ({
        ...prev,
        step: 'result',
        isSubmitting: false,
        resultStatus: 'success',
        txHash: result.txHash,
        errorMessage: null,
      }));

      return { status: 'ok' as const, txHash: result.txHash, pendingTxId: result.pendingTxId };
    },
    [chainConfig, fromAddress, state.amount, state.toAddress, walletId],
  );

  // Reset to initial state
  const reset = useCallback(() => {
    setState({
      ...initialState,
      asset: initialAsset ?? null,
    });
  }, [initialAsset]);

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
  };
}
