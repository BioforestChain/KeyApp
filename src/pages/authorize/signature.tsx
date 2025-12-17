import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigation, useActivityParams } from '@/stackflow'
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

type ParsedSignatureItem =
  | { type: 'message'; payload: MessagePayload }
  | { type: 'transfer'; payload: TransferPayload }
  | { type: 'destory'; payload: DestroyPayload }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readOptionalStringLike(obj: Record<string, unknown>, key: string): string | undefined {
  const v = obj[key]
  if (typeof v === 'string') return v
  if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  return undefined
}

function readRequiredStringLike(
  obj: Record<string, unknown>,
  key: string,
  label: string
): { ok: true; value: string } | { ok: false; error: string } {
  const value = readOptionalStringLike(obj, key)?.trim()
  if (!value) return { ok: false, error: `signaturedata 缺少字段：${label}` }
  return { ok: true, value }
}

function readFirstStringLike(
  obj: Record<string, unknown>,
  keys: Array<{ key: string; label: string }>
): { ok: true; value: string } | { ok: false; error: string } {
  for (const k of keys) {
    const value = readOptionalStringLike(obj, k.key)?.trim()
    if (value) return { ok: true, value }
  }
  return { ok: false, error: `signaturedata 缺少字段：${keys.map((k) => k.label).join(' / ')}` }
}

function parseSignatureType(rawType: unknown): { ok: true; value: ParsedSignatureItem['type'] } | { ok: false; error: string } {
  if (typeof rawType === 'string') {
    const v = rawType.trim().toLowerCase()
    if (v === 'message') return { ok: true, value: 'message' }
    if (v === 'transfer') return { ok: true, value: 'transfer' }
    if (v === 'destroy' || v === 'destory') return { ok: true, value: 'destory' }
    return { ok: false, error: `不支持的签名类型：${rawType}` }
  }

  if (typeof rawType === 'number' && Number.isInteger(rawType)) {
    // mpay legacy enum: message=0, transfer=1, ..., destory=7
    if (rawType === 0) return { ok: true, value: 'message' }
    if (rawType === 1) return { ok: true, value: 'transfer' }
    if (rawType === 7) return { ok: true, value: 'destory' }
    return { ok: false, error: `不支持的签名类型：${rawType}` }
  }

  return { ok: false, error: 'signaturedata.type 必须是字符串或数字' }
}

