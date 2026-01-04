import { useTranslation } from 'react-i18next'
import { IconAlertTriangle, IconDatabase } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useFlow } from '@/stackflow'

/**
 * 数据库迁移引导组件
 * 当检测到旧版数据需要迁移时显示
 */
export function MigrationRequiredView() {
  const { t } = useTranslation(['settings', 'common'])
  const { push } = useFlow()

  const handleGoToStorage = () => {
    push('SettingsStorageActivity', {})
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="flex flex-col items-center gap-6 text-center max-w-sm">
        <div className="bg-destructive/10 flex size-20 items-center justify-center rounded-full">
          <IconAlertTriangle className="text-destructive size-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold">
            {t('settings:storage.migrationRequired', '数据需要迁移')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t(
              'settings:storage.migrationDesc',
              '检测到旧版本数据格式，需要清空本地数据库后才能继续使用。您的助记词和私钥不会受到影响，但需要重新导入钱包。'
            )}
          </p>
        </div>

        <Button onClick={handleGoToStorage} className="w-full gap-2">
          <IconDatabase className="size-4" />
          {t('settings:storage.goToClear', '前往清理数据')}
        </Button>
      </div>
    </div>
  )
}
