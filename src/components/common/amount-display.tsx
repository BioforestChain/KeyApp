import NumberFlow from '@number-flow/react'
import { useState, useRef, useLayoutEffect, useCallback } from 'react'
import { cn } from '@/lib/utils';

type AmountSign = 'auto' | 'always' | 'never';
type AmountColor = 'auto' | 'default' | 'positive' | 'negative';
/** 小数位显示模式：false=隐藏尾随零, true=显示完整小数位, 'auto'=自适应容器宽度 */
type FixedDecimalsMode = boolean | 'auto';

interface AmountDisplayProps {
  value: string | number;
  symbol?: string | undefined;
  decimals?: number | undefined;
  /** 是否显示正负号 */
  sign?: AmountSign | undefined;
  /** 颜色模式：auto 根据正负自动，default 不变色 */
  color?: AmountColor | undefined;
  /** 是否使用紧凑模式（1K, 1M） */
  compact?: boolean | undefined;
  /** 隐藏金额（隐私模式） */
  hidden?: boolean | undefined;
  /** 是否正在加载 */
  loading?: boolean | undefined;
  /** 尺寸 */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | undefined;
  /** 字重 */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | undefined;
  /** 是否等宽字体 (默认 true) */
  mono?: boolean | undefined;
  /** 是否启用动画 (默认 true) */
  animated?: boolean | undefined;
  /** 小数位显示模式：false=隐藏尾随零, true=显示完整, 'auto'=自适应宽度 */
  fixedDecimals?: FixedDecimalsMode | undefined;
  className?: string | undefined;
}

// Canvas 测量文字宽度（不触发回流）
let measureCanvas: HTMLCanvasElement | null = null;
let measureCtx: CanvasRenderingContext2D | null = null;

function measureText(text: string, font: string): number {
  if (typeof document === 'undefined') {
    return text.length * 8;
  }

  if (!measureCanvas) {
    measureCanvas = document.createElement('canvas');
    measureCtx = measureCanvas.getContext('2d');
  }

  if (!measureCtx) {
    return text.length * 8;
  }

  measureCtx.font = font;
  return measureCtx.measureText(text).width;
}

// 格式化数字为字符串（用于测量宽度）
function formatNumberToString(num: number, minDecimals: number, maxDecimals: number): string {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  });
}

// 计算数值的有效小数位数（去除尾随零后的位数）
function getEffectiveDecimals(num: number, maxDecimals: number): number {
  if (num === 0) return 0;
  const str = Math.abs(num).toFixed(maxDecimals);
  const decimalPart = str.split('.')[1] || '';
  const trimmed = decimalPart.replace(/0+$/, '');
  return trimmed.length;
}

// 格式化数字 (仅用于非动画模式或 compact 模式)
function formatAmount(
  value: string | number,
  decimals: number,
  compact: boolean,
): { formatted: string; isNegative: boolean; isZero: boolean; numValue: number } {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return { formatted: '0', isNegative: false, isZero: true, numValue: 0 };
  }

  const isNegative = num < 0;
  const isZero = num === 0;
  const absNum = Math.abs(num);

  let formatted: string;

  if (isZero) {
    formatted = '0';
  } else if (compact && absNum >= 1_000_000_000) {
    formatted = (absNum / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '') + 'B';
  } else if (compact && absNum >= 1_000_000) {
    formatted = (absNum / 1_000_000).toFixed(2).replace(/\.?0+$/, '') + 'M';
  } else if (compact && absNum >= 1_000) {
    formatted = (absNum / 1_000).toFixed(2).replace(/\.?0+$/, '') + 'K';
  } else {
    // 显示完整小数位，不截断末尾的 0
    formatted = absNum.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    });
  }

  return { formatted, isNegative, isZero, numValue: num };
}

const sizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

const weightClasses = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

// 自适应小数位数 Hook
function useAutoDecimals(
  containerRef: React.RefObject<HTMLElement | null>,
  numValue: number,
  maxDecimals: number,
  signChar: string,
  symbol: string | undefined,
): number {
  const minDecimals = getEffectiveDecimals(numValue, maxDecimals);
  const [displayDecimals, setDisplayDecimals] = useState(minDecimals);

  const updateDecimals = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const style = getComputedStyle(container);
    const font = `${style.fontSize} ${style.fontFamily}`;
    const symbolSpace = symbol ? measureText(` ${symbol}`, font) : 0;
    const signSpace = signChar ? measureText(signChar, font) : 0;
    const availableWidth = container.clientWidth - symbolSpace - signSpace;

    if (availableWidth <= 0) {
      setDisplayDecimals(minDecimals);
      return;
    }

    // 从最大小数位开始，找到能容纳的最大位数
    for (let d = maxDecimals; d >= minDecimals; d--) {
      const text = formatNumberToString(Math.abs(numValue), d, maxDecimals);
      const textWidth = measureText(text, font);
      if (textWidth <= availableWidth) {
        setDisplayDecimals(d);
        return;
      }
    }
    setDisplayDecimals(minDecimals);
  }, [numValue, maxDecimals, minDecimals, signChar, symbol]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    updateDecimals();

    const observer = new ResizeObserver(updateDecimals);
    observer.observe(container);

    return () => observer.disconnect();
  }, [updateDecimals]);

  return displayDecimals;
}

