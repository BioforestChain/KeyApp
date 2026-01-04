/**
 * 开发版水印组件
 *
 * 在开发版本中显示 "DEV" 水印，不影响页面交互
 */

declare const __DEV_MODE__: boolean

export function DevWatermark() {
  // 只在 dev 模式下显示
  if (!__DEV_MODE__) {
    return null
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[99999] select-none overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 100px,
            rgba(255, 0, 0, 0.03) 100px,
            rgba(255, 0, 0, 0.03) 200px
          )`,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="text-[20vw] font-bold tracking-widest opacity-[0.03]"
          style={{
            color: 'red',
            transform: 'rotate(-15deg)',
            whiteSpace: 'nowrap',
          }}
        >
          DEV
        </div>
      </div>
      {/* 角标 */}
      <div
        className="absolute right-0 top-0 origin-center translate-x-[30%] translate-y-[40%] rotate-45 bg-red-500 px-8 py-1 text-xs font-bold text-white shadow-lg"
      >
        DEV
      </div>
    </div>
  )
}
