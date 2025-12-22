import { ErrorBoundary as BaseErrorBoundary, useErrorBoundary } from 'react-error-boundary'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 p-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-destructive">Something went wrong</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          {error.message || 'An unexpected error occurred'}
        </p>
      </div>
      <Button variant="outline" onClick={resetErrorBoundary}>
        Try again
      </Button>
    </div>
  )
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, info: React.ErrorInfo) => void
}

export function ErrorBoundary({ children, fallback, onError }: ErrorBoundaryProps) {
  return (
    <BaseErrorBoundary
      FallbackComponent={fallback ? () => <>{fallback}</> : ErrorFallback}
      onError={(error, info) => {
        console.error('ErrorBoundary caught an error:', error, info)
        onError?.(error, info)
      }}
    >
      {children}
    </BaseErrorBoundary>
  )
}

export { useErrorBoundary }
