import { useState, useEffect, useMemo } from 'react';
import {
  createMonochromeMask,
  createMonochromeMaskViaWorker,
  type MonochromeMaskOptions,
  type PipelineHook,
} from '@/lib/canvas';

export type { MonochromeMaskOptions, PipelineHook };

interface IdleDeadlineLike {
  didTimeout: boolean;
  timeRemaining: () => number;
}

type IdleCallbackLike = (deadline: IdleDeadlineLike) => void;

type IdleRequestFn = (callback: IdleCallbackLike, options?: { timeout: number }) => number;
type IdleCancelFn = (handle: number) => void;

type IdleGlobal = typeof globalThis & {
  requestIdleCallback?: IdleRequestFn;
  cancelIdleCallback?: IdleCancelFn;
};

const idleGlobal: IdleGlobal = globalThis;

const requestIdleWork: IdleRequestFn =
  typeof idleGlobal.requestIdleCallback === 'function'
    ? idleGlobal.requestIdleCallback.bind(idleGlobal)
    : ((callback: IdleCallbackLike) => {
        const timeoutHandle = idleGlobal.setTimeout(() => {
          callback({
            didTimeout: false,
            timeRemaining: () => 0,
          });
        }, 16);
        return timeoutHandle as unknown as number;
      });

const cancelIdleWork: IdleCancelFn =
  typeof idleGlobal.cancelIdleCallback === 'function'
    ? idleGlobal.cancelIdleCallback.bind(idleGlobal)
    : ((handle: number) => {
        idleGlobal.clearTimeout(handle);
      });

/**
 * 将图标转换为单色遮罩（用于防伪水印）
 *
 * 使用缓存 + CanvasPool 优化性能：
 * - 相同参数不重复计算
 * - 复用 OffscreenCanvas 实例
 * - 防止并发重复请求
 * - 支持管道 hooks 进行自定义后处理
 *
 * 原理：
 * 1. 加载图标到 canvas
 * 2. 转换为灰度
 * 3. 用亮度值作为 alpha 通道（白色=不透明，黑色=透明）
 * 4. 执行管道 hooks（可选）
 * 5. 返回 data URL
 */
export function useMonochromeMask(iconUrl: string | undefined, options: MonochromeMaskOptions = {}): string | null {
  const { size = 64, invert = false, contrast = 1.5, pipeline, clip, targetBrightness } = options;
  const [maskUrl, setMaskUrl] = useState<string | null>(null);

  // 稳定化 pipeline 引用（避免每次渲染都触发 effect）
  const pipelineKey = useMemo(() => (pipeline ? JSON.stringify(pipeline) : ''), [pipeline]);

  useEffect(() => {
    if (!iconUrl) {
      setMaskUrl(null);
      return;
    }

    let cancelled = false;
    let idleHandle = 0;

    // 解析 pipeline（从稳定化的 key 还原）
    const pipelineData: PipelineHook[] | undefined = pipelineKey ? JSON.parse(pipelineKey) : undefined;

    const opts: MonochromeMaskOptions = { size, invert, contrast };
    if (pipelineData) {
      opts.pipeline = pipelineData;
    }
    if (clip !== undefined) {
      opts.clip = clip;
    }
    if (targetBrightness !== undefined) {
      opts.targetBrightness = targetBrightness;
    }

    idleHandle = requestIdleWork(() => {
      createMonochromeMaskViaWorker(iconUrl, opts)
        .catch(() => createMonochromeMask(iconUrl, opts))
        .then((url) => {
          if (!cancelled) {
            setMaskUrl(url);
          }
        });
    }, { timeout: 300 });

    return () => {
      cancelled = true;
      if (idleHandle !== 0) {
        cancelIdleWork(idleHandle);
      }
    };
  }, [iconUrl, size, invert, contrast, pipelineKey, clip, targetBrightness]);

  return maskUrl;
}
