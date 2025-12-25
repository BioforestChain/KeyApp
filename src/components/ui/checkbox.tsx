import * as React from 'react';
import { cn } from '@/lib/utils';
import { IconCheck as Check, IconMinus as Minus } from '@tabler/icons-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** 是否处于不确定状态（部分选中） */
  indeterminate?: boolean;
  /** 选中状态变化回调 */
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, indeterminate, onCheckedChange, onChange, ...props }, ref) => {
    const innerRef = React.useRef<HTMLInputElement>(null);

    // 合并 ref
    React.useImperativeHandle(ref, () => innerRef.current!);

    // 设置 indeterminate 属性
    React.useEffect(() => {
      if (innerRef.current) {
        innerRef.current.indeterminate = indeterminate ?? false;
      }
    }, [indeterminate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    const handleClick = () => {
      if (innerRef.current && !props.disabled) {
        innerRef.current.click();
      }
    };

    return (
      <div className="relative inline-flex items-center">
        <input
          ref={innerRef}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          className="peer sr-only"
          {...props}
        />
        <div
          onClick={handleClick}
          className={cn(
            'size-5 rounded border-2 transition-colors cursor-pointer',
            'border-muted-foreground/30',
            'peer-checked:border-primary peer-checked:bg-primary',
            'peer-indeterminate:border-primary peer-indeterminate:bg-primary',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
            'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
            className,
          )}
        >
          {(checked || indeterminate) && (
            <div className="flex items-center justify-center text-primary-foreground pointer-events-none">
              {indeterminate ? (
                <Minus className="size-3.5" strokeWidth={3} />
              ) : (
                <Check className="size-3.5" strokeWidth={3} />
              )}
            </div>
          )}
        </div>
      </div>
    );
  },
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
