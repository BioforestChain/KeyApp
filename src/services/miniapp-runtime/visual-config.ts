import type { CSSProperties } from 'react'
import type { Transition } from 'motion/react'

export type MiniappCubicBezier = [number, number, number, number]

export interface MiniappMotionTokens {
  /** >1 更快，<1 更慢 */
  timeScale: number
  layoutDuration: number
  uiFastDuration: number
  layoutEase: MiniappCubicBezier
  spring: {
    stiffness: number
    damping: number
    mass: number
  }
}

export interface MiniappCssTokens {
  /** 预留：后续将 module.css 中的时间/缓动等 token 化 */
}

export interface MiniappVisualConfig {
  motion: MiniappMotionTokens
  css: MiniappCssTokens
}

export const DEFAULT_MINIAPP_VISUAL_CONFIG: MiniappVisualConfig = {
  motion: {
    timeScale: 1,
    layoutDuration: 0.45,
    uiFastDuration: 0.15,
    layoutEase: [0.4, 0, 0.1, 1],
    spring: {
      stiffness: 220,
      damping: 28,
      mass: 0.85,
    },
  },
  css: {},
} as const

export type MiniappVisualConfigUpdate = Partial<{
  motion: Partial<MiniappMotionTokens>
  css: Partial<MiniappCssTokens>
}>

export interface MiniappMotionPresets {
  /** 用于 MotionConfig（非 layout 动画的默认 transition） */
  motionConfig: Transition
  /** 用于所有 layoutId 节点：`transition={presets.sharedLayout}` */
  sharedLayout: Transition
  /** UI 快速过渡 */
  uiFast: Transition
}

function clampTimeScale(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1
  return value
}

function scaleDurationSeconds(duration: number, timeScale: number): number {
  const scale = clampTimeScale(timeScale)
  return duration / scale
}

function scaleSpring(value: number, timeScale: number, power: 1 | 2): number {
  const scale = clampTimeScale(timeScale)
  return value * Math.pow(scale, power)
}

export function mergeMiniappVisualConfig(
  base: MiniappVisualConfig,
  update: MiniappVisualConfigUpdate | undefined
): MiniappVisualConfig {
  if (!update) return base

  return {
    motion: {
      ...base.motion,
      ...(update.motion ?? {}),
      spring: {
        ...base.motion.spring,
        ...(update.motion?.spring ?? {}),
      },
    },
    css: {
      ...base.css,
      ...(update.css ?? {}),
    },
  }
}

const motionPresetsCache = new WeakMap<MiniappVisualConfig, MiniappMotionPresets>()
const cssVarsCache = new WeakMap<MiniappVisualConfig, CSSProperties>()

export function getMiniappMotionPresets(config: MiniappVisualConfig): MiniappMotionPresets {
  const cached = motionPresetsCache.get(config)
  if (cached) return cached

  const { motion } = config

  const motionConfig: Transition = {
    type: 'spring',
    stiffness: scaleSpring(motion.spring.stiffness, motion.timeScale, 2),
    damping: scaleSpring(motion.spring.damping, motion.timeScale, 1),
    mass: motion.spring.mass,
  } as const

  const layoutTransition = {
    duration: scaleDurationSeconds(motion.layoutDuration, motion.timeScale),
    ease: motion.layoutEase,
  } as const

  const sharedLayout: Transition = {
    layout: layoutTransition,
  } as const

  const uiFast: Transition = {
    duration: scaleDurationSeconds(motion.uiFastDuration, motion.timeScale),
    ease: 'easeOut',
  } as const

  const presets: MiniappMotionPresets = { motionConfig, sharedLayout, uiFast }
  motionPresetsCache.set(config, presets)
  return presets
}

export function getMiniappCssVars(config: MiniappVisualConfig): CSSProperties {
  const cached = cssVarsCache.get(config)
  if (cached) return cached

  const { motion } = config
  const vars: CSSProperties = {
    ['--miniapp-motion-time-scale' as any]: String(clampTimeScale(motion.timeScale)),
    ['--miniapp-motion-layout-duration' as any]: `${scaleDurationSeconds(motion.layoutDuration, motion.timeScale)}s`,
    ['--miniapp-motion-ui-fast-duration' as any]: `${scaleDurationSeconds(motion.uiFastDuration, motion.timeScale)}s`,
    ['--miniapp-motion-layout-ease' as any]: `cubic-bezier(${motion.layoutEase.join(',')})`,
  }

  cssVarsCache.set(config, vars)
  return vars
}
