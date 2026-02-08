interface PipelineHook {
  code: string;
  args?: unknown;
}

interface MonochromeMaskOptions {
  size?: number;
  invert?: boolean;
  contrast?: number;
  pipeline?: PipelineHook[];
  clip?: boolean;
  targetBrightness?: number;
}

interface CreateMaskRequest {
  type: 'create-mask';
  id: number;
  iconUrl: string;
  options: MonochromeMaskOptions;
}

interface CreateMaskResponse {
  type: 'create-mask-result';
  id: number;
  dataUrl: string | null;
  error?: string;
}

type Ctx2D = OffscreenCanvasRenderingContext2D;
type HookExecutor = (ctx: Ctx2D, imageData: ImageData, size: number, args: unknown) => void;

// Worker 环境下的 btoa 兼容（Safari WebWorker 某些环境可能缺失）
declare const btoa: ((data: string) => string) | undefined;

const normalizeHookCode = (code: string): string => code.replace(/\s+/g, ' ').trim();

function getNumberArg(args: unknown, key: string, fallback: number): number {
  if (typeof args !== 'object' || args === null) {
    return fallback;
  }

  const value = Reflect.get(args, key);
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function runRainbowGradientHook(ctx: Ctx2D, imageData: ImageData, size: number, args: unknown): void {
  const data = imageData.data;
  const centerX = size / 2;
  const centerY = size / 2;
  const opacity = getNumberArg(args, 'opacity', 1);

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3]!;
    if (alpha < 10) continue;

    const pixelX = (index / 4) % size;
    const pixelY = Math.floor(index / 4 / size);

    const angle = (Math.atan2(pixelX - centerX, centerY - pixelY) * 180) / Math.PI + 180;
    const hue = (angle % 360) / 60;
    const hueBand = Math.floor(hue) % 6;
    const fraction = hue - Math.floor(hue);

    let red = 255;
    let green = 0;
    let blue = 0;

    switch (hueBand) {
      case 0:
        red = 255;
        green = Math.round(fraction * 255);
        blue = 0;
        break;
      case 1:
        red = Math.round((1 - fraction) * 255);
        green = 255;
        blue = 0;
        break;
      case 2:
        red = 0;
        green = 255;
        blue = Math.round(fraction * 255);
        break;
      case 3:
        red = 0;
        green = Math.round((1 - fraction) * 255);
        blue = 255;
        break;
      case 4:
        red = Math.round(fraction * 255);
        green = 0;
        blue = 255;
        break;
      default:
        red = 255;
        green = 0;
        blue = Math.round((1 - fraction) * 255);
        break;
    }

    data[index] = red;
    data[index + 1] = green;
    data[index + 2] = blue;
    data[index + 3] = Math.round(alpha * opacity);
  }

  ctx.putImageData(imageData, 0, 0);
}

function runSolidColorHook(ctx: Ctx2D, imageData: ImageData, _size: number, args: unknown): void {
  const data = imageData.data;
  const red = getNumberArg(args, 'r', 255);
  const green = getNumberArg(args, 'g', 255);
  const blue = getNumberArg(args, 'b', 255);
  const opacity = getNumberArg(args, 'opacity', 1);

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3]!;
    if (alpha < 10) continue;

    data[index] = red;
    data[index + 1] = green;
    data[index + 2] = blue;
    data[index + 3] = Math.round(alpha * opacity);
  }

  ctx.putImageData(imageData, 0, 0);
}

