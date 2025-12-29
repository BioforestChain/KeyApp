import type { Preview, ReactRenderer } from '@storybook/react-vite'
import type { DecoratorFunction } from 'storybook/internal/types'
import { useEffect } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n, { languages, defaultLanguage, getLanguageDirection, type LanguageCode } from '../src/i18n'
import '../src/index.css'

const mobileViewports = {
  iPhoneSE: {
    name: 'iPhone SE',
    styles: { width: '375px', height: '667px' },
    type: 'mobile' as const,
  },
  iPhone13: {
    name: 'iPhone 13',
    styles: { width: '390px', height: '844px' },
    type: 'mobile' as const,
  },
  iPhone13ProMax: {
    name: 'iPhone 13 Pro Max',
    styles: { width: '428px', height: '926px' },
    type: 'mobile' as const,
  },
}

const preview: Preview = {
  parameters: {
    viewport: {
      viewports: mobileViewports,
      defaultViewport: 'iPhone13',
    },
    backgrounds: {
      disable: true,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  globalTypes: {
    locale: {
      name: 'Locale',
      description: 'Language',
      defaultValue: defaultLanguage,
      toolbar: {
        icon: 'globe',
        items: Object.entries(languages).map(([code, config]) => ({
          value: code,
          title: `${config.name} (${config.dir.toUpperCase()})`,
          right: config.dir === 'rtl' ? '←' : '→',
        })),
        dynamicTitle: true,
      },
    },
    theme: {
      name: 'Theme',
      description: 'Color theme',
      defaultValue: 'light',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    // i18n + Theme decorator
    ((Story, context) => {
      const locale = (context.globals['locale'] || defaultLanguage) as LanguageCode
      const theme = context.globals['theme'] || 'light'
      const direction = getLanguageDirection(locale)

      useEffect(() => {
        if (i18n.language !== locale) {
          i18n.changeLanguage(locale)
        }
        document.documentElement.lang = locale
        document.documentElement.dir = direction

        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }, [locale, theme, direction])

      return (
        <I18nextProvider i18n={i18n}>
          <Story />
        </I18nextProvider>
      )
    }) as DecoratorFunction<ReactRenderer>,

    // Container decorator with theme wrapper
    ((Story, context) => {
      const theme = context.globals['theme'] || 'light'
      const direction = getLanguageDirection((context.globals['locale'] || defaultLanguage) as LanguageCode)
      const isDark = theme === 'dark'

      return (
        <div className={`min-h-screen bg-background text-foreground transition-colors ${isDark ? 'dark' : ''}`}>
          <div
            className="mx-auto"
            dir={direction}
            style={{
              maxWidth: 428,
              minHeight: '100vh',
            }}
          >
            <Story />
          </div>
        </div>
      )
    }) as DecoratorFunction<ReactRenderer>,
  ],
}

export default preview
