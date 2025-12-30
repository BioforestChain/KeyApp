/**
 * MiniappCapsule - 小程序胶囊按钮
 *
 * 悬浮在小程序窗口右上角的胶囊形按钮组
 * 包含：多功能按钮（动态图标）+ 关闭按钮
 */

import { forwardRef } from 'react'
import { IconDots, IconPointFilled } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import styles from './miniapp-capsule.module.css'

export interface MiniappCapsuleProps {
  /** 多功能按钮的自定义图标 */
  actionIcon?: React.ReactNode
  /** 多功能按钮点击回调 */
  onAction?: () => void
  /** 关闭按钮点击回调 */
  onClose?: () => void
  /** 是否显示 */
  visible?: boolean
  /** 自定义类名 */
  className?: string
}

export const MiniappCapsule = forwardRef<HTMLDivElement, MiniappCapsuleProps>(
  function MiniappCapsule(
    {
      actionIcon,
      onAction,
      onClose,
      visible = true,
      className,
    },
    ref
  ) {
    if (!visible) return null

    return (
      <div
        ref={ref}
        className={cn(styles.capsule, className)}
        data-testid="miniapp-capsule"
      >
        {/* 多功能按钮 */}
        <button
          type="button"
          onClick={onAction}
          className={styles.button}
          aria-label="更多操作"
        >
          {actionIcon ?? <IconDots className={styles.icon} stroke={1.5} />}
        </button>

        {/* 分隔线 */}
        <div className={styles.divider} />

        {/* 关闭按钮 - 使用 IconPointFilled 模拟国内小程序的关闭图标 */}
        <button
          type="button"
          onClick={onClose}
          className={styles.button}
          aria-label="关闭应用"
        >
          <div className={styles.closeIcon}>
            <IconPointFilled className={styles.closeIconInner} />
          </div>
        </button>
      </div>
    )
  }
)

export default MiniappCapsule
