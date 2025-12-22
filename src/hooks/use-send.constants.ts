import type { SendState } from './use-send.types'

/** Mock fee estimation */
export const MOCK_FEES: Record<string, { amount: string; symbol: string }> = {
  ETH: { amount: '0.002', symbol: 'ETH' },
  USDT: { amount: '0.003', symbol: 'ETH' },
  USDC: { amount: '0.003', symbol: 'ETH' },
  BTC: { amount: '0.0001', symbol: 'BTC' },
  TRX: { amount: '1', symbol: 'TRX' },
  BFM: { amount: '0.1', symbol: 'BFM' },
}

export const initialState: SendState = {
  step: 'input',
  asset: null,
  toAddress: '',
  amount: null,
  addressError: null,
  amountError: null,
  feeAmount: null,
  feeSymbol: '',
  feeLoading: false,
  isSubmitting: false,
  resultStatus: null,
  txHash: null,
  errorMessage: null,
}
