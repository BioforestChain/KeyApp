import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { useNavigation, useFlow } from '@/stackflow';
import { IconDatabase, IconTrash, IconLoader2 } from '@tabler/icons-react';

interface StorageEstimate {
  usage: number;
  quota: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function SettingsStoragePage() {
  const { t } = useTranslation(['settings', 'common']);
  const { goBack } = useNavigation();
  const { push } = useFlow();
  const [estimate, setEstimate] = useState<StorageEstimate | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEstimate = useCallback(async () => {
    setLoading(true);
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const est = await navigator.storage.estimate();
        setEstimate({
          usage: est.usage ?? 0,
          quota: est.quota ?? 0,
        });
      }
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEstimate();
  }, [fetchEstimate]);

  const usagePercent = estimate ? (estimate.usage / estimate.quota) * 100 : 0;

  return (
    <div className="bg-muted/30 flex min-h-screen flex-col">
      <PageHeader title={t('settings:storage.title')} onBack={goBack} />

      <div className="flex-1 space-y-4 p-4">
        {/* 存储使用情况 */}
        <div className="bg-card rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 flex size-10 items-center justify-center rounded-full">
              <IconDatabase className="text-primary size-5" />
            </div>
            <div>
              <h3 className="font-medium">{t('settings:storage.usage')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('settings:storage.basedOn')}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <IconLoader2 className="text-muted-foreground size-6 animate-spin" />
            </div>
          ) : estimate ? (
            <div className="space-y-4">
              {/* 进度条 */}
              <div className="space-y-2">
                <div className="bg-muted h-3 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full transition-all"
                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t('settings:storage.used')}: {formatBytes(estimate.usage)}
                  </span>
                  <span className="text-muted-foreground">
                    {t('settings:storage.total')}: {formatBytes(estimate.quota)}
                  </span>
                </div>
              </div>

              {/* 详细信息 */}
              <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{t('settings:storage.usagePercent')}</span>
                  <span className="font-medium">{usagePercent.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('settings:storage.available')}</span>
                  <span className="font-medium">
                    {formatBytes(estimate.quota - estimate.usage)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              {t('settings:storage.unavailable')}
            </p>
          )}
        </div>

        {/* 清理数据 */}
        <div className="bg-card rounded-xl p-4 shadow-sm">
          <h3 className="font-medium mb-2">{t('settings:storage.clearTitle')}</h3>
          <p className="text-muted-foreground text-sm mb-4">
            {t('settings:storage.clearDesc')}
          </p>
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => push('ClearDataConfirmJob', {})}
          >
            <IconTrash className="size-4 mr-2" />
            {t('settings:items.clearData')}
          </Button>
        </div>
      </div>
    </div>
  );
}
