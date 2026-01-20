import { useNavigation } from '@/stackflow';
import { useTranslation } from 'react-i18next';
import { IconCheck as Check } from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/page-header';
import { useLanguage, preferencesActions, languages, type LanguageCode } from '@/stores';
import { cn } from '@/lib/utils';

/** 语言显示名称映射 - 使用原文 */
const LANGUAGE_DISPLAY: Record<LanguageCode, string> = {
  'zh-CN': '简体中文', // i18n-ignore: native language name
  'zh-TW': '中文（繁體）', // i18n-ignore: native language name
  en: 'English',
  ar: 'العربية',
};

export function LanguagePage() {
  const { goBack } = useNavigation();
  const { t } = useTranslation('settings');
  const currentLanguage = useLanguage();

  const handleSelect = (lang: LanguageCode) => {
    preferencesActions.setLanguage(lang);
    goBack();
  };

  return (
    <div className="bg-muted/30 flex min-h-screen flex-col">
      <PageHeader title={t('languagePage.title')} onBack={goBack} />

      <div className="flex-1 p-4">
        <div className="bg-card overflow-hidden rounded-xl shadow-sm">
          {(Object.keys(languages) as LanguageCode[]).map((lang, index) => (
            <div key={lang}>
              {index > 0 && <div className="bg-border mx-4 h-px" />}
              <button
                onClick={() => handleSelect(lang)}
                className={cn(
                  'flex w-full items-center justify-between px-4 py-3.5',
                  'hover:bg-muted/50 active:bg-muted transition-colors',
                  lang === currentLanguage && 'bg-primary/5',
                )}
              >
                <span className="text-sm font-medium">{LANGUAGE_DISPLAY[lang]}</span>
                {lang === currentLanguage && <Check className="text-primary size-5" />}
              </button>
            </div>
          ))}
        </div>

        <p className="text-muted-foreground mt-4 px-1 text-xs">{t('languagePage.hint')}</p>
      </div>
    </div>
  );
}
