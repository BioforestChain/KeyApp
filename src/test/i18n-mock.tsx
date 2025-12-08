import { ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// 创建测试用的 i18n 实例
const testI18n = i18n.createInstance()

testI18n.use(initReactI18next).init({
  lng: 'zh-CN',
  fallbackLng: 'zh-CN',
  ns: ['translation'],
  defaultNS: 'translation',
  resources: {
    'zh-CN': {
      translation: {
        common: {
          loading: '加载中',
          copy: '复制',
          copied: '已复制',
          copyToClipboard: '已复制到剪贴板',
        },
        wallet: {
          transfer: '转账',
          receive: '收款',
        },
        transaction: {
          send: '发送',
          receive: '接收',
          to: '至',
          from: '从',
          pending: '处理中',
          confirmed: '已确认',
          failed: '失败',
        },
        time: {
          justNow: '刚刚',
          minutesAgo: '{{count}} 分钟前',
          hoursAgo: '{{count}} 小时前',
          daysAgo: '{{count}} 天前',
          minutesLater: '{{count}} 分钟后',
          hoursLater: '{{count}} 小时后',
          daysLater: '{{count}} 天后',
        },
        empty: {
          title: '暂无内容',
          description: '这里空空如也',
        },
      },
    },
  },
  interpolation: {
    escapeValue: false,
  },
})

// 测试用 Provider 包装器
export function TestI18nProvider({ children }: { children: ReactNode }) {
  return <I18nextProvider i18n={testI18n}>{children}</I18nextProvider>
}

// 用于包装组件的 render 辅助函数
export function renderWithI18n(ui: ReactNode) {
  return <TestI18nProvider>{ui}</TestI18nProvider>
}

export { testI18n }
