import type { AssetInfo } from '@/types/asset'
import type { Amount } from '@/types/amount'
import type { ChainConfig } from '@/services/chain-config'

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
  /** Amount to send (as Amount object, null if empty/invalid) */
  amount: Amount | null
  /** Address validation error */
  addressError: string | null
  /** Amount validation error */
  amountError: string | null
  /** Estimated fee amount */
  feeAmount: Amount | null
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

export interface UseSendOptions {
  /** Initial asset */
  initialAsset?: AssetInfo | undefined
  /** Mock mode (default: true) */
  useMock?: boolean | undefined
  /** Wallet id for decrypting secret */
  walletId?: string | undefined
  /** Sender address */
  fromAddress?: string | undefined
  /** Chain config (bioforest only for now) */
  chainConfig?: ChainConfig | null | undefined
}

/** Submit result type */
export type SubmitResult =
  | { status: 'ok' }
  | { status: 'password' }
  | { status: 'pay_password_required'; secondPublicKey: string }
  | { status: 'error' }

export interface UseSendReturn {
  /** Current state */
  state: SendState
  /** Set recipient address */
  setToAddress: (address: string) => void
  /** Set amount (Amount object or null for empty/invalid) */
  setAmount: (amount: Amount | null) => void
  /** Set asset */
  setAsset: (asset: AssetInfo) => void
  /** Validate and go to confirm */
  goToConfirm: () => boolean
  /** Go back to input */
  goBack: () => void
  /** Submit transaction */
  submit: (password: string) => Promise<SubmitResult>
  /** Submit transaction with pay password */
  submitWithPayPassword: (password: string, payPassword: string) => Promise<SubmitResult>
  /** Reset to initial state */
  reset: () => void
  /** Check if can proceed to confirm */
  canProceed: boolean
}
