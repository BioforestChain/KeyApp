import type { Preview, ReactRenderer } from '@storybook/react-vite'
import type { DecoratorFunction } from 'storybook/internal/types'
import { useEffect } from 'react'
import '../src/styles/base.css'

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
    ((Story, context) => {
      const theme = context.globals['theme'] || 'light'

      useEffect(() => {
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }, [theme])

      return (
        <div className={`min-h-screen bg-background text-foreground transition-colors ${theme === 'dark' ? 'dark' : ''}`}>
          <div
            className="mx-auto p-4"
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
