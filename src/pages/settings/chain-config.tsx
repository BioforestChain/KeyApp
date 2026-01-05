import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigation } from '@/stackflow';
import { Trans, useTranslation } from 'react-i18next';
import {
  IconAlertTriangle as AlertTriangle,
  IconPlus as Plus,
  IconRefresh as RefreshCw,
} from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/services';
import {
  chainConfigActions,
  useChainConfigs,
  useChainConfigError,
  useChainConfigLoading,
  useChainConfigSubscription,
  useChainConfigWarnings,
} from '@/stores';
import { cn } from '@/lib/utils';
import type { ChainConfigSource, ChainConfigWarning } from '@/services/chain-config';

function getIdFromUnknownConfig(input: unknown): string | null {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return null;
  const id = (input as Record<string, unknown>).id;
  return typeof id === 'string' && id.trim() !== '' ? id : null;
}

function getManualConfigIds(input: string): string[] {
  try {
    const json: unknown = JSON.parse(input) as unknown;
    const ids = Array.isArray(json)
      ? json.map(getIdFromUnknownConfig)
      : [getIdFromUnknownConfig(json)];
    return Array.from(new Set(ids.filter((id): id is string => typeof id === 'string')));
  } catch {
    return [];
  }
}

function getSourceLabel(t: (key: string, options?: object) => string, source: ChainConfigSource): string {
  switch (source) {
    case 'default':
      return t('chainConfig.source.default');
    case 'subscription':
      return t('chainConfig.source.subscription');
    case 'manual':
      return t('chainConfig.source.manual');
  }
}

function getSourceBadgeClass(source: ChainConfigSource): string {
  switch (source) {
    case 'default':
      return 'bg-muted text-muted-foreground';
    case 'subscription':
      return 'bg-blue-500/10 text-blue-600';
    case 'manual':
      return 'bg-amber-500/10 text-amber-700';
  }
}

function indexWarnings(warnings: readonly ChainConfigWarning[]): Map<string, ChainConfigWarning> {
  const map = new Map<string, ChainConfigWarning>();
  for (const warning of warnings) map.set(warning.id, warning);
  return map;
}

