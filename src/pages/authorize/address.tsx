import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigation, useActivityParams, useFlow } from '@/stackflow'
import { setWalletLockConfirmCallback } from '@/stackflow/activities/sheets'
import { useTranslation } from 'react-i18next'
import { useStore } from '@tanstack/react-store'
import { PageHeader } from '@/components/layout/page-header'
import { AppInfoCard } from '@/components/authorize/AppInfoCard'
import { PermissionList } from '@/components/authorize/PermissionList'
import { Button } from '@/components/ui/button'
import { WalletSelector, type WalletInfo } from '@/components/wallet'
import { WalletCard } from '@/components/wallet/wallet-card'
import { ChainIcon, type ChainType as ChainIconType } from '@/components/wallet/chain-icon'
import { IconCheck } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import {
  AddressAuthService,
  plaocAdapter,
  type AddressAuthResponse,
  type CallerAppInfo,
} from '@/services/authorize'
import { useToast } from '@/services'
import { useChainNameMap, walletStore, walletSelectors, type Wallet } from '@/stores'

const REQUEST_TIMEOUT_MS = 5 * 60 * 1000

function toChainIconType(chainName: string | undefined): ChainIconType | undefined {
  if (!chainName) return undefined
  return chainName
}

interface ChainData {
  chain: ChainIconType
  name: string
  addresses: Array<{ address: string; isDefault: boolean }>
}

function toWalletSelectorItems(wallets: Wallet[]): WalletInfo[] {
  return wallets.map((w) => ({
    id: w.id,
    name: w.name,
    address: w.address,
    balance: '—',
  }))
}

function buildChainData(
  wallets: Wallet[],
  currentWalletId: string | null,
  chainNameMap: Record<string, string>
): ChainData[] {
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
    name: chainNameMap[chain] ?? chain,
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
  const chainNameMap = useChainNameMap()

  const [appInfo, setAppInfo] = useState<CallerAppInfo | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const walletItems = useMemo(() => toWalletSelectorItems(wallets), [wallets])

  const defaultWalletId = currentWallet?.id ?? wallets[0]?.id
  const [selectedWalletId, setSelectedWalletId] = useState<string | undefined>(defaultWalletId)

  const chainIconType = useMemo(() => toChainIconType(chainName), [chainName])

  const [selectedChain, setSelectedChain] = useState<ChainIconType | undefined>(chainIconType)
  useEffect(() => setSelectedChain(chainIconType), [chainIconType])

  const [_selectedAddress, _setSelectedAddress] = useState<string | undefined>(undefined)
  const [selectedWalletIds, setSelectedWalletIds] = useState<Set<string>>(() => new Set(wallets.map((w) => w.id)))
  const [chainSelectorOpen, setChainSelectorOpen] = useState(false)

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

  const chains = useMemo(
    () => buildChainData(wallets, currentWalletId, chainNameMap),
    [chainNameMap, currentWalletId, wallets]
  )

  // 当前钱包可用的链列表
  const availableChains = useMemo(() => {
    if (!currentWallet) return []
    return currentWallet.chainAddresses.map(ca => ca.chain as ChainIconType)
  }, [currentWallet])

  // 选中链的地址
  const selectedChainAddress = useMemo(() => {
    if (!currentWallet || !selectedChain) return undefined
    return currentWallet.chainAddresses.find(ca => ca.chain === selectedChain)?.address
  }, [currentWallet, selectedChain])

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
      setWalletLockConfirmCallback(async (password: string) => {
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

      push("WalletLockConfirmJob", {
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
                chainName: (selectedChain ? chainNameMap[selectedChain] : undefined) ?? (selectedChain ?? ''),
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

          {type === 'network' && currentWallet && selectedChain && (
            <div className="aspect-[1.6/1] w-full">
              <WalletCard
                wallet={currentWallet}
                chain={selectedChain}
                chainName={chainNameMap[selectedChain] ?? selectedChain}
                address={selectedChainAddress}
                priority="low"
                onOpenChainSelector={chainIconType ? undefined : () => setChainSelectorOpen(true)}
              />
            </div>
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

      {/* 链选择器 Sheet */}
      {chainSelectorOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50"
          onClick={() => setChainSelectorOpen(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center py-3">
              <div className="h-1 w-10 rounded-full bg-muted" />
            </div>
            <div className="border-b border-border px-4 pb-4">
              <h2 className="text-center text-lg font-semibold">{tAuthorize('address.selectNetwork')}</h2>
            </div>
            <div className="max-h-[60vh] space-y-2 overflow-y-auto p-4">
              {availableChains.map((chain) => {
                const chainAddr = currentWallet?.chainAddresses.find((ca) => ca.chain === chain)
                return (
                  <button
                    key={chain}
                    onClick={() => {
                      setSelectedChain(chain)
                      setChainSelectorOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl p-4 transition-colors',
                      chain === selectedChain
                        ? 'bg-primary/10 ring-1 ring-primary'
                        : 'bg-muted/50 hover:bg-muted'
                    )}
                  >
                    <ChainIcon chain={chain} size="md" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{chainNameMap[chain] ?? chain}</div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {chainAddr?.address ? truncateAddress(chainAddr.address) : '---'}
                      </div>
                    </div>
                    {chain === selectedChain && <IconCheck className="size-5 text-primary" />}
                  </button>
                )
              })}
            </div>
            <div className="h-[env(safe-area-inset-bottom)]" />
          </div>
        </div>
      )}
    </div>
  )
}

function truncateAddress(address: string, startChars = 10, endChars = 8): string {
  if (address.length <= startChars + endChars + 3) return address
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}
