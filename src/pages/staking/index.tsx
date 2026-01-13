/**
 * Staking Page - Main entry point
 * Provides tab navigation between Overview, Mint, Burn, and History
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@/stackflow'
import { PageHeader } from '@/components/layout/page-header'
import { cn } from '@/lib/utils'
import { StakingOverviewPanel, MintForm, BurnForm, StakingRecordList } from './components'
import type { StakingOverviewItem } from '@/types/staking'

type StakingTab = 'overview' | 'mint' | 'burn' | 'history'

/** Staking page with tab navigation */
export function StakingPage() {
  const { t } = useTranslation('staking')
  const { goBack } = useNavigation()
  const [activeTab, setActiveTab] = useState<StakingTab>('overview')

  const tabs: { id: StakingTab; label: string }[] = [
    { id: 'overview', label: t('overview') },
    { id: 'mint', label: t('mint') },
    { id: 'burn', label: t('burn') },
    { id: 'history', label: t('history') },
  ]

  /** Handle mint button click - switch to mint tab */
  const handleMint = (_item: StakingOverviewItem) => {
    setActiveTab('mint')
    // TODO: Pre-fill mint form with selected asset
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PageHeader title={t('title')} onBack={goBack} />

      {/* Tab Navigation */}
      <div className="flex border-b border-border px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 py-3 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-4">
        {activeTab === 'overview' && <StakingOverviewPanel onMint={handleMint} />}
        {activeTab === 'mint' && <StakingMintPanel />}
        {activeTab === 'burn' && <StakingBurnPanel />}
        {activeTab === 'history' && <StakingRecordList />}
      </div>
    </div>
  )
}

/** Mint panel - stake tokens */
function StakingMintPanel() {
  const { t } = useTranslation('staking')

  const handleSuccess = (txId: string) => {
    // TODO: Navigate to transaction detail or show success toast
    
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t('mintDescription')}</p>
      <MintForm onSuccess={handleSuccess} />
    </div>
  )
}

/** Burn panel - unstake tokens */
function StakingBurnPanel() {
  const { t } = useTranslation('staking')

  const handleSuccess = (txId: string) => {
    // TODO: Navigate to transaction detail or show success toast
    
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t('burnDescription')}</p>
      <BurnForm onSuccess={handleSuccess} />
    </div>
  )
}

export default StakingPage
