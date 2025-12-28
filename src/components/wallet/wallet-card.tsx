import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';

// 注册 CSS 自定义属性，使其可动画
// 只需注册一次，放在模块顶层
if (typeof window !== 'undefined' && 'registerProperty' in CSS) {
  const propsToRegister = [
    { name: '--tilt-x', syntax: '<number>', initialValue: '0' },
    { name: '--tilt-y', syntax: '<number>', initialValue: '0' },
    { name: '--tilt-nx', syntax: '<number>', initialValue: '0' },
    { name: '--tilt-ny', syntax: '<number>', initialValue: '0' },
    { name: '--tilt-intensity', syntax: '<number>', initialValue: '0' },
    { name: '--tilt-direction', syntax: '<number>', initialValue: '0' },
  ];

  for (const prop of propsToRegister) {
    try {
      CSS.registerProperty({ ...prop, inherits: true });
    } catch {
      // 已注册则忽略
    }
  }
}
import { cn } from '@/lib/utils';
import { useCardInteraction } from '@/hooks/useCardInteraction';
import { useMonochromeMask } from '@/hooks/useMonochromeMask';
import { ChainIcon } from './chain-icon';
import { AddressDisplay } from './address-display';
import { HologramCanvas, type Priority } from './refraction';
import type { Wallet, ChainType } from '@/stores';
import {
  IconCopy as Copy,
  IconCheck as Check,
  IconSettings as Settings,
  IconChevronDown as ChevronDown,
} from '@tabler/icons-react';

export interface WalletCardProps {
  wallet: Wallet;
  chain: ChainType;
  chainName: string;
  /** 渲染优先级，影响帧率和分辨率 */
  priority?: Priority;
  address?: string | undefined;
  /** 链图标 URL，用于防伪水印 */
  chainIconUrl?: string | undefined;
  /** 防伪水印 logo 平铺尺寸（含间距），默认 40px */
  watermarkLogoSize?: number | undefined;
  /** 防伪水印 logo 实际尺寸，默认 24px（与 watermarkLogoSize 差值为间距） */
  watermarkLogoActualSize?: number | undefined;
  onCopyAddress?: (() => void) | undefined;
  onOpenChainSelector?: (() => void) | undefined;
  onOpenSettings?: (() => void) | undefined;
  className?: string | undefined;
  themeHue?: number | undefined;
  /**
   * 禁用“水印 Refraction”层（Android 部分机型/浏览器组合会出现页面闪动）。
   * 默认：在 Android 浏览器上自动禁用，其它平台启用。
   */
  disableWatermarkRefraction?: boolean | undefined;
  /**
   * 禁用“三角纹理 Refraction”层。
   * 默认：在 Android 浏览器上自动禁用，其它平台启用。
   *
   * 说明：用户反馈 Pattern 在 Android 表现正常时，可以将该值显式设为 false 以保留效果。
   */
  disablePatternRefraction?: boolean | undefined;
  /**
   * 是否启用陀螺仪倾斜（deviceorientation）。
   * 默认：在 Android 上关闭（降低高频重绘导致的闪动/掉帧风险）。
   */
  enableGyro?: boolean | undefined;
}