const RAINBOW_GRADIENT_HOOK_CODE = `
    var data = imageData.data;
    var cx = size / 2;
    var cy = size / 2;
    var opacity = (args && args.opacity) || 1;
    
    for (var i = 0; i < data.length; i += 4) {
      var a = data[i + 3];
      if (a < 10) continue;
      
      var px = (i / 4) % size;
      var py = Math.floor((i / 4) / size);
      
      // 计算角度 (0-360)，从顶部开始顺时针
      var angle = Math.atan2(px - cx, cy - py) * 180 / Math.PI + 180;
      
      // HSV to RGB (H = angle, S = 1, V = 1) - 纯正彩虹色
      var h = (angle % 360) / 60;
      var hi = Math.floor(h) % 6;
      var f = h - Math.floor(h);
      var r, g, b;
      
      // 纯彩虹色：S=1, V=1
      switch (hi) {
        case 0: r = 255; g = Math.round(f * 255); b = 0; break;
        case 1: r = Math.round((1 - f) * 255); g = 255; b = 0; break;
        case 2: r = 0; g = 255; b = Math.round(f * 255); break;
        case 3: r = 0; g = Math.round((1 - f) * 255); b = 255; break;
        case 4: r = Math.round(f * 255); g = 0; b = 255; break;
        default: r = 255; g = 0; b = Math.round((1 - f) * 255); break;
      }
      
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = Math.round(a * opacity);
    }
    
    ctx.putImageData(imageData, 0, 0);
  `;

const SOLID_COLOR_HOOK_CODE = `
  var data = imageData.data;
  var r = (args && args.r) || 255;
  var g = (args && args.g) || 255;
  var b = (args && args.b) || 255;
  var opacity = (args && args.opacity) || 1;
  
  for (var i = 0; i < data.length; i += 4) {
    var a = data[i + 3];
    if (a < 10) continue;
    
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = Math.round(a * opacity);
  }
  
  ctx.putImageData(imageData, 0, 0);
`;

const builtinHookExecutors = new Map<string, HookExecutor>();
let builtinHookExecutorsReady = false;

function ensureBuiltinHookExecutors(): void {
  if (builtinHookExecutorsReady) {
    return;
  }

  builtinHookExecutors.set(normalizeHookCode(RAINBOW_GRADIENT_HOOK_CODE), runRainbowGradientHook);
  builtinHookExecutors.set(normalizeHookCode(SOLID_COLOR_HOOK_CODE), runSolidColorHook);
  builtinHookExecutorsReady = true;
}

function resolveBuiltinHookExecutor(code: string): HookExecutor | undefined {
  ensureBuiltinHookExecutors();
  return builtinHookExecutors.get(normalizeHookCode(code));
}

function compileHook(code: string): HookExecutor {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  return new Function('ctx', 'imageData', 'size', 'args', code) as HookExecutor;
}

const hookCache = new Map<string, HookExecutor>();

function getCompiledHook(code: string): HookExecutor {
  const builtinHook = resolveBuiltinHookExecutor(code);
  if (builtinHook) {
    return builtinHook;
  }

  let fn = hookCache.get(code);
  if (!fn) {
    fn = compileHook(code);
    hookCache.set(code, fn);
  }
  return fn;
}

function getContentBounds(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  alphaThreshold = 10,
): { minX: number; minY: number; maxX: number; maxY: number } | null {
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let found = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (data[idx + 3]! >= alphaThreshold) {
        found = true;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  return found ? { minX, minY, maxX, maxY } : null;
}

function applyMonochromeTransform(data: Uint8ClampedArray, contrast: number, invert: boolean): void {
  let minLum = 1;
  let maxLum = 0;

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3]!;
    if (a < 10) continue;
    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    minLum = Math.min(minLum, lum);
    maxLum = Math.max(maxLum, lum);
  }

  const lumRange = maxLum - minLum;
  const hasRange = lumRange > 0.01;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;
    const a = data[i + 3]!;

    let luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    if (hasRange) {
      luminance = (luminance - minLum) / lumRange;
    }
    luminance = (luminance - 0.5) * contrast + 0.5;
    luminance = Math.max(0, Math.min(1, luminance));
    if (invert) {
      luminance = 1 - luminance;
    }

    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    data[i + 3] = luminance * (a / 255) * 255;
  }
}

async function blobToDataURL(blob: Blob): Promise<string> {
  if (typeof btoa !== 'function') {
    throw new Error('btoa is not available');
  }

  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  const base64 = btoa(binary);
  const contentType = blob.type || 'application/octet-stream';
  return `data:${contentType};base64,${base64}`;
}

