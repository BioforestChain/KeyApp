import { forwardRef, useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useCardInteraction } from '@/hooks/useCardInteraction';
import { useMonochromeMask } from '@/hooks/useMonochromeMask';
import { ChainIcon } from './chain-icon';
import { AddressDisplay } from './address-display';
import type { Wallet, ChainType } from '@/stores';
import { IconCopy as Copy, IconCheck as Check, IconSettings as Settings, IconChevronDown as ChevronDown } from '@tabler/icons-react';

export interface WalletCardProps {
  wallet: Wallet;
  chain: ChainType;
  chainName: string;
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
}

// 静态样式常量 - 避免每次渲染创建新对象
const TRIANGLE_MASK_SVG = `url("data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 L10 10 L10 0 Z' fill='black'/%3E%3C/svg%3E")`;



const GOLD_GRADIENT = `linear-gradient(
  135deg,
  transparent 30%,
  rgba(255, 215, 0, 0.6) 50%,
  transparent 70%
)`;

export const WalletCard = forwardRef<HTMLDivElement, WalletCardProps>(function WalletCard(
  {
    wallet,
    chain,
    chainName,
    address,
    chainIconUrl,
    watermarkLogoSize = 40,
    watermarkLogoActualSize = 24,
    onCopyAddress,
    onOpenChainSelector,
    onOpenSettings,
    className,
    themeHue = 323,
  },
  ref,
) {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 将链图标转为单色遮罩（黑白 -> 透明）
  const monoMaskUrl = useMonochromeMask(chainIconUrl, {
    size: watermarkLogoActualSize * 2, // 2x for retina
    invert: false, // 白色区域不透明
    contrast: 1.8,
  });

  const { pointerX, pointerY, isActive, bindElement } = useCardInteraction({
    gyroStrength: 0.15,
    touchStrength: 0.8,
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
  const tiltIntensity = isActive ? Math.min(1, Math.sqrt(normalizedTiltX * normalizedTiltX + normalizedTiltY * normalizedTiltY)) : 0;
  
  // 4. 倾斜方向角 (度) - 用于彩虹旋转
  const tiltDirection = Math.atan2(-normalizedTiltX, normalizedTiltY) * (180 / Math.PI);
  
  // CSS 变量 - 所有光影效果都通过这些变量驱动
  // 过渡动画在 CSS 层面统一处理
  const cssVars = {
    '--tilt-x': tiltX,           // 倾斜角度 X (度)
    '--tilt-y': tiltY,           // 倾斜角度 Y (度)
    '--tilt-nx': normalizedTiltX, // 归一化 X (-1~1)
    '--tilt-ny': normalizedTiltY, // 归一化 Y (-1~1)
    '--tilt-intensity': tiltIntensity, // 强度 (0~1)
    '--tilt-direction': tiltDirection, // 方向角 (度)
  } as React.CSSProperties;
  
  // 动画配置 - 统一用于 transform 和光影
  const transitionConfig = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'; // ease-out-back 回弹效果

  // 缓存背景渐变样式（只依赖 themeHue）
  const bgGradient = useMemo(
    () => `linear-gradient(135deg,
      oklch(0.50 0.20 ${themeHue}) 0%,
      oklch(0.40 0.22 ${themeHue + 20}) 50%,
      oklch(0.30 0.18 ${themeHue + 40}) 100%)`,
    [themeHue],
  );

  // 缓存 Logo mask 样式（只依赖 monoMaskUrl 和 watermarkLogoSize）
  const logoMaskStyle = useMemo(
    () =>
      monoMaskUrl
        ? {
            WebkitMaskImage: `url(${monoMaskUrl})`,
            WebkitMaskSize: `${watermarkLogoSize}px ${watermarkLogoSize}px`,
            WebkitMaskRepeat: 'repeat' as const,
            WebkitMaskPosition: 'center',
            maskImage: `url(${monoMaskUrl})`,
            maskSize: `${watermarkLogoSize}px ${watermarkLogoSize}px`,
            maskRepeat: 'repeat' as const,
            maskPosition: 'center',
          }
        : null,
    [monoMaskUrl, watermarkLogoSize],
  );

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
        {/* 1. 主背景渐变 */}
        <div className="absolute inset-0" style={{ background: bgGradient }} />

        {/* 2. 防伪层1：三角纹理 (Pattern) - 全息衍射效果 */}
        <div
          className="absolute inset-0 overflow-hidden rounded-2xl"
          style={{
            WebkitMaskImage: TRIANGLE_MASK_SVG,
            WebkitMaskSize: '24px 24px',
            WebkitMaskRepeat: 'repeat',
            maskImage: TRIANGLE_MASK_SVG,
            maskSize: '24px 24px',
            maskRepeat: 'repeat',
            mixBlendMode: 'color-dodge',
            // 透明度跟随强度，带过渡
            opacity: `calc(0.05 + var(--tilt-intensity) * 0.2)`,
            transition: isActive ? 'none' : transitionConfig,
          }}
        >
          <div
            className="absolute"
            style={{
              inset: '-50%',
              width: '200%',
              height: '200%',
              // 彩虹色带随倾斜方向旋转
              background: `linear-gradient(
                calc(${tiltDirection + 90}deg),
                rgba(255, 0, 0, 0.6) 10%,
                rgba(255, 165, 0, 0.6) 20%,
                rgba(255, 255, 0, 0.6) 30%,
                rgba(0, 255, 0, 0.6) 40%,
                rgba(0, 255, 255, 0.6) 50%,
                rgba(0, 0, 255, 0.6) 60%,
                rgba(128, 0, 255, 0.6) 70%,
                transparent 85%
              )`,
              filter: 'blur(15px)',
              // 视差位移 - 使用 CSS 变量
              transform: `translate(calc(var(--tilt-ny) * -30%), calc(var(--tilt-nx) * 30%))`,
              transition: isActive ? 'none' : transitionConfig,
              willChange: 'transform',
            }}
          />
        </div>

        {/* 3. 防伪层2：Logo水印 (Watermark) */}
        {logoMaskStyle && (
          <div
            className="absolute inset-0 overflow-hidden rounded-2xl"
            style={{
              ...logoMaskStyle,
              mixBlendMode: 'overlay',
              // 透明度跟随强度
              opacity: `calc(var(--tilt-intensity) * 0.7)`,
              transition: isActive ? 'none' : transitionConfig,
            }}
          >
            <div
              className="absolute"
              style={{
                inset: '-50%',
                width: '200%',
                height: '200%',
                background: GOLD_GRADIENT,
                transform: `translate(calc(var(--tilt-ny) * -30%), calc(var(--tilt-nx) * 30%))`,
                transition: isActive ? 'none' : transitionConfig,
                willChange: 'transform',
              }}
            />
          </div>
        )}

        {/* 4. 表面高光 (Glare) - 基于物理反射 */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            // 高光位置跟随倾斜反方向
            background: `radial-gradient(
                ellipse 80% 60% at calc(50% + var(--tilt-ny) * -50%) calc(50% + var(--tilt-nx) * 50%),
                rgba(255,255,255,0.4) 0%,
                rgba(255,255,255,0.1) 30%,
                transparent 60%
              )`,
            mixBlendMode: 'overlay',
            opacity: `calc(var(--tilt-intensity) * 0.6)`,
            transition: isActive ? 'none' : transitionConfig,
          }}
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
