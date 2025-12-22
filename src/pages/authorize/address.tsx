import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigation, useActivityParams, useFlow } from '@/stackflow'
import { setPasswordConfirmCallback } from '@/stackflow/activities/sheets'
import { useTranslation } from 'react-i18next'
import { useStore } from '@tanstack/react-store'
import { PageHeader } from '@/components/layout/page-header'
import { AppInfoCard } from '@/components/authorize/AppInfoCard'
import { PermissionList } from '@/components/authorize/PermissionList'
import { Button } from '@/components/ui/button'
import { WalletSelector } from '@/components/wallet/wallet-selector'
import { ChainAddressSelector, type ChainData } from '@/components/wallet/chain-address-selector'
import type { ChainType as ChainIconType } from '@/components/wallet/chain-icon'
import { cn } from '@/lib/utils'
import {
  AddressAuthService,
  plaocAdapter,
  type AddressAuthResponse,
  type CallerAppInfo,
} from '@/services/authorize'
import { useToast } from '@/services'
import { walletStore, walletSelectors, type Wallet } from '@/stores'

const REQUEST_TIMEOUT_MS = 5 * 60 * 1000

const CHAIN_NAMES: Record<string, string> = {
  ethereum: 'Ethereum',
  bitcoin: 'Bitcoin',
  tron: 'Tron',
  binance: 'BSC',
  bsc: 'BSC',
  bfmeta: 'BFMeta',
  ccchain: 'CCChain',
  pmchain: 'PMChain',
  bfchainv2: 'BFChain V2',
  btgmeta: 'BTGMeta',
  biwmeta: 'BIWMeta',
  ethmeta: 'ETHMeta',
  malibu: 'Malibu',
  ccc: 'CCChain',
}

function toChainIconType(chainName: string | undefined): ChainIconType | undefined {
  if (!chainName) return undefined
  return chainName
}

function toWalletSelectorItems(wallets: Wallet[]) {
  return wallets.map((w) => ({
    id: w.id,
    name: w.name,
    address: w.address,
    balance: '—',
  }))
}

function buildChainData(wallets: Wallet[], currentWalletId: string | null): ChainData[] {
  const grouped = new Map<ChainIconType, Array<{ address: string; isDefault: boolean }>>()

  for (const wallet of wallets) {
    for (const ca of wallet.chainAddresses) {
      const chain = toChainIconType(ca.chain)
      if (!chain) continue

      const list = grouped.get(chain) ?? []
      list.push({ address: ca.address, isDefault: wallet.id === currentWalletId })
      grouped.set(chain, list)
    }
  }

  return Array.from(grouped.entries()).map(([chain, addresses]) => ({
    chain,
    name: CHAIN_NAMES[chain] ?? chain,
    addresses: addresses.map((a) => ({ address: a.address, isDefault: a.isDefault })),
  }))
}

function parseGetMainFlag(getMain: string | undefined): boolean {
  const v = getMain?.trim().toLowerCase()
  return v === 'true' || v === '1'
}

