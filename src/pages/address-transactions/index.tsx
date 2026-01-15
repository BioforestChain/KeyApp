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
import { ChainProviderGate, useChainProvider } from '@/contexts'
import type { Transaction } from '@/services/chain-adapter/providers'
import { NoSupportError } from '@biochain/key-fetch'
import { IconSearch, IconExternalLink, IconArrowUpRight, IconArrowDownLeft, IconLoader2 } from '@tabler/icons-react'

function formatAmount(amount: string, decimals: number): string {
  const num = parseFloat(amount) / Math.pow(10, decimals)
  return num.toLocaleString(undefined, { maximumFractionDigits: 6 })
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

function TransactionItem({ tx, address }: { tx: Transaction; address: string }) {
  const isOutgoing = tx.direction === 'out' || tx.from.toLowerCase() === address.toLowerCase()
  const primaryAsset = tx.assets.find((a) => a.assetType === 'native' || a.assetType === 'token')
  const value = primaryAsset ? primaryAsset.value : '0'
  const symbol = primaryAsset ? primaryAsset.symbol : ''
  const decimals = primaryAsset ? primaryAsset.decimals : 0

  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-b-0">
      <div className={`p-2 rounded-full ${isOutgoing ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
        {isOutgoing ? <IconArrowUpRight className="size-4" /> : <IconArrowDownLeft className="size-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">
          {isOutgoing ? `To: ${tx.to}` : `From: ${tx.from}`}
        </div>
        <div className="text-xs text-muted-foreground">
          {formatDate(tx.timestamp)}
        </div>
      </div>
      <div className={`text-sm font-medium ${isOutgoing ? 'text-red-600' : 'text-green-600'}`}>
        {isOutgoing ? '-' : '+'}{formatAmount(value, decimals)} {symbol}
      </div>
    </div>
  )
}

// ==================== 内部查询组件 ====================

interface TxQueryContentProps {
  searchAddress: string
  selectedChain: string
  explorerUrl: string | null
  onOpenExplorer: () => void
}

function TxQueryContent({ searchAddress, selectedChain, explorerUrl, onOpenExplorer }: TxQueryContentProps) {
  const { t } = useTranslation(['common'])
  const enabledChains = useEnabledChains()
  const selectedChainConfig = useMemo(
    () => enabledChains.find((c) => c.id === selectedChain),
    [enabledChains, selectedChain]
  )

  // 使用 useChainProvider() 获取确保非空的 provider
  const chainProvider = useChainProvider()

  // 直接调用，不需要条件判断
  const { data: transactions, isLoading, error } = chainProvider.transactionHistory.useState(
    { address: searchAddress, limit: 50 },
    { enabled: !!searchAddress }
  )

  // 通过 error 类型判断是否支持
  const supportsTransactionHistory = !(error instanceof NoSupportError)

  return (
    <Card>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <IconLoader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            {t('common:addressLookup.queryError')}
          </div>
        ) : transactions && transactions.length > 0 ? (
          <div className="divide-y">
            {transactions.map((tx) => (
              <TransactionItem key={tx.hash} tx={tx} address={searchAddress} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {!supportsTransactionHistory ? (
              <p>{t('common:addressLookup.useExplorerHint')}</p>
            ) : (
              <p>{t('common:addressLookup.noTransactions')}</p>
            )}
          </div>
        )}

        {/* Explorer Link */}
        {explorerUrl && (
          <div className="mt-4 pt-4 border-t">
            <Button
              variant={!supportsTransactionHistory ? 'default' : 'outline'}
              size="sm"
              className="w-full gap-2"
              onClick={onOpenExplorer}
            >
              <IconExternalLink className="size-4" />
              {t('common:addressLookup.viewOnExplorer', {
                name: selectedChainConfig?.name ?? selectedChain,
              })}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ==================== 主组件 ====================

export function AddressTransactionsPage() {
  const { t } = useTranslation(['common', 'wallet'])
  const { goBack } = useNavigation()
  const enabledChains = useEnabledChains()

  const [selectedChain, setSelectedChain] = useState('bfmeta')
  const [address, setAddress] = useState('')
  const [searchAddress, setSearchAddress] = useState('')
  const [searchChain, setSearchChain] = useState('')

  const selectedChainConfig = useMemo(
    () => enabledChains.find((c) => c.id === searchChain),
    [enabledChains, searchChain]
  )

  const explorerUrl = useMemo(() => {
    if (!selectedChainConfig?.explorer || !searchAddress.trim()) return null
    const { queryAddress, url } = selectedChainConfig.explorer
    if (queryAddress) {
      return queryAddress.replace(':address', searchAddress.trim())
    }
    return `${url}/address/${searchAddress.trim()}`
  }, [selectedChainConfig, searchAddress])

  const handleSearch = useCallback(() => {
    if (address.trim()) {
      setSearchAddress(address.trim())
      setSearchChain(selectedChain)
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

  const handleOpenExplorer = useCallback(() => {
    if (explorerUrl) {
      window.open(explorerUrl, '_blank', 'noopener,noreferrer')
    }
  }, [explorerUrl])

  const evmChains = enabledChains.filter((c) => c.chainKind === 'evm')
  const otherChains = enabledChains.filter((c) => c.chainKind !== 'evm')

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <PageHeader title={t('common:addressLookup.transactionsTitle')} onBack={goBack} />

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
            <Button onClick={handleSearch} disabled={!address.trim()}>
              <IconSearch className="size-4" />
            </Button>
          </div>
        </div>

        {/* Results - 使用 ChainProviderGate 包裹 */}
        {searchAddress && searchChain && (
          <ChainProviderGate
            chainId={searchChain}
            fallback={
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-center">Chain not supported</p>
                </CardContent>
              </Card>
            }
          >
            <TxQueryContent
              searchAddress={searchAddress}
              selectedChain={searchChain}
              explorerUrl={explorerUrl}
              onOpenExplorer={handleOpenExplorer}
            />
          </ChainProviderGate>
        )}
      </div>
    </div>
  )
}
