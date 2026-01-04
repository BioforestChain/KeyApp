import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IconAlertTriangle, IconTrash } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'

/**
 * 数据库迁移引导组件
 * 当检测到旧版数据需要迁移时显示
 * 
 * 注意：此组件在 Stackflow context 外部渲染，不能使用 useFlow()
 */
export function MigrationRequiredView() {
  const { t } = useTranslation(['settings', 'common'])
  const [isClearing, setIsClearing] = useState(false)

  const handleClearData = () => {
    setIsClearing(true)
    // 跳转到 clear.html 进行清理
    const baseUri = import.meta.env.BASE_URL || '/'
    window.location.href = `${baseUri}clear.html`
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

        {/* Warning List */}
        <div className="bg-destructive/5 rounded-lg p-4 w-full">
          <ul className="text-destructive space-y-2 text-sm text-left">
            <li>• {t('settings:clearData.item1', '所有钱包数据将被删除')}</li>
            <li>• {t('settings:clearData.item2', '所有设置将恢复默认')}</li>
            <li>• {t('settings:clearData.item3', '应用将重新启动')}</li>
          </ul>
        </div>

        <Button 
          variant="destructive" 
          onClick={handleClearData} 
          className="w-full gap-2"
          disabled={isClearing}
        >
          <IconTrash className="size-4" />
          {t('settings:clearData.confirm', '确认清空')}
        </Button>
      </div>
    </div>
  )
}
