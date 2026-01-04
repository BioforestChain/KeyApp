/**
 * System-level method handlers
 */

import type { MethodHandler } from '../types'
import { dismissSplash } from '@/services/miniapp-runtime'

/** bio_closeSplashScreen - Mark app ready and close splash overlay */
export const handleCloseSplashScreen: MethodHandler = async (_params, context) => {
  dismissSplash(context.appId)
  return undefined
}
