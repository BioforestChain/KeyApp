import NumberFlow from '@number-flow/react'
import { cn } from '@/lib/utils';

type AmountSign = 'auto' | 'always' | 'never';
type AmountColor = 'auto' | 'default' | 'positive' | 'negative';

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
  /** 始终显示完整小数位 (如 0.00000000) */
  fixedDecimals?: boolean | undefined;
  className?: string | undefined;
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
  fixedDecimals = false,
  className,
}: AmountDisplayProps) {
  const baseClassName = cn(sizeClasses[size], weightClasses[weight], mono && 'font-mono', className);

  if (hidden) {
    return (
      <span className={baseClassName}>
        ••••••
        {symbol && <span className="text-muted-foreground ml-1 font-normal">{symbol}</span>}
      </span>
    );
  }

  const format = {
    minimumFractionDigits: fixedDecimals ? decimals : 0,
    maximumFractionDigits: decimals,
  };

  // 加载状态：显示 0 配合呼吸动画
  if (loading) {
    return (
      <span
        className={cn(baseClassName, 'animate-pulse')}
        role="status"
        aria-label="Loading..."
      >
        <NumberFlow
          value={0}
          format={format}
          locales="en-US"
          aria-hidden="true"
        />
        {symbol && <span className="text-muted-foreground ml-1 font-normal">{symbol}</span>}
      </span>
    );
  }

  const { formatted, isNegative, isZero, numValue } = formatAmount(value, decimals, compact);

  // 计算符号
  let signChar = '';
  if (sign === 'always' && !isZero) {
    signChar = isNegative ? '-' : '+';
  } else if (sign === 'auto' && isNegative) {
    signChar = '-';
  }

  // 计算颜色
  let colorClass = '';
  if (color === 'auto' && !isZero) {
    colorClass = isNegative ? 'text-destructive' : 'text-secondary';
  } else if (color === 'positive') {
    colorClass = 'text-secondary';
  } else if (color === 'negative') {
    colorClass = 'text-destructive';
  }

  const coloredClassName = cn(baseClassName, colorClass);

  // 使用 NumberFlow 进行动画显示 (compact 模式不使用动画)
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
