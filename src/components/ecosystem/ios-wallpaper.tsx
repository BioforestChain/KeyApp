import { useMemo, useState, useEffect } from 'react';
import { useStore } from '@tanstack/react-store';
import { preferencesStore } from '@/stores/preferences';
import { cn } from '@/lib/utils';

type WallpaperVariant = 'color-dodge' | 'hard-light' | 'rainbow' | 'vivid';

const darkWallpapers: WallpaperVariant[] = ['color-dodge', 'hard-light'];
const lightWallpapers: WallpaperVariant[] = ['rainbow', 'vivid'];

const ANIMATION_DURATION = 10_000; // 动画持续 10 秒

function resolveIsDark(theme: 'light' | 'dark' | 'system'): boolean {
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getMsUntilNextHour(): number {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(now.getHours() + 1, 0, 0, 0);
  return nextHour.getTime() - now.getTime();
}

export interface IOSWallpaperProps {
  className?: string;
  children?: React.ReactNode;
}

export function IOSWallpaper({ className, children }: IOSWallpaperProps) {
  const theme = useStore(preferencesStore, (s) => s.theme);
  const isDark = resolveIsDark(theme);
  const [isAnimating, setIsAnimating] = useState(false);

  // 每次组件挂载时随机选择（dark/light 各一个）
  const selectedWallpapers = useMemo(() => ({
    dark: pickRandom(darkWallpapers),
    light: pickRandom(lightWallpapers),
  }), []);

  const variant = isDark ? selectedWallpapers.dark : selectedWallpapers.light;

  // 整点报时动画
  useEffect(() => {
    let animationTimer: ReturnType<typeof setTimeout>;
    let hourlyTimer: ReturnType<typeof setTimeout>;

    const triggerAnimation = () => {
      setIsAnimating(true);
      animationTimer = setTimeout(() => setIsAnimating(false), ANIMATION_DURATION);
    };

    const scheduleNextHour = () => {
      const msUntilNextHour = getMsUntilNextHour();
      hourlyTimer = setTimeout(() => {
        triggerAnimation();
        // 每小时重新调度
        scheduleNextHour();
      }, msUntilNextHour);
    };

    scheduleNextHour();

    return () => {
      clearTimeout(animationTimer);
      clearTimeout(hourlyTimer);
    };
  }, []);

  return (
    <div className={cn(
      'ios-wallpaper relative h-full w-full',
      `ios-wallpaper--${variant}`,
      isAnimating && 'ios-wallpaper--animating',
      className
    )}>
      {/* Hard Light 需要额外的层 */}
      {variant === 'hard-light' && (
        <>
          <div className="ios-wallpaper__stars" />
          <div className="ios-wallpaper__glow" />
          <div className="ios-wallpaper__highlight" />
        </>
      )}
      {children}
    </div>
  );
}
