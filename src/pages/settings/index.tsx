import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  Wallet,
  BookUser,
  Lock,
  Eye,
  KeyRound,
  Languages,
  DollarSign,
  Palette,
  Network,
  Info,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { useCurrentWallet, useLanguage, useCurrency } from '@/stores'
import { SettingsItem } from './settings-item'
import { SettingsSection } from './settings-section'

/** 支持的语言显示名称映射 */
const LANGUAGE_NAMES: Record<string, string> = {
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  en: 'English',
  ja: '日本語',
  ko: '한국어',
  ar: 'العربية',
}

/** 支持的货币显示名称映射 */
const CURRENCY_NAMES: Record<string, string> = {
  USD: 'USD ($)',
  CNY: 'CNY (¥)',
  EUR: 'EUR (€)',
  JPY: 'JPY (¥)',
  KRW: 'KRW (₩)',
}

export function SettingsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const currentWallet = useCurrentWallet()
  const currentLanguage = useLanguage()
  const currentCurrency = useCurrency()

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <PageHeader title={t('a11y.tabSettings')} />

      <div className="flex-1 space-y-4 p-4">
        {/* 钱包信息头 */}
        {currentWallet && (
          <div className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-sm">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-2xl">
              {currentWallet.name.slice(0, 1)}
            </div>
            <div className="flex-1">
              <h2 className="font-semibold">{currentWallet.name}</h2>
              <p className="text-sm text-muted-foreground">
                {currentWallet.chainAddresses.length} 个链地址
              </p>
            </div>
          </div>
        )}

        {/* 钱包管理 */}
        <SettingsSection title="钱包管理">
          <SettingsItem
            icon={<Wallet size={20} />}
            label="钱包管理"
            onClick={() => navigate({ to: '/wallet/$walletId', params: { walletId: currentWallet?.id ?? '' } })}
          />
          <div className="mx-4 h-px bg-border" />
          <SettingsItem
            icon={<BookUser size={20} />}
            label="地址簿"
            onClick={() => {
              // TODO: 导航到地址簿页面
            }}
          />
        </SettingsSection>

        {/* 安全 */}
        <SettingsSection title="安全">
          <SettingsItem
            icon={<Lock size={20} />}
            label="应用锁"
            value="未设置"
            onClick={() => {
              // TODO: T008.x - 应用锁设置
            }}
          />
          <div className="mx-4 h-px bg-border" />
          <SettingsItem
            icon={<Eye size={20} />}
            label="查看助记词"
            onClick={() => navigate({ to: '/settings/mnemonic' })}
          />
          <div className="mx-4 h-px bg-border" />
          <SettingsItem
            icon={<KeyRound size={20} />}
            label="修改密码"
            onClick={() => navigate({ to: '/settings/password' })}
          />
        </SettingsSection>

        {/* 偏好设置 */}
        <SettingsSection title="偏好设置">
          <SettingsItem
            icon={<Languages size={20} />}
            label="语言"
            value={LANGUAGE_NAMES[currentLanguage]}
            onClick={() => navigate({ to: '/settings/language' })}
          />
          <div className="mx-4 h-px bg-border" />
          <SettingsItem
            icon={<DollarSign size={20} />}
            label="货币单位"
            value={CURRENCY_NAMES[currentCurrency]}
            onClick={() => navigate({ to: '/settings/currency' })}
          />
          <div className="mx-4 h-px bg-border" />
          <SettingsItem
            icon={<Network size={20} />}
            label="链配置"
            onClick={() => navigate({ to: '/settings/chains' })}
          />
          <div className="mx-4 h-px bg-border" />
          <SettingsItem
            icon={<Palette size={20} />}
            label="外观"
            value="跟随系统"
            onClick={() => {
              // TODO: 主题切换
            }}
          />
        </SettingsSection>

        {/* 关于 */}
        <SettingsSection title="关于">
          <SettingsItem
            icon={<Info size={20} />}
            label="关于 BFM Pay"
            value="v1.0.0"
            onClick={() => {
              // TODO: 关于页面
            }}
          />
        </SettingsSection>
      </div>
    </div>
  )
}