async function createMonochromeMaskInWorker(iconUrl: string, options: MonochromeMaskOptions): Promise<string> {
  const { size = 64, invert = false, contrast = 1.5, pipeline, clip = true, targetBrightness } = options;

  const response = await fetch(iconUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }

  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);

  try {
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      throw new Error('Failed to get 2d context');
    }

    ctx.clearRect(0, 0, size, size);

    const initialScale = Math.min(size / bitmap.width, size / bitmap.height) * 0.85;
    const initialW = bitmap.width * initialScale;
    const initialH = bitmap.height * initialScale;
    const initialX = (size - initialW) / 2;
    const initialY = (size - initialH) / 2;
    ctx.drawImage(bitmap, initialX, initialY, initialW, initialH);

    let imageData = ctx.getImageData(0, 0, size, size);
    let data = imageData.data;

    applyMonochromeTransform(data, contrast, invert);

    if (clip) {
      const bounds = getContentBounds(data, size, size, 20);
      if (bounds) {
        const padding = 1;
        const clipX = Math.max(0, bounds.minX - padding);
        const clipY = Math.max(0, bounds.minY - padding);
        const clipW = Math.min(size - clipX, bounds.maxX - bounds.minX + 1 + padding * 2);
        const clipH = Math.min(size - clipY, bounds.maxY - bounds.minY + 1 + padding * 2);

        const srcX = (clipX - initialX) / initialScale;
        const srcY = (clipY - initialY) / initialScale;
        const srcW = clipW / initialScale;
        const srcH = clipH / initialScale;

        const clipMaxDim = Math.max(clipW, clipH);
        const newScale = (size / clipMaxDim) * 0.95;
        const finalW = clipW * newScale;
        const finalH = clipH * newScale;
        const finalX = (size - finalW) / 2;
        const finalY = (size - finalH) / 2;

        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(bitmap, srcX, srcY, srcW, srcH, finalX, finalY, finalW, finalH);

        imageData = ctx.getImageData(0, 0, size, size);
        data = imageData.data;
        applyMonochromeTransform(data, contrast, invert);
      }
    }

    if (targetBrightness !== undefined) {
      let sumAlpha = 0;
      let count = 0;
      for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3]!;
        if (a >= 10) {
          sumAlpha += a / 255;
          count++;
        }
      }

      if (count > 0) {
        const currentBrightness = sumAlpha / count;
        if (currentBrightness > 0.01) {
          const multiplier = targetBrightness / currentBrightness;
          for (let i = 0; i < data.length; i += 4) {
            const a = data[i + 3]!;
            if (a >= 1) {
              data[i + 3] = Math.min(255, Math.max(0, a * multiplier));
            }
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);

    if (pipeline && pipeline.length > 0) {
      for (const hook of pipeline) {
        try {
          const fn = getCompiledHook(hook.code);
          imageData = ctx.getImageData(0, 0, size, size);
          fn(ctx, imageData, size, hook.args);
        } catch {
          // ignore pipeline errors
        }
      }
    }

    const outputBlob = await canvas.convertToBlob({ type: 'image/png' });
    return await blobToDataURL(outputBlob);
  } finally {
    bitmap.close();
  }
}

type WorkerPostMessageFn = (message: unknown, transfer?: Transferable[]) => void;

interface WorkerLikeGlobal {
  addEventListener: typeof globalThis.addEventListener;
  postMessage: WorkerPostMessageFn;
}

const workerScope = self as unknown as WorkerLikeGlobal;

workerScope.addEventListener('message', (event: MessageEvent) => {
  const data = event.data as CreateMaskRequest;
  if (!data || data.type !== 'create-mask') {
    return;
  }

  const respond = (response: CreateMaskResponse) => {
    workerScope.postMessage(response);
  };

  createMonochromeMaskInWorker(data.iconUrl, data.options)
    .then((dataUrl) => {
      respond({
        type: 'create-mask-result',
        id: data.id,
        dataUrl,
      });
    })
    .catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      respond({
        type: 'create-mask-result',
        id: data.id,
        dataUrl: null,
        error: message,
      });
    });
});
