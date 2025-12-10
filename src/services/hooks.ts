/**
 * Service Hooks
 * 提供 React 组件中使用服务的便捷方式
 */

import { biometricService } from './biometric'
import { clipboardService } from './clipboard'
import { toastService } from './toast'
import { hapticsService } from './haptics'
import { secureStorageService } from './storage'
import { cameraService } from './camera'

export function useBiometric() {
  return biometricService
}

export function useClipboard() {
  return clipboardService
}

export function useToast() {
  return toastService
}

export function useHaptics() {
  return hapticsService
}

export function useSecureStorage() {
  return secureStorageService
}

export function useCamera() {
  return cameraService
}
