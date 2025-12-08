import type { Meta, StoryObj } from '@storybook/react'
import { useTranslation } from 'react-i18next'
import { GradientButton } from './gradient-button'
import { LoadingSpinner } from './loading-spinner'
import { EmptyState } from './empty-state'

function ThemeDemoComponent() {
  const { t, i18n } = useTranslation()
  
  return (
    <div className="space-y-6 p-4 bg-card rounded-xl">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">{t('wallet.myWallet')}</h2>
        <p className="text-sm text-muted">{t('common.loading')}</p>
      </div>
      
      <div className="flex items-center gap-3">
        <LoadingSpinner size="sm" />
        <span className="text-sm">{t('common.loading')}...</span>
      </div>
      
      <div className="flex gap-2">
        <GradientButton variant="purple" size="sm">
          {t('wallet.transfer')}
        </GradientButton>
        <GradientButton variant="blue" size="sm">
          {t('wallet.receive')}
        </GradientButton>
      </div>
      
      <div className="bg-background rounded-lg p-3">
        <p className="text-sm font-medium">{t('transaction.send')}</p>
        <p className="text-xs text-muted">{t('transaction.pending')}</p>
      </div>
      
      <div className="text-xs text-muted">
        Current: {i18n.language} | Dir: {i18n.dir()}
      </div>
    </div>
  )
}

const meta: Meta<typeof ThemeDemoComponent> = {
  title: 'Common/ThemeDemo',
  component: ThemeDemoComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
演示多语言和主题切换功能。

## 使用方法

使用工具栏切换：
- **🌐 Globe 图标**: 切换语言 (简体中文 / English / العربية)
- **🎨 Paintbrush 图标**: 切换主题 (Light / Dark)

## RTL 支持

选择阿拉伯语 (العربية) 时，页面会自动切换为 RTL 布局。
        `,
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof ThemeDemoComponent>

export const Default: Story = {}

export const WithEmptyState: Story = {
  render: () => {
    const { t } = useTranslation()
    return (
      <EmptyState
        title={t('token.noAssets')}
        description={t('empty.description')}
        action={
          <GradientButton variant="purple" size="sm">
            {t('token.addToken')}
          </GradientButton>
        }
      />
    )
  },
}

export const TransactionStates: Story = {
  render: () => {
    const { t } = useTranslation()
    return (
      <div className="space-y-3">
        {(['send', 'receive', 'swap', 'stake'] as const).map((type) => (
          <div 
            key={type}
            className="flex items-center justify-between p-3 bg-card rounded-lg"
          >
            <span className="font-medium">{t(`transaction.${type}`)}</span>
            <span className="text-sm text-muted">{t('transaction.confirmed')}</span>
          </div>
        ))}
      </div>
    )
  },
}

export const SecurityLabels: Story = {
  render: () => {
    const { t } = useTranslation()
    return (
      <div className="space-y-3">
        <div className="p-3 bg-card rounded-lg">
          <p className="font-medium">{t('security.password')}</p>
          <div className="flex gap-2 mt-2">
            {(['weak', 'medium', 'strong'] as const).map((level) => (
              <span 
                key={level}
                className={`px-2 py-1 rounded text-xs ${
                  level === 'weak' ? 'bg-destructive/20 text-destructive' :
                  level === 'medium' ? 'bg-yellow-500/20 text-yellow-600' :
                  'bg-secondary/20 text-secondary'
                }`}
              >
                {t(`security.strength.${level}`)}
              </span>
            ))}
          </div>
        </div>
        <div className="p-3 bg-card rounded-lg">
          <p className="font-medium">{t('security.mnemonic')}</p>
          <p className="text-sm text-muted mt-1">{t('security.copyMnemonic')}</p>
        </div>
      </div>
    )
  },
}
