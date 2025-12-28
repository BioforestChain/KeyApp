import { useCallback, useEffect, useRef, useState } from 'react'

interface CardInteractionOptions {
  /** 重力感应强度 (0-1)，默认0.15 */
  gyroStrength?: number
  /** 触摸/鼠标强度 (0-1)，默认1 */
  touchStrength?: number
  /** 是否启用重力感应 */
  enableGyro?: boolean
  /** 是否启用触摸 */
  enableTouch?: boolean
  /** 摩擦力系统：静止检测时间 (ms)，默认 3000 */
  idleTimeout?: number
  /** 摩擦力系统：唤醒阈值 (pointer 变化量)，默认 0.055 ≈ 10pt 视觉移动 */
  wakeThreshold?: number
}

interface CardInteractionState {
  /** 指针X位置 (-1 到 1) */
  pointerX: number
  /** 指针Y位置 (-1 到 1) */
  pointerY: number
  /** 是否激活（hover或touch中） */
  isActive: boolean
}

/**
 * 卡片交互 Hook - 结合重力感应和触摸/鼠标
 * 用于实现3D倾斜效果和炫光追踪
 */
export function useCardInteraction(options: CardInteractionOptions = {}) {
  const {
    gyroStrength = 0.15,
    touchStrength = 1,
    enableGyro = true,
    enableTouch = true,
    idleTimeout = 3000,
    wakeThreshold = 0.055,
  } = options

  const applyGyroCurve = useCallback((value: number) => {
    const abs = Math.abs(value)
    // 让小幅度倾斜更“跟手”（小值放大，大值不变），提升手机端体感。
    const curved = Math.pow(abs, 0.7)
    return Math.sign(value) * curved
  }, [])

  const elementRef = useRef<HTMLElement | null>(null)
  const [state, setState] = useState<CardInteractionState>({
    pointerX: 0,
    pointerY: 0,
    isActive: false,
  })

  // 重力感应数据
  const gyroRef = useRef({ x: 0, y: 0 })
  // 触摸数据
  const touchRef = useRef({ x: 0, y: 0, active: false })

  // 摩擦力系统状态
  const frictionPhase = useRef<'static' | 'dynamic'>('dynamic')
  const lastActiveTime = useRef(Date.now())
  const lastPointer = useRef({ x: 0, y: 0 })

  // 合并重力和触摸数据（含摩擦力系统）
  const updateState = useCallback(() => {
    const now = Date.now()
    const gyro = gyroRef.current
    const touch = touchRef.current

    const gyroX = applyGyroCurve(gyro.x)
    const gyroY = applyGyroCurve(gyro.y)

    let x = 0
    let y = 0
    let active = false

    if (touch.active && enableTouch) {
      // 触摸优先，但仍叠加轻微重力
      x = touch.x * touchStrength + gyroX * gyroStrength * 0.3
      y = touch.y * touchStrength + gyroY * gyroStrength * 0.3
      active = true
    } else if (enableGyro && (Math.abs(gyro.x) > 0.01 || Math.abs(gyro.y) > 0.01)) {
      // 重力感应 - 有明显倾斜时也算激活
      x = gyroX * gyroStrength
      y = gyroY * gyroStrength
      active = true
    }

    // 限制范围
    x = Math.max(-1, Math.min(1, x))
    y = Math.max(-1, Math.min(1, y))

    // 摩擦力系统：计算运动幅度（相对于上一个稳定位置）
    const delta = Math.hypot(x - lastPointer.current.x, y - lastPointer.current.y)

    if (frictionPhase.current === 'static') {
      // 静止阶段：只有大幅运动或触摸才唤醒
      if (delta > wakeThreshold || touch.active) {
        frictionPhase.current = 'dynamic'
        lastActiveTime.current = now
        lastPointer.current = { x, y }
      } else {
        // 过滤微弱运动，保持静止（不更新 state，不更新 lastPointer）
        return
      }
    } else {
      // 动态阶段：检查是否该进入静止
      if (delta > wakeThreshold || touch.active) {
        lastActiveTime.current = now
        lastPointer.current = { x, y }
      } else if (now - lastActiveTime.current > idleTimeout) {
        frictionPhase.current = 'static'
        // 进入静止时：保持当前位置不变（冻结），不再更新
        // lastPointer 也保持不变，用于检测唤醒
        return
      }
    }

    setState({
      pointerX: x,
      pointerY: y,
      isActive: active,
    })
  }, [applyGyroCurve, gyroStrength, touchStrength, enableGyro, enableTouch, idleTimeout, wakeThreshold])

  // 处理重力感应
  useEffect(() => {
    if (!enableGyro) return

    let permissionGranted = false

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const { beta, gamma } = event
      if (beta === null || gamma === null) return

      // beta: 前后倾斜 (-180 to 180)，gamma: 左右倾斜 (-90 to 90)
      // 归一化到 -1 到 1
      gyroRef.current = {
        x: Math.max(-1, Math.min(1, gamma / 45)),
        y: Math.max(-1, Math.min(1, (beta - 45) / 45)),
      }
      updateState()
    }

    const requestPermission = async () => {
      // iOS 13+ 需要请求权限
      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        'requestPermission' in DeviceOrientationEvent &&
        typeof (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission === 'function'
      ) {
        try {
          const permission = await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission()
          permissionGranted = permission === 'granted'
        } catch {
          permissionGranted = false
        }
      } else {
        permissionGranted = true
      }

      if (permissionGranted) {
        window.addEventListener('deviceorientation', handleOrientation)
      }
    }

    requestPermission()

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation)
    }
  }, [enableGyro, updateState])

  // 处理鼠标/触摸
  const handlePointerMove = useCallback(
    (event: PointerEvent | MouseEvent | TouchEvent) => {
      if (!enableTouch || !elementRef.current) return

      const element = elementRef.current
      const rect = element.getBoundingClientRect()

      let clientX: number, clientY: number

      if ('touches' in event && event.touches[0]) {
        clientX = event.touches[0].clientX
        clientY = event.touches[0].clientY
      } else if ('clientX' in event) {
        clientX = event.clientX
        clientY = event.clientY
      } else {
        return
      }

      const x = ((clientX - rect.left) / rect.width - 0.5) * 2
      const y = ((clientY - rect.top) / rect.height - 0.5) * 2

      touchRef.current = { x, y, active: true }
      updateState()
    },
    [enableTouch, updateState]
  )

  const handlePointerLeave = useCallback(() => {
    touchRef.current = { x: 0, y: 0, active: false }
    updateState()
  }, [updateState])

  // 绑定到元素
  const bindElement = useCallback(
    (element: HTMLElement | null) => {
      // 清理旧绑定
      if (elementRef.current) {
        elementRef.current.removeEventListener('pointermove', handlePointerMove as EventListener)
        elementRef.current.removeEventListener('pointerleave', handlePointerLeave)
        elementRef.current.removeEventListener('touchmove', handlePointerMove as EventListener)
        elementRef.current.removeEventListener('touchend', handlePointerLeave)
      }

      elementRef.current = element

      // 新绑定
      if (element) {
        element.addEventListener('pointermove', handlePointerMove as EventListener)
        element.addEventListener('pointerleave', handlePointerLeave)
        element.addEventListener('touchmove', handlePointerMove as EventListener, { passive: true })
        element.addEventListener('touchend', handlePointerLeave)
      }
    },
    [handlePointerMove, handlePointerLeave]
  )

  return {
    ...state,
    bindElement,
    ref: elementRef,
    /** CSS变量样式，可直接应用到元素 */
    style: {
      '--pointer-x': state.pointerX,
      '--pointer-y': state.pointerY,
    } as React.CSSProperties,
  }
}
