import {
  IconSparkles as Sparkles,
  IconShieldCheck as ShieldCheck,
  IconStackMiddle as Layers3,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export interface WhatsNewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WhatsNewSheet({ open, onOpenChange }: WhatsNewSheetProps) {
  const { t } = useTranslation('migration');

  const features = [
    { key: 'feature_modern_ui', Icon: Sparkles },
    { key: 'feature_security', Icon: ShieldCheck },
    { key: 'feature_multichain', Icon: Layers3 },
  ] as const;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="gap-0 p-0">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-base">{t('whats_new_title')}</SheetTitle>
        </SheetHeader>

        <div className="px-4 pb-6">
          <ul className="space-y-3">
            {features.map(({ key, Icon }) => (
              <li key={key} className="flex items-start gap-3">
                <div className="bg-muted mt-0.5 flex size-8 items-center justify-center rounded-md">
                  <Icon className="size-4" />
                </div>
                <p className="text-sm leading-6">{t(key)}</p>
              </li>
            ))}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}
