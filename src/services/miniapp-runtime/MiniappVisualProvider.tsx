import type { PropsWithChildren } from 'react'
import { MotionConfig } from 'motion/react'
import { useStore } from '@tanstack/react-store'
import { miniappRuntimeSelectors, miniappRuntimeStore } from './index'
import {
  getMiniappCssVars,
  getMiniappMotionPresets,
  mergeMiniappVisualConfig,
  type MiniappVisualConfigUpdate,
} from './visual-config'

export function MiniappVisualProvider({
  children,
  override,
}: PropsWithChildren<{ override?: MiniappVisualConfigUpdate }>) {
  const baseConfig = useStore(miniappRuntimeStore, miniappRuntimeSelectors.getVisualConfig)
  const config = mergeMiniappVisualConfig(baseConfig, override)
  const presets = getMiniappMotionPresets(config)
  const cssVars = getMiniappCssVars(config)

  return (
    <div style={cssVars} data-miniapp-visual-provider>
      <MotionConfig transition={presets.motionConfig} reducedMotion="user">
        {children}
      </MotionConfig>
    </div>
  )
}
