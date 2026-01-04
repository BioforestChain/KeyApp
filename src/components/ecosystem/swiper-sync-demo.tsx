/**
 * Swiper 双向绑定 Demo
 * 
 * - Controller: 原理展示（同组件内直接使用 Controller 模块）
 * - ContextMode: 封装展示（跨组件使用 Context + Controller）
 */

import { useState } from 'react';
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
  // Controller 需要 state 来触发重渲染建立连接
  const [mainSwiper, setMainSwiper] = useState<SwiperType | null>(null);
  const [indicatorSwiper, setIndicatorSwiper] = useState<SwiperType | null>(null);
  
  // 用于 UI 显示的进度（不参与同步逻辑）
  const [displayProgress, setDisplayProgress] = useState(0);

  return (
    <div className="flex flex-col gap-8 p-4">
      <h2 className="text-lg font-bold">方案一：Controller 模块（官方推荐）</h2>
      
      {/* 调试信息 */}
      <div className="bg-muted rounded-lg p-4 font-mono text-sm">
        <div>Progress: {displayProgress.toFixed(3)}</div>
        <div>Active Index: {Math.round(displayProgress * (PAGES.length - 1))}</div>
      </div>

      {/* 主 Swiper */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted px-4 py-2 text-sm font-medium">主 Swiper</div>
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
              className="!flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5"
            >
              <span className="text-2xl font-bold">{page}</span>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* 指示器 Swiper */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted px-4 py-2 text-sm font-medium">指示器 Swiper</div>
        <div className="flex justify-center py-4">
          <Swiper
            className="!w-24 !h-8"
            modules={[Controller]}
            controller={{ control: mainSwiper ?? undefined }}
            onSwiper={setIndicatorSwiper}
            slidesPerView={1}
            resistance={true}
            resistanceRatio={0.5}
          >
            {PAGES.map((page, index) => (
              <SwiperSlide key={page} className="!flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-xs text-primary-foreground font-bold">{index + 1}</span>
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
            className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80"
          >
            Go to {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * 方案三：Context 封装模式（使用 Controller 模块）
 */
import { 
  SwiperSyncProvider, 
  useSwiperMember,
} from '@/components/common/swiper-sync-context';

/** 主 Swiper 组件 */
function MainSwiperWithContext() {
  // 自己是 'main'，要控制 'indicator'
  const { onSwiper, controlledSwiper } = useSwiperMember('main', 'indicator');
  const [progress, setProgress] = useState(0);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted px-4 py-2 text-sm font-medium">
        主 Swiper（独立组件）
      </div>
      <Swiper
        className="h-48"
        modules={[Controller]}
        controller={{ control: controlledSwiper }}
        onSwiper={onSwiper}
        onProgress={(_, p) => setProgress(p)}
      >
        {PAGES.map((page) => (
          <SwiperSlide 
            key={page}
            className="!flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5"
          >
            <span className="text-2xl font-bold">{page}</span>
          </SwiperSlide>
        ))}
      </Swiper>
      
      {/* 调试信息 */}
      <div className="px-4 py-2 border-t bg-muted/50 font-mono text-xs">
        Progress: {progress.toFixed(3)} | Index: {Math.round(progress * (PAGES.length - 1))}
      </div>
    </div>
  );
}

/** 指示器 Swiper 组件 */
function IndicatorSwiperWithContext() {
  // 自己是 'indicator'，要控制 'main'
  const { onSwiper, controlledSwiper } = useSwiperMember('indicator', 'main');
  const [progress, setProgress] = useState(0);
  const maxIndex = PAGES.length - 1;

  // 计算图标透明度
  const getOpacity = (index: number) => {
    const currentIndex = progress * maxIndex;
    const distance = Math.abs(currentIndex - index);
    return Math.max(0.3, 1 - distance);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted px-4 py-2 text-sm font-medium">
        指示器 Swiper（独立组件）
      </div>
      <div className="flex flex-col items-center gap-2 py-4">
        <Swiper
          className="!w-24 !h-8"
          modules={[Controller]}
          controller={{ control: controlledSwiper }}
          onSwiper={onSwiper}
          onProgress={(_, p) => setProgress(p)}
          slidesPerView={1}
          resistance={true}
          resistanceRatio={0.5}
        >
          {PAGES.map((page, index) => (
            <SwiperSlide key={page} className="!flex items-center justify-center">
              <div 
                className="w-6 h-6 rounded-full bg-primary flex items-center justify-center transition-opacity duration-75"
                style={{ opacity: getOpacity(index) }}
              >
                <span className="text-xs text-primary-foreground font-bold">{index + 1}</span>
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
                  "size-1.5 rounded-full transition-all duration-200",
                  isActive ? "bg-primary scale-125" : "bg-muted-foreground/40"
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
  return (
    <SwiperSyncProvider>
      <div className="flex flex-col gap-8 p-4">
        <h2 className="text-lg font-bold">方案三：Context 封装模式</h2>
        <p className="text-muted-foreground text-sm">
          使用 SwiperSyncProvider + useSwiperMember + Controller 模块实现跨组件同步
        </p>
        
        <MainSwiperWithContext />
        <IndicatorSwiperWithContext />
      </div>
    </SwiperSyncProvider>
  );
}

export default SwiperSyncDemo;