export function AddressAuthPage() {
  const { t: tAuthorize } = useTranslation('authorize')
  const { t: tCommon } = useTranslation('common')
  const { navigate, goBack } = useNavigation()
  const { push } = useFlow()
  const toast = useToast()

  const { id: eventId, type, chainName, signMessage, getMain } = useActivityParams<{
    id: string
    type?: string
    chainName?: string
    signMessage?: string
    getMain?: string
  }>()

  const currentWalletId = useStore(walletStore, (s) => s.currentWalletId)
  const wallets = useStore(walletStore, (s) => s.wallets)
  const currentWallet = useStore(walletStore, walletSelectors.getCurrentWallet)

  const [appInfo, setAppInfo] = useState<CallerAppInfo | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const walletItems = useMemo(() => toWalletSelectorItems(wallets), [wallets])

  const defaultWalletId = currentWallet?.id ?? wallets[0]?.id
  const [selectedWalletId, setSelectedWalletId] = useState<string | undefined>(defaultWalletId)

  const chainIconType = useMemo(() => toChainIconType(chainName), [chainName])

  const [selectedChain, setSelectedChain] = useState<ChainIconType | undefined>(chainIconType)
  useEffect(() => setSelectedChain(chainIconType), [chainIconType])

  const [selectedAddress, setSelectedAddress] = useState<string | undefined>(undefined)
  const [selectedWalletIds, setSelectedWalletIds] = useState<Set<string>>(() => new Set(wallets.map((w) => w.id)))

  useEffect(() => {
    setSelectedWalletId(defaultWalletId)
  }, [defaultWalletId])

  useEffect(() => {
    setSelectedWalletIds(new Set(wallets.map((w) => w.id)))
  }, [wallets])

  const requestedPermissions = useMemo(
    () => {
      const permissions = ['viewAddress', 'viewPublicKey']
      if (signMessage?.trim()) permissions.push('signMessage')
      if (parseGetMainFlag(getMain)) permissions.push('getMain')
      return permissions
    },
    [getMain, signMessage]
  )

  const authService = useMemo(() => new AddressAuthService(plaocAdapter, eventId), [eventId])

  const needsSignMessage = useMemo(() => Boolean(signMessage?.trim()), [signMessage])
  const needsMainPhrase = useMemo(() => parseGetMainFlag(getMain), [getMain])
  const needsPasswordConfirm = needsSignMessage || needsMainPhrase

  // Load app info
  useEffect(() => {
    let cancelled = false

    async function run() {
      setLoadError(null)
      try {
        const info = await plaocAdapter.getCallerAppInfo(eventId)
        if (cancelled) return
        setAppInfo(info)
      } catch {
        if (cancelled) return
        setLoadError(tAuthorize('error.authFailed'))
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [eventId, tAuthorize])

  // Timeout
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

  const selectedWallet = useMemo(() => {
    if (!selectedWalletId) return null
    return wallets.find((w) => w.id === selectedWalletId) ?? null
  }, [selectedWalletId, wallets])

  const chains = useMemo(() => buildChainData(wallets, currentWalletId), [wallets, currentWalletId])

  useEffect(() => {
    if (type !== 'network') return
    if (selectedChain) return
    setSelectedChain(chains[0]?.chain)
  }, [chains, selectedChain, type])

  const canApprove = useMemo(() => {
    if (wallets.length === 0) return false
    if (type === 'main') return !!selectedWallet
    if (type === 'network') {
      if (!selectedChain) return false
      return (chains.find((c) => c.chain === selectedChain)?.addresses.length ?? 0) > 0
    }
    return selectedWalletIds.size > 0
  }, [chains, selectedChain, selectedWallet, selectedWalletIds.size, type, wallets.length])

  const handleBack = useCallback(() => {
    goBack()
  }, [goBack])

  const handleReject = useCallback(async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      await authService.reject('rejected')
      navigate({ to: '/' })
    } finally {
      setIsSubmitting(false)
    }
  }, [authService, isSubmitting, navigate])

  const handleApprove = useCallback(async () => {
    if (!canApprove || isSubmitting) return
    if (needsPasswordConfirm) {
      setPasswordConfirmCallback(async (password: string) => {
        setIsSubmitting(true)
        try {
          const message = signMessage?.trim() ?? ''
          let addresses: AddressAuthResponse[] = []
          let scopeWallets: Wallet[] = []

          if (type === 'main') {
            if (!selectedWallet) return false
            addresses = authService.handleMainAddresses(selectedWallet)
            scopeWallets = [selectedWallet]
          } else if (type === 'network') {
            if (!selectedChain) return false
            addresses = authService.handleNetworkAddresses(wallets, selectedChain)
            scopeWallets = wallets
          } else {
            const allowedWallets = wallets.filter((w) => selectedWalletIds.has(w.id))
            addresses = authService.handleAllAddresses(allowedWallets)
            scopeWallets = allowedWallets
          }

          addresses = await authService.applySensitiveOptions(addresses, scopeWallets, {
            password,
            signMessage: message,
            getMain: needsMainPhrase,
          })

          await authService.approve(addresses)
          navigate({ to: '/' })
          return true
        } catch {
          return false
        } finally {
          setIsSubmitting(false)
        }
      })

      push("PasswordConfirmSheetActivity", {
        title: tAuthorize('passwordConfirm.title'),
      })
      return
    }
    setIsSubmitting(true)

    try {
      let addresses: AddressAuthResponse[] = []

      if (type === 'main') {
        if (!selectedWallet) return
        addresses = authService.handleMainAddresses(selectedWallet)
      } else if (type === 'network') {
        if (!selectedChain) return
        addresses = authService.handleNetworkAddresses(wallets, selectedChain)
      } else {
        const allowedWallets = wallets.filter((w) => selectedWalletIds.has(w.id))
        addresses = authService.handleAllAddresses(allowedWallets)
      }

      await authService.approve(addresses)
      navigate({ to: '/' })
    } finally {
      setIsSubmitting(false)
    }
  }, [
    authService,
    canApprove,
    isSubmitting,
    navigate,
    needsPasswordConfirm,
    needsMainPhrase,
    push,
    selectedChain,
    selectedWallet,
    selectedWalletIds,
    signMessage,
    tAuthorize,
    type,
    wallets,
  ])

  if (type === 'network' && chainName && !chainIconType) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/30">
        <PageHeader title={tAuthorize('title.address')} onBack={handleBack} />
        <div className="flex-1 p-4">
          <div className="rounded-xl bg-card p-4 shadow-sm">
            <p className="text-sm text-destructive">{tAuthorize('error.unknownChain')}</p>
            <div className="mt-4">
              <Button onClick={() => navigate({ to: '/' })} className="w-full">
                {tCommon('back')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/30">
        <PageHeader title={tAuthorize('title.address')} onBack={handleBack} />
        <div className="flex-1 p-4">
          <div className="rounded-xl bg-card p-4 shadow-sm">
            <p className="text-sm text-destructive">{loadError}</p>
            <div className="mt-4">
              <Button onClick={() => navigate({ to: '/' })} className="w-full">
                {tCommon('back')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <PageHeader title={tAuthorize('title.address')} onBack={handleBack} />

      <div className="flex-1 space-y-4 p-4">
        {appInfo && <AppInfoCard appInfo={appInfo} />}

        <div className="px-1 text-sm text-foreground">
          {tAuthorize('address.shareWith')}
        </div>

        <PermissionList permissions={requestedPermissions} />

        <div className="rounded-xl bg-card p-4 shadow-sm">
          <div className="text-sm text-muted-foreground">
            {type === 'main' && tAuthorize('address.scope.main')}
            {type === 'network' &&
              tAuthorize('address.scope.network', {
                chainName: CHAIN_NAMES[selectedChain ?? ''] ?? (selectedChain ?? ''),
              })}
            {type === 'all' && tAuthorize('address.scope.all')}
          </div>
        </div>

        {/* Wallet/Address selector */}
        <div className="rounded-xl bg-card p-4 shadow-sm">
          {type === 'main' && (
            <WalletSelector
              wallets={walletItems}
              {...(selectedWalletId ? { selectedId: selectedWalletId } : {})}
              onSelect={(w) => setSelectedWalletId(w.id)}
            />
          )}

          {type === 'network' && (
            <ChainAddressSelector
              chains={chainIconType ? chains.filter((c) => c.chain === chainIconType) : chains}
              selectedChain={selectedChain}
              selectedAddress={selectedAddress}
              onSelect={(chain, address) => {
                setSelectedChain(chain)
                setSelectedAddress(address)
              }}
            />
          )}

          {type === 'all' && (
            <div className="space-y-2">
              {wallets.length === 0 && <div className="py-6 text-center text-sm text-muted-foreground">{tAuthorize('address.noWallets')}</div>}
              {wallets.map((w) => {
                const checked = selectedWalletIds.has(w.id)
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => {
                      setSelectedWalletIds((prev) => {
                        const next = new Set(prev)
                        if (next.has(w.id)) next.delete(w.id)
                        else next.add(w.id)
                        return next
                      })
                    }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors',
                      'hover:bg-muted/50',
                      checked ? 'border-primary bg-primary/5' : 'border-border bg-background'
                    )}
                    aria-pressed={checked}
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{w.name}</div>
                      <div className="truncate font-mono text-xs text-muted-foreground">{w.address}</div>
                    </div>
                    <div
                      className={cn(
                        'flex size-5 items-center justify-center rounded border',
                        checked ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background'
                      )}
                      aria-hidden="true"
                    >
                      {checked ? '✓' : ''}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

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
            onClick={handleApprove}
            disabled={!canApprove || isSubmitting}
          >
            {tAuthorize('button.approve')}
          </Button>
        </div>
      </div>
    </div>
  )
}
