/**
 * Staking Page - Main entry point
 * Provides tab navigation between Overview, Mint, and Burn
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/page-header'
import { cn } from '@/lib/utils'

type StakingTab = 'overview' | 'mint' | 'burn'

/** Staking page with tab navigation */
export function StakingPage() {
  const { t } = useTranslation('staking')
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<StakingTab>('overview')

  const tabs: { id: StakingTab; label: string }[] = [
    { id: 'overview', label: t('overview') },
    { id: 'mint', label: t('mint') },
    { id: 'burn', label: t('burn') },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PageHeader title={t('title')} onBack={() => router.history.back()} />

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
        {activeTab === 'overview' && <StakingOverviewPanel />}
        {activeTab === 'mint' && <StakingMintPanel />}
        {activeTab === 'burn' && <StakingBurnPanel />}
      </div>
    </div>
  )
}

/** Overview panel - shows staked assets */
function StakingOverviewPanel() {
  const { t } = useTranslation('staking')

  return (
    <div className="space-y-4">
      <p className="text-center text-muted-foreground">{t('noStakedAssets')}</p>
    </div>
  )
}

/** Mint panel - stake tokens */
function StakingMintPanel() {
  const { t } = useTranslation('staking')

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t('mintDescription')}</p>
      {/* MintForm will be added here */}
    </div>
  )
}

/** Burn panel - unstake tokens */
function StakingBurnPanel() {
  const { t } = useTranslation('staking')

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t('burnDescription')}</p>
      {/* BurnForm will be added here */}
    </div>
  )
}

export default StakingPage