export function AmountDisplay({
  value,
  symbol,
  decimals = 8,
  sign = 'never',
  color = 'default',
  compact = false,
  hidden = false,
  loading = false,
  size = 'md',
  weight = 'normal',
  mono = true,
  animated = true,
  fixedDecimals = 'auto',
  className,
}: AmountDisplayProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const baseClassName = cn(sizeClasses[size], weightClasses[weight], mono && 'font-mono', className);

  // 预计算数值信息
  const { isNegative, isZero, numValue } = formatAmount(value, decimals, compact);

  // 计算符号
  let signChar = '';
  if (sign === 'always' && !isZero) {
    signChar = isNegative ? '-' : '+';
  } else if (sign === 'auto' && isNegative) {
    signChar = '-';
  }

  // auto 模式：自适应小数位数
  const autoDecimals = useAutoDecimals(
    containerRef,
    numValue,
    decimals,
    signChar,
    symbol,
  );

  // 根据 fixedDecimals 模式确定 minimumFractionDigits
  const effectiveMinDecimals =
    fixedDecimals === 'auto'
      ? autoDecimals
      : fixedDecimals === true
        ? decimals
        : 0;

  const format = {
    minimumFractionDigits: effectiveMinDecimals,
    maximumFractionDigits: decimals,
  };

  if (hidden) {
    return (
      <span className={baseClassName}>
        ••••••
        {symbol && <span className="text-muted-foreground ml-1 font-normal">{symbol}</span>}
      </span>
    );
  }

  // 加载状态：显示当前值 + 呼吸动画（避免跳到 0）
  if (loading) {
    return (
      <span
        className={cn(baseClassName, 'animate-pulse')}
        role="status"
        aria-label="Loading..."
      >
        <NumberFlow
          value={numValue}
          format={format}
          locales="en-US"
          aria-hidden="true"
        />
        {symbol && <span className="text-muted-foreground ml-1 font-normal">{symbol}</span>}
      </span>
    );
  }

  const { formatted } = formatAmount(value, decimals, compact);

  // 计算颜色
  let colorClass = '';
  if (color === 'auto' && !isZero) {
    colorClass = isNegative ? 'text-destructive' : 'text-green-500';
  } else if (color === 'positive') {
    colorClass = 'text-green-500';
  } else if (color === 'negative') {
    colorClass = 'text-destructive';
  }

  const coloredClassName = cn(baseClassName, colorClass);

  // auto 模式需要使用相对定位容器
  if (fixedDecimals === 'auto') {
    const minText = formatNumberToString(Math.abs(numValue), getEffectiveDecimals(numValue, decimals), decimals);
    const a11yLabel = `${signChar}${formatted}${symbol ? ` ${symbol}` : ''}`;
    
    return (
      <span
        ref={containerRef}
        className={cn(coloredClassName, 'relative inline-block')}
        role="text"
        aria-label={a11yLabel}
      >
        {/* 隐藏占位符：最小宽度（有效数字） */}
        <span className="invisible" aria-hidden="true">
          {signChar}{minText}{symbol ? ` ${symbol}` : ''}
        </span>
        {/* 绝对定位的实际内容 */}
        <span className="absolute inset-0 text-right" aria-hidden="true">
          {signChar}
          {animated && !compact ? (
            <NumberFlow
              value={Math.abs(numValue)}
              format={format}
              locales="en-US"
            />
          ) : (
            formatNumberToString(Math.abs(numValue), effectiveMinDecimals, decimals)
          )}
          {symbol && <span className="text-muted-foreground ml-1 font-normal">{symbol}</span>}
        </span>
      </span>
    );
  }

  // 非 auto 模式：使用 NumberFlow 进行动画显示 (compact 模式不使用动画)
  if (animated && !compact) {
    const a11yLabel = `${signChar}${formatted}${symbol ? ` ${symbol}` : ''}`;
    return (
      <span className={coloredClassName} role="text" aria-label={a11yLabel}>
        {signChar}
        <NumberFlow
          value={Math.abs(numValue)}
          format={format}
          locales="en-US"
          aria-hidden="true"
        />
        {symbol && <span className="text-muted-foreground ml-1 font-normal" aria-hidden="true">{symbol}</span>}
      </span>
    );
  }

  return (
    <span className={coloredClassName}>
      {signChar}
      {formatted}
      {symbol && <span className="text-muted-foreground ml-1 font-normal">{symbol}</span>}
    </span>
  );
}

// 带法币价值的复合显示
interface AmountWithFiatProps extends AmountDisplayProps {
  fiatValue?: string | number | undefined;
  fiatSymbol?: string | undefined;
  fiatDecimals?: number | undefined;
  /** 布局方向 */
  layout?: 'vertical' | 'horizontal' | undefined;
}

export function AmountWithFiat({
  fiatValue,
  fiatSymbol = '$',
  fiatDecimals = 2,
  layout = 'vertical',
  className,
  ...amountProps
}: AmountWithFiatProps) {
  const fiatFormatted = fiatValue !== undefined ? formatAmount(fiatValue, fiatDecimals, false).formatted : null;

  if (layout === 'horizontal') {
    return (
      <span className={cn('inline-flex items-baseline gap-2', className)}>
        <AmountDisplay {...amountProps} />
        {fiatFormatted && (
          <span className="text-muted-foreground text-sm">
            ≈ {fiatSymbol}
            {fiatFormatted}
          </span>
        )}
      </span>
    );
  }

  return (
    <div className={cn('space-y-0.5', className)}>
      <AmountDisplay {...amountProps} />
      {fiatFormatted && (
        <p className="text-muted-foreground text-sm">
          ≈ {fiatSymbol}
          {fiatFormatted}
        </p>
      )}
    </div>
  );
}

export { formatAmount };
