import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Trans, useTranslation } from 'react-i18next'
import { AlertTriangle, Check, Plus, RefreshCw } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/services'
import {
  chainConfigActions,
  useChainConfigs,
  useChainConfigError,
  useChainConfigLoading,
  useChainConfigSubscription,
  useChainConfigWarnings,
} from '@/stores'
import { cn } from '@/lib/utils'
import type { ChainConfigSource, ChainConfigWarning } from '@/services/chain-config'

function getSourceLabel(t: (key: string) => string, source: ChainConfigSource): string {
  switch (source) {
    case 'default':
      return t('chainConfig.source.default')
    case 'subscription':
      return t('chainConfig.source.subscription')
    case 'manual':
      return t('chainConfig.source.manual')
  }
}

function getSourceBadgeClass(source: ChainConfigSource): string {
  switch (source) {
    case 'default':
      return 'bg-muted text-muted-foreground'
    case 'subscription':
      return 'bg-blue-500/10 text-blue-600'
    case 'manual':
      return 'bg-amber-500/10 text-amber-700'
  }
}

function indexWarnings(warnings: readonly ChainConfigWarning[]): Map<string, ChainConfigWarning> {
  const map = new Map<string, ChainConfigWarning>()
  for (const warning of warnings) map.set(warning.id, warning)
  return map
}

export function ChainConfigPage() {
  const navigate = useNavigate()
  const { t } = useTranslation('settings')
  const toast = useToast()

  const configs = useChainConfigs()
  const subscription = useChainConfigSubscription()
  const warnings = useChainConfigWarnings()
  const isLoading = useChainConfigLoading()
  const error = useChainConfigError()

  const warningById = useMemo(() => indexWarnings(warnings), [warnings])

  const [subscriptionUrl, setSubscriptionUrl] = useState<string>('default')
  const [manualJson, setManualJson] = useState<string>('')

  const pendingToastRef = useRef<null | 'subscriptionSaved' | 'subscriptionRefreshed' | 'manualAdded'>(null)
  const wasLoadingRef = useRef(false)

  useEffect(() => {
    void chainConfigActions.initialize()
  }, [])

  useEffect(() => {
    if (subscription?.url) setSubscriptionUrl(subscription.url)
  }, [subscription?.url])

  useEffect(() => {
    const wasLoading = wasLoadingRef.current
    wasLoadingRef.current = isLoading

    if (!wasLoading || isLoading) return

    const pending = pendingToastRef.current
    if (!pending) return

    pendingToastRef.current = null

    if (error) {
      void toast.show(error)
      return
    }

    void toast.show(t(`chainConfig.toast.${pending}`))
    if (pending === 'manualAdded') setManualJson('')
  }, [error, isLoading, t, toast])

  const handleSaveSubscription = async () => {
    pendingToastRef.current = 'subscriptionSaved'
    await chainConfigActions.setSubscriptionUrl(subscriptionUrl)
  }

  const handleRefreshSubscription = async () => {
    pendingToastRef.current = 'subscriptionRefreshed'
    await chainConfigActions.refreshSubscription()
  }

  const handleAddManual = async () => {
    pendingToastRef.current = 'manualAdded'
    await chainConfigActions.addManualConfig(manualJson)
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <PageHeader title={t('chainConfig.title')} onBack={() => navigate({ to: '/settings' })} />

      <div className="flex-1 space-y-4 p-4">
        {error && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-xl bg-card shadow-sm">
          <div className="space-y-3 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">{t('chainConfig.subscription.title')}</div>
                <div className="text-xs text-muted-foreground">
                  <Trans
                    ns="settings"
                    i18nKey="chainConfig.subscription.description"
                    components={{ code: <code className="font-mono" /> }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleRefreshSubscription}
                  disabled={isLoading}
                  aria-label={t('chainConfig.subscription.refreshAriaLabel')}
                >
                  <RefreshCw className={cn('size-4', isLoading && 'animate-spin')} />
                </Button>
                <Button type="button" onClick={handleSaveSubscription} disabled={isLoading}>
                  {t('chainConfig.subscription.save')}
                </Button>
              </div>
            </div>

            <Input
              value={subscriptionUrl}
              onChange={(e) => setSubscriptionUrl(e.target.value)}
              placeholder={t('chainConfig.subscription.placeholder')}
              disabled={isLoading}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />

            {subscription?.lastUpdated && (
              <div className="text-xs text-muted-foreground">
                {t('chainConfig.subscription.lastUpdated', { value: subscription.lastUpdated })}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-card shadow-sm">
          <div className="space-y-3 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">{t('chainConfig.manual.title')}</div>
                <div className="text-xs text-muted-foreground">
                  {t('chainConfig.manual.description')}
                </div>
              </div>
              <Button type="button" variant="outline" onClick={handleAddManual} disabled={isLoading || manualJson.trim() === ''}>
                <Plus className="size-4" />
                {t('chainConfig.manual.add')}
              </Button>
            </div>

            <textarea
              value={manualJson}
              onChange={(e) => setManualJson(e.target.value)}
              placeholder={t('chainConfig.manual.placeholder')}
              rows={5}
              disabled={isLoading}
              className={cn(
                'w-full resize-none rounded-lg border bg-background px-3 py-3 text-sm',
                'placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-card shadow-sm">
          <div className="px-4 py-3">
            <div className="text-sm font-medium">{t('chainConfig.list.title')}</div>
            <div className="text-xs text-muted-foreground">{t('chainConfig.list.description')}</div>
          </div>

          <div className="h-px bg-border" />

          <div>
            {configs.map((config, index) => {
              const warning = warningById.get(config.id)
              const disabledByWarning = warning?.kind === 'incompatible_major'
              const sourceLabel = getSourceLabel(t, config.source)

              return (
                <div key={config.id}>
                  {index > 0 && <div className="mx-4 h-px bg-border" />}
                  <div className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">
                            {config.name}
                          </span>
                          <span className={cn('rounded px-2 py-0.5 text-xs', getSourceBadgeClass(config.source))}>
                            {sourceLabel}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="font-mono">{config.id}</span>
                          <span>v{config.version}</span>
                          <span>{config.type}</span>
                          <span>{config.symbol}</span>
                        </div>
                        {warning?.kind === 'incompatible_major' && (
                          <div className="mt-2 flex items-start gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-800">
                            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                            <div>
                              {t('chainConfig.warning.incompatibleMajor', {
                                version: warning.version,
                                supportedMajor: warning.supportedMajor,
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      <label className={cn('flex cursor-pointer items-start gap-2', disabledByWarning && 'cursor-not-allowed opacity-60')}>
                        <div className="relative mt-0.5">
                          <input
                            type="checkbox"
                            checked={config.enabled}
                            onChange={(e) => {
                              void chainConfigActions.setChainEnabled(config.id, e.target.checked)
                            }}
                            disabled={isLoading || disabledByWarning}
                            className="peer sr-only"
                          />
                          <div
                            className={cn(
                              'flex size-5 items-center justify-center rounded border border-input',
                              'transition-colors peer-checked:border-primary peer-checked:bg-primary',
                              'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
                            )}
                          >
                            {config.enabled && <Check className="size-3.5 text-primary-foreground" />}
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )
            })}

            {configs.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                {t('chainConfig.list.empty')}
              </div>
            )}
          </div>
        </div>

        <div className="px-1 text-xs text-muted-foreground">
          {t('chainConfig.hint')}
        </div>
      </div>
    </div>
  )
}
