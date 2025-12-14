import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useStore } from '@tanstack/react-store'
import { PageHeader } from '@/components/layout/page-header'
import { AppInfoCard } from '@/components/authorize/AppInfoCard'
import { TransactionDetails } from '@/components/authorize/TransactionDetails'
import { BalanceWarning } from '@/components/authorize/BalanceWarning'
import { PasswordConfirmSheet } from '@/components/security/password-confirm-sheet'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  SignatureAuthService,
  plaocAdapter,
  type CallerAppInfo,
  type DestroyPayload,
  type SignatureRequest,
  type TransferPayload,
  type MessagePayload,
} from '@/services/authorize'
import { useToast } from '@/services'
import { walletStore, walletSelectors } from '@/stores'

const REQUEST_TIMEOUT_MS = 5 * 60 * 1000

/**
 * Type guard for TransferPayload
 */
function isTransferPayload(payload: unknown): payload is TransferPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'senderAddress' in payload &&
    'receiveAddress' in payload &&
    'balance' in payload
  )
}

/**
 * Type guard for MessagePayload
 */
function isMessagePayload(payload: unknown): payload is MessagePayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'senderAddress' in payload &&
    'message' in payload &&
    !('receiveAddress' in payload)
  )
}

/**
 * Type guard for DestroyPayload
 */
function isDestroyPayload(payload: unknown): payload is DestroyPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'senderAddress' in payload &&
    'destoryAddress' in payload &&
    'destoryAmount' in payload
  )
}

/**
 * Format token symbol from asset type or chain name
 */
function getTokenSymbol(payload: TransferPayload): string {
  if (payload.contractInfo?.assetType) {
    return payload.contractInfo.assetType.toUpperCase()
  }
  if (payload.assetType) {
    return payload.assetType.toUpperCase()
  }
  // Default to chain native token
  const chainSymbols: Record<string, string> = {
    ethereum: 'ETH',
    bitcoin: 'BTC',
    tron: 'TRX',
    binance: 'BNB',
    bsc: 'BNB',
  }
  return chainSymbols[payload.chainName?.toLowerCase() ?? ''] ?? 'TOKEN'
}

/**
 * Parse balance and fee to check if sufficient
 */
function checkBalance(
  walletBalance: string,
  amount: string,
  fee: string | undefined
): { sufficient: boolean; required: string } {
  const balanceNum = parseFloat(walletBalance) || 0
  const amountNum = parseFloat(amount) || 0
  const feeNum = parseFloat(fee ?? '0') || 0
  const required = amountNum + feeNum
  return {
    sufficient: balanceNum >= required,
    required: required.toString(),
  }
}

