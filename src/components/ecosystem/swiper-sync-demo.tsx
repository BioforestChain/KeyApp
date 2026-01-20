/**
 * Swiper 双向绑定 Demo
 *
 * - Controller: 原理展示（同组件内直接使用 Controller 模块）
 * - ContextMode: 封装展示（跨组件使用 Context + Controller）
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Controller } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { cn } from '@/lib/utils';
import 'swiper/css';

/** 页面配置 */
const PAGES = ['Page 1', 'Page 2', 'Page 3'];

/**
 * 方案一：Swiper Controller 模块（官方推荐）
 */
export function SwiperSyncDemo() {
  const { t } = useTranslation('ecosystem');
  // Controller 需要 state 来触发重渲染建立连接
  const [mainSwiper, setMainSwiper] = useState<SwiperType | null>(null);
  const [indicatorSwiper, setIndicatorSwiper] = useState<SwiperType | null>(null);

  // 用于 UI 显示的进度（不参与同步逻辑）
  const [displayProgress, setDisplayProgress] = useState(0);

  return (
    <div className="flex flex-col gap-8 p-4">
      <h2 className="text-lg font-bold">{t('demo.swiper.method1')}</h2>

      {/* 调试信息 */}
      <div className="bg-muted rounded-lg p-4 font-mono text-sm">
        <div>{t('demo.swiper.debugProgress', { value: displayProgress.toFixed(3) })}</div>
        <div>{t('demo.swiper.debugActiveIndex', { value: Math.round(displayProgress * (PAGES.length - 1)) })}</div>
      </div>

      {/* 主 Swiper */}
      <div className="overflow-hidden rounded-lg border">
        <div className="bg-muted px-4 py-2 text-sm font-medium">{t('demo.swiper.main')}</div>
        <Swiper
          className="h-48"
          modules={[Controller]}
          controller={{ control: indicatorSwiper ?? undefined }}
          onSwiper={setMainSwiper}
          onProgress={(_, p) => setDisplayProgress(p)}
        >
          {PAGES.map((page) => (
            <SwiperSlide
              key={page}
              className="from-primary/20 to-primary/5 !flex items-center justify-center bg-gradient-to-br"
            >
              <span className="text-2xl font-bold">{page}</span>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* 指示器 Swiper */}
      <div className="overflow-hidden rounded-lg border">
        <div className="bg-muted px-4 py-2 text-sm font-medium">{t('demo.swiper.indicator')}</div>
        <div className="flex justify-center py-4">
          <Swiper
            className="!h-8 !w-24"
            modules={[Controller]}
            controller={{ control: mainSwiper ?? undefined }}
            onSwiper={setIndicatorSwiper}
            slidesPerView={1}
            resistance={true}
            resistanceRatio={0.5}
          >
            {PAGES.map((page, index) => (
              <SwiperSlide key={page} className="!flex items-center justify-center">
                <div className="bg-primary flex h-6 w-6 items-center justify-center rounded-full">
                  <span className="text-primary-foreground text-xs font-bold">{index + 1}</span>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* 手动控制 */}
      <div className="flex gap-2">
        {PAGES.map((_, index) => (
          <button
            key={index}
            onClick={() => mainSwiper?.slideTo(index)}
            className="bg-muted hover:bg-muted/80 rounded-lg px-4 py-2"
          >
            {t('demo.swiper.goTo', { index: index + 1 })}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * 方案三：Context 封装模式（使用 Controller 模块）
 */
import { SwiperSyncProvider, useSwiperMember } from '@/components/common/swiper-sync-context';

/** 主 Swiper 组件 */
function MainSwiperWithContext() {
  const { t } = useTranslation('ecosystem');
  const [progress, setProgress] = useState(0);
  const { onSwiper, onSlideChange } = useSwiperMember('main', 'indicator', {
    initialIndex: 0,
  });

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="bg-muted px-4 py-2 text-sm font-medium">{t('demo.swiper.mainIndependent')}</div>
      <Swiper
        className="h-48"
        modules={[Controller]}
        onSwiper={onSwiper}
        onSlideChange={onSlideChange}
        onProgress={(_, p) => setProgress(p)}
      >
        {PAGES.map((page) => (
          <SwiperSlide
            key={page}
            className="from-primary/20 to-primary/5 !flex items-center justify-center bg-gradient-to-br"
          >
            <span className="text-2xl font-bold">{page}</span>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 调试信息 */}
      <div className="bg-muted/50 border-t px-4 py-2 font-mono text-xs">
        {t('demo.swiper.debugCombined', {
          progress: progress.toFixed(3),
          index: Math.round(progress * (PAGES.length - 1)),
        })}
      </div>
    </div>
  );
}

/** 指示器 Swiper 组件 */
function IndicatorSwiperWithContext() {
  const { t } = useTranslation('ecosystem');
  const [progress, setProgress] = useState(0);
  const maxIndex = PAGES.length - 1;
  const { onSwiper, onSlideChange } = useSwiperMember('indicator', 'main', {
    initialIndex: 0,
  });

  const getOpacity = (index: number) => {
    const currentIndex = progress * maxIndex;
    const distance = Math.abs(currentIndex - index);
    return Math.max(0.3, 1 - distance);
  };

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="bg-muted px-4 py-2 text-sm font-medium">{t('demo.swiper.indicatorIndependent')}</div>
      <div className="flex flex-col items-center gap-2 py-4">
        <Swiper
          className="!h-8 !w-24"
          modules={[Controller]}
          onSwiper={onSwiper}
          onSlideChange={onSlideChange}
          onProgress={(_, p) => setProgress(p)}
          slidesPerView={1}
          resistance={true}
          resistanceRatio={0.5}
        >
          {PAGES.map((page, index) => (
            <SwiperSlide key={page} className="!flex items-center justify-center">
              <div
                className="bg-primary flex h-6 w-6 items-center justify-center rounded-full transition-opacity duration-75"
                style={{ opacity: getOpacity(index) }}
              >
                <span className="text-primary-foreground text-xs font-bold">{index + 1}</span>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* 分页点 */}
        <div className="flex items-center gap-1">
          {PAGES.map((_, index) => {
            const isActive = Math.round(progress * maxIndex) === index;
            return (
              <span
                key={index}
                className={cn(
                  'size-1.5 rounded-full transition-all duration-200',
                  isActive ? 'bg-primary scale-125' : 'bg-muted-foreground/40',
                )}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** 方案三：Context 封装 Demo */
export function SwiperSyncDemoContext() {
  const { t } = useTranslation('ecosystem');
  return (
    <SwiperSyncProvider>
      <div className="flex flex-col gap-8 p-4">
        <h2 className="text-lg font-bold">{t('demo.swiper.method3')}</h2>
        <p className="text-muted-foreground text-sm">{t('demo.swiper.method3Desc')}</p>

        <MainSwiperWithContext />
        <IndicatorSwiperWithContext />
      </div>
    </SwiperSyncProvider>
  );
}

export default SwiperSyncDemo;
