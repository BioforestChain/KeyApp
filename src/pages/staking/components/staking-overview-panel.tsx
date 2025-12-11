/**
 * Staking Overview Panel - Pool list with search and filtering
 */

import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { StakingPoolCard } from './staking-pool-card'
import { mockStakingService } from '@/services/staking.mock'
import type { StakingOverviewItem, ExternalChain, InternalChain } from '@/types/staking'
import { cn } from '@/lib/utils'

interface StakingOverviewPanelProps {
  onMint?: (item: StakingOverviewItem) => void
  className?: string
}

type ChainFilter = ExternalChain | InternalChain | 'all'

const CHAIN_OPTIONS: { value: ChainFilter; label: string }[] = [
  { value: 'all', label: 'allNetworks' },
  { value: 'ETH', label: 'Ethereum' },
  { value: 'BSC', label: 'BNB Chain' },
  { value: 'TRON', label: 'Tron' },
  { value: 'BFMeta', label: 'BFMeta' },
  { value: 'BFChain', label: 'BFChain' },
]

/** Staking overview panel with search and filter */
export function StakingOverviewPanel({ onMint, className }: StakingOverviewPanelProps) {
  const { t } = useTranslation('staking')
  const [searchQuery, setSearchQuery] = useState('')
  const [chainFilter, setChainFilter] = useState<ChainFilter>('all')
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [pools, setPools] = useState<StakingOverviewItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch overview data
  useEffect(() => {
    let mounted = true
    setIsLoading(true)
    mockStakingService.getOverview().then((data) => {
      if (mounted) {
        setPools(data)
        setIsLoading(false)
      }
    })
    return () => {
      mounted = false
    }
  }, [])

  // Filter pools
  const filteredPools = useMemo(() => {
    let result = pools

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (pool) =>
          pool.assetType.toLowerCase().includes(query) ||
          pool.externalAssetType.toLowerCase().includes(query) ||
          pool.chain.toLowerCase().includes(query) ||
          pool.externalChain.toLowerCase().includes(query)
      )
    }

    // Filter by chain
    if (chainFilter !== 'all') {
      result = result.filter(
        (pool) => pool.chain === chainFilter || pool.externalChain === chainFilter
      )
    }

    return result
  }, [pools, searchQuery, chainFilter])

  const handleSelectChain = (chain: ChainFilter) => {
    setChainFilter(chain)
    setFilterSheetOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LoadingSpinner size="lg" />
        <p className="mt-2 text-sm text-muted-foreground">{t('loading')}</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Filter */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Filter className="size-4" />
              {chainFilter !== 'all' && (
                <span className="absolute -right-1 -top-1 size-2 rounded-full bg-primary" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[60vh]">
            <SheetHeader>
              <SheetTitle>{t('selectNetwork')}</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-2">
              {CHAIN_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelectChain(option.value)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-colors',
                    chainFilter === option.value
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted'
                  )}
                >
                  <span>
                    {option.value === 'all' ? t('allNetworks') : option.label}
                  </span>
                  {chainFilter === option.value && (
                    <span className="text-primary">✓</span>
                  )}
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Pool List */}
      {filteredPools.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-muted-foreground">{t('noResults')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPools.map((pool, index) => (
            <StakingPoolCard
              key={`${pool.chain}-${pool.assetType}-${index}`}
              item={pool}
              onMint={onMint}
            />
          ))}
        </div>
      )}
    </div>
  )
}
