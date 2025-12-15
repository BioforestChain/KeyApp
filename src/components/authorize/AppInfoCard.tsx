import { useMemo, useState } from 'react';
import type { CallerAppInfo } from '@/services/authorize';
import { cn } from '@/lib/utils';
import { IconAlertTriangle as AlertTriangle } from '@tabler/icons-react';

export interface AppInfoCardProps {
  appInfo: CallerAppInfo;
  className?: string;
}

function isUnknownOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    if (url.protocol !== 'https:') return true;
    if (url.hostname === 'localhost') return true;
    if (url.hostname.endsWith('.local')) return true;
    return false;
  } catch {
    return true;
  }
}

export function AppInfoCard({ appInfo, className }: AppInfoCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const isUnknown = useMemo(() => isUnknownOrigin(appInfo.origin), [appInfo.origin]);
  const showImage = !imageFailed && appInfo.appIcon.trim().length > 0;

  return (
    <section className={cn('bg-card rounded-xl p-4 shadow-sm', className)} aria-label="App info">
      <div className="flex items-center gap-3">
        <div className="bg-muted relative size-12 shrink-0 overflow-hidden rounded-xl">
          {showImage ? (
            <img
              src={appInfo.appIcon}
              alt={appInfo.appName}
              className="size-full object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="text-muted-foreground flex size-full items-center justify-center text-lg font-semibold">
              {appInfo.appName.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-base font-semibold">{appInfo.appName}</h2>
            {isUnknown && (
              <span
                className="bg-warning/15 text-warning inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                aria-label="Unknown app"
              >
                <AlertTriangle className="size-3" />
                Unknown
              </span>
            )}
          </div>
          <p className="text-muted-foreground truncate text-sm">{appInfo.origin}</p>
        </div>
      </div>
    </section>
  );
}
