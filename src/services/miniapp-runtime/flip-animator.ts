/**
 * FLIP Animator
 *
 * 计算 FLIP (First, Last, Invert, Play) 动画的帧数据
 * 用于小程序图标到窗口的平滑变换
 */

import type { FlipFrame, FlipFrames, AnimationConfig } from './types'
import { DEFAULT_ANIMATION_CONFIG } from './types'

/** 图标默认圆角比例 (iOS App Icon) */
const ICON_BORDER_RADIUS_RATIO = 0.22

/**
 * 从 DOM 元素获取 FLIP 帧数据
 */
export function getFlipFrame(element: HTMLElement): FlipFrame {
  const rect = element.getBoundingClientRect()
  const style = getComputedStyle(element)

  return {
    rect: DOMRect.fromRect({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    }),
    opacity: parseFloat(style.opacity) || 1,
    borderRadius: parseFloat(style.borderRadius) || 0,
  }
}

/**
 * 获取图标元素的 FLIP 帧（带默认圆角）
 */
export function getIconFlipFrame(iconElement: HTMLElement): FlipFrame {
  const frame = getFlipFrame(iconElement)
  // 如果没有圆角，使用 iOS 默认比例
  if (frame.borderRadius === 0) {
    frame.borderRadius = Math.round(frame.rect.width * ICON_BORDER_RADIUS_RATIO)
  }
  return frame
}

/**
 * 获取 TabBar 高度
 */
function getTabBarHeight(): number {
  if (typeof window === 'undefined') return 52
  const style = getComputedStyle(document.documentElement)
  const height = style.getPropertyValue('--tab-bar-height')
  // 解析 calc(52px + env(...)) 的结果
  if (!height) return 52
  // 创建临时元素来计算实际高度
  const temp = document.createElement('div')
  temp.style.cssText = `position:fixed;height:var(--tab-bar-height);visibility:hidden;`
  document.body.appendChild(temp)
  const computed = temp.offsetHeight
  document.body.removeChild(temp)
  return computed || 52
}

/**
 * 获取窗口目标帧（不覆盖底部 TabBar）
 */
export function getWindowFlipFrame(safeAreaInsets?: {
  top: number
  bottom: number
  left: number
  right: number
}): FlipFrame {
  const insets = safeAreaInsets ?? { top: 0, bottom: 0, left: 0, right: 0 }
  const tabBarHeight = getTabBarHeight()

  return {
    rect: DOMRect.fromRect({
      x: insets.left,
      y: insets.top,
      width: window.innerWidth - insets.left - insets.right,
      // 底部减去 tabbar 高度
      height: window.innerHeight - insets.top - tabBarHeight,
    }),
    opacity: 1,
    borderRadius: 0,
  }
}

/**
 * 计算启动动画帧
 * 从图标位置变换到全屏窗口
 */
export function computeLaunchFrames(
  iconElement: HTMLElement,
  config: Partial<AnimationConfig> = {}
): FlipFrames {
  const animConfig = { ...DEFAULT_ANIMATION_CONFIG, ...config }

  return {
    first: getIconFlipFrame(iconElement),
    last: getWindowFlipFrame(),
    duration: animConfig.launchDuration,
    easing: animConfig.iosEasing,
  }
}

/**
 * 计算关闭动画帧
 * 从全屏窗口变换回图标位置
 */
export function computeCloseFrames(
  iconElement: HTMLElement,
  config: Partial<AnimationConfig> = {}
): FlipFrames {
  const animConfig = { ...DEFAULT_ANIMATION_CONFIG, ...config }

  return {
    first: getWindowFlipFrame(),
    last: getIconFlipFrame(iconElement),
    duration: animConfig.closeDuration,
    easing: animConfig.iosEasing,
  }
}

/**
 * 计算 FLIP 反转变换
 * 用于将元素从 last 位置反转到 first 位置的 CSS transform
 */
export function computeInvertTransform(frames: FlipFrames): {
  x: number
  y: number
  scaleX: number
  scaleY: number
} {
  const { first, last } = frames

  return {
    x: first.rect.x - last.rect.x,
    y: first.rect.y - last.rect.y,
    scaleX: first.rect.width / last.rect.width,
    scaleY: first.rect.height / last.rect.height,
  }
}

/**
 * 生成 Web Animations API 的 keyframes
 */
export function generateKeyframes(frames: FlipFrames): Keyframe[] {
  const invert = computeInvertTransform(frames)

  return [
    {
      transform: `translate(${invert.x}px, ${invert.y}px) scale(${invert.scaleX}, ${invert.scaleY})`,
      borderRadius: `${frames.first.borderRadius}px`,
      opacity: frames.first.opacity,
    },
    {
      transform: 'translate(0, 0) scale(1, 1)',
      borderRadius: `${frames.last.borderRadius}px`,
      opacity: frames.last.opacity,
    },
  ]
}

/**
 * 生成关闭动画的 keyframes（反向）
 */
export function generateCloseKeyframes(frames: FlipFrames): Keyframe[] {
  const invert = computeInvertTransform(frames)

  return [
    {
      transform: 'translate(0, 0) scale(1, 1)',
      borderRadius: `${frames.first.borderRadius}px`,
      opacity: frames.first.opacity,
    },
    {
      transform: `translate(${-invert.x}px, ${-invert.y}px) scale(${1 / invert.scaleX}, ${1 / invert.scaleY})`,
      borderRadius: `${frames.last.borderRadius}px`,
      opacity: frames.last.opacity,
    },
  ]
}

/**
 * 播放 FLIP 动画
 */
export function playFlipAnimation(
  element: HTMLElement,
  frames: FlipFrames,
  options?: {
    onFinish?: () => void
    reverse?: boolean
  }
): Animation {
  const keyframes = options?.reverse
    ? generateCloseKeyframes(frames)
    : generateKeyframes(frames)

  const animation = element.animate(keyframes, {
    duration: frames.duration,
    easing: frames.easing,
    fill: 'forwards',
  })

  if (options?.onFinish) {
    animation.onfinish = options.onFinish
  }

  return animation
}

/**
 * 创建同步的双层动画（窗口 + Swiper）
 * 返回控制函数用于手势驱动
 */
export function createSyncedAnimation(
  windowElement: HTMLElement,
  frames: FlipFrames
): {
  animation: Animation
  setProgress: (progress: number) => void
  play: () => void
  reverse: () => void
  finish: () => void
} {
  const keyframes = generateKeyframes(frames)

  const animation = windowElement.animate(keyframes, {
    duration: frames.duration,
    easing: frames.easing,
    fill: 'both',
  })

  // 暂停动画，用于手势控制
  animation.pause()

  return {
    animation,
    setProgress: (progress: number) => {
      // progress: 0-1
      animation.currentTime = progress * frames.duration
    },
    play: () => {
      animation.play()
    },
    reverse: () => {
      animation.reverse()
    },
    finish: () => {
      animation.finish()
    },
  }
}
