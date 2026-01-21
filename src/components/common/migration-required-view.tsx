import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconAlertTriangle, IconTrash } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

/**
 * 数据库迁移引导组件
 * 当检测到旧版数据需要迁移时显示
 *
 * 注意：此组件在 Stackflow context 外部渲染，不能使用 useFlow()
 */
export function MigrationRequiredView() {
  const { t } = useTranslation(['settings', 'common']);
  const [isClearing, setIsClearing] = useState(false);

  const handleClearData = () => {
    setIsClearing(true);
    // 跳转到 clear.html 进行清理
    const baseUri = import.meta.env.BASE_URL || '/';
    window.location.href = `${baseUri}clear.html`;
  };

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center p-6">
      <div className="flex max-w-sm flex-col items-center gap-6 text-center">
        <div className="bg-destructive/10 flex size-20 items-center justify-center rounded-full">
          <IconAlertTriangle className="text-destructive size-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold">{t('settings:storage.migrationRequired')}</h1>
          <p className="text-muted-foreground text-sm">{t('settings:storage.migrationDesc')}</p>
        </div>

        {/* Warning List */}
        <div className="bg-destructive/5 w-full rounded-lg p-4">
          <ul className="text-destructive space-y-2 text-left text-sm">
            <li>• {t('settings:clearData.item1')}</li>
            <li>• {t('settings:clearData.item2')}</li>
            <li>• {t('settings:clearData.item3')}</li>
          </ul>
        </div>

        <Button variant="destructive" onClick={handleClearData} className="w-full gap-2" disabled={isClearing}>
          <IconTrash className="size-4" />
          {t('settings:clearData.confirm')}
        </Button>
      </div>
    </div>
  );
}
