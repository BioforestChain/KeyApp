import { useState, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { BioAccount } from '@biochain/bio-sdk'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

import { BackgroundBeams } from './components/BackgroundBeams'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Coins, Leaf, DollarSign, X, ChevronDown, ChevronLeft, Zap, ArrowDown, Check, Loader2, AlertCircle } from 'lucide-react'

import { useRechargeConfig, useForge, type ForgeOption } from '@/hooks'

type Step = 'connect' | 'swap' | 'confirm' | 'processing' | 'success'

const TOKEN_COLORS: Record<string, string> = {
  ETH: 'bg-indigo-600',
  BSC: 'bg-yellow-600',
  TRON: 'bg-red-600',
  BFM: 'bg-emerald-600',
  USDT: 'bg-teal-600',
  BFC: 'bg-blue-600',
}

export default function App() {
  const { t } = useTranslation()
  const [step, setStep] = useState<Step>('connect')
  const [externalAccount, setExternalAccount] = useState<BioAccount | null>(null)
  const [internalAccount, setInternalAccount] = useState<BioAccount | null>(null)
  const [selectedOption, setSelectedOption] = useState<ForgeOption | null>(null)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)

  // Fetch recharge config from backend
  const { forgeOptions, isLoading: configLoading, error: configError } = useRechargeConfig()
  
  // Forge hook
  const forgeHook = useForge()

  // Helper to get chain name from translations
  const getChainName = useCallback((chain: string) => {
    return t(`chain.${chain}`, { defaultValue: chain })
  }, [t])

  // Close splash screen
  useEffect(() => {
    window.bio?.request({ method: 'bio_closeSplashScreen' })
  }, [])

  // Auto-select first option when config loads
  useEffect(() => {
    if (forgeOptions.length > 0 && !selectedOption) {
      setSelectedOption(forgeOptions[0])
    }
  }, [forgeOptions, selectedOption])

  // Watch forge status
  useEffect(() => {
    if (forgeHook.step === 'success') {
      setStep('success')
    } else if (forgeHook.step === 'error') {
      setError(forgeHook.error)
      setStep('confirm')
    } else if (forgeHook.step !== 'idle') {
      setStep('processing')
    }
  }, [forgeHook.step, forgeHook.error])

  const handleConnect = useCallback(async () => {
    if (!window.bio) {
      setError('Bio SDK 未初始化')
      return
    }
    setLoading(true)
    setError(null)
    try {
      // Select external chain account (for payment)
      const extAcc = await window.bio.request<BioAccount>({
        method: 'bio_selectAccount',
        params: [{ chain: selectedOption?.externalChain?.toLowerCase() }],
      })
      setExternalAccount(extAcc)

      // Select internal chain account (for receiving)
      const intAcc = await window.bio.request<BioAccount>({
        method: 'bio_selectAccount',
        params: [{ chain: selectedOption?.internalChain }],
      })
      setInternalAccount(intAcc)

      setStep('swap')
    } catch (err) {
      setError(err instanceof Error ? err.message : '连接失败')
    } finally {
      setLoading(false)
    }
  }, [selectedOption])

  const handlePreview = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('请输入有效金额')
      return
    }
    setError(null)
    setStep('confirm')
  }

  const handleConfirm = useCallback(async () => {
    if (!externalAccount || !internalAccount || !selectedOption) return
    
    setError(null)
    setStep('processing')

    await forgeHook.forge({
      externalChain: selectedOption.externalChain,
      externalAsset: selectedOption.externalAsset,
      depositAddress: selectedOption.externalInfo.depositAddress,
      amount,
      externalAccount,
      internalChain: selectedOption.internalChain,
      internalAsset: selectedOption.internalAsset,
      internalAccount,
    })
  }, [externalAccount, internalAccount, selectedOption, amount, forgeHook])

  const handleReset = useCallback(() => {
    setStep('swap')
    setAmount('')
    setError(null)
    forgeHook.reset()
  }, [forgeHook])

  const handleSelectOption = (option: ForgeOption) => {
    setSelectedOption(option)
    setPickerOpen(false)
  }

  // Group options by external chain for picker
  const groupedOptions = useMemo(() => {
    const groups: Record<string, ForgeOption[]> = {}
    for (const opt of forgeOptions) {
      const key = opt.externalChain
      if (!groups[key]) groups[key] = []
      groups[key].push(opt)
    }
    return groups
  }, [forgeOptions])

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground">
      <BackgroundBeams className="opacity-30" />
      
      <div className="relative z-10 w-full max-w-md mx-auto min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 backdrop-blur-md bg-background/80 border-b border-border">
          <div className="flex items-center h-14 px-4">
            {step === 'confirm' && (
              <Button variant="ghost" size="icon-sm" onClick={() => setStep('swap')}>
                <ChevronLeft className="size-5" />
              </Button>
            )}
            <h1 className="flex-1 text-center font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
              {t('app.title')}
            </h1>
            <div className="w-7" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 flex flex-col p-4">
          {/* Loading config */}
          {configLoading && (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Config error */}
          {configError && (
            <Card className="mb-4 border-destructive/50 bg-destructive/10">
              <CardContent className="py-3 flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="size-4" />
                {configError}
              </CardContent>
            </Card>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="mb-4 border-destructive/50 bg-destructive/10">
                <CardContent className="py-3 text-destructive text-sm">
                  {error}
                </CardContent>
              </Card>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* Connect */}
            {step === 'connect' && !configLoading && (
              <motion.div
                key="connect"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 flex flex-col items-center justify-center gap-8 pb-20"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full" />
                  <Avatar className="relative size-28 border-2 border-orange-500/30">
                    <AvatarFallback className="bg-gradient-to-b from-muted to-muted/50">
                      <Zap className="size-14 text-orange-500" strokeWidth={1.5} />
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">{t('app.subtitle')}</h2>
                  <p className="text-muted-foreground text-sm">{t('app.description')}</p>
                </div>

                {/* Available chains preview */}
                {forgeOptions.length > 0 && (
                  <div className="flex gap-2">
                    {Object.keys(groupedOptions).map((chain) => (
                      <Badge key={chain} variant="outline">
                        {getChainName(chain)}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <Button 
                  data-testid="connect-button"
                  size="lg" 
                  className="w-full max-w-xs h-12"
                  onClick={handleConnect} 
                  disabled={loading || forgeOptions.length === 0}
                >
                  {loading && <Loader2 className="size-4 animate-spin mr-2" />}
                  {loading ? t('connect.loading') : t('connect.button')}
                </Button>

                {/* Disclaimer */}
                <div className="mt-4 text-center text-xs text-muted-foreground space-y-1 max-w-xs">
                  <p>{t('disclaimer.title')}</p>
                  <p>{t('disclaimer.ratio')}</p>
                </div>
              </motion.div>
            )}

            {/* Swap */}
            {step === 'swap' && selectedOption && (
              <motion.div
                key="swap"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col gap-3"
              >
                {/* From Card (External Chain) */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardDescription>{t('forge.pay')} ({getChainName(selectedOption.externalChain)})</CardDescription>
                      <CardDescription className="text-xs truncate max-w-32">
                        {externalAccount?.address?.slice(0, 8)}...
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        className="shrink-0 gap-2 h-10 px-3"
                        onClick={() => setPickerOpen(true)}
                      >
                        <TokenAvatar symbol={selectedOption.externalAsset} size="sm" />
                        <span className="font-semibold">{selectedOption.externalAsset}</span>
                        <ChevronDown className="size-4 text-muted-foreground" />
                      </Button>
                      <Input
                        data-testid="amount-input"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="text-right text-2xl font-bold h-10 border-0 focus-visible:ring-0"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Arrow */}
                <div className="flex justify-center -my-1.5 relative z-10">
                  <Avatar className="size-10 border border-orange-500/30 bg-background">
                    <AvatarFallback className="bg-orange-500/10">
                      <ArrowDown className="size-4 text-orange-500" />
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* To Card (Internal Chain) */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardDescription>{t('forge.receive')} ({getChainName(selectedOption.internalChain)})</CardDescription>
                      <CardDescription className="text-xs truncate max-w-32">
                        {internalAccount?.address?.slice(0, 8)}...
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 flex items-center gap-2 h-10 px-3 border rounded-md bg-muted/50">
                        <TokenAvatar symbol={selectedOption.internalAsset} size="sm" />
                        <span className="font-semibold">{selectedOption.internalAsset}</span>
                      </div>
                      <div className="flex-1 text-right text-2xl font-bold text-muted-foreground">
                        {amount || '0.00'}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Rate Info - 1:1 for forge */}
                {amount && parseFloat(amount) > 0 && (
                  <Card className="border-orange-500/20 bg-orange-500/5">
                    <CardContent className="py-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('forge.ratio')}</span>
                        <span>1:1</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('forge.depositAddress')}</span>
                        <span className="font-mono text-xs truncate max-w-40">
                          {selectedOption.externalInfo.depositAddress.slice(0, 10)}...
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="mt-auto pt-4">
                  <Button 
                    data-testid="preview-button"
                    className="w-full h-12" 
                    onClick={handlePreview}
                    disabled={!amount || parseFloat(amount) <= 0}
                  >
                    {t('forge.preview')}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Confirm */}
            {step === 'confirm' && selectedOption && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col gap-4"
              >
                <Card>
                  <CardContent className="py-6 text-center space-y-4">
                    <div>
                      <CardDescription className="mb-1">
                        {t('forge.pay')} ({getChainName(selectedOption.externalChain)})
                      </CardDescription>
                      <div className="text-3xl font-bold flex items-center justify-center gap-2">
                        <TokenAvatar symbol={selectedOption.externalAsset} size="sm" />
                        {amount} <span className="text-lg text-muted-foreground">{selectedOption.externalAsset}</span>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Avatar className="size-10 border border-orange-500/30 bg-orange-500/10">
                        <AvatarFallback className="bg-transparent">
                          <ArrowDown className="size-5 text-orange-500" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <CardDescription className="mb-1">
                        {t('forge.receive')} ({getChainName(selectedOption.internalChain)})
                      </CardDescription>
                      <div className="text-3xl font-bold text-orange-500 flex items-center justify-center gap-2">
                        <TokenAvatar symbol={selectedOption.internalAsset} size="sm" />
                        {amount} <span className="text-lg text-orange-500/60">{selectedOption.internalAsset}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="py-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('forge.ratio')}</span>
                      <span>1:1</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('forge.network')}</span>
                      <div className="flex gap-2">
                        <Badge variant="outline">{getChainName(selectedOption.externalChain)}</Badge>
                        <span>→</span>
                        <Badge variant="outline">{getChainName(selectedOption.internalChain)}</Badge>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('forge.depositAddress')}</span>
                      <span className="font-mono text-xs truncate max-w-32">
                        {selectedOption.externalInfo.depositAddress.slice(0, 10)}...
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-auto pt-4">
                  <Button 
                    data-testid="confirm-button"
                    className="w-full h-12" 
                    onClick={handleConfirm}
                    disabled={loading}
                  >
                    {t('forge.confirm')}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Processing */}
            {step === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center gap-6 pb-20"
              >
                <div className="relative size-24">
                  <div className="absolute inset-0 border-4 border-muted rounded-full" />
                  <div className="absolute inset-0 border-4 border-t-orange-500 rounded-full animate-spin" />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-bold">
                    {forgeHook.step === 'signing_external' && t('processing.signingExternal')}
                    {forgeHook.step === 'signing_internal' && t('processing.signingInternal')}
                    {forgeHook.step === 'submitting' && t('processing.submitting')}
                    {forgeHook.step === 'idle' && t('processing.default')}
                  </h2>
                  <p className="text-muted-foreground text-sm">{t('processing.hint')}</p>
                </div>
              </motion.div>
            )}

            {/* Success */}
            {step === 'success' && selectedOption && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center gap-6 pb-20"
              >
                <Avatar className="size-20 border border-emerald-500/30 bg-emerald-500/10">
                  <AvatarFallback className="bg-transparent">
                    <Check className="size-10 text-emerald-500" />
                  </AvatarFallback>
                </Avatar>
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-bold">{t('success.title')}</h2>
                  <p className="text-2xl font-bold text-emerald-400">
                    {amount} {selectedOption.internalAsset}
                  </p>
                  {forgeHook.orderId && (
                    <p className="text-xs text-muted-foreground font-mono">
                      {t('success.orderId')}: {forgeHook.orderId.slice(0, 16)}...
                    </p>
                  )}
                </div>
                <Button variant="outline" className="w-full max-w-xs" onClick={handleReset}>
                  {t('forge.continue')}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Token Picker Modal */}
          {pickerOpen && (
            <div className="fixed inset-0 z-50">
              <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                onClick={() => setPickerOpen(false)} 
              />
              <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl border-t border-border animate-in slide-in-from-bottom">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <CardTitle>{t('picker.title')}</CardTitle>
                  <Button variant="ghost" size="icon-sm" onClick={() => setPickerOpen(false)}>
                    <X className="size-5" />
                  </Button>
                </div>
                <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                  {Object.entries(groupedOptions).map(([chain, options]) => (
                    <div key={chain}>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        {getChainName(chain)}
                      </h3>
                      <div className="space-y-2">
                        {options.map((option) => (
                          <Card 
                            key={`${option.externalChain}-${option.externalAsset}-${option.internalAsset}`}
                            className={cn(
                              "cursor-pointer transition-colors hover:bg-accent",
                              selectedOption?.externalAsset === option.externalAsset &&
                              selectedOption?.externalChain === option.externalChain &&
                              "ring-2 ring-primary"
                            )}
                            onClick={() => handleSelectOption(option)}
                          >
                            <CardContent className="py-3 flex items-center gap-3">
                              <TokenAvatar symbol={option.externalAsset} size="md" />
                              <div className="flex-1">
                                <CardTitle className="text-base">
                                  {option.externalAsset} → {option.internalAsset}
                                </CardTitle>
                                <CardDescription>
                                  {getChainName(option.externalChain)} → {getChainName(option.internalChain)}
                                </CardDescription>
                              </div>
                              {selectedOption?.externalAsset === option.externalAsset &&
                               selectedOption?.externalChain === option.externalChain && (
                                <Badge>{t('picker.selected')}</Badge>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
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