export function SignatureAuthPage() {
  const { t: tAuthorize } = useTranslation('authorize')
  const { t: tCommon } = useTranslation('common')
  const navigate = useNavigate()
  const toast = useToast()

  const { id: eventId } = useParams({ from: '/authorize/signature/$id' })

  const currentWallet = useStore(walletStore, walletSelectors.getCurrentWallet)

  const [appInfo, setAppInfo] = useState<CallerAppInfo | null>(null)
  const [signatureRequest, setSignatureRequest] = useState<SignatureRequest | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPasswordSheet, setShowPasswordSheet] = useState(false)
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined)

  const authService = useMemo(() => new SignatureAuthService(plaocAdapter, eventId), [eventId])

  // Load app info and signature request
  useEffect(() => {
    let cancelled = false

    async function run() {
      setLoadError(null)
      try {
        const info = await plaocAdapter.getCallerAppInfo(eventId)
        if (cancelled) return
        setAppInfo(info)

        // In a real implementation, we would get the signature request from the event
        // For now, we'll use a mock request based on the eventId
        // This would normally come from plaocAdapter.getSignatureRequest(eventId)
        const isInsufficient = eventId.toLowerCase().includes('insufficient')
        const transferPayload = {
          chainName: 'ethereum',
          senderAddress: currentWallet?.address ?? '0x1234567890abcdef1234567890abcdef12345678',
          receiveAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
          balance: isInsufficient ? '1.5' : '0.5',
          fee: '0.002',
        } satisfies TransferPayload
        const mockRequest: SignatureRequest = {
          eventId,
          type: 'transfer',
          payload: transferPayload,
          appName: info.appName,
          appHome: info.origin,
          appLogo: info.appIcon,
        }
        setSignatureRequest(mockRequest)
      } catch {
        if (cancelled) return
        setLoadError(tAuthorize('error.authFailed'))
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [eventId, tAuthorize, currentWallet?.address])

  // Timeout handler
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void (async () => {
        await authService.reject('timeout')
        toast.show({ message: tAuthorize('error.timeout'), position: 'center' })
        navigate({ to: '/' })
      })()
    }, REQUEST_TIMEOUT_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [authService, navigate, tAuthorize, toast])

  // Derived state for transfer payload
  const transferPayload = useMemo(() => {
    if (!signatureRequest || !isTransferPayload(signatureRequest.payload)) {
      return null
    }
    return signatureRequest.payload
  }, [signatureRequest])

  // Derived state for message payload
  const messagePayload = useMemo(() => {
    if (!signatureRequest || !isMessagePayload(signatureRequest.payload)) {
      return null
    }
    return signatureRequest.payload
  }, [signatureRequest])

  // Derived state for destroy payload
  const destroyPayload = useMemo(() => {
    if (!signatureRequest || !isDestroyPayload(signatureRequest.payload)) {
      return null
    }
    return signatureRequest.payload
  }, [signatureRequest])

  // Check balance for transfer
  const balanceCheck = useMemo(() => {
    if (!transferPayload || !currentWallet) {
      return { sufficient: true, required: '0' }
    }

    // Find the relevant chain address balance
    const chainAddress = currentWallet.chainAddresses.find(
      (ca) => ca.chain.toLowerCase() === transferPayload.chainName?.toLowerCase()
    )

    // For now, use a mock balance - in real implementation, this would come from the wallet
    const walletBalance = chainAddress ? '1.0' : '0'
    return checkBalance(walletBalance, transferPayload.balance, transferPayload.fee)
  }, [transferPayload, currentWallet])

  const tokenSymbol = useMemo(() => {
    if (!transferPayload) return 'TOKEN'
    return getTokenSymbol(transferPayload)
  }, [transferPayload])

  const handleBack = useCallback(() => {
    navigate({ to: '/' })
  }, [navigate])

  const handleReject = useCallback(async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      await authService.reject(balanceCheck.sufficient ? 'rejected' : 'insufficient_balance')
      navigate({ to: '/' })
    } finally {
      setIsSubmitting(false)
    }
  }, [authService, balanceCheck.sufficient, isSubmitting, navigate])

  const handleSign = useCallback(() => {
    if (!balanceCheck.sufficient) return
    setShowPasswordSheet(true)
    setPasswordError(undefined)
  }, [balanceCheck.sufficient])

  const handlePasswordVerify = useCallback(
    async (password: string) => {
      if (isSubmitting) return
      setIsSubmitting(true)

      try {
        const encryptedSecret = currentWallet?.encryptedMnemonic
        if (!encryptedSecret) {
          setPasswordError(tAuthorize('error.authFailed'))
          return
        }

        if (!signatureRequest) {
          setPasswordError(tAuthorize('error.authFailed'))
          return
        }

        let signature: string
        if (signatureRequest.type === 'message') {
          if (!messagePayload) {
            setPasswordError(tAuthorize('error.authFailed'))
            return
          }
          signature = await authService.handleMessageSign(messagePayload, encryptedSecret, password)
        } else if (signatureRequest.type === 'transfer') {
          if (!transferPayload) {
            setPasswordError(tAuthorize('error.authFailed'))
            return
          }
          signature = await authService.handleTransferSign(transferPayload, encryptedSecret, password)
        } else if (signatureRequest.type === 'destory') {
          if (!destroyPayload) {
            setPasswordError(tAuthorize('error.authFailed'))
            return
          }
          signature = await authService.handleDestroySign(destroyPayload, encryptedSecret, password)
        } else {
          setPasswordError(tAuthorize('error.authFailed'))
          return
        }

        await authService.approve(signature)
        setShowPasswordSheet(false)
        navigate({ to: '/' })
      } catch {
        setPasswordError(tAuthorize('error.passwordIncorrect'))
      } finally {
        setIsSubmitting(false)
      }
    },
    [authService, currentWallet?.encryptedMnemonic, destroyPayload, isSubmitting, messagePayload, navigate, signatureRequest, tAuthorize, transferPayload]
  )

  const handlePasswordClose = useCallback(() => {
    setShowPasswordSheet(false)
    setPasswordError(undefined)
  }, [])

  // Error state
  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/30">
        <PageHeader title={tAuthorize('title.signature')} onBack={handleBack} />
        <div className="flex-1 p-4">
          <div className="rounded-xl bg-card p-4 shadow-sm">
            <p className="text-sm text-destructive">{loadError}</p>
            <div className="mt-4">
              <Button onClick={() => navigate({ to: '/' })} className="w-full">
                {tCommon('back', { defaultValue: 'Back' })}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Determine page title based on request type
  const pageTitle = signatureRequest?.type === 'message'
    ? tAuthorize('signature.type.message')
    : tAuthorize('title.signature')

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <PageHeader title={pageTitle} onBack={handleBack} />

      <div className="flex-1 space-y-4 p-4">
        {appInfo && <AppInfoCard appInfo={appInfo} />}

        <div className="px-1 text-sm text-foreground">
          {tAuthorize('signature.reviewTransaction')}
        </div>

        {/* Transfer type display */}
        {transferPayload && (
          <>
            <TransactionDetails
              from={transferPayload.senderAddress}
              to={transferPayload.receiveAddress}
              amount={`${transferPayload.balance} ${tokenSymbol}`}
              {...(transferPayload.fee ? { fee: `${transferPayload.fee} ${tokenSymbol}` } : {})}
              chainId={transferPayload.chainName}
            />

            {!balanceCheck.sufficient && (
              <BalanceWarning
                balance="1.0"
                required={balanceCheck.required}
                symbol={tokenSymbol}
              />
            )}
          </>
        )}

        {/* Message type display */}
        {messagePayload && (
          <div className="rounded-xl bg-card p-4 shadow-sm">
            <div className="text-sm text-muted-foreground mb-2">
              {tAuthorize('signature.messageToSign', { defaultValue: 'Message to Sign' })}
            </div>
            <div className={cn(
              'rounded-lg bg-muted/50 p-3',
              'font-mono text-sm whitespace-pre-wrap break-all',
              'max-h-48 overflow-y-auto'
            )}>
              {messagePayload.message}
            </div>
          </div>
        )}

        {/* Signature type badge */}
        {signatureRequest && (
          <div className="rounded-xl bg-card p-4 shadow-sm">
            <div className="text-sm text-muted-foreground">
              {signatureRequest.type === 'transfer' && tAuthorize('signature.type.transfer')}
              {signatureRequest.type === 'message' && tAuthorize('signature.type.message')}
              {signatureRequest.type === 'destory' && tAuthorize('signature.type.destroy')}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="sticky bottom-0 border-t border-border bg-background p-4 safe-area-inset-bottom">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleReject}
            disabled={isSubmitting}
          >
            {tAuthorize('button.reject')}
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={handleSign}
            disabled={isSubmitting || !balanceCheck.sufficient}
          >
            {tAuthorize('button.confirm')}
          </Button>
        </div>
      </div>

      {/* Password confirmation sheet */}
      <PasswordConfirmSheet
        open={showPasswordSheet}
        onClose={handlePasswordClose}
        onVerify={handlePasswordVerify}
        title={tAuthorize('button.confirm')}
        description={tAuthorize('signature.confirmDescription', {
          defaultValue: 'Enter your password to sign this transaction',
        })}
        error={passwordError}
        isVerifying={isSubmitting}
      />
    </div>
  )
}
