import { useTranslation } from 'react-i18next';
import { IconSun, IconMoon, IconDeviceDesktop, IconCheck } from '@tabler/icons-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useTheme, preferencesActions } from '@/stores/preferences';
import { cn } from '@/lib/utils';

interface AppearanceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ThemeOption = 'system' | 'light' | 'dark';

const themeOptions: { value: ThemeOption; icon: typeof IconSun }[] = [
  { value: 'system', icon: IconDeviceDesktop },
  { value: 'light', icon: IconSun },
  { value: 'dark', icon: IconMoon },
];

export function AppearanceSheet({ open, onOpenChange }: AppearanceSheetProps) {
  const { t } = useTranslation('settings');
  const currentTheme = useTheme();

  const handleThemeChange = (theme: ThemeOption) => {
    preferencesActions.setTheme(theme);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>{t('appearance.title')}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-2">
          {themeOptions.map(({ value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => handleThemeChange(value)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl p-4 transition-colors',
                currentTheme === value
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-muted'
              )}
            >
              <Icon size={24} />
              <span className="flex-1 text-left font-medium">
                {t(`appearance.${value}`)}
              </span>
              {currentTheme === value && <IconCheck size={20} />}
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
