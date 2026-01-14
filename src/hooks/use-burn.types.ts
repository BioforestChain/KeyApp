import type { AssetInfo } from '@/types/asset'
import type { Amount } from '@/types/amount'
import type { ChainConfig } from '@/services/chain-config'

/** Burn flow step */
export type BurnStep = 'input' | 'confirm' | 'burning' | 'result'

/** Burn result status */
export type BurnResultStatus = 'success' | 'failed' | 'pending'

/** Burn flow state */
export interface BurnState {
  /** Current step */
  step: BurnStep
  /** Selected asset to burn (must not be main asset) */
  asset: AssetInfo | null
  /** Amount to burn (as Amount object, null if empty/invalid) */
  amount: Amount | null
  /** Amount validation error */
  amountError: string | null
  /** Recipient address (asset's applyAddress) */
  recipientAddress: string | null
  /** Estimated fee amount */
  feeAmount: Amount | null
  /** Minimum fee from estimation */
  feeMinAmount: Amount | null
  /** Fee token symbol (always main asset) */
  feeSymbol: string
  /** Fee loading state */
  feeLoading: boolean
  /** Is submitting transaction */
  isSubmitting: boolean
  /** Result status */
  resultStatus: BurnResultStatus | null
  /** Transaction hash */
  txHash: string | null
  /** Error message */
  errorMessage: string | null
}

export interface UseBurnOptions {
  /** Initial asset */
  initialAsset?: AssetInfo | undefined
  /** Whether asset can be changed (default: true) */
  assetLocked?: boolean | undefined
  /** Mock mode (default: true) */
  useMock?: boolean | undefined
  /** Wallet id for decrypting secret */
  walletId?: string | undefined
  /** Sender address */
  fromAddress?: string | undefined
  /** Chain config (bioforest only) */
  chainConfig?: ChainConfig | null | undefined
}

/** Submit result type */
export type BurnSubmitResult =
  | { status: 'ok'; txHash?: string; pendingTxId?: string }
  | { status: 'password' }
  | { status: 'two_step_secret_required'; secondPublicKey: string }
  | { status: 'error'; message?: string; pendingTxId?: string }

export interface UseBurnReturn {
  /** Current state */
  state: BurnState
  /** Set amount (Amount object or null for empty/invalid) */
  setAmount: (amount: Amount | null) => void
  /** Set asset to burn */
  setAsset: (asset: AssetInfo) => void
  /** Validate and go to confirm */
  goToConfirm: () => boolean
  /** Go back to input */
  goBack: () => void
  /** Submit transaction */
  submit: (password: string) => Promise<BurnSubmitResult>
  /** Submit transaction with pay password */
  submitWithTwoStepSecret: (password: string, twoStepSecret: string) => Promise<BurnSubmitResult>
  /** Reset to initial state */
  reset: () => void
  /** Check if can proceed to confirm */
  canProceed: boolean
  /** Whether asset selection is locked */
  assetLocked: boolean
}
