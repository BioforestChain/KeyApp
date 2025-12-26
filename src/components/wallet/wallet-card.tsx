import { forwardRef, useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useCardInteraction } from '@/hooks/useCardInteraction';
import { useMonochromeMask } from '@/hooks/useMonochromeMask';
import { ChainIcon } from './chain-icon';
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

function truncateAddress(address: string, startChars = 6, endChars = 4): string {
  if (address.length <= startChars + endChars + 3) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

// 静态样式常量 - 避免每次渲染创建新对象
const TRIANGLE_MASK_SVG = `url("data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 L10 10 L10 0 Z' fill='black'/%3E%3C/svg%3E")`;

const REFRACTION_GRADIENT = `radial-gradient(
  circle at 50% 50%,
  rgba(255, 255, 255, 0) 10%,
  rgba(255, 200, 200, 0.5) 30%,
  rgba(0, 255, 255, 0.6) 50%,
  rgba(255, 0, 255, 0.6) 70%,
  rgba(255, 255, 255, 0) 90%
)`;

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

  // 3D 旋转
  const rotateX = isActive ? pointerY * -12 : 0;
  const rotateY = isActive ? pointerX * 12 : 0;

  // 移动幅度 (hypot) - 离中心越远，防伪效果越明显
  const hypot = Math.min(1, Math.sqrt(pointerX * pointerX + pointerY * pointerY));

  // 全息渐变位移 - 跟随指针反向移动产生视差 (百分比)
  const holoTranslateX = pointerX * -25; // %
  const holoTranslateY = pointerY * -25;

  // 各层透明度 - 参考 DEMO 调整
  const patternOpacity = isActive ? 0.1 + hypot * 0.2 : 0.05; // 三角层：降低强度
  const watermarkOpacity = isActive ? 0.2 + hypot * 0.8 : 0; // Logo层：提高强度

  // 缓存背景渐变样式（只依赖 themeHue）
  const bgGradient = useMemo(
    () => `linear-gradient(135deg,
      hsl(${themeHue} 70% 40%) 0%,
      hsl(${themeHue + 20} 80% 30%) 50%,
      hsl(${themeHue + 40} 70% 20%) 100%)`,
    [themeHue]
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
    [monoMaskUrl, watermarkLogoSize]
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

        {/* 2. 防伪层1：三角纹理 (Pattern) */}
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
              background: REFRACTION_GRADIENT,
              filter: 'blur(20px)',
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

        {/* 4. 表面高光 (Glare) */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background: `radial-gradient(
                circle at calc(50% + ${pointerX * 50}%) calc(50% + ${pointerY * 50}%),
                rgba(255,255,255,0.3) 0%,
                transparent 50%
              )`,
            mixBlendMode: 'overlay',
            opacity: hypot,
            transition: 'opacity 0.3s',
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
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-white/80 drop-shadow">
              {address ? truncateAddress(address) : '---'}
            </span>
            <button
              onClick={handleCopy}
              className="rounded-full bg-black/10 p-1.5 text-white/80 backdrop-blur-sm transition-all hover:bg-black/20 hover:text-white"
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
