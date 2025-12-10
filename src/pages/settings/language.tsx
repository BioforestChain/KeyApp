import { useNavigate } from '@tanstack/react-router'
import { Check } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import {
  useLanguage,
  preferencesActions,
  languages,
  type LanguageCode,
} from '@/stores'
import { cn } from '@/lib/utils'

/** 语言显示名称映射 - 使用原文 */
const LANGUAGE_DISPLAY: Record<LanguageCode, string> = {
  'zh-CN': '简体中文',
  en: 'English',
  ar: 'العربية',
}

export function LanguagePage() {
  const navigate = useNavigate()
  const currentLanguage = useLanguage()

  const handleSelect = (lang: LanguageCode) => {
    preferencesActions.setLanguage(lang)
    // 返回设置页
    navigate({ to: '/settings' })
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <PageHeader title="语言" showBack onBack={() => navigate({ to: '/settings' })} />

      <div className="flex-1 p-4">
        <div className="overflow-hidden rounded-xl bg-card shadow-sm">
          {(Object.keys(languages) as LanguageCode[]).map((lang, index) => (
            <div key={lang}>
              {index > 0 && <div className="mx-4 h-px bg-border" />}
              <button
                onClick={() => handleSelect(lang)}
                className={cn(
                  'flex w-full items-center justify-between px-4 py-3.5',
                  'transition-colors hover:bg-muted/50 active:bg-muted',
                  lang === currentLanguage && 'bg-primary/5'
                )}
              >
                <span className="text-sm font-medium">
                  {LANGUAGE_DISPLAY[lang]}
                </span>
                {lang === currentLanguage && (
                  <Check className="size-5 text-primary" />
                )}
              </button>
            </div>
          ))}
        </div>

        <p className="mt-4 px-1 text-xs text-muted-foreground">
          选择界面语言后，应用将立即切换到所选语言。
        </p>
      </div>
    </div>
  )
}
