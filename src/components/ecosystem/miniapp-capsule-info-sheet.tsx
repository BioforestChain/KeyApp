import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { IconAlertTriangle, IconCheck, IconCopy, IconInfoCircle, IconExternalLink } from '@tabler/icons-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { clipboardService } from '@/services/clipboard';

interface MiniappCapsuleInfoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appName: string;
  appId: string;
  version: string;
  author?: string;
  sourceName?: string;
  runtime: 'iframe' | 'wujie';
  entryUrl: string;
  currentUrl: string;
  sourceUrl?: string;
  strictUrl?: boolean;
}

export function MiniappCapsuleInfoSheet({
  open,
  onOpenChange,
  appName,
  appId,
  version,
  author,
  sourceName,
  runtime,
  entryUrl,
  currentUrl,
  sourceUrl,
  strictUrl,
}: MiniappCapsuleInfoSheetProps) {
  const { t } = useTranslation('ecosystem');
  const normalizedEntryUrl = entryUrl.trim();
  const normalizedCurrentUrl = currentUrl.trim();
  const urlMismatch = resolveUrlMismatch(normalizedEntryUrl, normalizedCurrentUrl, strictUrl ?? false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-[max(env(safe-area-inset-bottom),1rem)]">
        <SheetHeader>
          <SheetTitle>{t('capsule.infoTitle')}</SheetTitle>
        </SheetHeader>

        <div className="space-y-3 px-4">
          <div className="bg-muted/50 space-y-2 rounded-xl p-3">
            <InfoRow label={t('capsule.infoApp')} value={appName} />
            <InfoRow label={t('capsule.infoAppId')} value={appId} />
            <InfoRow label={t('capsule.infoVersion')} value={version} />
            <InfoRow label={t('capsule.infoAuthor')} value={author || t('detail.unknownDeveloper')} />
            <InfoRow label={t('capsule.infoSourceName')} value={sourceName || t('capsule.infoSourceUnknown')} />
            <InfoRow label={t('capsule.infoRuntime')} value={runtime} />
            <InfoRow
              label={t('capsule.infoStrictUrl')}
              value={strictUrl ? t('capsule.infoStrictEnabled') : t('capsule.infoStrictDisabled')}
            />
          </div>

          <UrlCard
            label={t('capsule.infoCurrentUrl')}
            url={normalizedCurrentUrl}
            emptyText={t('capsule.infoUrlUnavailable')}
            testId="miniapp-capsule-current-url"
          />

          {urlMismatch.type === 'query-only' && (
            <div
              data-testid="miniapp-capsule-url-adjusted-info"
              className="rounded-xl border border-sky-500/30 bg-sky-50 p-3 dark:border-sky-400/30 dark:bg-sky-950/30"
            >
              <div className="mb-2 flex items-start gap-2">
                <IconInfoCircle className="mt-0.5 size-4 shrink-0 text-sky-600 dark:text-sky-300" />
                <div>
                  <div className="text-sm font-medium text-sky-800 dark:text-sky-200">
                    {t('capsule.infoUrlQueryAdjustedTitle')}
                  </div>
                  <p className="text-xs text-sky-700 dark:text-sky-300">
                    {t('capsule.infoUrlQueryAdjustedHint')}
                  </p>
                </div>
              </div>

              <UrlCard
                label={t('capsule.infoEntryUrl')}
                url={normalizedEntryUrl}
                emptyText={t('capsule.infoUrlUnavailable')}
                testId="miniapp-capsule-entry-url"
              />
            </div>
          )}

          {urlMismatch.type === 'warning' && (
            <div
              data-testid="miniapp-capsule-url-mismatch-warning"
              className="rounded-xl border border-amber-500/30 bg-amber-50 p-3 dark:border-amber-400/30 dark:bg-amber-950/30"
            >
              <div className="mb-2 flex items-start gap-2">
                <IconAlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-300" />
                <div>
                  <div className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    {t('capsule.infoUrlMismatchTitle')}
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    {t('capsule.infoUrlMismatchHint')}
                  </p>
                </div>
              </div>

              <UrlCard
                label={t('capsule.infoEntryUrl')}
                url={normalizedEntryUrl}
                emptyText={t('capsule.infoUrlUnavailable')}
                testId="miniapp-capsule-entry-url"
              />
            </div>
          )}

          {sourceUrl && (
            <UrlCard
              label={t('capsule.infoSourceUrl')}
              url={sourceUrl}
              emptyText={t('capsule.infoUrlUnavailable')}
              testId="miniapp-capsule-source-url"
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function UrlCard({
  label,
  url,
  emptyText,
  testId,
}: {
  label: string;
  url: string;
  emptyText: string;
  testId: string;
}) {
  if (!url) {
    return (
      <div className="bg-muted/50 rounded-xl p-3">
        <div className="text-muted-foreground mb-1 text-xs">{label}</div>
        <div className="text-muted-foreground text-sm">{emptyText}</div>
      </div>
    );
  }

  return (
    <div className="bg-muted/50 space-y-2 rounded-xl p-3" data-testid={testId}>
      <div className="text-muted-foreground text-xs">{label}</div>
      <UrlLine url={url} />
    </div>
  );
}

function UrlLine({ url }: { url: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await clipboardService.write({ text: url });
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <p className="min-w-0 flex-1 truncate font-mono text-sm" title={url}>
        {url}
      </p>
      <button
        type="button"
        onClick={handleCopy}
        className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
        aria-label={copied ? t('common:copiedToClipboard') : t('common:copy')}
      >
        {copied ? <IconCheck className="size-4 text-emerald-500" /> : <IconCopy className="size-4" />}
      </button>
      <a
        href={url}
        target="_blank"
        rel="noreferrer noopener"
        className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
        aria-label={t('common:ecosystem.menu.open')}
      >
        <IconExternalLink className="size-4" />
      </a>
    </div>
  );
}

type UrlMismatchType = 'none' | 'query-only' | 'warning';

function resolveUrlMismatch(entry: string, current: string, strictUrl: boolean): { type: UrlMismatchType } {
  if (!entry || !current || entry === current) {
    return { type: 'none' };
  }

  if (strictUrl) {
    return { type: 'warning' };
  }

  try {
    const entryUrl = new URL(entry);
    const currentUrl = new URL(current);
    const sameOrigin = entryUrl.origin === currentUrl.origin;
    const samePath = normalizePath(entryUrl.pathname) === normalizePath(currentUrl.pathname);
    const sameHash = entryUrl.hash === currentUrl.hash;

    if (sameOrigin && samePath && sameHash && entryUrl.search !== currentUrl.search) {
      return { type: 'query-only' };
    }
  } catch {
    return { type: 'warning' };
  }

  return { type: 'warning' };
}

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}
