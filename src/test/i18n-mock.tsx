import type { ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import zhCNSettings from '@/i18n/locales/zh-CN/settings.json'
import zhCNCommon from '@/i18n/locales/zh-CN/common.json'
import zhCNOnboarding from '@/i18n/locales/zh-CN/onboarding.json'
import zhCNTransaction from '@/i18n/locales/zh-CN/transaction.json'
import zhCNNotification from '@/i18n/locales/zh-CN/notification.json'
import zhCNWallet from '@/i18n/locales/zh-CN/wallet.json'

// 创建测试用的 i18n 实例
const testI18n = i18n.createInstance()

testI18n.use(initReactI18next).init({
  lng: 'zh-CN',
  fallbackLng: 'zh-CN',
  ns: ['translation', 'authorize', 'common', 'settings', 'onboarding', 'transaction', 'notification', 'wallet'],
  defaultNS: 'translation',
  resources: {
    'zh-CN': {
      translation: {
        a11y: {
          skipToMain: '跳转到主要内容',
          tabHome: '首页',
          tabTransfer: '转账',
          tabWallet: '钱包',
          tabSettings: '设置',
          tabHistory: '交易记录',
          scan: '扫描二维码',
          scanQrCode: '扫描二维码',
          chainSelector: '选择区块链网络',
          copyAddress: '复制地址',
          paste: '粘贴',
          refresh: '刷新',
          selectChain: '选择链',
          selectPeriod: '选择时间段',
          tokenDetails: '查看 {{token}} 详情',
          showPassword: '显示密码',
          hidePassword: '隐藏密码',
          passwordStrength: '密码强度：{{strength}}',
          closeDialog: '关闭弹窗',
          invalidAddress: '无效的地址格式',
        },
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
      common: zhCNCommon,
      authorize: {
        title: {
          address: '地址授权',
          signature: '交易授权',
        },
        address: {
          shareWith: '是否与该应用共享地址？',
          scope: {
            main: '仅当前钱包',
            network: '所有 {{chainName}} 地址',
            all: '所有钱包',
          },
          permissions: {
            viewAddress: '查看你的钱包地址',
            viewPublicKey: '查看你的公钥',
            signMessage: '签名验证消息',
          },
        },
        signature: {
          reviewTransaction: '请确认该交易',
          messageToSign: '待签名消息',
          confirmDescription: '请输入密码进行签名',
          type: {
            message: '消息签名',
            transfer: '代币转账',
            destroy: '资产销毁',
          },
        },
        button: {
          approve: '同意',
          reject: '拒绝',
          confirm: '输入密码确认',
        },
        error: {
          authFailed: '授权失败',
          unknownChain: '不支持的区块链',
          timeout: '请求已超时',
          insufficientBalance: '余额不足，无法完成此交易',
          passwordIncorrect: '密码错误',
        },
      },
      settings: zhCNSettings,
      onboarding: zhCNOnboarding,
      transaction: zhCNTransaction,
      notification: zhCNNotification,
      wallet: zhCNWallet,
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
