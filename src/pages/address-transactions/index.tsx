import { useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@/stackflow'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { useEnabledChains } from '@/stores'
import { IconSearch, IconExternalLink, IconInfoCircle } from '@tabler/icons-react'

export function AddressTransactionsPage() {
  const { t } = useTranslation(['common', 'wallet'])
  const { goBack } = useNavigation()
  const enabledChains = useEnabledChains()

  const [selectedChain, setSelectedChain] = useState('ethereum')
  const [address, setAddress] = useState('')

  const selectedChainConfig = useMemo(
    () => enabledChains.find((c) => c.id === selectedChain),
    [enabledChains, selectedChain]
  )

  const explorerUrl = useMemo(() => {
    if (!selectedChainConfig?.explorer || !address.trim()) return null

    const { queryAddress, url } = selectedChainConfig.explorer
    if (queryAddress) {
      return queryAddress.replace(':address', address.trim())
    }
    // Fallback: common explorer patterns
    if (url.includes('etherscan')) {
      return `${url}/address/${address.trim()}`
    }
    if (url.includes('bscscan')) {
      return `${url}/address/${address.trim()}`
    }
    if (url.includes('tronscan')) {
      return `${url}/#/address/${address.trim()}`
    }
    return `${url}/address/${address.trim()}`
  }, [selectedChainConfig, address])

  const handleOpenExplorer = useCallback(() => {
    if (explorerUrl) {
      window.open(explorerUrl, '_blank', 'noopener,noreferrer')
    }
  }, [explorerUrl])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && explorerUrl) {
        handleOpenExplorer()
      }
    },
    [explorerUrl, handleOpenExplorer]
  )

  const evmChains = enabledChains.filter((c) => c.type === 'evm')
  const otherChains = enabledChains.filter((c) => c.type !== 'evm')

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <PageHeader title={t('common:addressLookup.transactionsTitle')} onBack={goBack} />

      <div className="flex-1 space-y-4 p-4">
        {/* Chain Selector */}
        <div className="space-y-2">
          <Label>{t('common:addressLookup.chain')}</Label>
          <Select value={selectedChain} onValueChange={setSelectedChain}>
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
          <Label>{t('common:addressLookup.addressOrHash')}</Label>
          <div className="flex gap-2">
            <Input
              placeholder={t('common:addressLookup.addressOrHashPlaceholder')}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 font-mono text-sm"
            />
            <Button onClick={handleOpenExplorer} disabled={!explorerUrl}>
              <IconSearch className="size-4" />
            </Button>
          </div>
        </div>

        {/* Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <IconInfoCircle className="text-muted-foreground mt-0.5 size-5 shrink-0" />
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  {t('common:addressLookup.explorerHint')}
                </p>
                {selectedChainConfig?.explorer?.url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() =>
                      window.open(selectedChainConfig.explorer!.url, '_blank', 'noopener,noreferrer')
                    }
                  >
                    <IconExternalLink className="size-4" />
                    {t('common:addressLookup.openExplorer', {
                      name: selectedChainConfig.name,
                    })}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        {address.trim() && explorerUrl && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <Button className="w-full gap-2" onClick={handleOpenExplorer}>
                <IconExternalLink className="size-4" />
                {t('common:addressLookup.viewOnExplorer', {
                  name: selectedChainConfig?.name ?? selectedChain,
                })}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
