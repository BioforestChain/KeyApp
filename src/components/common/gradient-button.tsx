import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const gradientButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full text-white font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        blue: 'bg-gradient-blue hover:opacity-90',
        purple: 'bg-gradient-purple hover:opacity-90',
        red: 'bg-gradient-red hover:opacity-90',
        mint: 'bg-gradient-mint hover:opacity-90',
      },
      size: {
        sm: 'h-9 px-4 text-sm has-[svg]:ps-3 @xs:h-10 @xs:px-5 @xs:has-[svg]:ps-4',
        md: 'h-11 px-6 text-base has-[svg]:ps-4 @xs:h-12 @xs:px-8 @xs:has-[svg]:ps-5',
        lg: 'h-12 px-8 text-lg has-[svg]:ps-5 @xs:h-14 @xs:px-10 @xs:has-[svg]:ps-6',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'purple',
      size: 'md',
      fullWidth: false,
    },
  }
)

export interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof gradientButtonVariants> {
  asChild?: boolean
  loading?: boolean
}

const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, variant, size, fullWidth, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    
    return (
      <Comp
        ref={ref}
        className={cn(gradientButtonVariants({ variant, size, fullWidth, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin size-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </Comp>
    )
  }
)
GradientButton.displayName = 'GradientButton'

export { GradientButton, gradientButtonVariants }