function parseSignaturedataParam(signaturedata: string | undefined): { ok: true; item: ParsedSignatureItem } | { ok: false; error: string } {
  if (signaturedata === undefined || signaturedata.trim() === '') {
    return { ok: false, error: '缺少 signaturedata 参数' }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(signaturedata)
  } catch {
    return { ok: false, error: 'signaturedata 不是合法的 JSON' }
  }

  if (!Array.isArray(parsed)) {
    return { ok: false, error: 'signaturedata 必须是 JSON 数组' }
  }

  if (parsed.length === 0) {
    return { ok: false, error: 'signaturedata 不能为空数组' }
  }

  const first = parsed[0]
  if (!isRecord(first)) {
    return { ok: false, error: 'signaturedata[0] 必须是对象' }
  }

  const typeRes = parseSignatureType(first.type)
  if (!typeRes.ok) return typeRes

  const chainNameRes = readFirstStringLike(first, [
    { key: 'chainName', label: 'chainName' },
    { key: 'chain', label: 'chain' },
  ])
  if (!chainNameRes.ok) return chainNameRes
  const chainName = chainNameRes.value

  if (typeRes.value === 'message') {
    const senderRes = readFirstStringLike(first, [
      { key: 'senderAddress', label: 'senderAddress' },
      { key: 'from', label: 'from' },
    ])
    if (!senderRes.ok) return senderRes

    const messageRes = readRequiredStringLike(first, 'message', 'message')
    if (!messageRes.ok) return messageRes

    return {
      ok: true,
      item: {
        type: 'message',
        payload: {
          chainName,
          senderAddress: senderRes.value,
          message: messageRes.value,
        },
      },
    }
  }

  if (typeRes.value === 'transfer') {
    const senderRes = readFirstStringLike(first, [
      { key: 'senderAddress', label: 'senderAddress' },
      { key: 'from', label: 'from' },
    ])
    if (!senderRes.ok) return senderRes

    const receiveRes = readFirstStringLike(first, [
      { key: 'receiveAddress', label: 'receiveAddress' },
      { key: 'to', label: 'to' },
    ])
    if (!receiveRes.ok) return receiveRes

    const amountRes = readFirstStringLike(first, [
      { key: 'balance', label: 'balance' },
      { key: 'amount', label: 'amount' },
    ])
    if (!amountRes.ok) return amountRes

    const fee = readOptionalStringLike(first, 'fee')?.trim()
    const assetType = readOptionalStringLike(first, 'assetType')?.trim()

    let contractInfo: TransferPayload['contractInfo'] | undefined
    const rawContractInfo = first.contractInfo
    if (isRecord(rawContractInfo)) {
      const ciAssetType = readOptionalStringLike(rawContractInfo, 'assetType')?.trim()
      const ciDecimalsRaw = rawContractInfo.decimals
      const ciContractAddress = readOptionalStringLike(rawContractInfo, 'contractAddress')?.trim()
      const ciDecimals =
        typeof ciDecimalsRaw === 'number' && Number.isFinite(ciDecimalsRaw)
          ? ciDecimalsRaw
          : typeof ciDecimalsRaw === 'string' && ciDecimalsRaw.trim() !== ''
            ? Number(ciDecimalsRaw)
            : undefined

      if (ciAssetType && ciContractAddress && typeof ciDecimals === 'number' && Number.isFinite(ciDecimals)) {
        contractInfo = {
          assetType: ciAssetType,
          contractAddress: ciContractAddress,
          decimals: ciDecimals,
        }
      }
    }

    return {
      ok: true,
      item: {
        type: 'transfer',
        payload: {
          chainName,
          senderAddress: senderRes.value,
          receiveAddress: receiveRes.value,
          balance: amountRes.value,
          ...(fee ? { fee } : {}),
          ...(assetType ? { assetType } : {}),
          ...(contractInfo ? { contractInfo } : {}),
        },
      },
    }
  }

  {
    const senderRes = readFirstStringLike(first, [
      { key: 'senderAddress', label: 'senderAddress' },
      { key: 'from', label: 'from' },
    ])
    if (!senderRes.ok) return senderRes

    const amountRes = readFirstStringLike(first, [
      { key: 'destoryAmount', label: 'destoryAmount' },
      { key: 'amount', label: 'amount' },
    ])
    if (!amountRes.ok) return amountRes

    const destoryAddress =
      readOptionalStringLike(first, 'destoryAddress')?.trim() ??
      readOptionalStringLike(first, 'to')?.trim() ??
      senderRes.value

    const fee = readOptionalStringLike(first, 'fee')?.trim()
    const assetType = readOptionalStringLike(first, 'assetType')?.trim()

    return {
      ok: true,
      item: {
        type: 'destory',
        payload: {
          chainName,
          senderAddress: senderRes.value,
          destoryAddress,
          destoryAmount: amountRes.value,
          ...(fee ? { fee } : {}),
          ...(assetType ? { assetType } : {}),
        },
      },
    }
  }
}

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
function getTokenSymbol(payload: { contractInfo?: { assetType: string }; assetType?: string; chainName?: string }): string {
  if (payload.contractInfo?.assetType) return payload.contractInfo.assetType.toUpperCase()
  if (payload.assetType) return payload.assetType.toUpperCase()

  // Default to chain native token (best-effort).
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
  const { navigate, goBack } = useNavigation()
  const toast = useToast()

  const { id: eventId, signaturedata } = useActivityParams<{
    id: string
    signaturedata?: string
  }>()

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
        const parsed = parseSignaturedataParam(signaturedata)
        if (!parsed.ok) {
          setLoadError(parsed.error)
          return
        }

        const info = await plaocAdapter.getCallerAppInfo(eventId)
        if (cancelled) return
        setAppInfo(info)

        const req: SignatureRequest = {
          eventId,
          type: parsed.item.type,
          payload: parsed.item.payload,
          appName: info.appName,
          appHome: info.origin,
          appLogo: info.appIcon,
        }

        setSignatureRequest(req)
      } catch {
        if (cancelled) return
        setLoadError(tAuthorize('error.authFailed'))
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [eventId, signaturedata, tAuthorize])

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
    if (!currentWallet) return { sufficient: true, required: '0', walletBalance: '0' }

    const spend =
      transferPayload
        ? { chainName: transferPayload.chainName, amount: transferPayload.balance, fee: transferPayload.fee }
        : destroyPayload
          ? { chainName: destroyPayload.chainName, amount: destroyPayload.destoryAmount, fee: destroyPayload.fee }
          : null

    if (!spend) return { sufficient: true, required: '0', walletBalance: '0' }

    const chainAddress = currentWallet.chainAddresses.find(
      (ca) => ca.chain.toLowerCase() === spend.chainName?.toLowerCase()
    )

    // For now, use a mock balance - in real implementation, this would come from the wallet
    const walletBalance = chainAddress ? '1.0' : '0'
    const result = checkBalance(walletBalance, spend.amount, spend.fee)
    return { ...result, walletBalance }
  }, [currentWallet, destroyPayload, transferPayload])

  const tokenSymbol = useMemo(() => {
    if (transferPayload) return getTokenSymbol(transferPayload)
    if (destroyPayload) return getTokenSymbol(destroyPayload)
    return 'TOKEN'
  }, [destroyPayload, transferPayload])

  const handleBack = useCallback(() => {
    goBack()
  }, [goBack])

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
  const pageTitle =
    signatureRequest?.type === 'message'
      ? tAuthorize('signature.type.message')
      : signatureRequest?.type === 'destory'
        ? tAuthorize('signature.type.destroy')
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
                balance={balanceCheck.walletBalance}
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

        {/* Destroy type display */}
        {destroyPayload && (
          <>
            <TransactionDetails
              from={destroyPayload.senderAddress}
              to={destroyPayload.destoryAddress}
              amount={`${destroyPayload.destoryAmount} ${tokenSymbol}`}
              {...(destroyPayload.fee ? { fee: `${destroyPayload.fee} ${tokenSymbol}` } : {})}
              chainId={destroyPayload.chainName}
            />

            {!balanceCheck.sufficient && (
              <BalanceWarning
                balance={balanceCheck.walletBalance}
                required={balanceCheck.required}
                symbol={tokenSymbol}
              />
            )}
          </>
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
