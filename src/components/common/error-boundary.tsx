/**
 * React Error Boundary Component
 * 
 * 捕获子组件树中的 JavaScript 错误，防止整个应用白屏
 */

import { Component, type ReactNode, type ErrorInfo } from 'react'

export interface ErrorBoundaryProps {
  /** 子组件 */
  children: ReactNode
  /** 自定义错误 UI */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode)
  /** 错误回调 */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  override render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      const { fallback } = this.props

      // 使用自定义 fallback
      if (fallback) {
        if (typeof fallback === 'function') {
          return fallback(this.state.error, this.handleReset)
        }
        return fallback
      }

      // 默认错误 UI
      return (
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <div className="text-destructive mb-2">
            <svg className="size-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            出现了一些问题
          </p>
          <button
            onClick={this.handleReset}
            className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            重试
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * 带错误边界的包装器 HOC
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ErrorBoundaryProps['fallback']
): React.FC<P> {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    )
  }
}
