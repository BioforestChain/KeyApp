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

  // ============ 基于角度的光影算法 ============
  
  // 1. 卡片倾斜角度 (度)
  const maxTilt = 15; // 最大倾斜角度
  const tiltX = isActive ? pointerY * -maxTilt : 0; // 绕X轴旋转 (前后倾斜)
  const tiltY = isActive ? pointerX * maxTilt : 0;  // 绕Y轴旋转 (左右倾斜)
  
  // 2. 转换为弧度进行物理计算
  const tiltXRad = (tiltX * Math.PI) / 180;
  const tiltYRad = (tiltY * Math.PI) / 180;
  
  // 3. 总倾斜角度 (用于强度计算)
  const totalTiltRad = Math.sqrt(tiltXRad * tiltXRad + tiltYRad * tiltYRad);
  const totalTiltDeg = (totalTiltRad * 180) / Math.PI;
  
  // 4. 倾斜方向角 (用于光带旋转，0° = 右，90° = 上)
  const tiltDirection = Math.atan2(-tiltX, tiltY) * (180 / Math.PI);
  
  // 5. 计算光线反射点位置 (假设光源从右上方照射) (基于入射角=反射角)
  // 当卡片倾斜时，高光点会向倾斜的反方向移动
  const reflectX = -Math.sin(tiltYRad) * 50; // 高光X偏移 (%)
  const reflectY = -Math.sin(tiltXRad) * 50; // 高光Y偏移 (%)
  
  // 7. 菲涅尔效应：倾斜角度越大，边缘反射越强
  // F = F0 + (1-F0) * (1-cos(θ))^5 简化版
  const fresnelIntensity = Math.min(1, Math.pow(Math.sin(totalTiltRad), 2) * 3);
  
  // 8. 全息色带位移 - 基于倾斜角度和方向
  // 模拟光栅衍射：不同角度显示不同颜色
  const holoShift = totalTiltDeg * 2; // 色带位移量
  const holoTranslateX = Math.sin(tiltYRad) * -30; // 视差位移 X
  const holoTranslateY = Math.sin(tiltXRad) * -30; // 视差位移 Y
  
  // 9. 各层透明度 - 基于物理角度
  const patternOpacity = isActive ? 0.08 + fresnelIntensity * 0.15 : 0.03;
  const watermarkOpacity = isActive ? 0.15 + fresnelIntensity * 0.7 : 0;
  const glareOpacity = fresnelIntensity * 0.8;
  
  // 兼容旧变量名
  const rotateX = tiltX;
  const rotateY = tiltY;

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
      <div
        ref={cardRef}
        className="wallet-card relative h-full w-full transform-gpu touch-none overflow-hidden rounded-2xl select-none"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: 'preserve-3d',
          transition: isActive ? 'none' : 'transform 0.4s ease-out',
          isolation: 'isolate',
          willChange: 'transform', // 优化 3D 变换性能
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
            opacity: patternOpacity,
          }}
        >
          <div
            className="absolute"
            style={{
              inset: '-50%',
              width: '200%',
              height: '200%',
              // 彩虹色带随倾斜方向旋转，模拟光栅衍射
              background: `linear-gradient(
                ${tiltDirection + 90}deg,
                rgba(255, 0, 0, 0.6) ${10 + holoShift}%,
                rgba(255, 165, 0, 0.6) ${20 + holoShift}%,
                rgba(255, 255, 0, 0.6) ${30 + holoShift}%,
                rgba(0, 255, 0, 0.6) ${40 + holoShift}%,
                rgba(0, 255, 255, 0.6) ${50 + holoShift}%,
                rgba(0, 0, 255, 0.6) ${60 + holoShift}%,
                rgba(128, 0, 255, 0.6) ${70 + holoShift}%,
                transparent ${85 + holoShift}%
              )`,
              filter: 'blur(15px)',
              transform: `translate(${holoTranslateX}%, ${holoTranslateY}%)`,
              willChange: 'transform',
            }}
          />
        </div>

        {/* 3. 防伪层2：Logo水印 (Watermark) - 默认隐藏，动起来才显示 */}
        {logoMaskStyle && (
          <div
            className="absolute inset-0 overflow-hidden rounded-2xl"
            style={{
              ...logoMaskStyle,
              mixBlendMode: 'overlay',
              opacity: watermarkOpacity,
            }}
          >
            <div
              className="absolute"
              style={{
                inset: '-50%',
                width: '200%',
                height: '200%',
                background: GOLD_GRADIENT,
                transform: `translate(${holoTranslateX}%, ${holoTranslateY}%)`,
                willChange: 'transform',
              }}
            />
          </div>
        )}

        {/* 4. 表面高光 (Glare) - 基于物理反射 */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background: `radial-gradient(
                ellipse 80% 60% at calc(50% + ${reflectX}%) calc(50% + ${reflectY}%),
                rgba(255,255,255,0.4) 0%,
                rgba(255,255,255,0.1) 30%,
                transparent 60%
              )`,
            mixBlendMode: 'overlay',
            opacity: glareOpacity,
            transition: 'opacity 0.2s',
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
