/**
 * Swiper 同步 Context
 * 
 * 简单存储 Swiper 实例，让组件使用 Controller 模块自动同步
 */

import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
  type MutableRefObject,
} from 'react';
import type { Swiper as SwiperType } from 'swiper';

/** Swiper 同步 Context 值 */
interface SwiperSyncContextValue {
  /** Swiper 实例注册表 */
  swipersRef: MutableRefObject<Map<string, SwiperType>>;
  /** 监听器注册表 */
  listenersRef: MutableRefObject<Set<() => void>>;
  /** 注册 Swiper */
  register: (id: string, swiper: SwiperType) => void;
  /** 注销 Swiper */
  unregister: (id: string) => void;
  /** 订阅变更 */
  subscribe: (listener: () => void) => () => void;
}

const SwiperSyncContext = createContext<SwiperSyncContextValue | null>(null);

interface SwiperSyncProviderProps {
  children: ReactNode;
}

/**
 * Swiper 同步 Provider
 */
export function SwiperSyncProvider({ children }: SwiperSyncProviderProps) {
  const swipersRef = useRef<Map<string, SwiperType>>(new Map());
  const listenersRef = useRef<Set<() => void>>(new Set());

  const notify = useCallback(() => {
    listenersRef.current.forEach(listener => listener());
  }, []);

  const register = useCallback((id: string, swiper: SwiperType) => {
    swipersRef.current.set(id, swiper);
    notify();
  }, [notify]);

  const unregister = useCallback((id: string) => {
    swipersRef.current.delete(id);
    notify();
  }, [notify]);

  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);
    return () => listenersRef.current.delete(listener);
  }, []);

  return (
    <SwiperSyncContext.Provider value={{ swipersRef, listenersRef, register, unregister, subscribe }}>
      {children}
    </SwiperSyncContext.Provider>
  );
}

/**
 * 注册 Swiper 并获取要控制的其他 Swiper
 * 
 * 用法：
 * ```tsx
 * const { onSwiper, controlledSwiper } = useSwiperMember('main', 'indicator');
 * 
 * <Swiper
 *   modules={[Controller]}
 *   controller={{ control: controlledSwiper }}
 *   onSwiper={onSwiper}
 * >
 * ```
 */
export function useSwiperMember(selfId: string, targetId: string) {
  const ctx = useContext(SwiperSyncContext);
  if (!ctx) {
    throw new Error('useSwiperMember must be used within SwiperSyncProvider');
  }

  const [controlledSwiper, setControlledSwiper] = useState<SwiperType | undefined>(() => {
    const target = ctx.swipersRef.current.get(targetId);
    return target && !target.destroyed ? target : undefined;
  });

  const onSwiper = useCallback((swiper: SwiperType) => {
    ctx.register(selfId, swiper);
  }, [ctx, selfId]);

  // 订阅变更，当目标 Swiper 注册时更新
  useEffect(() => {
    const updateTarget = () => {
      const target = ctx.swipersRef.current.get(targetId);
      const validTarget = target && !target.destroyed ? target : undefined;
      setControlledSwiper(prev => prev !== validTarget ? validTarget : prev);
    };
    
    // 初始检查
    updateTarget();
    
    // 订阅变更
    return ctx.subscribe(updateTarget);
  }, [ctx, targetId]);

  return {
    onSwiper,
    controlledSwiper,
  };
}

export type { SwiperSyncContextValue };
