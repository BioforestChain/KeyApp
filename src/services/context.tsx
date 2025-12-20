import { createContext, useContext, type ReactNode } from 'react'
import type { IServices } from './types'

// 导入新架构的服务单例
import { biometricService } from './biometric'
import { secureStorageService } from './storage'
import { clipboardService } from './clipboard'
import { toastService } from './toast'
import { cameraService } from './camera'
import { hapticsService } from './haptics'
import { currencyExchangeService } from './currency-exchange'

/**
 * Service 层架构 - 已迁移到独立文件夹
 * 
 * 新架构：每个服务独立文件夹 (biometric/, clipboard/, etc.)
 * 旧架构：ServiceProvider + Context (此文件仅保留兼容性)
 * 
 * 推荐使用新的 hooks.ts 中的 hooks，它们直接返回服务单例
 */

/** Service Context */
const ServiceContext = createContext<IServices | null>(null)

/** Service Provider Props */
interface ServiceProviderProps {
  children: ReactNode
  /** 直接传入服务实例（用于测试覆盖） */
  services?: IServices
}

/** 从新架构构建 IServices 对象 */
function getDefaultServices(): IServices {
  return {
    biometric: biometricService,
    secureStorage: secureStorageService,
    clipboard: clipboardService,
    toast: toastService,
    camera: cameraService as unknown as IServices['camera'],
    haptics: hapticsService,
    currencyExchange: currencyExchangeService,
  }
}

/** 
 * Service Provider (Legacy)
 * 
 * 注意：新代码建议直接使用 hooks.ts 中的 hooks
 * 此 Provider 保留用于向后兼容
 */
export function ServiceProvider({ children, services }: ServiceProviderProps) {
  const actualServices = services ?? getDefaultServices()

  return (
    <ServiceContext.Provider value={actualServices}>
      {children}
    </ServiceContext.Provider>
  )
}

/** Hook: 获取所有服务 (Legacy) */
export function useServices(): IServices {
  const services = useContext(ServiceContext)
  if (!services) {
    throw new Error('useServices must be used within ServiceProvider')
  }
  return services
}

// 以下 hooks 已迁移到 hooks.ts，这里重新导出以保持兼容
export { useBiometric, useSecureStorage, useClipboard, useToast, useCamera, useHaptics } from './hooks'
