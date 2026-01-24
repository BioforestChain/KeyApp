/**
 * RedemptionForm Component
 * 赎回表单：内链资产 → 外链资产
 */

import { useState, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { BioAccount } from '@biochain/bio-sdk'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ArrowDown, AlertCircle, Check, Coins, DollarSign, Leaf } from 'lucide-react'

import type { RechargeConfig, ExternalChainName, RechargeItem } from '@/api/types'
import { useRedemption } from '@/hooks/useRedemption'
import { calculateRedemptionFee, formatAmount, parseAmount, isAmountWithinLimits } from '@/lib/fee'

interface RedemptionFormProps {
  config: RechargeConfig
  onSuccess?: (orderId: string) => void
  onBack?: () => void
}

interface RedemptionOption {
  internalChain: string
  internalAsset: string
  externalChain: ExternalChainName
  externalAsset: string
  rechargeItem: RechargeItem
}

const TOKEN_COLORS: Record<string, string> = {
  ETH: 'bg-indigo-600',
  BSC: 'bg-yellow-600',
  TRON: 'bg-red-600',
  BFM: 'bg-emerald-600',
  USDT: 'bg-teal-600',
  BFC: 'bg-blue-600',
}

function TokenAvatar({ symbol, size = 'sm' }: { symbol: string; size?: 'sm' | 'md' }) {
  const iconSize = size === 'md' ? 'size-5' : 'size-4'
  const icons: Record<string, React.ReactNode> = {
    ETH: <Coins className={iconSize} />,
    BSC: <Coins className={iconSize} />,
    TRON: <Coins className={iconSize} />,
    BFM: <Leaf className={iconSize} />,
    BFC: <Leaf className={iconSize} />,
    USDT: <DollarSign className={iconSize} />,
  }
  return (
    <Avatar className={cn(size === 'md' ? 'size-10' : 'size-6', TOKEN_COLORS[symbol] || 'bg-muted')}>
      <AvatarFallback className="bg-transparent text-white">
        {icons[symbol] || <Coins className={iconSize} />}
      </AvatarFallback>
    </Avatar>
  )
}