export const WalletCard = forwardRef<HTMLDivElement, WalletCardProps>(function WalletCard(
  {
    wallet,
    chain,
    chainName,
    priority = 'high',
    address,
    chainIconUrl,
    watermarkLogoSize = 48,
    watermarkLogoActualSize = 24,
    onCopyAddress,
    onOpenChainSelector,
    onOpenSettings,
    className,
    themeHue = 323,
    disableWatermarkRefraction,
    disablePatternRefraction,
    enableGyro,
  },
  ref,
) {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  }, []);

  const disableWatermarkRefractionEffective = disableWatermarkRefraction ?? prefersReducedMotion;
  const disablePatternRefractionEffective = disablePatternRefraction ?? prefersReducedMotion;
  const enableGyroEffective = enableGyro ?? !prefersReducedMotion;

  const refractionMode = prefersReducedMotion ? ('static' as const) : ('dynamic' as const);

  // 将链图标转为单色遮罩（黑白 -> 透明）
  // 使用 devicePixelRatio 确保高清
  const dpr = typeof window !== 'undefined' ? Math.min(3, window.devicePixelRatio || 1) : 1;
  const monoMaskUrl = useMonochromeMask(chainIconUrl, {
    size: Math.round(watermarkLogoActualSize * dpr),
    invert: false, // 白色区域不透明
    contrast: 1.8,
  });

  const { pointerX, pointerY, isActive, bindElement } = useCardInteraction({
    // 提高重力感应对光影的影响（之前偏弱，手机端不明显）
    gyroStrength: 0.35,
    touchStrength: 0.8,
    enableGyro: enableGyroEffective,
  });

  useEffect(() => {
    bindElement(cardRef.current);
  }, [bindElement]);

  const handleCopy = useCallback(() => {
    onCopyAddress?.();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [onCopyAddress]);

  // ============ 基于角度的光影算法 (GPU动画同步) ============

  // 1. 卡片倾斜角度 (度) - 作为 CSS 变量传递，让 GPU 处理过渡
  const maxTilt = 15;
  const tiltX = isActive ? pointerY * -maxTilt : 0;
  const tiltY = isActive ? pointerX * maxTilt : 0;

  // 2. 归一化倾斜值 (-1 到 1) - 用于 CSS calc()
  const normalizedTiltX = tiltX / maxTilt; // -1 to 1
  const normalizedTiltY = tiltY / maxTilt; // -1 to 1

  // 3. 倾斜强度 (0 到 1) - 用于透明度等
  const tiltIntensity = isActive
    ? Math.min(1, Math.sqrt(normalizedTiltX * normalizedTiltX + normalizedTiltY * normalizedTiltY))
    : 0;

  // 4. 倾斜方向角 (度) - 用于彩虹旋转
  const tiltDirection = Math.atan2(-normalizedTiltX, normalizedTiltY) * (180 / Math.PI);

  // CSS 变量 - 所有光影效果都通过这些变量驱动
  // 过渡动画在 CSS 层面统一处理
  const cssVars = {
    '--tilt-x': tiltX, // 倾斜角度 X (度)
    '--tilt-y': tiltY, // 倾斜角度 Y (度)
    '--tilt-nx': normalizedTiltX, // 归一化 X (-1~1)
    '--tilt-ny': normalizedTiltY, // 归一化 Y (-1~1)
    '--tilt-intensity': tiltIntensity, // 强度 (0~1)
    '--tilt-direction': tiltDirection, // 方向角 (度)
  } as React.CSSProperties;

  // 动画配置 - 统一用于 transform 和光影
  const transitionConfig = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'; // ease-out-back 回弹效果

  return (
    <div ref={ref} className={cn('wallet-card-container h-full w-full', className)} style={{ perspective: '1000px' }}>
      {/* 卡片主体 - CSS 变量驱动所有动画 */}
      <div
        ref={cardRef}
        className="wallet-card relative h-full w-full transform-gpu touch-none overflow-hidden rounded-2xl select-none"
        style={{
          ...cssVars,
          // 3D 旋转 - 使用 CSS 变量
          transform: `rotateX(calc(var(--tilt-x) * 1deg)) rotateY(calc(var(--tilt-y) * 1deg))`,
          transformStyle: 'preserve-3d',
          // 统一过渡配置 - 激活时即时响应，松手时回弹
          transition: isActive ? 'none' : transitionConfig,
          isolation: 'isolate',
          willChange: 'transform, --tilt-x, --tilt-y, --tilt-intensity',
        }}
      >
        {/* 1~4. 背景 + Pattern/Watermark + Spotlight 全部由 Canvas 完成（不依赖 DOM mix-blend-mode） */}
        <HologramCanvas
          priority={priority}
          enabledPattern={!disablePatternRefractionEffective}
          enabledWatermark={!disableWatermarkRefractionEffective && Boolean(monoMaskUrl)}
          mode={refractionMode}
          pointerX={pointerX}
          pointerY={pointerY}
          active={isActive}
          themeHue={themeHue}
          watermarkMaskUrl={monoMaskUrl}
          watermarkCellSize={watermarkLogoSize}
          watermarkIconSize={watermarkLogoActualSize}
        />

        {/* 5. 边框装饰 */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        />

        {/* 卡片内容 */}
        <div className="relative z-10 flex h-full flex-col justify-between p-4">
          {/* 顶部：链选择器 + 设置 */}
          <div className="flex items-center justify-between">
            <button
              onClick={onOpenChainSelector}
              className="flex items-center gap-1.5 rounded-full bg-black/20 px-2.5 py-1 text-xs text-white backdrop-blur-sm transition-colors hover:bg-black/30"
            >
              <ChainIcon chainId={chain} size="sm" />
              <span className="font-medium">{chainName}</span>
              <ChevronDown className="size-3 opacity-70" />
            </button>

            <button
              onClick={onOpenSettings}
              className="rounded-full bg-black/10 p-1.5 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/20 hover:text-white"
            >
              <Settings className="size-4" />
            </button>
          </div>

          {/* 中部：钱包名称 */}
          <div className="flex flex-1 items-center justify-center">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">{wallet.name}</h2>
          </div>

          {/* 底部：地址 */}
          <div className="flex items-center gap-2">
            <AddressDisplay
              address={address ?? ''}
              copyable={false}
              className="min-w-0 flex-1 text-white/80 drop-shadow"
            />
            <button
              onClick={handleCopy}
              className="shrink-0 rounded-full bg-black/10 p-1.5 text-white/80 backdrop-blur-sm transition-all hover:bg-black/20 hover:text-white"
            >
              {copied ? <Check className="size-4 text-green-300" /> : <Copy className="size-4" />}
            </button>
          </div>
        </div>

        {/* 外层阴影 */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            boxShadow: `
                inset 0 1px 1px rgba(255,255,255,0.3),
                inset 0 -1px 1px rgba(0,0,0,0.2),
                0 20px 40px -15px rgba(0,0,0,0.4)
              `,
          }}
        />
      </div>
    </div>
  );
});