export function ChainConfigPage() {
  const { goBack } = useNavigation();
  const { t } = useTranslation('settings');
  const toast = useToast();

  const configs = useChainConfigs();
  const subscription = useChainConfigSubscription();
  const warnings = useChainConfigWarnings();
  const isLoading = useChainConfigLoading();
  const error = useChainConfigError();

  const warningById = useMemo(() => indexWarnings(warnings), [warnings]);

  const [subscriptionUrl, setSubscriptionUrl] = useState<string>('default');
  const [manualJson, setManualJson] = useState<string>('');

  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [duplicateIds, setDuplicateIds] = useState<string[]>([]);

  const pendingToastRef = useRef<null | 'subscriptionSaved' | 'subscriptionRefreshed' | 'manualAdded'>(null);
  const pendingManualJsonRef = useRef<string | null>(null);
  const wasLoadingRef = useRef(false);

  useEffect(() => {
    void chainConfigActions.initialize();
  }, []);

  useEffect(() => {
    if (subscription?.url) setSubscriptionUrl(subscription.url);
  }, [subscription?.url]);

  useEffect(() => {
    const wasLoading = wasLoadingRef.current;
    wasLoadingRef.current = isLoading;

    if (!wasLoading || isLoading) return;

    const pending = pendingToastRef.current;
    if (!pending) return;

    pendingToastRef.current = null;

    if (error) {
      void toast.show(error);
      return;
    }

    void toast.show(t(`chainConfig.toast.${pending}`));
    if (pending === 'manualAdded') setManualJson('');
  }, [error, isLoading, t, toast]);

  const handleSaveSubscription = async () => {
    pendingToastRef.current = 'subscriptionSaved';
    await chainConfigActions.setSubscriptionUrl(subscriptionUrl);
  };

  const handleRefreshSubscription = async () => {
    pendingToastRef.current = 'subscriptionRefreshed';
    await chainConfigActions.refreshSubscription();
  };

  const handleAddManual = async () => {
    const ids = getManualConfigIds(manualJson);
    const existing = new Set(configs.map((config) => config.id));
    const duplicates = ids.filter((id) => existing.has(id));

    if (duplicates.length > 0) {
      pendingManualJsonRef.current = manualJson;
      setDuplicateIds(duplicates);
      setDuplicateDialogOpen(true);
      return;
    }

    pendingToastRef.current = 'manualAdded';
    await chainConfigActions.addManualConfig(manualJson);
  };

  const handleDuplicateCancel = () => {
    pendingManualJsonRef.current = null;
    setDuplicateIds([]);
    setDuplicateDialogOpen(false);
  };

  const handleDuplicateReplace = async () => {
    const pendingJson = pendingManualJsonRef.current;
    pendingManualJsonRef.current = null;
    setDuplicateIds([]);
    setDuplicateDialogOpen(false);

    if (!pendingJson) return;

    pendingToastRef.current = 'manualAdded';
    await chainConfigActions.addManualConfig(pendingJson);
  };

  return (
    <div className="bg-muted/30 flex min-h-screen flex-col">
      <PageHeader title={t('chainConfig.title')} onBack={goBack} />

      <div className="flex-1 space-y-4 p-4">
        <AlertDialog
          open={duplicateDialogOpen}
          onOpenChange={(open) => {
            if (!open) handleDuplicateCancel();
            else setDuplicateDialogOpen(open);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('chainConfig.manual.duplicate.title')}</AlertDialogTitle>
              <AlertDialogDescription>{t('chainConfig.manual.duplicate.description')}</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="bg-muted/50 text-muted-foreground rounded-lg px-3 py-2 text-xs font-mono break-all">
              {duplicateIds.join(', ')}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleDuplicateCancel}>
                {t('chainConfig.manual.duplicate.cancel')}
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDuplicateReplace} disabled={isLoading}>
                {t('chainConfig.manual.duplicate.replace')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {error && (
          <div className="border-destructive/20 bg-destructive/5 text-destructive rounded-xl border px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="bg-card overflow-hidden rounded-xl shadow-sm">
          <div className="space-y-3 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">{t('chainConfig.subscription.title')}</div>
                <div className="text-muted-foreground text-xs">
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
                  data-testid="refresh-subscription-button"
                  onClick={handleRefreshSubscription}
                  disabled={isLoading}
                  aria-label={t('chainConfig.subscription.refreshAriaLabel')}
                >
                  <RefreshCw className={cn('size-4', isLoading && 'animate-spin')} />
                </Button>
                <Button type="button" data-testid="save-subscription-button" onClick={handleSaveSubscription} disabled={isLoading}>
                  {t('chainConfig.subscription.save')}
                </Button>
              </div>
            </div>

            <Input
              data-testid="subscription-url-input"
              value={subscriptionUrl}
              onChange={(e) => setSubscriptionUrl(e.target.value)}
              placeholder={t('chainConfig.subscription.placeholder')}
              disabled={isLoading}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />

            {subscription?.lastUpdated && (
              <div className="text-muted-foreground text-xs">
                {t('chainConfig.subscription.lastUpdated', { value: subscription.lastUpdated })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-card overflow-hidden rounded-xl shadow-sm" data-testid="manual-add-section">
          <div className="space-y-3 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">{t('chainConfig.manual.title')}</div>
                <div className="text-muted-foreground text-xs">{t('chainConfig.manual.description')}</div>
              </div>
              <Button
                type="button"
                variant="outline"
                data-testid="add-chain-button"
                onClick={handleAddManual}
                disabled={isLoading || manualJson.trim() === ''}
              >
                <Plus className="size-4" />
                {t('chainConfig.manual.add')}
              </Button>
            </div>

            <textarea
              data-testid="manual-config-textarea"
              value={manualJson}
              onChange={(e) => setManualJson(e.target.value)}
              placeholder={t('chainConfig.manual.placeholder')}
              rows={5}
              disabled={isLoading}
              className={cn(
                'bg-background w-full resize-none rounded-lg border px-3 py-3 text-sm',
                'placeholder:text-muted-foreground',
                'focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-none',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>
        </div>

        <div className="bg-card overflow-hidden rounded-xl shadow-sm">
          <div className="px-4 py-3">
            <div className="text-sm font-medium">{t('chainConfig.list.title')}</div>
            <div className="text-muted-foreground text-xs">{t('chainConfig.list.description')}</div>
          </div>

          <div className="bg-border h-px" />

          <div>
            {configs.map((config, index) => {
              const warning = warningById.get(config.id);
              const disabledByWarning = warning?.kind === 'incompatible_major';
              const sourceLabel = getSourceLabel(t as (key: string, options?: object) => string, config.source);

              return (
                <div key={config.id} data-testid={`chain-item-${config.id}`}>
                  {index > 0 && <div className="bg-border mx-4 h-px" />}
                  <div className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">{config.name}</span>
                          <span className={cn('rounded px-2 py-0.5 text-xs', getSourceBadgeClass(config.source))}>
                            {sourceLabel}
                          </span>
                        </div>
                        <div className="text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                          <span className="font-mono">{config.id}</span>
                          <span>v{config.version}</span>
                          <span>{config.chainKind}</span>
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

                      <Checkbox
                        checked={config.enabled}
                        onCheckedChange={(checked) => {
                          void chainConfigActions.setChainEnabled(config.id, checked);
                        }}
                        disabled={isLoading || disabledByWarning}
                        className={cn(disabledByWarning && 'cursor-not-allowed opacity-60')}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {configs.length === 0 && (
              <div className="text-muted-foreground px-4 py-8 text-center text-sm">{t('chainConfig.list.empty')}</div>
            )}
          </div>
        </div>

        <div className="text-muted-foreground px-1 text-xs">{t('chainConfig.hint')}</div>
      </div>
    </div>
  );
}