export function RedemptionForm({ config, onSuccess }: RedemptionFormProps) {
  const { t } = useTranslation()
  const redemption = useRedemption()

  // Form state
  const [internalAccount, setInternalAccount] = useState<BioAccount | null>(null)
  const [selectedOption, setSelectedOption] = useState<RedemptionOption | null>(null)
  const [amount, setAmount] = useState('')
  const [externalAddress, setExternalAddress] = useState('')
  const [step, setStep] = useState<'select' | 'form' | 'confirm' | 'processing' | 'success'>('select')
  const [error, setError] = useState<string | null>(null)

  // Parse available redemption options from config
  const redemptionOptions = useMemo(() => {
    const options: RedemptionOption[] = []
    
    for (const [internalChain, assets] of Object.entries(config)) {
      for (const [internalAsset, item] of Object.entries(assets)) {
        if (!item.enable || !item.redemption?.enable) continue
        
        for (const [externalChain, externalInfo] of Object.entries(item.supportChain)) {
          if (!externalInfo?.enable) continue
          
          options.push({
            internalChain,
            internalAsset,
            externalChain: externalChain as ExternalChainName,
            externalAsset: externalInfo.assetType,
            rechargeItem: item,
          })
        }
      }
    }
    
    return options
  }, [config])

  // Auto-select first option
  useEffect(() => {
    if (redemptionOptions.length > 0 && !selectedOption) {
      setSelectedOption(redemptionOptions[0])
    }
  }, [redemptionOptions, selectedOption])

  // Watch redemption status
  useEffect(() => {
    if (redemption.step === 'success') {
      setStep('success')
      onSuccess?.(redemption.orderId!)
    } else if (redemption.step === 'error') {
      setError(redemption.error)
      setStep('confirm')
    } else if (redemption.step !== 'idle') {
      setStep('processing')
    }
  }, [redemption.step, redemption.error, redemption.orderId, onSuccess])

  // Fee calculation
  const feeResult = useMemo(() => {
    if (!selectedOption?.rechargeItem.redemption || !amount) return null
    
    const amountInUnits = parseAmount(amount)
    return calculateRedemptionFee(
      amountInUnits,
      selectedOption.externalChain,
      selectedOption.rechargeItem.redemption
    )
  }, [selectedOption, amount])

  // Amount validation
  const amountValidation = useMemo(() => {
    if (!selectedOption?.rechargeItem.redemption || !amount) return null
    
    const amountInUnits = parseAmount(amount)
    return isAmountWithinLimits(amountInUnits, selectedOption.rechargeItem.redemption)
  }, [selectedOption, amount])

  const handleConnect = useCallback(async () => {
    if (!window.bio || !selectedOption) return
    
    setError(null)
    try {
      const acc = await window.bio.request<BioAccount>({
        method: 'bio_selectAccount',
        params: [{ chain: selectedOption.internalChain }],
      })
      setInternalAccount(acc)
      setStep('form')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed')
    }
  }, [selectedOption])

  const handlePreview = () => {
    if (!amount || !externalAddress) {
      setError(t('redemption.error.fillAll'))
      return
    }
    if (!amountValidation?.valid) {
      const errorKey = amountValidation?.reason === 'below_min' 
        ? 'redemption.error.below_min' 
        : amountValidation?.reason === 'above_max'
        ? 'redemption.error.above_max'
        : 'error.invalidAmount'
      setError(t(errorKey))
      return
    }
    if (!feeResult?.isValid) {
      setError(t('redemption.error.amountTooLow'))
      return
    }
    setError(null)
    setStep('confirm')
  }

  const handleConfirm = useCallback(async () => {
    if (!internalAccount || !selectedOption) return
    
    setError(null)
    
    await redemption.redeem({
      internalChain: selectedOption.internalChain,
      internalAsset: selectedOption.internalAsset,
      internalAccount,
      amount: parseAmount(amount).toString(),
      externalChain: selectedOption.externalChain,
      externalAddress,
      externalAsset: selectedOption.externalAsset,
      applyAddress: selectedOption.rechargeItem.applyAddress,
    })
  }, [internalAccount, selectedOption, amount, externalAddress, redemption])

  const handleReset = useCallback(() => {
    setStep('form')
    setAmount('')
    setExternalAddress('')
    setError(null)
    redemption.reset()
  }, [redemption])

  const getChainName = useCallback((chain: string) => {
    return t(`chain.${chain}`, { defaultValue: chain })
  }, [t])

  // No redemption options available
  if (redemptionOptions.length === 0) {
    return (
      <Card className="border-muted">
        <CardContent className="py-8 text-center text-muted-foreground">
          {t('redemption.noOptions')}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="py-3 flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="size-4" />
              {error}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Select & Connect */}
      {step === 'select' && selectedOption && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-6 py-8"
        >
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold">{t('redemption.title')}</h2>
            <p className="text-muted-foreground text-sm">{t('redemption.description')}</p>
          </div>

          {/* Chain selection */}
          <div className="flex flex-wrap gap-2 justify-center">
            {redemptionOptions.map((opt) => (
              <Badge
                key={`${opt.internalChain}-${opt.internalAsset}-${opt.externalChain}`}
                asChild
                variant={selectedOption === opt ? 'secondary' : 'outline'}
                className={cn(
                  'cursor-pointer select-none',
                  selectedOption === opt && 'ring-2 ring-primary/40'
                )}
              >
                <button type="button" onClick={() => setSelectedOption(opt)}>
                  {opt.internalAsset} → {getChainName(opt.externalChain)}
                </button>
              </Badge>
            ))}
          </div>

          <Button size="lg" className="w-full max-w-xs" onClick={handleConnect}>
            {t('redemption.connect')}
          </Button>
        </motion.div>
      )}

      {/* Form */}
      {step === 'form' && selectedOption && internalAccount && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-3"
        >
          {/* From (Internal) */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>
                {t('redemption.from')} ({getChainName(selectedOption.internalChain)})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="shrink-0 flex items-center gap-2 h-10 px-3 border rounded-md bg-muted/50">
                  <TokenAvatar symbol={selectedOption.internalAsset} size="sm" />
                  <span className="font-semibold">{selectedOption.internalAsset}</span>
                </div>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="text-right text-2xl font-bold h-10 border-0 focus-visible:ring-0"
                />
              </div>
              <div className="text-xs text-muted-foreground font-mono break-all">
                {internalAccount.address}
              </div>
              {selectedOption.rechargeItem.redemption && (
                <div className="text-xs text-muted-foreground">
                  {t('redemption.limits')}: {formatAmount(String(selectedOption.rechargeItem.redemption.min))} - {formatAmount(String(selectedOption.rechargeItem.redemption.max))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Arrow */}
          <div className="flex justify-center -my-1.5 relative z-10">
            <Avatar className="size-10 border border-blue-500/30 bg-background">
              <AvatarFallback className="bg-blue-500/10">
                <ArrowDown className="size-4 text-blue-500" />
              </AvatarFallback>
            </Avatar>
          </div>

          {/* To (External) */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>
                {t('redemption.to')} ({getChainName(selectedOption.externalChain)})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="shrink-0 flex items-center gap-2 h-10 px-3 border rounded-md bg-muted/50">
                  <TokenAvatar symbol={selectedOption.externalAsset} size="sm" />
                  <span className="font-semibold">{selectedOption.externalAsset}</span>
                </div>
                <div className="flex-1 text-right text-2xl font-bold text-muted-foreground">
                  {feeResult?.isValid ? formatAmount(feeResult.receivable) : '0.00'}
                </div>
              </div>
              <Input
                type="text"
                value={externalAddress}
                onChange={(e) => setExternalAddress(e.target.value)}
                placeholder={t('redemption.addressPlaceholder')}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>

          {/* Fee Info */}
          {feeResult && amount && (
            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardContent className="py-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('redemption.fee')}</span>
                  <span>{formatAmount(feeResult.totalFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('redemption.receivable')}</span>
                  <span className="font-semibold text-blue-500">
                    {formatAmount(feeResult.receivable)} {selectedOption.externalAsset}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-auto pt-4">
            <Button className="w-full h-12" onClick={handlePreview} disabled={!amount || !externalAddress}>
              {t('redemption.preview')}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Confirm */}
      {step === 'confirm' && selectedOption && feeResult && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-4"
        >
          <Card>
            <CardContent className="py-6 text-center space-y-4">
              <div>
                <CardDescription className="mb-1">
                  {t('redemption.from')} ({getChainName(selectedOption.internalChain)})
                </CardDescription>
                <div className="text-3xl font-bold flex items-center justify-center gap-2">
                  <TokenAvatar symbol={selectedOption.internalAsset} size="sm" />
                  {amount} <span className="text-lg text-muted-foreground">{selectedOption.internalAsset}</span>
                </div>
              </div>
              <div className="flex justify-center">
                <Avatar className="size-10 border border-blue-500/30 bg-blue-500/10">
                  <AvatarFallback className="bg-transparent">
                    <ArrowDown className="size-5 text-blue-500" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <CardDescription className="mb-1">
                  {t('redemption.to')} ({getChainName(selectedOption.externalChain)})
                </CardDescription>
                <div className="text-3xl font-bold text-blue-500 flex items-center justify-center gap-2">
                  <TokenAvatar symbol={selectedOption.externalAsset} size="sm" />
                  {formatAmount(feeResult.receivable)} <span className="text-lg text-blue-500/60">{selectedOption.externalAsset}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('redemption.targetAddress')}</span>
                <span className="font-mono text-xs truncate max-w-40">{externalAddress.slice(0, 10)}...</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('redemption.fee')}</span>
                <span>{formatAmount(feeResult.totalFee)}</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 mt-auto pt-4">
            <Button variant="outline" className="flex-1 h-12" onClick={() => setStep('form')}>
              {t('common.back')}
            </Button>
            <Button className="flex-1 h-12" onClick={handleConfirm}>
              {t('redemption.confirm')}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Processing */}
      {step === 'processing' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center gap-6 py-16"
        >
          <div className="relative size-24">
            <div className="absolute inset-0 border-4 border-muted rounded-full" />
            <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold">
              {redemption.step === 'creating_transaction' && t('redemption.processing.creating')}
              {redemption.step === 'signing' && t('redemption.processing.signing')}
              {redemption.step === 'submitting' && t('redemption.processing.submitting')}
            </h2>
            <p className="text-muted-foreground text-sm">{t('processing.hint')}</p>
          </div>
        </motion.div>
      )}

      {/* Success */}
      {step === 'success' && selectedOption && feeResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center gap-6 py-16"
        >
          <Avatar className="size-20 border border-emerald-500/30 bg-emerald-500/10">
            <AvatarFallback className="bg-transparent">
              <Check className="size-10 text-emerald-500" />
            </AvatarFallback>
          </Avatar>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold">{t('redemption.success.title')}</h2>
            <p className="text-2xl font-bold text-emerald-400">
              {formatAmount(feeResult.receivable)} {selectedOption.externalAsset}
            </p>
            {redemption.orderId && (
              <p className="text-xs text-muted-foreground font-mono">
                {t('success.orderId')}: {redemption.orderId.slice(0, 16)}...
              </p>
            )}
          </div>
          <Button variant="outline" className="w-full max-w-xs" onClick={handleReset}>
            {t('redemption.continue')}
          </Button>
        </motion.div>
      )}
    </div>
  )
}
