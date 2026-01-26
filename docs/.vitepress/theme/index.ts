import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import DwebInstallLink from './components/DwebInstallLink.vue'

export default {
  extends: DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp?.(ctx)
    ctx.app.component('DwebInstallLink', DwebInstallLink)
  },
} satisfies Theme
