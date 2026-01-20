import {
  createContext,
  useContext,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
  type MutableRefObject,
} from 'react';
import type { Swiper as SwiperType } from 'swiper';

interface SwiperMemberState {
  swiper: SwiperType;
  initialIndex: number;
}

interface SwiperSyncContextValue {
  membersRef: MutableRefObject<Map<string, SwiperMemberState>>;
  readyPairsRef: MutableRefObject<Set<string>>;
  register: (id: string, state: SwiperMemberState) => void;
  unregister: (id: string) => void;
  tryConnect: (selfId: string, targetId: string) => void;
  isReady: (selfId: string, targetId: string) => boolean;
}

const SwiperSyncContext = createContext<SwiperSyncContextValue | null>(null);

interface SwiperSyncProviderProps {
  children: ReactNode;
}

const getPairKey = (id1: string, id2: string) => [id1, id2].sort().join(':');

export function SwiperSyncProvider({ children }: SwiperSyncProviderProps) {
  const membersRef = useRef<Map<string, SwiperMemberState>>(new Map());
  const readyPairsRef = useRef<Set<string>>(new Set());

  const register = useCallback((id: string, state: SwiperMemberState) => {
    membersRef.current.set(id, state);
  }, []);

  const unregister = useCallback((id: string) => {
    const state = membersRef.current.get(id);
    if (state?.swiper && !state.swiper.destroyed && state.swiper.controller) {
      state.swiper.controller.control = undefined;
    }
    membersRef.current.delete(id);
    readyPairsRef.current.forEach((key) => {
      if (key.includes(id)) readyPairsRef.current.delete(key);
    });
  }, []);

  const tryConnect = useCallback((selfId: string, targetId: string) => {
    const pairKey = getPairKey(selfId, targetId);
    if (readyPairsRef.current.has(pairKey)) return;

    const self = membersRef.current.get(selfId);
    const target = membersRef.current.get(targetId);

    if (!self || !target) return;
    if (self.swiper.destroyed || target.swiper.destroyed) return;

    // 先标记 ready，再执行操作，这样 slideTo 触发的 onSlideChange 能通过 isReady 检查
    readyPairsRef.current.add(pairKey);

    self.swiper.controller.control = target.swiper;
    target.swiper.controller.control = self.swiper;

    self.swiper.slideTo(self.initialIndex, 0, false);
    target.swiper.slideTo(target.initialIndex, 0, false);
  }, []);

  const isReady = useCallback((selfId: string, targetId: string) => {
    return readyPairsRef.current.has(getPairKey(selfId, targetId));
  }, []);

  return (
    <SwiperSyncContext.Provider value={{ membersRef, readyPairsRef, register, unregister, tryConnect, isReady }}>
      {children}
    </SwiperSyncContext.Provider>
  );
}

interface UseSwiperMemberOptions {
  initialIndex: number;
  onSlideChange?: (swiper: SwiperType) => void;
}

export function useSwiperMember(selfId: string, targetId: string, options: UseSwiperMemberOptions) {
  const ctx = useContext(SwiperSyncContext);
  if (!ctx) {
    throw new Error('useSwiperMember must be used within SwiperSyncProvider');
  }

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;

  const selfIdRef = useRef(selfId);
  selfIdRef.current = selfId;

  const onSwiper = useCallback(
    (swiper: SwiperType) => {
      ctx.register(selfId, {
        swiper,
        initialIndex: optionsRef.current.initialIndex,
      });
      ctx.tryConnect(selfId, targetId);
    },
    [ctx, selfId, targetId],
  );

  const onSlideChange = useCallback(
    (swiper: SwiperType) => {
      if (!ctx.isReady(selfId, targetId)) return;
      optionsRef.current.onSlideChange?.(swiper);
    },
    [ctx, selfId, targetId],
  );

  useEffect(() => {
    return () => ctxRef.current.unregister(selfIdRef.current);
  }, []);

  return { onSwiper, onSlideChange };
}
