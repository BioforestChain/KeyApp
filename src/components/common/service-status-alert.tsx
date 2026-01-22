/**
 * 统一服务状态提示组件
 * 
 * 根据不同错误类型显示对应的用户友好提示
 */

import { useTranslation } from 'react-i18next'
import { Alert } from '@biochain/key-ui'
import { IconAlertTriangle, IconCloudOff, IconLock } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

export type ServiceAlertType = 'notSupported' | 'limited' | 'error'

export interface ServiceStatusAlertProps {
  /** 错误类型 */
  type: ServiceAlertType
  /** 功能名称（如"交易历史"） */
  feature?: string
  /** 技术原因（可选展开查看） */
  reason?: string
  /** 自定义样式 */
  className?: string
}

/**
 * 服务状态提示组件
 * 
 * @example
 * ```tsx
 * // 服务受限
 * <ServiceStatusAlert type="limited" feature="交易历史" />
 * 
 * // 不支持
 * <ServiceStatusAlert type="notSupported" feature="代币余额" />
 * 
 * // 查询失败
 * <ServiceStatusAlert type="error" reason={error.message} />
 * ```
 */
export function ServiceStatusAlert({ type, feature, reason, className }: ServiceStatusAlertProps) {
  const { t } = useTranslation('common')

  const config = {
    notSupported: {
      variant: 'info' as const,
      icon: <IconCloudOff className="size-4" />,
      title: t('service.notSupported'),
      desc: feature 
        ? t('service.notSupportedDesc', { feature }) 
        : t('service.notSupportedDescGeneric'),
    },
    limited: {
      variant: 'warning' as const,
      icon: <IconLock className="size-4" />,
      title: t('service.limited'),
      desc: t('service.limitedDesc'),
    },
    error: {
      variant: 'error' as const,
      icon: <IconAlertTriangle className="size-4" />,
      title: t('service.queryFailed'),
      desc: t('service.queryFailedDesc'),
    },
  }

  const { variant, icon, title, desc } = config[type]

  return (
    <Alert 
      variant={variant} 
      title={title} 
      icon={icon} 
      className={cn(className)}
    >
      <p className="text-xs opacity-80">{desc}</p>
      {reason && (
        <details className="mt-2">
          <summary className="text-xs cursor-pointer hover:underline opacity-70">
            {t('service.technicalDetails')}
          </summary>
          <p className="mt-1 text-xs font-mono break-all opacity-60">{reason}</p>
        </details>
      )}
    </Alert>
  )
}
