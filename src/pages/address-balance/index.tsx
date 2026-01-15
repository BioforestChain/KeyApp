import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@/stackflow'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/common'
import { ChainProviderGate, useChainProvider } from '@/contexts'
import { useEnabledChains } from '@/stores'
import { IconSearch, IconAlertCircle, IconCurrencyEthereum } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

// ==================== 内部查询组件 ====================

interface BalanceQueryContentProps {
  queryAddress: string
  queryChain: string
}

function BalanceQueryContent({ queryAddress, queryChain }: BalanceQueryContentProps) {
  const { t } = useTranslation(['common'])
  const enabledChains = useEnabledChains()

  // 使用 useChainProvider() 获取确保非空的 provider
  const chainProvider = useChainProvider()

  // 直接调用，不需要条件判断
  const { data: balance, isLoading, error } = chainProvider.nativeBalance.useState(
    { address: queryAddress },
    { enabled: !!queryAddress }
  )

  return (
    <Card className={cn('transition-all', isLoading && 'opacity-50')}>
      <CardContent className="pt-6">
        {error ? (
          <div className="flex items-center gap-3 text-destructive">
            <IconAlertCircle className="size-5 shrink-0" />
            <div>
              <div className="font-medium">{t('common:addressLookup.error')}</div>
              <div className="text-sm opacity-80">{error.message}</div>
            </div>
          </div>
        ) : balance ? (
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
              <IconCurrencyEthereum className="text-primary size-6" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {balance.amount.toFormatted()} {balance.symbol}
              </div>
              <div className="text-muted-foreground text-sm">
                {t('common:addressLookup.onChain', {
                  chain: enabledChains.find((c) => c.id === queryChain)?.name ?? queryChain,
                })}
              </div>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-4">
            <LoadingSpinner size="lg" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

// ==================== 主组件 ====================

export function AddressBalancePage() {
  const { t } = useTranslation(['common', 'wallet'])
  const { goBack } = useNavigation()
  const enabledChains = useEnabledChains()

  const [selectedChain, setSelectedChain] = useState('ethereum')
  const [address, setAddress] = useState('')
  const [queryAddress, setQueryAddress] = useState('')
  const [queryChain, setQueryChain] = useState('')
  const [isFetching, setIsFetching] = useState(false)

  const handleSearch = useCallback(() => {
    if (address.trim()) {
      setIsFetching(true)
      setQueryAddress(address.trim())
      setQueryChain(selectedChain)
      // 在 Gate 渲染后重置 fetching 状态
      setTimeout(() => setIsFetching(false), 100)
    }
  }, [address, selectedChain])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearch()
      }
    },
    [handleSearch]
  )

  const evmChains = enabledChains.filter((c) => c.chainKind === 'evm')
  const otherChains = enabledChains.filter((c) => c.chainKind !== 'evm')

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <PageHeader title={t('common:addressLookup.balanceTitle')} onBack={goBack} />

      <div className="flex-1 space-y-4 p-4">
        {/* Chain Selector */}
        <div className="space-y-2">
          <Label>{t('common:addressLookup.chain')}</Label>
          <Select value={selectedChain} onValueChange={(v) => v && setSelectedChain(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {evmChains.length > 0 && (
                <>
                  <div className="text-muted-foreground px-2 py-1.5 text-xs font-medium">EVM</div>
                  {evmChains.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id}>
                      {chain.name}
                    </SelectItem>
                  ))}
                </>
              )}
              {otherChains.length > 0 && (
                <>
                  <div className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
                    {t('common:addressLookup.otherChains')}
                  </div>
                  {otherChains.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id}>
                      {chain.name}
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Address Input */}
        <div className="space-y-2">
          <Label>{t('common:addressLookup.address')}</Label>
          <div className="flex gap-2">
            <Input
              placeholder={t('common:addressLookup.addressPlaceholder')}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 font-mono text-sm"
            />
            <Button onClick={handleSearch} disabled={!address.trim() || isFetching}>
              {isFetching ? <LoadingSpinner size="sm" /> : <IconSearch className="size-4" />}
            </Button>
          </div>
        </div>

        {/* Result - 使用 ChainProviderGate 包裹 */}
        {queryAddress && queryChain && (
          <ChainProviderGate
            chainId={queryChain}
            fallback={
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-center">Chain not supported</p>
                </CardContent>
              </Card>
            }
          >
            <BalanceQueryContent queryAddress={queryAddress} queryChain={queryChain} />
          </ChainProviderGate>
        )}

        {/* Debug Info (DEV only) */}
        {import.meta.env.DEV && queryAddress && (
          <div className="text-muted-foreground rounded-lg bg-muted/50 p-3 font-mono text-xs">
            <div>Chain: {queryChain}</div>
            <div className="truncate">Address: {queryAddress}</div>
          </div>
        )}
      </div>
    </div>
  )
}
