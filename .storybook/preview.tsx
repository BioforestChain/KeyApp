import type { Preview, ReactRenderer } from '@storybook/react-vite'
import type { DecoratorFunction } from 'storybook/internal/types'
import { useEffect, useMemo } from 'react'
import { I18nextProvider } from 'react-i18next'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import i18n, { languages, getLanguageDirection, type LanguageCode } from '../src/i18n'
import { currencies, preferencesActions, preferencesStore, type CurrencyCode } from '../src/stores/preferences'
import '../src/styles/globals.css'

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
  foldableOpen: {
    name: 'Foldable (Open)',
    styles: { width: '717px', height: '512px' },
    type: 'tablet' as const,
  },
  iPadMini: {
    name: 'iPad Mini',
    styles: { width: '768px', height: '1024px' },
    type: 'tablet' as const,
  },
}

const containerSizes = {
  narrow: { name: 'Narrow (280px)', width: 280 },
  small: { name: 'Small (320px)', width: 320 },
  standard: { name: 'Standard (360px)', width: 360 },
  wide: { name: 'Wide (480px)', width: 480 },
  tablet: { name: 'Tablet (600px)', width: 600 },
}

const supportedCurrencyCodes: CurrencyCode[] = ['USD', 'CNY', 'EUR', 'JPY', 'KRW']

function isCurrencyCode(value: unknown): value is CurrencyCode {
  return (
    typeof value === 'string' &&
    (value === 'USD' || value === 'CNY' || value === 'EUR' || value === 'JPY' || value === 'KRW')
  )
}

const preview: Preview = {
  parameters: {
    viewport: {
      viewports: mobileViewports,
      defaultViewport: 'iPhone13',
    },
    backgrounds: {
      disable: true, // 使用自定义主题切换
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
      description: 'Language and direction',
      defaultValue: 'zh-CN',
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
    currency: {
      name: 'Currency',
      description: 'Fiat display currency (default USD)',
      defaultValue: 'USD',
      toolbar: {
        icon: 'creditcard',
        items: supportedCurrencyCodes.map((code) => ({
          value: code,
          title: `${currencies[code].symbol} ${code}`,
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
    containerSize: {
      name: 'Container Size',
      description: 'Container width for testing responsive components',
      defaultValue: 'standard',
      toolbar: {
        icon: 'grow',
        items: Object.entries(containerSizes).map(([key, value]) => ({
          value: key,
          title: value.name,
        })),
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    // i18n + Theme + Direction + QueryClient decorator
    ((Story, context) => {
      const locale = (context.globals['locale'] || 'zh-CN') as LanguageCode
      const currency = isCurrencyCode(context.globals['currency']) ? context.globals['currency'] : 'USD'
      const theme = context.globals['theme'] || 'light'
      const direction = getLanguageDirection(locale)

      // Create a stable QueryClient instance for each story
      const queryClient = useMemo(
        () =>
          new QueryClient({
            defaultOptions: {
              queries: {
                retry: false,
                staleTime: Infinity,
              },
            },
          }),
        []
      )

      useEffect(() => {
        // 更新语言
        if (i18n.language !== locale) {
          i18n.changeLanguage(locale)
        }

        // 更新 HTML 属性
        document.documentElement.lang = locale
        document.documentElement.dir = direction
        
        // 更新主题 - Tailwind 4.x 使用 class
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }

        // 同步法币偏好（用于 TokenItem 汇率展示）
        if (preferencesStore.state.currency !== currency) {
          preferencesActions.setCurrency(currency)
        }
      }, [locale, currency, theme, direction])

      return (
        <QueryClientProvider client={queryClient}>
          <I18nextProvider i18n={i18n}>
            <Story />
          </I18nextProvider>
        </QueryClientProvider>
      )
    }) as DecoratorFunction<ReactRenderer>,

    // Container size decorator with theme wrapper
    ((Story, context) => {
      const containerKey = context.globals['containerSize'] || 'standard'
      const containerWidth = containerSizes[containerKey as keyof typeof containerSizes]?.width || 360
      const theme = context.globals['theme'] || 'light'
      const direction = getLanguageDirection((context.globals['locale'] || 'zh-CN') as LanguageCode)
      const isDark = theme === 'dark'
      
      return (
        // 外层 div 控制主题 class，确保 @theme dark 生效
        <div className={`min-h-screen p-4 bg-background transition-colors ${isDark ? 'dark' : ''}`}>
          <div 
            className="@container mx-auto bg-card text-foreground transition-colors"
            dir={direction}
            style={{ 
              width: containerWidth,
              resize: 'horizontal',
              overflow: 'auto',
              minWidth: 200,
              maxWidth: 800,
              border: isDark ? '1px dashed #444' : '1px dashed #ccc',
              padding: '8px',
              borderRadius: '8px',
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
