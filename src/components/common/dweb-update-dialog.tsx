import { useTranslation } from 'react-i18next'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { useDwebUpdateState, dwebUpdateActions } from '@/stores/dweb-update'

export function DwebUpdateDialog() {
  const { t } = useTranslation()
  const { dialogOpen, status, currentVersion, latestVersion, changeLog, installUrl } = useDwebUpdateState()

  if (status !== 'update-available') return null

  const description = t('settings:update.dialogDesc', {
    current: currentVersion,
    latest: latestVersion ?? currentVersion,
  })

  const handleInstall = () => {
    if (installUrl) {
      window.location.href = installUrl
    }
  }

  return (
    <AlertDialog
      open={dialogOpen}
      onOpenChange={(open) => {
        if (!open) dwebUpdateActions.closeDialog()
      }}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{t('settings:update.dialogTitle')}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {changeLog ? (
          <div className="bg-muted/40 text-muted-foreground scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[color-mix(in_srgb,currentColor,transparent)] mt-2 max-h-40 overflow-auto rounded-lg p-3 text-xs leading-relaxed whitespace-pre-wrap">
            <div className="text-foreground mb-1 text-xs font-medium">
              {t('settings:update.changelogTitle')}
            </div>
            {changeLog}
          </div>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel>{t('settings:update.later')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleInstall}>
            {t('settings:update.install')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
